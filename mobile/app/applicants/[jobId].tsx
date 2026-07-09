import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, MessageSquare, User } from 'lucide-react-native';
import api from '../../src/api/client';

export default function ApplicantsScreen() {
  const { jobId } = useLocalSearchParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data);
    } catch (e) {
      console.error('Error fetching applicants', e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleAccept = async (appId: string) => {
    try {
      await api.patch(`/applications/${appId}/accept`);
      Alert.alert('Success', 'Candidate accepted!');
      fetchApplicants(); // Refresh list to show accepted state
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.response?.data?.message || 'Could not accept candidate');
    }
  };

  const renderApplicant = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <User color="#fff" size={24} />
          </View>
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>
              {item.candidate?.firstName} {item.candidate?.lastName}
            </Text>
            <Text style={styles.date}>Applied {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.messageText}>"{item.message || 'No specific message.'}"</Text>

        <View style={styles.footer}>
          {item.isAccepted ? (
            <View style={styles.actionRow}>
              <View style={styles.acceptedBadge}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.acceptedText}>Accepted</Text>
              </View>
              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => router.push(`/messages/${item.id}`)}
              >
                <MessageSquare size={16} color="#fff" />
                <Text style={styles.chatButtonText}>Discuter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleAccept(item.id)}
            >
              <Text style={styles.acceptButtonText}>Accept Candidate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Applicants</Text>
        </View>

        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderApplicant}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchApplicants} tintColor="#3B82F6" />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No applicants yet.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  messageText: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptedText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
