import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';

import { AuthLayout } from '@/components/auth/auth-layout';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type LoginFormValues = {
  email: string;
};

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const palette = Colors[colorScheme];
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const onSubmit = (_data: LoginFormValues) => {};

  return (
    <AuthLayout title="Welcome back" subtitle="Log in with your email to continue.">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined, web: undefined })}
        style={styles.flex}
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Email</ThemedText>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Enter a valid email address',
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
                      borderColor: errors.email ? '#e5484d' : palette.icon,
                      color: palette.text,
                      backgroundColor: colorScheme === 'light' ? '#ffffff' : '#1f2123',
                    },
                  ]}
                />
              )}
            />
            {errors.email ? (
              <ThemedText style={styles.errorText}>{errors.email.message}</ThemedText>
            ) : null}
          </View>

          <Pressable
            disabled={!isValid}
            style={[
              styles.primaryButton,
              {
                backgroundColor: isValid ? palette.tint : palette.icon,
                opacity: isValid ? 1 : 0.55,
              },
            ]}
            onPress={handleSubmit(onSubmit)}
          >
            <ThemedText style={styles.primaryButtonText}>Send login link</ThemedText>
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
