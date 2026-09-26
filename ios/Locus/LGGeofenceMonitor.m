// ios/Locus/LGGeofenceMonitor.m
//
// Objective-C bridge that exposes LGGeofenceMonitor to the React Native bridge.
// Required for RCT_EXTERN_MODULE / RCT_EXTERN_METHOD macro pattern.

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LGGeofenceMonitor, RCTEventEmitter)

RCT_EXTERN_METHOD(register:(NSDictionary *)config
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deregister:(NSString *)id
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deregisterAll:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAuthorizationStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
