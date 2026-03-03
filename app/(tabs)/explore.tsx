import { FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getJobById } from '@/constants/jobs';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/providers/session-provider';

export default function ApplicationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { applications } = useSession();

  if (!applications.length) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: palette.background }]}>
        <ThemedText type="subtitle">No applications yet</ThemedText>
        <ThemedText>Go to Dashboard, open a job, and apply with your resume.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.jobId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const job = getJobById(item.jobId);
          return (
            <View
              style={[
                styles.card,
                {
                  borderColor: palette.icon,
                  backgroundColor: colorScheme === 'light' ? '#ffffff' : '#1f2123',
                },
              ]}
            >
              <ThemedText type="defaultSemiBold">{job?.title ?? 'Job no longer available'}</ThemedText>
              <ThemedText>{job?.company ?? 'Unknown company'}</ThemedText>
              <ThemedText>{`Resume: ${item.resumeName}`}</ThemedText>
              <ThemedText>{`Applied on ${new Date(item.appliedAt).toLocaleDateString()}`}</ThemedText>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    justifyContent: 'center',
    gap: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
});
