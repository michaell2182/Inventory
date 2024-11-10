import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../store/AuthContext';
import { TierManager } from '../../lib/TierManager';

type SubscriptionTier = 'Basic' | 'Premium' | 'Enterprise';

const PlanFeature = ({ text }: { text: string }) => (
  <View style={styles.featureRow}>
    <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const MonetizationScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('Basic');
  const { user, userTier } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('Current tier:', userTier);
      setSelectedPlan(userTier);
    }
  }, [user, userTier]);

  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to change plans');
      return;
    }

    try {
      const success = await TierManager.setUserTier(user.id, selectedPlan);
      
      if (!success) throw new Error('Failed to update tier');

      Alert.alert(
        'Success',
        `Your plan has been updated to ${selectedPlan}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      Alert.alert('Error', 'Failed to update subscription tier');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the perfect plan for your business needs
        </Text>
      </View>

      {/* Basic Plan */}
      <TouchableOpacity 
        style={[
          styles.planCard,
          selectedPlan === 'Basic' && styles.selectedPlan
        ]}
        onPress={() => setSelectedPlan('Basic')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Basic</Text>
          <Text style={styles.planPrice}>Free</Text>
          <Text style={styles.planBilling}>Forever</Text>
        </View>
        <View style={styles.planFeatures}>
          <PlanFeature text="Up to 50 products" />
          <PlanFeature text="Basic analytics" />
          <PlanFeature text="Single user" />
        </View>
      </TouchableOpacity>

      {/* Premium Plan */}
      <TouchableOpacity 
        style={[
          styles.planCard,
          styles.recommendedPlan,
          selectedPlan === 'Premium' && styles.selectedPlan
        ]}
        onPress={() => setSelectedPlan('Premium')}
      >
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Premium</Text>
          <Text style={styles.planPrice}>$9.99</Text>
          <Text style={styles.planBilling}>per month</Text>
        </View>
        <View style={styles.planFeatures}>
          <PlanFeature text="Up to 500 products" />
          <PlanFeature text="Advanced analytics" />
          <PlanFeature text="Multiple users" />
          <PlanFeature text="Priority support" />
          <PlanFeature text="Custom branding" />
        </View>
      </TouchableOpacity>

      {/* Enterprise Plan */}
      <TouchableOpacity 
        style={[
          styles.planCard,
          selectedPlan === 'Enterprise' && styles.selectedPlan
        ]}
        onPress={() => setSelectedPlan('Enterprise')}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Enterprise</Text>
          <Text style={styles.planPrice}>Custom</Text>
          <Text style={styles.planBilling}>Contact sales</Text>
        </View>
        <View style={styles.planFeatures}>
          <PlanFeature text="Unlimited products" />
          <PlanFeature text="Advanced analytics" />
          <PlanFeature text="Unlimited users" />
          <PlanFeature text="24/7 support" />
          <PlanFeature text="Custom integration" />
          <PlanFeature text="API access" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.upgradeButton}
        onPress={handleUpgrade}
      >
        <Text style={styles.upgradeButtonText}>
          Upgrade to {selectedPlan}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 80,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  planCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#4f46e5',
  },
  recommendedPlan: {
    backgroundColor: '#f5f3ff',
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4f46e5',
  },
  planBilling: {
    fontSize: 14,
    color: '#6b7280',
  },
  planFeatures: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#4b5563',
  },
  upgradeButton: {
    backgroundColor: '#4f46e5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MonetizationScreen; 