import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const { user, signOut } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully.");
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View
        style={[
          styles.card,
          {
            borderColor: palette.icon,
            backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
          },
        ]}
      >
        <ThemedText type="subtitle">Account</ThemedText>
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Email</ThemedText>
          <ThemedText>{user?.email ?? "Unknown"}</ThemedText>
        </View>
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Role</ThemedText>
          <ThemedText>{user?.role ?? "Unknown"}</ThemedText>
        </View>
      </View>

      <Pressable
        onPress={handleSignOut}
        style={[styles.logoutButton, { backgroundColor: palette.tint }]}
      >
        <ThemedText style={styles.logoutText}>Log out</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  field: {
    gap: 4,
  },
  logoutButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
