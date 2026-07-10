import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LogOut, Star } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import api from '../../src/api/client';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        // fetch user id
        const userRes = await api.get('/users/me');
        if (isMounted) setUser(userRes.data);
        
        const userId = userRes.data?.id;
        if (userId) {
          const reviewsRes = await api.get(`/reviews/user/${userId}`);
          if (isMounted) setReviews(reviewsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile/reviews', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadProfile();
    
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    router.replace('/(auth)/login');
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating();

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'JC'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Candidate User'}</Text>
        <Text style={styles.email}>{user?.email || 'candidate@jobconnect.com'}</Text>
        
        {/* Average Star Rating */}
        <View style={styles.avgRatingContainer}>
          <Text style={styles.avgRatingNumber}>{avgRating}</Text>
          <Star color="#F59E0B" fill="#F59E0B" size={24} />
          <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>No reviews found.</Text>
        ) : (
          reviews.map((review, idx) => (
            <View key={review.id || idx} style={styles.reviewCard}>
              <View style={styles.reviewHeaderRow}>
                <Text style={styles.reviewerName}>{review.reviewer?.name || 'Anonymous'}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color="#F59E0B"
                      fill={star <= review.rating ? "#F59E0B" : "transparent"}
                    />
                  ))}
                </View>
              </View>
              {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut color="#EF4444" size={20} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  avgRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  avgRatingNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  reviewCount: {
    fontSize: 14,
    color: '#888',
    marginLeft: 4,
  },
  reviewsSection: {
    flex: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  noReviewsText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  reviewCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
