import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
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
  const { user, userTier, refreshTier } = useAuth();
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

    if (selectedPlan !== 'Basic') {
      setShowPaymentModal(true);
      return;
    }

    try {
      console.log('Updating tier for user:', user.id, 'to:', selectedPlan);
      const success = await TierManager.setUserTier(user.id, selectedPlan);
      
      if (!success) {
        console.error('Failed to update tier');
        throw new Error('Failed to update tier');
      }

      // Refresh the tier in AuthContext
      await refreshTier();

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
      Alert.alert(
        'Error', 
        'Failed to update subscription tier. Please try again later.'
      );
    }
  };

  const handlePaymentMethodSelect = (method: 'paypal' | 'wipay') => {
    setShowPaymentModal(false);
    Alert.alert(
      'Coming Soon!',
      `${method === 'paypal' ? 'PayPal' : 'WiPay'} payment integration will be available soon. Currently, plan upgrades are disabled.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
            <Text style={styles.planBilling}>Yearly</Text>
          </View>
          <View style={styles.planFeatures}>
            <PlanFeature text="Up to 150 products" />
            <PlanFeature text="Advanced analytics" />
            <PlanFeature text="Priority support" />
            <PlanFeature text="Report Generator" />
            <PlanFeature text="Multiple users (coming soon)" />
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
            <PlanFeature text="24/7 support" />
            <PlanFeature text="Report Generator" />
            <PlanFeature text="Custom Design Requests" />
            <PlanFeature text="Custom Features Requests" />
            <PlanFeature text="Unlimited users (coming soon)" />
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

      <Modal
  visible={showPaymentModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setShowPaymentModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select Payment Method</Text>
      
      <View style={styles.cardsContainer}>
        {/* PayPal Card */}
        <TouchableOpacity
          style={styles.paymentCard}
          onPress={() => handlePaymentMethodSelect('paypal')}
        >
          <View style={styles.cardChip} />
          <Text style={styles.cardProvider}>PayPal</Text>
          <Text style={styles.cardRegion}>(US)</Text>
          <View style={styles.cardDecoration}>
            <View style={styles.cardCircle1} />
            <View style={styles.cardCircle2} />
          </View>
        </TouchableOpacity>

        {/* WiPay Card */}
        <TouchableOpacity
          style={[styles.paymentCard, styles.wipayCard]}
          onPress={() => handlePaymentMethodSelect('wipay')}
        >
          <View style={styles.cardChip} />
          <Text style={styles.cardProvider}>WiPay</Text>
          <Text style={styles.cardRegion}>(TT)</Text>
          <View style={styles.cardDecoration}>
            <View style={styles.cardCircle1} />
            <View style={styles.cardCircle2} />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setShowPaymentModal(false)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </>
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
    backgroundColor: 'black',
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
  scrollContent: {
    paddingBottom: 100, // Adjust as needed
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // modalContent: {
  //   backgroundColor: 'white',
  //   borderRadius: 16,
  //   padding: 24,
  //   width: '80%',
  //   alignItems: 'center',
  // },
  // modalTitle: {
  //   fontSize: 20,
  //   fontWeight: '700',
  //   marginBottom: 24,
  //   color: '#1a1a1a',
  // },
  paymentButton: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // cancelButton: {
  //   padding: 16,
  //   width: '100%',
  //   alignItems: 'center',
  // },
  // cancelButtonText: {
  //   color: '#6b7280',
  //   fontSize: 16,
  //   fontWeight: '600',
  // },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  paymentCard: {
    height: 180,
    backgroundColor: '#1f45fc',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  wipayCard: {
    backgroundColor: '#4f46e5',
  },
  cardChip: {
    width: 45,
    height: 35,
    backgroundColor: '#ffd700',
    borderRadius: 6,
    marginBottom: 30,
  },
  cardProvider: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardRegion: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  cardDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  cardCircle1: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardCircle2: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    color: '#1a1a1a',
  },
  cancelButton: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default MonetizationScreen; 