import { Link, useLocalSearchParams } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useJob } from "@/hooks/use-jobs-query";
import { useSession } from "@/providers/session-provider";

export default function JobDetailsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user, hasApplied, getApplication } = useSession();
  const isEmployer = user?.role === "Employer";

  const { data: job, isLoading, isError } = useJob(jobId);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">Loading job...</ThemedText>
      </View>
    );
  }

  if (isError || !job) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">Job not found</ThemedText>
      </View>
    );
  }

  const applied = hasApplied(job.id);
  const application = getApplication(job.id);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <ThemedText type="title">{job.title}</ThemedText>
        <ThemedText>{job.companyName}</ThemedText>
        <ThemedText>{`${job.location} • ${job.jobType}`}</ThemedText>
        <ThemedText>{job.salaryRange}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Job description</ThemedText>
        <ThemedText>{job.description}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Requirements</ThemedText>
        {job.requiredSkills.map((requirement) => (
          <ThemedText key={requirement}>{`\u2022 ${requirement}`}</ThemedText>
        ))}
      </View>

      {applied && application ? (
        <View style={[styles.appliedCard, { borderColor: palette.icon }]}>
          <ThemedText type="defaultSemiBold">Application submitted</ThemedText>
          <ThemedText>{`Resume: ${application.resumeName}`}</ThemedText>
          <ThemedText>{`Date: ${new Date(application.appliedAt).toLocaleDateString()}`}</ThemedText>
        </View>
      ) : null}

      {!isEmployer ? (
        <View style={styles.actionRow}>
          <Link href={`/jobs/${job.id}/apply`} asChild>
            <Pressable
              style={[
                styles.button,
                {
                  backgroundColor: palette.tint,
                  shadowColor: palette.tint,
                },
              ]}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonTextWrap}>
                  <ThemedText style={styles.buttonLabel}>
                    {applied ? "Update application" : "Apply now"}
                  </ThemedText>
                  <ThemedText style={styles.buttonSubLabel}>
                    {applied
                      ? "Edit your resume and cover letter."
                      : "Submit your resume in one step."}
                  </ThemedText>
                </View>
                <ArrowUpRight size={20} color="#ffffff" />
              </View>
            </Pressable>
          </Link>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 18,
    paddingBottom: 30,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    gap: 8,
  },
  section: {
    gap: 8,
  },
  appliedCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  buttonTextWrap: {
    flex: 1,
    gap: 2,
  },
  actionRow: {
    gap: 10,
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonSubLabel: {
    color: "#e8f7ff",
    fontSize: 13,
  },
});
