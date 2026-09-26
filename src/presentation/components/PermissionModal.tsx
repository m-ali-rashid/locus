/**
 * presentation/components/PermissionModal.tsx
 *
 * Minimalist White Onboarding Modal inspired by the Waynest design:
 * - Crisp white card with soft shadow and rounded top corners.
 * - Bold typography with subtle dark grey descriptions.
 * - High-contrast dark charcoal button: "› › › ›  Get started  › › › ›".
 */
import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { PermissionBundle } from '../../core/permissions/PermissionsOrchestrator';

interface Props {
  visible: boolean;
  permissions: PermissionBundle | null;
  isRequesting: boolean;
  onRequestPermissions: () => void;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

export const PermissionModal: React.FC<Props> = ({
  visible,
  permissions,
  isRequesting,
  onRequestPermissions,
  onOpenSettings,
  onDismiss,
}) => {
  if (!visible) return null;

  const locationDenied =
    permissions?.location.status === 'denied' ||
    permissions?.location.status === 'restricted' ||
    permissions?.location.status === 'never_ask_again';

  const notifDenied = permissions?.notification === 'denied';
  const hasPermanentDenial = locationDenied || notifDenied;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={styles.backdropTap}
          activeOpacity={1}
          onPress={onDismiss}
        />

        {/* White bottom card */}
        <View style={styles.card}>
          <View style={styles.grabber} />

          <Text style={styles.title}>
            Getting Started – Locus{'\n'}App Onboarding Flow
          </Text>

          <Text style={styles.subtitle}>
            Locus makes smart contextual reminders simple. Get started in
            seconds by saving your favorite places and receiving intelligent
            alerts on arrival and departure.
          </Text>

          {/* Value highlights */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📍</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Always-On Geofencing</Text>
                <Text style={styles.featureDesc}>
                  Triggers alerts reliably even when your phone is locked.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🔔</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Instant On-Device Alerts</Text>
                <Text style={styles.featureDesc}>
                  Zero battery drain with completely local processing.
                </Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          {hasPermanentDenial ? (
            <>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={onOpenSettings}
                activeOpacity={0.85}
              >
                <Text style={styles.arrowText}>› › › › </Text>
                <Text style={styles.primaryBtnText}>Open Settings </Text>
                <Text style={styles.arrowText}>› › › ›</Text>
              </TouchableOpacity>
              <Text style={styles.settingsHint}>
                Please enable "Always" Location in Settings to continue.
              </Text>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onRequestPermissions}
              disabled={isRequesting}
              activeOpacity={0.85}
            >
              {isRequesting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.arrowText}>› › › ›  </Text>
                  <Text style={styles.primaryBtnText}>Get started  </Text>
                  <Text style={styles.arrowText}>› › › ›</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <Text style={styles.skipBtnText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'flex-end',
  },
  backdropTap: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 16,
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 20,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E4E4E7',
    marginBottom: 20,
  },
  title: {
    color: '#1C1B1F',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
    marginBottom: 12,
  },
  subtitle: {
    color: '#71717A',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  features: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: '#1C1B1F',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    color: '#71717A',
    fontSize: 12,
    lineHeight: 16,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#1C1B1F',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1C1B1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#B3A2E8',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  settingsHint: {
    color: '#E05D52',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipBtnText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
});
