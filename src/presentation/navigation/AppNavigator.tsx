/**
 * presentation/navigation/AppNavigator.tsx
 *
 * Bottom tab navigator styled in clean white with dark charcoal accents.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, StyleSheet } from 'react-native';
import { MapScreen } from '../screens/MapScreen';
import { RemindersScreen } from '../screens/RemindersScreen';

export type RootTabParamList = {
  Map: undefined;
  Reminders: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
);

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
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          title: 'Reminders',
          headerShown: true,
          tabBarLabel: 'Reminders',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);
