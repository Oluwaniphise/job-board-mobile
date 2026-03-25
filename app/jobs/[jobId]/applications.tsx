import { useLocalSearchParams } from "expo-router";
import { Link2 } from "lucide-react-native";
import { FlatList, Linking, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEmployerJobApplications } from "@/hooks/use-jobs-query";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";

function normalizeStatusLabel(status: string) {
  if (!status) return "Draft";
  const value = status.toLowerCase();
  if (value === "published") return "Published";
  if (value === "archived") return "Archived";
  if (value === "draft") return "Draft";
  return status;
}

function getStatusStyle(status: string) {
  const value = status.toLowerCase();
  if (value === "published") {
    return { backgroundColor: "#d1fae5", color: "#065f46" };
  }
  if (value === "archived") {
    return { backgroundColor: "#fee2e2", color: "#991b1b" };
  }
  return { backgroundColor: "#fef3c7", color: "#92400e" };
}

export default function JobApplicationsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const toast = useToast();
  const { user } = useSession();

  const isEmployer = user?.role === "Employer";
  const { data, isLoading, isError, refetch, isRefetching } =
    useEmployerJobApplications(jobId, isEmployer);

  const applications = data ?? [];

  const openResume = async (resumeUrl?: string) => {
    if (!resumeUrl) {
      toast.error("Resume URL is not available.");
      return;
    }

    const canOpen = await Linking.canOpenURL(resumeUrl);
    if (!canOpen) {
      toast.error("Unable to open resume link.");
      return;
    }

    await Linking.openURL(resumeUrl);
  };

  if (!isEmployer) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">
          Only employers can view job applications.
        </ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">Loading applications...</ThemedText>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">Unable to load applications.</ThemedText>
        <Pressable
          onPress={() => refetch()}
          style={[styles.retryButton, { borderColor: palette.icon }]}
        >
          <ThemedText type="defaultSemiBold">
            {isRefetching ? "Retrying..." : "Retry"}
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.headerRow}>
        <ThemedText type="title">{`Applications (${applications.length})`}</ThemedText>
        <ThemedText style={styles.jobIdText}>{`Job ID: ${jobId}`}</ThemedText>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <ThemedText type="subtitle">No applications yet</ThemedText>
            <ThemedText>Applications to this job will appear here.</ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const badge = getStatusStyle(item.status);
          const candidateName =
            `${item.candidateId.firstName} ${item.candidateId.lastName}`.trim() ||
            "Unknown candidate";
          const candidateEmail = item.candidateId.email || "No email";
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
              <View style={styles.cardTopRow}>
                <View style={styles.candidateWrap}>
                  <ThemedText type="defaultSemiBold">
                    {`Candidate: ${candidateName}`}
                  </ThemedText>
                  <ThemedText>{candidateEmail}</ThemedText>
                  <ThemedText>{`Applied ${new Date(item.createdAt).toLocaleDateString()}`}</ThemedText>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: badge.backgroundColor },
                  ]}
                >
                  <ThemedText style={{ color: badge.color, fontSize: 12 }}>
                    {normalizeStatusLabel(item.status)}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.applicationIdText}>
                {`Application ID: ${item.id}`}
              </ThemedText>

              <Pressable
                onPress={() => openResume(item.resumeUrl)}
                style={styles.resumeButton}
              >
                <Link2 size={16} color={palette.tint} />
                <ThemedText type="link">View Resume</ThemedText>
              </Pressable>
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
    alignItems: "center",
    gap: 10,
  },
  headerRow: {
    gap: 6,
    marginBottom: 12,
  },
  jobIdText: {
    fontSize: 12,
    opacity: 0.7,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyWrap: {
    marginTop: 20,
    gap: 6,
    alignItems: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  candidateWrap: {
    flex: 1,
    gap: 2,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  applicationIdText: {
    fontSize: 12,
    opacity: 0.75,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
});
