package com.locus

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * LGGeofencePackage.kt
 *
 * Registers LGGeofenceModule with the React Native module registry.
 * Add an instance of this class to MainApplication.getPackages().
 */
class LGGeofencePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(LGGeofenceModule(reactContext))

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
