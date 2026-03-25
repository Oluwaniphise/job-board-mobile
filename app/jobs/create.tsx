import { useRouter } from "expo-router";
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
  useCreateJobMutation,
  useInvalidateJobs,
  type CreateJobPayload,
} from "@/hooks/use-jobs-query";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";

export default function CreateJobScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const invalidateJobs = useInvalidateJobs();
  const createJobMutation = useCreateJobMutation();
  const { user } = useSession();

  if (user?.role !== "Employer") {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">
          Only employers can create job postings.
        </ThemedText>
      </View>
    );
  }

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

    createJobMutation.mutate(payload, {
      onSuccess: () => {
        invalidateJobs();
        toast.success("Job created successfully.");
        router.replace("/(tabs)");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create job.");
      },
    });
  };

  return (
    <JobForm
      title="Create New Job"
      subtitle="Fill in details below to publish a job posting."
      submitLabel="Create Job"
      submittingLabel="Creating..."
      isSubmitting={createJobMutation.isPending}
      initialValues={DEFAULT_JOB_FORM_VALUES}
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
