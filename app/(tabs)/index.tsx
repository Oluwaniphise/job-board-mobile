import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEmployerJobs, useJobs } from "@/hooks/use-jobs-query";
import { useSession } from "@/providers/session-provider";

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const { user, applications } = useSession();
  const isEmployer = user?.role === "Employer";
  const { data: jobs, isLoading, isError } = useJobs();

  const {
    data: employerJobs,
    isLoading: isEmployerJobsLoading,
    isError: isEmployerJobsError,
  } = useEmployerJobs(isEmployer);
  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.jobId)),
    [applications],
  );

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

  console.log(jobs);
  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText>
          Welcome {user?.email}. Browse all jobs
          {isEmployer
            ? " and review jobs posted by your account."
            : " and apply with your resume."}
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
                {!isEmployer && hasApplied ? (
                  <ThemedText style={styles.appliedBadge}>Applied</ThemedText>
                ) : null}
              </View>
              <ThemedText>{item.companyName}</ThemedText>
              <ThemedText>{`${item.location} - ${item.jobType}`}</ThemedText>
              <ThemedText>{item.salaryRange}</ThemedText>
              <ThemedText>{item.summary}</ThemedText>
            </Pressable>
          );
        }}
        ListFooterComponent={
          isEmployer ? (
            <View style={styles.employerSection}>
              <ThemedText type="subtitle">Your posted jobs</ThemedText>
              {isEmployerJobsLoading ? (
                <ThemedText>Loading your jobs...</ThemedText>
              ) : null}
              {isEmployerJobsError ? (
                <ThemedText>
                  Unable to load your jobs. Please try again.
                </ThemedText>
              ) : null}
              {!isEmployerJobsLoading &&
              !isEmployerJobsError &&
              !employerJobs?.length ? (
                <ThemedText>You have not posted any jobs yet.</ThemedText>
              ) : null}
              {(employerJobs ?? []).map((item) => (
                <Pressable
                  key={item.id}
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
                  <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                  <ThemedText>{item.companyName}</ThemedText>
                  <ThemedText>{`${item.location} - ${item.jobType} - ${item.experienceLevel}`}</ThemedText>
                  <ThemedText>{item.salaryRange}</ThemedText>
                  <ThemedText>{item.summary}</ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null
        }
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
  employerSection: {
    marginTop: 20,
    gap: 12,
    paddingBottom: 20,
  },
});
