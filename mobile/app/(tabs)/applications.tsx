import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Clock, MessageSquare, ChevronRight } from 'lucide-react-native';
import api from '../../src/api/client';

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/my-applications');
      setApplications(res.data);
    } catch (e) {
      console.error('Error fetching applications', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const renderApplication = ({ item }: { item: any }) => {
    const isAccepted = item.isAccepted;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          if (isAccepted) {
            router.push(`/messages/${item.id}`);
          }
        }}
        disabled={!isAccepted}
      >
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.job?.title || 'Unknown Job'}</Text>
            <Text style={styles.date}>Applied {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          
          {isAccepted ? (
            <View style={[styles.badge, styles.acceptedBadge]}>
              <CheckCircle size={14} color="#10B981" />
              <Text style={styles.acceptedText}>Accepted</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.pendingBadge]}>
              <Clock size={14} color="#60A5FA" />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>

        {isAccepted && (
          <View style={styles.chatAction}>
            <View style={styles.chatActionLeft}>
              <MessageSquare size={16} color="#10B981" />
              <Text style={styles.chatText}>Tap to chat with Employer</Text>
            </View>
            <ChevronRight size={16} color="#444" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderApplication}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchApplications} tintColor="#10B981" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You haven't applied to any jobs yet.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  acceptedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
  },
  pendingBadge: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderWidth: 1,
  },
  acceptedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  chatActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});
