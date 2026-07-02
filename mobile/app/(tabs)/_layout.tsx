import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Home, Camera, ClipboardList, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#233137",
        tabBarInactiveTintColor: "#A2A7A7",
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.2 : 1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "AI Scan",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.scanIconWrapper, focused && styles.scanIconWrapperActive]}>
              <Camera size={22} color={focused ? "#F2F5F5" : color} strokeWidth={focused ? 2.2 : 1.6} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <ClipboardList size={22} color={color} strokeWidth={focused ? 2.2 : 1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.2 : 1.6} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#F9F9F9",
    borderTopWidth: 1,
    borderTopColor: "#E5EBEB",
    height: 72,
    paddingTop: 10,
    paddingBottom: 14,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },
  scanIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scanIconWrapperActive: {
    backgroundColor: "#233137",
  },
});
