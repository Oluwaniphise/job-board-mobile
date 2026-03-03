import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';

import { AuthLayout } from '@/components/auth/auth-layout';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/providers/session-provider';

type LoginFormValues = {
  username: string;
  password: string;
};

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { signIn } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const palette = Colors[colorScheme];
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    defaultValues: { username: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(data.username);
      router.replace('/(tabs)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in with your username and password to continue.">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined, web: undefined })}
        style={styles.flex}
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Username</ThemedText>
            <Controller
              control={control}
              name="username"
              rules={{
                required: 'Username is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="username"
                  placeholder="johndoe"
                  placeholderTextColor={palette.icon}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={[
                    styles.input,
                    {
                      borderColor: errors.username ? '#e5484d' : palette.icon,
                      color: palette.text,
                      backgroundColor: colorScheme === 'light' ? '#ffffff' : '#1f2123',
                    },
                  ]}
                />
              )}
            />
            {errors.username ? (
              <ThemedText style={styles.errorText}>{errors.username.message}</ThemedText>
            ) : null}
          </View>
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Password</ThemedText>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoComplete="password"
                  secureTextEntry
                  placeholder="Enter your password"
                  placeholderTextColor={palette.icon}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  style={[
                    styles.input,
                    {
                      borderColor: errors.password ? '#e5484d' : palette.icon,
                      color: palette.text,
                      backgroundColor: colorScheme === 'light' ? '#ffffff' : '#1f2123',
                    },
                  ]}
                />
              )}
            />
            {errors.password ? (
              <ThemedText style={styles.errorText}>{errors.password.message}</ThemedText>
            ) : null}
          </View>

          <Pressable
            disabled={!isValid || isSubmitting}
            style={[
              styles.primaryButton,
              {
                backgroundColor: isValid && !isSubmitting ? palette.tint : palette.icon,
                opacity: isValid && !isSubmitting ? 1 : 0.55,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
          >
            <ThemedText style={styles.primaryButtonText}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </ThemedText>
          </Pressable>

          <View style={styles.footer}>
            <ThemedText>New here?</ThemedText>
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
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  link: {
    alignSelf: 'flex-start',
  },
  errorText: {
    color: '#e5484d',
    fontSize: 13,
  },
});
