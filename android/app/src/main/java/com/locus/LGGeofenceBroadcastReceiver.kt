package com.locus

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofenceStatusCodes
import com.google.android.gms.location.GeofencingEvent

/**
 * LGGeofenceBroadcastReceiver.kt
 *
 * Receives geofence transition broadcasts from Google Play Services
 * and forwards them to LGGeofenceModule to emit to JS.
 * Declared in AndroidManifest.xml.
 */
class LGGeofenceBroadcastReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent) ?: return

        if (geofencingEvent.hasError()) {
            val errorMessage = GeofenceStatusCodes.getStatusCodeString(geofencingEvent.errorCode)
            android.util.Log.e("LGGeofence", "Geofencing error: $errorMessage")
            return
        }

        val transitionType = geofencingEvent.geofenceTransition
        val eventName = when (transitionType) {
            Geofence.GEOFENCE_TRANSITION_ENTER -> "ENTER"
            Geofence.GEOFENCE_TRANSITION_EXIT  -> "EXIT"
            Geofence.GEOFENCE_TRANSITION_DWELL -> "DWELL"
            else -> return
        }

        val app = context.applicationContext as? com.locus.MainApplication ?: return
        val reactContext = app.reactNativeHost.reactInstanceManager
            .currentReactContext as? com.facebook.react.bridge.ReactApplicationContext ?: return

        geofencingEvent.triggeringGeofences?.forEach { geofence ->
            LGGeofenceModule.emitTransition(reactContext, geofence.requestId, eventName)
        }
    }
}
