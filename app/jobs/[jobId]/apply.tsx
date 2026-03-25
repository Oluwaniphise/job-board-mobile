import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useJob } from "@/hooks/use-jobs-query";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/providers/session-provider";

type ApplyFormValues = {
  coverLetter: string;
};

export default function ApplyScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const router = useRouter();
  const toast = useToast();
  const { user, applyToJob, getApplication } = useSession();
  const [pickedResume, setPickedResume] = useState<{
    name: string;
    uri: string;
    mimeType?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: job, isLoading, isError } = useJob(jobId);
  const isEmployer = user?.role === "Employer";
  const existingApplication = job ? getApplication(job.id) : undefined;

  const { control, handleSubmit } = useForm<ApplyFormValues>({
    defaultValues: {
      coverLetter: existingApplication?.coverLetter ?? "",
    },
  });

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

  if (isEmployer) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: palette.background },
        ]}
      >
        <ThemedText type="subtitle">
          Employers cannot apply for jobs.
        </ThemedText>
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
    setPickedResume({
      name: asset.name,
      uri: asset.uri,
      mimeType: asset.mimeType,
    });
  };

  const onSubmit = async (values: ApplyFormValues) => {
    if (!pickedResume) {
      toast.error("Select a resume file before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await applyToJob({
        jobId: job.id,
        resumeName: pickedResume.name,
        resumeUri: pickedResume.uri,
        resumeType: pickedResume.mimeType,
        coverLetter: values.coverLetter.trim() || undefined,
      });

      console.log(res);
      toast.success(
        existingApplication
          ? "Application updated successfully."
          : "Application submitted successfully.",
      );
      router.replace(`/jobs/${job.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
    >
      <ThemedText type="subtitle">{job.title}</ThemedText>
      <ThemedText>{`Company: ${job.companyName}`}</ThemedText>
      <ThemedText>
        Attach your resume file and submit your cover letter.
      </ThemedText>

      <Pressable
        onPress={pickResume}
        style={[styles.pickerButton, { borderColor: palette.icon }]}
      >
        <ThemedText type="defaultSemiBold">
          {pickedResume ? pickedResume.name : "Choose resume file"}
        </ThemedText>
      </Pressable>

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
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
