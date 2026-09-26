/**
 * presentation/navigation/AppNavigator.tsx
 *
 * Bottom tab navigator styled in clean white with dark charcoal accents.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, StyleSheet } from 'react-native';
import { MapWorkspaceScreen } from '../screens/MapWorkspaceScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { MapOutlineIcon, RemindersOutlineIcon } from '../components/TabIcons';

export type RootTabParamList = {
  Map: undefined;
  Reminders: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 2,
        },
        headerTitleStyle: {
          color: '#1C1B1F',
          fontWeight: '800',
          fontSize: 18,
          letterSpacing: -0.3,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F2',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarActiveTintColor: '#1C1B1F',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapWorkspaceScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused, color }) => (
            <MapOutlineIcon focused={focused} color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Reminders',
          tabBarIcon: ({ focused, color }) => (
            <RemindersOutlineIcon focused={focused} color={color} size={22} />
          ),
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);
