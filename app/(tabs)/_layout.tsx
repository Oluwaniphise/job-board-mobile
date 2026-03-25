import { Redirect, Tabs, useRouter } from "expo-router";
import {
  BriefcaseBusiness,
  CircleUserRound,
  LayoutGrid,
  NotepadTextDashed,
} from "lucide-react-native";
import React from "react";
import { Platform, Pressable, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSession } from "@/providers/session-provider";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, isHydrating, signOut } = useSession();
  const isEmployer = user?.role === "Employer";

  if (isHydrating) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].icon,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: Platform.select({ ios: 18, android: 12, default: 12 }),
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {isEmployer ? (
              <Pressable onPress={() => router.push("/jobs/create")}>
                <ThemedText type="link">Create Job</ThemedText>
              </Pressable>
            ) : null}
            <Pressable
              onPress={async () => {
                await signOut();
                router.replace("/login");
              }}
              style={{ paddingHorizontal: 16 }}
            >
              <ThemedText type="link">Log out</ThemedText>
            </Pressable>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.9 }}>
              <LayoutGrid
                size={22}
                color={color}
                strokeWidth={focused ? 2.6 : 2.2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: isEmployer ? "My  Jobs" : "Applications",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.9 }}>
              {isEmployer ? (
                <BriefcaseBusiness
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.6 : 2.2}
                />
              ) : (
                <NotepadTextDashed
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.6 : 2.2}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.9 }}>
              <CircleUserRound
                size={22}
                color={color}
                strokeWidth={focused ? 2.6 : 2.2}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
