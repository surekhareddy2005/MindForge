import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import CoursesScreen from '../screens/CoursesScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StudyMaterialsScreen from '../screens/StudyMaterialsScreen';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';
import ModuleDetailsScreen from '../screens/ModuleDetailsScreen';
import SessionScreen from '../screens/SessionScreen';
import StudyGuideScreen from '../screens/StudyGuideScreen';
import { useTheme } from '../context/ThemeContext';
import { Feather } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home (Dashboard) Sub-Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
      <Stack.Screen name="ModuleDetails" component={ModuleDetailsScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="StudyGuide" component={StudyGuideScreen} />
    </Stack.Navigator>
  );
}

// Courses Sub-Stack
function CoursesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoursesMain" component={CoursesScreen} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
      <Stack.Screen name="ModuleDetails" component={ModuleDetailsScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="StudyGuide" component={StudyGuideScreen} />
    </Stack.Navigator>
  );
}

// Study Guides (Materials) Sub-Stack
function StudyMaterialsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyMaterialsMain" component={StudyMaterialsScreen} />
      <Stack.Screen name="StudyGuide" component={StudyGuideScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="ModuleDetails" component={ModuleDetailsScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 62,
          backgroundColor: '#0a0a0a', // Solid premium dark black
          borderTopWidth: 1.5,
          borderTopColor: 'rgba(79, 70, 229, 0.18)', // Subtle gold top border
          paddingBottom: 6,
          paddingTop: 8,
          borderWidth: 0,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 8.5,
          fontWeight: '800',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'book';
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Courses') {
            iconName = 'book';
          } else if (route.name === 'StudyMaterials') {
            iconName = 'book-open';
          } else if (route.name === 'Feedback') {
            iconName = 'star';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return (
            <View style={styles.iconContainer}>
              <Feather name={iconName} size={20} color={color} />
              {focused && (
                <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HomeStack} 
        options={{ title: 'Home' }} 
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesStack} 
        options={{ title: 'Courses' }} 
      />
      <Tab.Screen 
        name="StudyMaterials" 
        component={StudyMaterialsStack} 
        options={{ title: 'Study Guides' }} 
      />
      <Tab.Screen 
        name="Feedback" 
        component={FeedbackScreen} 
        options={{ title: 'Feedback' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -6,
  }
});
