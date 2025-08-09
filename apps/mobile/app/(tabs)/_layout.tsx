import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👥</Text>,
        }}
      />
        <Tabs.Screen
        name="postcode-finder"
        options={{
          title: 'Postcode Finder',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🔍</Text>,
        }}
      />
    </Tabs>
  );
}
