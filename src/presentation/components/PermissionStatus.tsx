/**
 * presentation/components/PermissionStatus.tsx
 *
 * Pure display component — renders the current PermissionBundle as a
 * status card. No business logic; props-driven.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { PermissionBundle } from '../../core/permissions/PermissionsOrchestrator';
import type { AppError } from '../../core/errors/AppError';

interface Props {
  isLoading: boolean;
  permissions: PermissionBundle | null;
  error: AppError | null;
  onRequestPermissions: () => void;
}

const StatusDot = ({ ok }: { ok: boolean }) => (
  <View style={[styles.dot, ok ? styles.dotGreen : styles.dotRed]} />
);

export const PermissionStatus: React.FC<Props> = ({
  isLoading,
  permissions,
  error,
  onRequestPermissions,
}) => {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#4F8EF7" />
        <Text style={styles.loadingText}>Checking permissions…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.card, styles.cardError]}>
        <Text style={styles.errorTitle}>⚠️ Permission Error</Text>
        <Text style={styles.errorBody}>{error.message}</Text>
        <Text style={styles.errorCode}>[{error.code}]</Text>
        <TouchableOpacity style={styles.button} onPress={onRequestPermissions}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permissions) {
    return null;
  }

  const locationOk = permissions.location.level === 'always';
  const notifOk = permissions.notification === 'granted';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Permission Status</Text>

      <View style={styles.row}>
        <StatusDot ok={locationOk} />
        <View style={styles.rowText}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>
            {permissions.location.level.toUpperCase()} ·{' '}
            {permissions.location.status}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <StatusDot ok={notifOk} />
        <View style={styles.rowText}>
          <Text style={styles.label}>Notifications</Text>
          <Text style={styles.value}>{permissions.notification}</Text>
        </View>
      </View>

      {!permissions.allGranted && (
        <TouchableOpacity style={styles.button} onPress={onRequestPermissions}>
          <Text style={styles.buttonText}>Grant Required Permissions</Text>
        </TouchableOpacity>
      )}

      {permissions.allGranted && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ All permissions granted</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  title: {
    color: '#CDD6F4',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  dotGreen: { backgroundColor: '#A6E3A1' },
  dotRed: { backgroundColor: '#F38BA8' },
  rowText: { flex: 1 },
  label: {
    color: '#CDD6F4',
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    color: '#6C7086',
    fontSize: 13,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#4F8EF7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#1E3A2F',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  badgeText: {
    color: '#A6E3A1',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    color: '#6C7086',
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#F38BA8',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorBody: {
    color: '#CDD6F4',
    fontSize: 14,
    marginBottom: 4,
  },
  errorCode: {
    color: '#6C7086',
    fontSize: 12,
    fontFamily: 'Courier',
  },
});
