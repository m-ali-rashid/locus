package com.locus

import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.location.*

/**
 * LGGeofenceModule.kt
 *
 * Android native module: wraps Google Play Services GeofencingClient.
 * Registers/deregisters circular geofences and broadcasts ENTER/EXIT/DWELL
 * transitions back to JS via DeviceEventEmitter as "LGGeofenceTransition".
 *
 * Requirements:
 *   - play-services-location must be on the classpath (already pulled in via
 *     react-native-geolocation-service's transitive dependency)
 *   - ACCESS_FINE_LOCATION + ACCESS_BACKGROUND_LOCATION granted at runtime
 *   - AndroidManifest.xml must declare LGGeofenceBroadcastReceiver
 */
class LGGeofenceModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val geofencingClient: GeofencingClient =
        LocationServices.getGeofencingClient(reactContext)

    override fun getName(): String = "LGGeofenceMonitor"

    // ─── Pending intent for geofence broadcasts ──────────────────────────────

    private val geofencePendingIntent: PendingIntent by lazy {
        val intent = Intent(reactContext, LGGeofenceBroadcastReceiver::class.java)
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        else
            PendingIntent.FLAG_UPDATE_CURRENT
        PendingIntent.getBroadcast(reactContext, 0, intent, flags)
    }

    // ─── JS-exposed methods ──────────────────────────────────────────────────

    @ReactMethod
    fun register(config: ReadableMap, promise: Promise) {
        val id        = config.getString("id")        ?: return promise.reject("INVALID_CONFIG", "id required")
        val latitude  = if (config.hasKey("latitude"))  config.getDouble("latitude")  else return promise.reject("INVALID_CONFIG", "latitude required")
        val longitude = if (config.hasKey("longitude")) config.getDouble("longitude") else return promise.reject("INVALID_CONFIG", "longitude required")
        val radius    = if (config.hasKey("radius"))    config.getDouble("radius").toFloat() else return promise.reject("INVALID_CONFIG", "radius required")

        val notifyEntry = config.hasKey("notifyOnEntry") && config.getBoolean("notifyOnEntry")
        val notifyExit  = config.hasKey("notifyOnExit")  && config.getBoolean("notifyOnExit")
        val notifyDwell = config.hasKey("notifyOnDwell") && config.getBoolean("notifyOnDwell")
        val dwellMillis = if (config.hasKey("dwellMillis")) config.getInt("dwellMillis") else 30_000

        var transitions = 0
        if (notifyEntry) transitions = transitions or Geofence.GEOFENCE_TRANSITION_ENTER
        if (notifyExit)  transitions = transitions or Geofence.GEOFENCE_TRANSITION_EXIT
        if (notifyDwell) transitions = transitions or Geofence.GEOFENCE_TRANSITION_DWELL

        val geofence = Geofence.Builder()
            .setRequestId(id)
            .setCircularRegion(latitude, longitude, radius)
            .setExpirationDuration(Geofence.NEVER_EXPIRE)
            .setTransitionTypes(transitions)
            .setLoiteringDelay(dwellMillis)
            .build()

        val request = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofence(geofence)
            .build()

        geofencingClient.addGeofences(request, geofencePendingIntent)
            .addOnSuccessListener { promise.resolve(null) }
            .addOnFailureListener { e -> promise.reject("GEO_ERROR", e.message, e) }
    }

    @ReactMethod
    fun deregister(id: String, promise: Promise) {
        geofencingClient.removeGeofences(listOf(id))
            .addOnSuccessListener { promise.resolve(null) }
            .addOnFailureListener { e -> promise.reject("GEO_ERROR", e.message, e) }
    }

    @ReactMethod
    fun deregisterAll(promise: Promise) {
        geofencingClient.removeGeofences(geofencePendingIntent)
            .addOnSuccessListener { promise.resolve(null) }
            .addOnFailureListener { e -> promise.reject("GEO_ERROR", e.message, e) }
    }

    // ─── Internal: emit transition to JS ────────────────────────────────────

    companion object {
        fun emitTransition(context: ReactApplicationContext, geofenceId: String, event: String) {
            val params = Arguments.createMap().apply {
                putString("geofenceId", geofenceId)
                putString("event", event)
                putString("timestamp", java.time.Instant.now().toString())
            }
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("LGGeofenceTransition", params)
        }
    }
}
