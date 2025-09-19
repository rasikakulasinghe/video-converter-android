import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import { MainScreen } from './src/screens/MainScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';

// Import types
import type { RootStackParamList } from './src/types/navigation';

// Import NativeWind styles
import './global.css';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2f6690',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{
                title: 'Video Converter',
                headerShown: true
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Settings',
                headerShown: true
              }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                title: 'Conversion Results',
                headerShown: true
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" backgroundColor="#2f6690" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}