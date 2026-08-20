import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../../src/api/client';
import { Calendar as CalendarIcon, MapPin, Clock, DollarSign } from 'lucide-react-native';

export default function CalendarScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      const res = await api.get('/jobs/candidate/calendar');
      setJobs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {jobs.length === 0 ? (
        <View style={styles.center}>
          <CalendarIcon size={64} color="#333" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Aucune mission prévue pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.dateBox}>
                <Text style={styles.dateMonth}>
                  {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase() : 'N/A'}
                </Text>
                <Text style={styles.dateDay}>
                  {item.scheduledDate ? new Date(item.scheduledDate).getDate() : '-'}
                </Text>
                <Text style={styles.dateTime}>
                  {item.scheduledDate ? new Date(item.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#F59E0B" />
                  <Text style={styles.detailText}>{item.location || 'Remote'}</Text>
                </View>
                {item.estimatedDuration && (
                  <View style={styles.detailRow}>
                    <Clock size={14} color="#A78BFA" />
                    <Text style={styles.detailText}>{item.estimatedDuration / 60}h estimé</Text>
                  </View>
                )}
                <View style={styles.priceRow}>
                  <DollarSign size={16} color="#10B981" />
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#333',
    borderWidth: 1,
  },
  dateBox: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 80,
    marginRight: 16,
  },
  dateMonth: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateDay: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateTime: {
    color: '#888',
    fontSize: 10,
  },
  infoBox: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  }
});
