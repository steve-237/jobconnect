import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MapPin, DollarSign, Clock, Search, Filter } from 'lucide-react-native';
import api from '../../src/api/client';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const categories = Array.from(new Set(jobs.map(job => job.category?.name).filter(Boolean)));

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (job.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? job.category?.name === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const renderJob = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.categoryBadge}>{item.category?.name || 'General'}</Text>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <DollarSign size={16} color="#10B981" />
          <Text style={styles.detailText}>{item.price}</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#888" />
          <Text style={styles.detailText}>{item.location || 'Remote'}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Posted by {item.employer?.firstName}</Text>
        <Text style={styles.applyText}>Tap to Apply</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {categories.length > 0 && (
          <View style={styles.categoriesWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  selectedCategory === null && styles.categoryPillActive
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.categoryPillText,
                  selectedCategory === null && styles.categoryPillTextActive
                ]}>All</Text>
              </TouchableOpacity>
              
              {categories.map((cat: any) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    selectedCategory === cat && styles.categoryPillActive
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[
                    styles.categoryPillText,
                    selectedCategory === cat && styles.categoryPillTextActive
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={styles.list}
        onRefresh={fetchJobs}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs found matching your criteria.</Text>
          </View>
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
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  categoriesWrapper: {
    marginTop: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  categoryPillText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  categoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#ccc',
    fontSize: 14,
  },
  description: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 16,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
  applyText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});
