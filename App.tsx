/**
 * App.tsx — Step 2 entry point
 *
 * Wraps the app in:
 *   GestureHandlerRootView  — required by @gorhom/bottom-sheet + gesture-handler
 *   AppNavigator            — NavigationContainer + bottom tab navigator
 *
 * Headless task registration happens in index.js (see comment below).
 */
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BackgroundFetch from 'react-native-background-fetch';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { services } from './src/core/di/ServiceLocator';
import { usePermissions } from './src/presentation/hooks/usePermissions';
import { PermissionModal } from './src/presentation/components/PermissionModal';

// Configure BackgroundFetch once on app mount
async function initBackgroundFetch(): Promise<void> {
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15,      // minutes — minimum allowed by OS
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
    },
    async (taskId) => {
      console.log('[BackgroundFetch] foreground task:', taskId);
      BackgroundFetch.finish(taskId);
    },
    (taskId) => {
      console.warn('[BackgroundFetch] timeout:', taskId);
      BackgroundFetch.finish(taskId);
    },
  );
}

// Subscribe to geofence transitions for foreground notifications
function subscribeToGeofenceEvents(): () => void {
  return services.geofenceMonitor.onTransition(async (transition) => {
    console.log('[GeofenceTransition]', transition);
    await services.triggerReminderUseCase.execute(transition);
  });
}

const App: React.FC = () => {
  const {
    permissions,
    status,
    requestPermissions,
    openSettings,
  } = usePermissions();

  const [hasDismissedModal, setHasDismissedModal] = useState(false);

  useEffect(() => {
    initBackgroundFetch();
    const unsubscribe = subscribeToGeofenceEvents();
    return unsubscribe;
  }, []);

  // Show modal if permissions are not all granted and user hasn't dismissed it
  const showModal = Boolean(
    permissions &&
    !permissions.allGranted &&
    !hasDismissedModal,
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
        <PermissionModal
          visible={showModal}
          permissions={permissions}
          isRequesting={status === 'requesting'}
          onRequestPermissions={requestPermissions}
          onOpenSettings={openSettings}
          onDismiss={() => setHasDismissedModal(true)}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

