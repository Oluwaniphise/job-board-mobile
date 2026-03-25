import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {
  useCreateJobMutation,
  useInvalidateJobs,
  type CreateJobPayload,
} from "@/hooks/use-jobs-query";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";

type CreateJobFormValues = {
  title: string;
  companyName: string;
  location: string;
  salaryRange: string;
  requiredSkills: string;
  jobType: CreateJobPayload["jobType"];
  experienceLevel: string;
  status: CreateJobPayload["status"];
  description: string;
};

const JOB_TYPES: CreateJobPayload["jobType"][] = [
  "Full-time",
  "Part-time",
  "Contract",
];
const STATUS_OPTIONS: CreateJobPayload["status"][] = [
  "Draft",
  "Published",
  "Archived",
];
const EXPERIENCE_LEVELS = ["Intern", "Junior", "Mid-Level", "Senior"];

function buildSummary(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= 140) {
    return normalized;
  }
  return `${normalized.slice(0, 137).trimEnd()}...`;
}

export default function CreateJobScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const invalidateJobs = useInvalidateJobs();
  const createJobMutation = useCreateJobMutation();
  const { user } = useSession();

  const { control, handleSubmit, watch, setValue } = useForm<CreateJobFormValues>({
    defaultValues: {
      title: "",
      companyName: "",
      location: "",
      salaryRange: "",
      requiredSkills: "",
      jobType: "Full-time",
      experienceLevel: "Intern",
      status: "Draft",
      description: "",
    },
  });

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

  const onSubmit = async (values: CreateJobFormValues) => {
    const requiredSkills = values.requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

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

  const selectedJobType = watch("jobType");
  const selectedStatus = watch("status");
  const selectedExperience = watch("experienceLevel");

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: palette.background }]}
      behavior={Platform.select({ ios: "padding", android: "height" })}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title">Create New Job</ThemedText>
        <ThemedText>Fill in details below to publish a job posting.</ThemedText>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Job Title</ThemedText>
        <Controller
          control={control}
          name="title"
          rules={{ required: "Job title is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="e.g. Senior Frontend Engineer"
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Company Name</ThemedText>
        <Controller
          control={control}
          name="companyName"
          rules={{ required: "Company name is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Company Inc."
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Location</ThemedText>
        <Controller
          control={control}
          name="location"
          rules={{ required: "Location is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Remote or City, Country"
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Salary Range</ThemedText>
        <Controller
          control={control}
          name="salaryRange"
          rules={{ required: "Salary range is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="$80,000 - $110,000"
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">
          Required Skills (comma separated)
        </ThemedText>
        <Controller
          control={control}
          name="requiredSkills"
          rules={{ required: "Required skills are needed" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="React, TypeScript, Tailwind"
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Job Type</ThemedText>
        <View style={styles.optionsRow}>
          {JOB_TYPES.map((option) => {
            const active = selectedJobType === option;
            return (
              <Pressable
                key={option}
                onPress={() => setValue("jobType", option)}
                style={[
                  styles.optionButton,
                  {
                    borderColor: active ? palette.tint : palette.icon,
                    backgroundColor:
                      active && colorScheme === "light"
                        ? "#d9f3fb"
                        : active
                          ? "#1f3e47"
                          : "transparent",
                  },
                ]}
              >
                <ThemedText type="defaultSemiBold">{option}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Experience Level</ThemedText>
        <View style={styles.optionsRow}>
          {EXPERIENCE_LEVELS.map((option) => {
            const active = selectedExperience === option;
            return (
              <Pressable
                key={option}
                onPress={() => setValue("experienceLevel", option)}
                style={[
                  styles.optionButton,
                  {
                    borderColor: active ? palette.tint : palette.icon,
                    backgroundColor:
                      active && colorScheme === "light"
                        ? "#d9f3fb"
                        : active
                          ? "#1f3e47"
                          : "transparent",
                  },
                ]}
              >
                <ThemedText type="defaultSemiBold">{option}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Status</ThemedText>
        <View style={styles.optionsRow}>
          {STATUS_OPTIONS.map((option) => {
            const active = selectedStatus === option;
            return (
              <Pressable
                key={option}
                onPress={() => setValue("status", option)}
                style={[
                  styles.optionButton,
                  {
                    borderColor: active ? palette.tint : palette.icon,
                    backgroundColor:
                      active && colorScheme === "light"
                        ? "#d9f3fb"
                        : active
                          ? "#1f3e47"
                          : "transparent",
                  },
                ]}
              >
                <ThemedText type="defaultSemiBold">{option}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Job Description</ThemedText>
        <Controller
          control={control}
          name="description"
          rules={{ required: "Job description is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              multiline
              numberOfLines={6}
              placeholder="Describe responsibilities, requirements and benefits."
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                styles.textArea,
                {
                  color: palette.text,
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            />
          )}
        />
      </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={createJobMutation.isPending}
          style={[
            styles.submitButton,
            {
              backgroundColor: createJobMutation.isPending
                ? palette.icon
                : palette.tint,
              opacity: createJobMutation.isPending ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText style={styles.submitText}>
            {createJobMutation.isPending ? "Creating..." : "Create Job"}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 80,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 130,
    textAlignVertical: "top",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
