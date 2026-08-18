import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import api from '../api/client';
import * as SecureStore from 'expo-secure-store';

export default function WalletView() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('CANDIDATE');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          setRole(decoded.role || 'CANDIDATE');
        }

        const res = await api.get('/payments/transactions');
        setTransactions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const isEmployer = role === 'EMPLOYER';
  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
  const totalAmount = completedTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={isEmployer ? "#3B82F6" : "#10B981"} />
      </View>
    );
  }

  const renderTransaction = ({ item }: { item: any }) => {
    const isPending = item.status === 'PENDING';
    const isCompleted = item.status === 'COMPLETED';

    return (
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {isEmployer ? (
            <ArrowUpRight color="#EF4444" size={24} />
          ) : (
            <ArrowDownRight color="#10B981" size={24} />
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.jobTitle}>{item.job?.title}</Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {isEmployer ? '-' : '+'}{item.amount}€
          </Text>
          <View style={[styles.statusBadge, isCompleted ? styles.badgeSuccess : (isPending ? styles.badgeWarning : styles.badgeError)]}>
            {isCompleted && <CheckCircle2 size={12} color="#10B981" />}
            {isPending && <Clock size={12} color="#F59E0B" />}
            {!isCompleted && !isPending && <XCircle size={12} color="#EF4444" />}
            <Text style={[styles.statusText, isCompleted ? styles.textSuccess : (isPending ? styles.textWarning : styles.textError)]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <View style={styles.walletIconWrapper}>
          <Wallet color={isEmployer ? "#3B82F6" : "#10B981"} size={32} />
        </View>
        <Text style={styles.balanceLabel}>{isEmployer ? 'Total Dépensé' : 'Total Gagné'}</Text>
        <Text style={styles.balanceAmount}>{totalAmount.toFixed(2)} €</Text>
      </View>

      <Text style={styles.sectionTitle}>Historique des transactions</Text>
      
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune transaction trouvée.</Text>
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
  balanceContainer: {
    margin: 16,
    padding: 24,
    backgroundColor: '#111',
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  walletIconWrapper: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 12,
  },
  balanceLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  jobTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    color: '#666',
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  badgeSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  badgeWarning: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  badgeError: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  textSuccess: { color: '#10B981' },
  textWarning: { color: '#F59E0B' },
  textError: { color: '#EF4444' },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});
