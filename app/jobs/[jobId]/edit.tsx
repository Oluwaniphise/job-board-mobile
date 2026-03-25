import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import {
  buildSummary,
  DEFAULT_JOB_FORM_VALUES,
  JobForm,
  parseRequiredSkills,
  type JobFormValues,
} from "@/components/jobs/job-form";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useEmployerJobs,
  useInvalidateJobs,
  useUpdateJobMutation,
  type CreateJobPayload,
} from "@/hooks/use-jobs-query";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";

export default function EditJobScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const invalidateJobs = useInvalidateJobs();
  const updateJobMutation = useUpdateJobMutation();
  const { user } = useSession();

  const { data: employerJobs, isLoading } = useEmployerJobs(
    user?.role === "Employer",
  );
  const existingJob = employerJobs?.find((job) => job.id === jobId);

  if (user?.role !== "Employer") {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">Only employers can edit jobs.</ThemedText>
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
        <ThemedText type="subtitle">Loading job...</ThemedText>
      </View>
    );
  }

  if (!existingJob) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">Job not found.</ThemedText>
      </View>
    );
  }

  const initialValues: JobFormValues = {
    title: existingJob.title ?? "",
    companyName: existingJob.companyName ?? "",
    location: existingJob.location ?? "",
    salaryRange: existingJob.salaryRange ?? "",
    requiredSkills: (existingJob.requiredSkills ?? []).join(", "),
    jobType: existingJob.jobType ?? "Full-time",
    experienceLevel: existingJob.experienceLevel ?? "Intern",
    status: existingJob.status ?? "Draft",
    description: existingJob.description ?? "",
  };

  const onSubmit = (values: JobFormValues) => {
    const requiredSkills = parseRequiredSkills(values.requiredSkills);
    if (!requiredSkills.length) {
      toast.error("Add at least one required skill.");
      return;
    }

    const payload: CreateJobPayload = {
      title: values.title.trim(),
      companyName: values.companyName.trim(),
      location: values.location.trim(),
      salaryRange: values.salaryRange.trim(),
      requiredSkills,
      jobType: values.jobType,
      experienceLevel: values.experienceLevel.trim(),
      status: values.status,
      description: values.description.trim(),
      summary: buildSummary(values.description),
    };

    updateJobMutation.mutate(
      { jobId: existingJob.id, payload },
      {
        onSuccess: () => {
          invalidateJobs();
          toast.success("Job updated successfully.");
          router.replace("/(tabs)/explore");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update job.");
        },
      },
    );
  };

  return (
    <JobForm
      title="Edit Job"
      subtitle="Update job details and save your changes."
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      isSubmitting={updateJobMutation.isPending}
      initialValues={initialValues ?? DEFAULT_JOB_FORM_VALUES}
      onSubmit={onSubmit}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});
