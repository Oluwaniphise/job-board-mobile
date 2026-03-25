import { Link, useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
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
import { useToast } from "@/hooks/use-toast";
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
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const toast = useToast();
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
                  email: loginResponse.user.email,
                  token: loginResponse.accessToken,
                  role: loginResponse.user.role ?? role,
                };
                setUser(user);
                toast.success("Account created successfully!");
                router.replace("/(tabs)");
              },
              onError: (error) => {
                const message = error.message;
                toast.error(message);
              },
            },
          );
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Signup failed";
          toast.error(message);
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
                  <View style={styles.passwordToggleRow}>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="password"
                      secureTextEntry={!showPassword}
                      placeholder="Create a password"
                      placeholderTextColor={palette.icon}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      style={[
                        styles.input,
                        styles.passwordInput,
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
                    <Pressable
                      style={styles.passwordToggleButton}
                      onPress={() => setShowPassword((prev: boolean) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff color={palette.text} size={20} />
                      ) : (
                        <Eye color={palette.text} size={20} />
                      )}
                    </Pressable>
                  </View>
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
                          {
                            color: isActive ? palette.background : palette.text,
                          },
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
                  opacity: isFormReady && !signupMutation.isPending ? 1 : 0.55,
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
  passwordToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  passwordInput: {
    flex: 1,
  },
  passwordToggleButton: {
    padding: 10,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#000",
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
