import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthLayoutProps = PropsWithChildren & {
  title: string;
  subtitle: string;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.background}>
        <View
          style={[
            styles.blob,
            {
              backgroundColor: palette.tint,
              opacity: colorScheme === 'light' ? 0.12 : 0.18,
              top: -140,
              right: -60,
            },
          ]}
        />
        <View
          style={[
            styles.blob,
            {
              backgroundColor: palette.icon,
              opacity: colorScheme === 'light' ? 0.08 : 0.12,
              bottom: -160,
              left: -80,
            },
          ]}
        />
      </View>

      <View style={styles.brand}>
        <View style={[styles.badge, { borderColor: palette.tint }]}>
          <View style={[styles.badgeDot, { backgroundColor: palette.tint }]} />
          <ThemedText type="defaultSemiBold">JobBoard</ThemedText>
        </View>
      </View>

      <View style={styles.header}>
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText>{subtitle}</ThemedText>
      </View>

      <View style={styles.content}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
  },
  brand: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  header: {
    gap: 8,
    marginBottom: 32,
  },
  content: {
    flex: 1,
  },
});
