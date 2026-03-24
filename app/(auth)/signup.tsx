import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

import { AuthLayout } from "@/components/auth/auth-layout";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import {
  useLoginMutation,
  useSignupMutation,
} from "@/hooks/use-auth-mutations";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SessionUser, useSessionStore } from "@/stores/session-store";

type RoleOption = "Candidate" | "Employer";

type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
};

export default function SignupScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [role, setRole] = useState<RoleOption>("Candidate");
  const router = useRouter();
  const setUser = useSessionStore((state) => state.setUser);
  const signupMutation = useSignupMutation();
  const loginMutation = useLoginMutation();

  const palette = Colors[colorScheme];
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormValues>({
    defaultValues: { firstName: "", lastName: "", email: "", passwordHash: "" },
    mode: "onChange",
  });

  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate(
      { ...data, role },
      {
        onSuccess: () => {
          // After signup, login automatically
          loginMutation.mutate(
            { email: data.email, password: data.passwordHash },
            {
              onSuccess: (loginResponse) => {
                const user: SessionUser = {
                  email: loginResponse.email,
                  token: loginResponse.token,
                };
                setUser(user);
                router.replace("/(tabs)");
              },
            },
          );
        },
      },
    );
  };
  const isFormReady = useMemo(() => isValid, [isValid]);

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join the job board in minutes."
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        // keyboardVerticalOffset adds space if you have a header
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.field}>
                <ThemedText type="defaultSemiBold">First name</ThemedText>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: "First name is required" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      autoCapitalize="words"
                      placeholder="Avery"
                      placeholderTextColor={palette.icon}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={[
                        styles.input,
                        {
                          borderColor: errors.firstName
                            ? "#e5484d"
                            : palette.icon,
                          color: palette.text,
                          backgroundColor:
                            colorScheme === "light" ? "#ffffff" : "#1f2123",
                        },
                      ]}
                    />
                  )}
                />
                {errors.firstName ? (
                  <ThemedText style={styles.errorText}>
                    {errors.firstName.message}
                  </ThemedText>
                ) : null}
              </View>
              <View style={styles.field}>
                <ThemedText type="defaultSemiBold">Last name</ThemedText>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: "Last name is required" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      autoCapitalize="words"
                      placeholder="Johnson"
                      placeholderTextColor={palette.icon}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={[
                        styles.input,
                        {
                          borderColor: errors.lastName
                            ? "#e5484d"
                            : palette.icon,
                          color: palette.text,
                          backgroundColor:
                            colorScheme === "light" ? "#ffffff" : "#1f2123",
                        },
                      ]}
                    />
                  )}
                />
                {errors.lastName ? (
                  <ThemedText style={styles.errorText}>
                    {errors.lastName.message}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <View style={styles.verticalField}>
              <ThemedText type="defaultSemiBold">Email</ThemedText>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="you@company.com"
                    placeholderTextColor={palette.icon}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={[
                      styles.input,
                      {
                        borderColor: errors.email ? "#e5484d" : palette.icon,
                        color: palette.text,
                        backgroundColor:
                          colorScheme === "light" ? "#ffffff" : "#1f2123",
                      },
                    ]}
                  />
                )}
              />
              {errors.email ? (
                <ThemedText style={styles.errorText}>
                  {errors.email.message}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.verticalField}>
              <ThemedText type="defaultSemiBold">Password</ThemedText>
              <Controller
                control={control}
                name="passwordHash"
                rules={{
                  required: "password is required",
                  minLength: {
                    value: 8,
                    message: "passwordHash must be at least 8 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="password"
                    secureTextEntry
                    placeholder="Create a password"
                    placeholderTextColor={palette.icon}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={[
                      styles.input,
                      {
                        borderColor: errors.passwordHash
                          ? "#e5484d"
                          : palette.icon,
                        color: palette.text,
                        backgroundColor:
                          colorScheme === "light" ? "#ffffff" : "#1f2123",
                      },
                    ]}
                  />
                )}
              />
              {errors.passwordHash ? (
                <ThemedText style={styles.errorText}>
                  {errors.passwordHash.message}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.verticalField}>
              <ThemedText type="defaultSemiBold">Role</ThemedText>
              <View style={[styles.roleGroup, { borderColor: palette.icon }]}>
                {(["Candidate", "Employer"] as RoleOption[]).map((option) => {
                  const isActive = role === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setRole(option)}
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor: isActive
                            ? palette.tint
                            : "transparent",
                          borderColor: "transparent",
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.roleLabel,
                          { color: isActive ? "#ffffff" : palette.text },
                        ]}
                      >
                        {option === "Candidate" ? "Candidate" : "Employer"}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              disabled={!isFormReady || signupMutation.isPending}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: isFormReady ? palette.tint : palette.icon,
                  opacity: isFormReady ? 1 : 0.55,
                },
              ]}
              onPress={handleSubmit(onSubmit)}
            >
              <ThemedText style={styles.primaryButtonText}>
                {signupMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </ThemedText>
            </Pressable>
            {signupMutation.isError ? (
              <ThemedText style={styles.errorText}>
                {signupMutation.error instanceof Error
                  ? signupMutation.error.message
                  : "Unable to create account."}
              </ThemedText>
            ) : null}

            <View style={styles.footer}>
              <ThemedText>Already have an account?</ThemedText>
              <Link href="/login" asChild>
                <Pressable>
                  <ThemedText type="link">Log in</ThemedText>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  form: {
    gap: 20,
    paddingTop: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  field: {
    flex: 1,
    gap: 8,
  },
  verticalField: {
    width: "100%",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  roleGroup: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 999,
    padding: 4,
    overflow: "hidden",
  },
  roleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 999,
  },
  roleLabel: {
    fontWeight: "600",
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  errorText: {
    color: "#e5484d",
    fontSize: 13,
  },
});
