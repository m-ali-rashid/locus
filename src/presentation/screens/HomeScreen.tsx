/**
 * presentation/screens/HomeScreen.tsx
 *
 * Step 1 stub — renders the PermissionStatus card only.
 * Full map UI and reminder list will be added in Step 2.
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionStatus } from '../components/PermissionStatus';

export const HomeScreen: React.FC = () => {
  const { status, permissions, error, requestPermissions } = usePermissions();

  const isLoading = status === 'checking' || status === 'requesting';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>📍 Locus</Text>
        <Text style={styles.subtitle}>Contextual Reminders</Text>
      </View>

      <PermissionStatus
        isLoading={isLoading}
        permissions={permissions}
        error={error}
        onRequestPermissions={requestPermissions}
      />

      <View style={styles.debugSection}>
        <Text style={styles.debugLabel}>Debug info (dev only)</Text>
        <Text style={styles.debugValue}>
          {JSON.stringify(
            { status, location: permissions?.location, notification: permissions?.notification },
            null,
            2,
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#11111B',
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  wordmark: {
    color: '#CDD6F4',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6C7086',
    fontSize: 14,
    marginTop: 2,
  },
  debugSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#181825',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#313244',
  },
  debugLabel: {
    color: '#6C7086',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  debugValue: {
    color: '#A6E3A1',
    fontSize: 12,
    fontFamily: 'Courier',
  },
});
