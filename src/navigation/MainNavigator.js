// MainNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/homeScreen';
import Result from '../screens/resultScreen';

const Stack = createStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          height: 0,
        },
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Result" component={Result} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default MainNavigator;
