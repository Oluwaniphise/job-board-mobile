import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useJobs } from "@/hooks/use-jobs-query";
import { useSession } from "@/providers/session-provider";

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const { user, applications } = useSession();
  const { data: jobs, isLoading, isError } = useJobs();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ThemedText>Loading jobs...</ThemedText>
      </View>
    );
  }

  if (isError || !jobs) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ThemedText>Unable to load jobs. Please try again.</ThemedText>
      </View>
    );
  }

  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.jobId)),
    [applications],
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText>
          Welcome {user?.email}. Browse jobs and apply with your resume.
        </ThemedText>
      </View>

      <FlatList
        data={jobs ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const hasApplied = appliedJobIds.has(item.id);
          return (
            <Pressable
              onPress={() => router.push(`/jobs/${item.id}`)}
              style={[
                styles.card,
                {
                  borderColor: palette.icon,
                  backgroundColor:
                    colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                {hasApplied ? (
                  <ThemedText style={styles.appliedBadge}>Applied</ThemedText>
                ) : null}
              </View>
              <ThemedText>{item.company}</ThemedText>
              <ThemedText>{`${item.location} - ${item.type}`}</ThemedText>
              <ThemedText>{item.salaryRange}</ThemedText>
              <ThemedText>{item.summary}</ThemedText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  appliedBadge: {
    backgroundColor: "#0a7ea4",
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    lineHeight: 16,
  },
});
