import { useEffect } from "react";
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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { type CreateJobPayload } from "@/hooks/use-jobs-query";

export type JobFormValues = {
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

export const DEFAULT_JOB_FORM_VALUES: JobFormValues = {
  title: "",
  companyName: "",
  location: "",
  salaryRange: "",
  requiredSkills: "",
  jobType: "Full-time",
  experienceLevel: "Intern",
  status: "Draft",
  description: "",
};

export function parseRequiredSkills(input: string): string[] {
  return input
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function buildSummary(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= 140) {
    return normalized;
  }
  return `${normalized.slice(0, 137).trimEnd()}...`;
}

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

type JobFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  initialValues?: JobFormValues;
  onSubmit: (values: JobFormValues) => void;
};

export function JobForm({
  title,
  subtitle,
  submitLabel,
  submittingLabel,
  isSubmitting,
  initialValues = DEFAULT_JOB_FORM_VALUES,
  onSubmit,
}: JobFormProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const { control, handleSubmit, watch, setValue, reset } =
    useForm<JobFormValues>({
      defaultValues: initialValues,
    });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

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
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText>{subtitle}</ThemedText>

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
                    backgroundColor:
                      colorScheme === "light" ? "#ffffff" : "#1f2123",
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
                    backgroundColor:
                      colorScheme === "light" ? "#ffffff" : "#1f2123",
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
                    backgroundColor:
                      colorScheme === "light" ? "#ffffff" : "#1f2123",
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
                    backgroundColor:
                      colorScheme === "light" ? "#ffffff" : "#1f2123",
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
                    backgroundColor:
                      colorScheme === "light" ? "#ffffff" : "#1f2123",
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
                numberOfLines={8}
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
                    backgroundColor:
                      colorScheme === "light" ? "#ffffff" : "#1f2123",
                  },
                ]}
              />
            )}
          />
        </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            {
              backgroundColor: isSubmitting ? palette.icon : palette.tint,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
        >
          <ThemedText style={styles.submitText}>
            {isSubmitting ? submittingLabel : submitLabel}
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
