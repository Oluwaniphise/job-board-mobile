import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useDeleteJobMutation,
  useEmployerJobs,
  useInvalidateJobs,
  useJobs,
} from "@/hooks/use-jobs-query";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";

export default function ApplicationsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const toast = useToast();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const { user, applications, syncMyApplications } = useSession();
  const isEmployer = user?.role === "Employer";
  const invalidateJobs = useInvalidateJobs();
  const deleteJobMutation = useDeleteJobMutation();

  const { data: jobs } = useJobs();
  const {
    data: employerJobs,
    isLoading: isEmployerJobsLoading,
    isError: isEmployerJobsError,
  } = useEmployerJobs(isEmployer);

  useEffect(() => {
    if (isEmployer) {
      return;
    }

    if (typeof syncMyApplications !== "function") {
      return;
    }

    syncMyApplications().catch(() => {});
  }, [isEmployer, syncMyApplications]);

  const handleRefresh = async () => {
    if (typeof syncMyApplications !== "function") {
      toast.error("Please reload the app to use refresh.");
      return;
    }

    setIsRefreshing(true);
    try {
      await syncMyApplications();
      toast.success("Applications refreshed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to refresh applications.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    Alert.alert(
      "Delete job",
      "This will permanently remove the job post. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeletingJobId(jobId);
            deleteJobMutation.mutate(jobId, {
              onSuccess: () => {
                invalidateJobs();
                toast.success("Job deleted.");
              },
              onError: (error) => {
                toast.error(error.message || "Failed to delete job.");
              },
              onSettled: () => {
                setDeletingJobId(null);
              },
            });
          },
        },
      ],
    );
  };

  if (isEmployer) {
    if (isEmployerJobsLoading) {
      return (
        <View
          style={[
            styles.container,
            styles.centered,
            { backgroundColor: palette.background },
          ]}
        >
          <ThemedText type="subtitle">Loading employer data...</ThemedText>
        </View>
      );
    }

    if (isEmployerJobsError) {
      return (
        <View
          style={[
            styles.container,
            styles.centered,
            { backgroundColor: palette.background },
          ]}
        >
          <ThemedText type="subtitle">Unable to load employer jobs</ThemedText>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ThemedText type="subtitle" style={styles.employerHeader}>
          Your posted jobs
        </ThemedText>
        <FlatList
          data={employerJobs ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={<ThemedText>No jobs posted yet</ThemedText>}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  borderColor: palette.icon,
                  backgroundColor:
                    colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            >
              <Pressable onPress={() => router.push(`/jobs/${item.id}/applications`)}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText>{item.companyName}</ThemedText>
                <ThemedText>{`${item.location} - ${item.jobType}`}</ThemedText>
                <ThemedText>{item.salaryRange}</ThemedText>
              </Pressable>
              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => router.push(`/jobs/${item.id}/edit`)}
                  style={[styles.actionButton, { borderColor: palette.icon }]}
                >
                  <ThemedText type="defaultSemiBold">Edit</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteJob(item.id)}
                  disabled={deletingJobId === item.id}
                  style={[styles.actionButton, styles.deleteAction]}
                >
                  <ThemedText style={styles.deleteActionText}>
                    {deletingJobId === item.id ? "Deleting..." : "Delete"}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  if (!applications.length) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">No applications yet</ThemedText>
        <ThemedText>
          Go to Dashboard, open a job, and apply with your resume.
        </ThemedText>
        <Pressable
          onPress={handleRefresh}
          disabled={isRefreshing}
          style={[styles.refreshButton, { borderColor: palette.icon }]}
        >
          <ThemedText type="defaultSemiBold">
            {isRefreshing ? "Refreshing..." : "Refresh applications"}
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Pressable
        onPress={handleRefresh}
        disabled={isRefreshing}
        style={[styles.refreshButton, { borderColor: palette.icon }]}
      >
        <ThemedText type="defaultSemiBold">
          {isRefreshing ? "Refreshing..." : "Refresh applications"}
        </ThemedText>
      </Pressable>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.jobId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const job = jobs?.find((entry) => entry.id === item.jobId);
          return (
            <View
              style={[
                styles.card,
                {
                  borderColor: palette.icon,
                  backgroundColor:
                    colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            >
              <ThemedText type="defaultSemiBold">
                {job?.title ?? "Job no longer available"}
              </ThemedText>
              <ThemedText>{job?.companyName ?? "Unknown company"}</ThemedText>
              <ThemedText>{`Resume: ${item.resumeName}`}</ThemedText>
              <ThemedText>{`Applied on ${new Date(item.appliedAt).toLocaleDateString()}`}</ThemedText>
            </View>
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
  centered: {
    justifyContent: "center",
    gap: 8,
  },
  refreshButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 12,
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
  actionRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  deleteAction: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2",
  },
  deleteActionText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
  employerHeader: {
    marginBottom: 12,
  },
});
