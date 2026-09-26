// ios/Locus/LGGeofenceMonitor.swift
//
// Custom native module: wraps CLLocationManager region monitoring.
// Exposes register/deregister/deregisterAll to JS and emits
// "LGGeofenceTransition" events on ENTER/EXIT/DWELL.
//
// Design notes:
//   - One shared CLLocationManager per app lifecycle (singleton via AppDelegate).
//   - iOS caps monitored regions at 20; SaveGeofenceUseCase enforces this via
//     APP_CONSTANTS.GEOFENCE.IOS_MAX_REGIONS before calling register().
//   - Dwell is simulated via a 30s timer after ENTER (iOS has no native DWELL).

import Foundation
import CoreLocation
import React
import React_RCTAppDelegate

@objc(LGGeofenceMonitor)
class LGGeofenceMonitor: RCTEventEmitter, CLLocationManagerDelegate {

  // MARK: – Singleton location manager
  private let locationManager = CLLocationManager()
  private var dwellTimers: [String: Timer] = [:]
  private static let dwellInterval: TimeInterval = 30

  override init() {
    super.init()
    locationManager.delegate = self
    locationManager.allowsBackgroundLocationUpdates = true
    locationManager.pausesLocationUpdatesAutomatically = false
  }

  // MARK: – RCTEventEmitter
  override func supportedEvents() -> [String] {
    return ["LGGeofenceTransition"]
  }

  override static func requiresMainQueueSetup() -> Bool { return false }

  // MARK: – JS-exposed methods

  @objc func register(_ config: NSDictionary,
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard
      let id        = config["id"]        as? String,
      let latitude  = config["latitude"]  as? Double,
      let longitude = config["longitude"] as? Double,
      let radius    = config["radius"]    as? Double
    else {
      reject("INVALID_CONFIG", "Missing required geofence fields", nil)
      return
    }

    let center = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    let region = CLCircularRegion(center: center, radius: radius, identifier: id)
    region.notifyOnEntry = config["notifyOnEntry"] as? Bool ?? true
    region.notifyOnExit  = config["notifyOnExit"]  as? Bool ?? false

    // Remove existing registration with this ID to avoid duplicates
    for existing in locationManager.monitoredRegions where existing.identifier == id {
      locationManager.stopMonitoring(for: existing)
    }

    locationManager.startMonitoring(for: region)
    resolve(nil)
  }

  @objc func deregister(_ id: String,
                          resolver resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    for region in locationManager.monitoredRegions where region.identifier == id {
      locationManager.stopMonitoring(for: region)
    }
    dwellTimers[id]?.invalidate()
    dwellTimers.removeValue(forKey: id)
    resolve(nil)
  }

  @objc func deregisterAll(_ resolve: @escaping RCTPromiseResolveBlock,
                              rejecter reject: @escaping RCTPromiseRejectBlock) {
    for region in locationManager.monitoredRegions {
      locationManager.stopMonitoring(for: region)
    }
    dwellTimers.values.forEach { $0.invalidate() }
    dwellTimers.removeAll()
    resolve(nil)
  }

  @objc func getAuthorizationStatus(_ resolve: @escaping RCTPromiseResolveBlock,
                                    rejecter reject: @escaping RCTPromiseRejectBlock) {
    let status: CLAuthorizationStatus
    if #available(iOS 14.0, *) {
      status = locationManager.authorizationStatus
    } else {
      status = CLLocationManager.authorizationStatus()
    }
    switch status {
    case .notDetermined:
      resolve("notDetermined")
    case .restricted:
      resolve("restricted")
    case .denied:
      resolve("denied")
    case .authorizedAlways:
      resolve("always")
    case .authorizedWhenInUse:
      resolve("whenInUse")
    @unknown default:
      resolve("unknown")
    }
  }

  // MARK: – CLLocationManagerDelegate

  func locationManager(_ manager: CLLocationManager,
                       didEnterRegion region: CLRegion) {
    emitTransition(id: region.identifier, event: "ENTER")

    // Simulate DWELL via timer
    dwellTimers[region.identifier]?.invalidate()
    dwellTimers[region.identifier] = Timer.scheduledTimer(
      withTimeInterval: LGGeofenceMonitor.dwellInterval,
      repeats: false
    ) { [weak self] _ in
      self?.emitTransition(id: region.identifier, event: "DWELL")
      self?.dwellTimers.removeValue(forKey: region.identifier)
    }
  }

  func locationManager(_ manager: CLLocationManager,
                       didExitRegion region: CLRegion) {
    dwellTimers[region.identifier]?.invalidate()
    dwellTimers.removeValue(forKey: region.identifier)
    emitTransition(id: region.identifier, event: "EXIT")
  }

  func locationManager(_ manager: CLLocationManager,
                       monitoringDidFailFor region: CLRegion?,
                       withError error: Error) {
    print("[LGGeofenceMonitor] Monitoring failed for \(region?.identifier ?? "?"): \(error)")
  }

  // MARK: – Helpers

  private func emitTransition(id: String, event: String) {
    sendEvent(withName: "LGGeofenceTransition", body: [
      "geofenceId": id,
      "event":      event,
      "timestamp":  ISO8601DateFormatter().string(from: Date()),
    ])
  }
}
