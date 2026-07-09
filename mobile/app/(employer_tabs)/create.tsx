import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../src/api/client';

export default function CreateJobScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategoryId(res.data[0].id);
        }
      } catch (e) {
        console.error('Error fetching categories', e);
      } finally {
        setFetchingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!title || !description || !price || !location || !categoryId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et sélectionner une catégorie.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/jobs', {
        title,
        description,
        price,
        location,
        categoryId,
      });
      
      Alert.alert('Succès', 'Annonce publiée avec succès !', [
        { text: 'OK', onPress: () => {
            setTitle('');
            setDescription('');
            setPrice('');
            setLocation('');
            router.push('/(employer_tabs)');
        }}
      ]);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de publier l\'annonce.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      <Text style={styles.header}>Post a New Job</Text>
      <Text style={styles.subtext}>Find the right candidate for your task.</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Need a plumber"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        {fetchingCats ? (
          <ActivityIndicator color="#3B82F6" style={{ alignSelf: 'flex-start', marginTop: 10 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  categoryId === cat.id && styles.categoryPillActive
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={[
                  styles.categoryPillText,
                  categoryId === cat.id && styles.categoryPillTextActive
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the task in detail..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Price / Compensation (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 50 or 20/hour"
          placeholderTextColor="#666"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Paris, France"
          placeholderTextColor="#666"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading || fetchingCats}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publish Job</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  categoryPill: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Light blue
    borderColor: '#3B82F6',
  },
  categoryPillText: {
    color: '#888',
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
