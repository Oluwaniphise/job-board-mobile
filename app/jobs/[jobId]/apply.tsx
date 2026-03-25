import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useJob } from "@/hooks/use-jobs-query";
import { useSession } from "@/providers/session-provider";

type ApplyFormValues = {
  resumeUrl: string;
  coverLetter: string;
};

export default function ApplyScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const { user, applyToJob, getApplication } = useSession();
  const [pickedResume, setPickedResume] = useState<{ name: string; uri: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: job, isLoading, isError } = useJob(jobId);
  const isEmployer = user?.role === "Employer";
  const existingApplication = job ? getApplication(job.id) : undefined;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyFormValues>({
    defaultValues: {
      resumeUrl: existingApplication?.resumeUri ?? "",
      coverLetter: existingApplication?.coverLetter ?? "",
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: palette.background }]}>
        <ThemedText type="subtitle">Loading job...</ThemedText>
      </View>
    );
  }

  if (isError || !job) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: palette.background }]}>
        <ThemedText type="subtitle">Job not found</ThemedText>
      </View>
    );
  }

  if (isEmployer) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: palette.background }]}>
        <ThemedText type="subtitle">Employers cannot apply for jobs.</ThemedText>
      </View>
    );
  }

  const pickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: false,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setPickedResume({ name: asset.name, uri: asset.uri });
  };

  const onSubmit = async (values: ApplyFormValues) => {
    const resumeSource = pickedResume?.uri || values.resumeUrl.trim();
    const resumeName = pickedResume?.name || "Resume link";

    if (!resumeSource) {
      return;
    }

    setIsSubmitting(true);
    try {
      await applyToJob({
        jobId: job.id,
        resumeName,
        resumeUri: resumeSource,
        coverLetter: values.coverLetter.trim() || undefined,
      });
      router.replace(`/jobs/${job.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.background }]} contentContainerStyle={styles.content}>
      <ThemedText type="subtitle">{job.title}</ThemedText>
      <ThemedText>{`Company: ${job.company}`}</ThemedText>
      <ThemedText>Attach your resume using a file picker or paste a resume URL.</ThemedText>

      <Pressable onPress={pickResume} style={[styles.pickerButton, { borderColor: palette.icon }]}>
        <ThemedText type="defaultSemiBold">{pickedResume ? pickedResume.name : "Choose resume file"}</ThemedText>
      </Pressable>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Resume URL (optional if file is selected)</ThemedText>
        <Controller
          control={control}
          name="resumeUrl"
          rules={{
            validate: (value) => {
              if (pickedResume) {
                return true;
              }
              if (!value.trim()) {
                return "Provide a resume URL or select a file.";
              }
              return true;
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              placeholder="https://yourdomain.com/resume.pdf"
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                {
                  borderColor: errors.resumeUrl ? "#e5484d" : palette.icon,
                  color: palette.text,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
                },
              ]}
            />
          )}
        />
        {errors.resumeUrl ? <ThemedText style={styles.errorText}>{errors.resumeUrl.message}</ThemedText> : null}
      </View>

      <View style={styles.field}>
        <ThemedText type="defaultSemiBold">Cover letter (optional)</ThemedText>
        <Controller
          control={control}
          name="coverLetter"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Tell the employer why you're a strong fit."
              placeholderTextColor={palette.icon}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: palette.icon,
                  color: palette.text,
                  backgroundColor: colorScheme === "light" ? "#ffffff" : "#1f2123",
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
          {isSubmitting
            ? "Submitting..."
            : existingApplication
              ? "Update application"
              : "Submit application"}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  field: {
    gap: 8,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#e5484d",
    fontSize: 13,
  },
});
