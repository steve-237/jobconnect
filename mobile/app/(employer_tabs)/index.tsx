import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Users, ChevronRight, Star, X } from 'lucide-react-native';
import api from '../../src/api/client';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' }; // Purple
    case 'COMPLETED': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' }; // Green
    default: return { bg: 'rgba(234, 179, 8, 0.1)', text: '#EAB308', border: 'rgba(234, 179, 8, 0.3)' }; // Yellow for PENDING
  }
};

export default function EmployerJobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const router = useRouter();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/employer/my-jobs');
      setJobs(res.data);
    } catch (e) {
      console.error('Error fetching employer jobs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCompleteJob = async (id: string) => {
    try {
      await api.patch(`/jobs/${id}/status`, { status: 'COMPLETED' });
      setJobs(jobs.map(job => job.id === id ? { ...job, status: 'COMPLETED' } : job));
    } catch (e) {
      console.error('Error completing job', e);
      Alert.alert('Erreur', 'Impossible de terminer la mission.');
    }
  };

  const openReviewModal = (id: string) => {
    setReviewJobId(id);
    setRating(0);
    setComment('');
    setReviewModalVisible(true);
  };

  const submitReview = async () => {
    if (!reviewJobId) return;
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note.');
      return;
    }
    
    try {
      setSubmittingReview(true);
      await api.post('/reviews', { jobId: reviewJobId, rating, comment });
      Alert.alert('Succès', 'Votre avis a été enregistré.');
      setReviewModalVisible(false);
    } catch (e: any) {
      console.error('Error submitting review', e);
      Alert.alert('Erreur', e.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderJob = ({ item }: { item: any }) => {
    const status = item.status || 'PENDING';
    const statusColors = getStatusColor(status);

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push(`/applicants/${item.id}`)}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
                <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{status}</Text>
              </View>
            </View>
            <Text style={styles.date}>Posted {new Date(item.createdAt).toLocaleDateString()}</Text>
            
            <View style={[styles.badge, { marginTop: 12, alignSelf: 'flex-start' }]}>
              <Users size={14} color="#3B82F6" />
              <Text style={styles.badgeText}>{item._count?.applications || 0} Applicants</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Text style={styles.actionText}>View Applicants</Text>
            <ChevronRight size={16} color="#3B82F6" />
          </View>
        </TouchableOpacity>

        {status === 'IN_PROGRESS' && (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => handleCompleteJob(item.id)}
          >
            <Text style={styles.primaryButtonText}>Terminer la mission</Text>
          </TouchableOpacity>
        )}

        {status === 'COMPLETED' && (
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => openReviewModal(item.id)}
          >
            <Text style={styles.secondaryButtonText}>Laisser un avis</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchJobs} tintColor="#3B82F6" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You haven't posted any jobs yet.</Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Laisser un avis</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={styles.closeButton}>
                <X size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Comment s'est passée la mission ?</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star 
                    size={32} 
                    color={star <= rating ? "#EAB308" : "#3F3F46"} 
                    fill={star <= rating ? "#EAB308" : "transparent"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Partagez votre expérience (optionnel)..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={submitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Envoyer l'avis</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  cardContainer: {
    gap: 8,
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
  },
  cardHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
  },
  badgeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
  },
  actionText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    color: '#A1A1AA',
    fontSize: 16,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
