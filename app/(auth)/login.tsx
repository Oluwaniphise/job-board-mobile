import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useLoginMutation } from "@/hooks/use-auth-mutations";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { useSessionStore, type SessionUser } from "@/stores/session-store";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useSessionStore((state) => state.setUser);
  const loginMutation = useLoginMutation();

  const palette = Colors[colorScheme];
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        const user: SessionUser = {
          email: response.user.email,
          token: response.accessToken,
          role: response.user.role,
        };
        setUser(user);
        toast.success("Login successful!");
        router.replace("/(tabs)");
      },
      onError: (error) => {
        const message = error.message;
        toast.error(message);
      },
    });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in with your email and password to continue."
    >
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined,
          web: undefined,
        })}
        style={styles.flex}
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Email</ThemedText>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Enter a valid email",
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
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Password</ThemedText>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordToggleRow}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="password"
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={palette.icon}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    style={[
                      styles.input,
                      styles.passwordInput,
                      {
                        borderColor: errors.password ? "#e5484d" : palette.icon,
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
            {errors.password ? (
              <ThemedText style={styles.errorText}>
                {errors.password.message}
              </ThemedText>
            ) : null}
          </View>

          <Pressable
            disabled={!isValid || loginMutation.isPending}
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  isValid && !loginMutation.isPending
                    ? palette.tint
                    : palette.icon,
                opacity: isValid && !loginMutation.isPending ? 1 : 0.55,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
          >
            <ThemedText style={styles.primaryButtonText}>
              {loginMutation.isPending ? "Logging in..." : "Log in"}
            </ThemedText>
          </Pressable>

          <View style={styles.footer}>
            <ThemedText>New here? </ThemedText>
            <Link href="/signup" style={styles.link}>
              <ThemedText type="link">Create an account</ThemedText>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
  link: {
    alignSelf: "flex-start",
  },
  errorText: {
    color: "#e5484d",
    fontSize: 13,
  },
});
