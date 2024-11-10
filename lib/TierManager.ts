import { supabase } from './supabase';

export type SubscriptionTier = 'Basic' | 'Premium' | 'Enterprise';

export class TierManager {
  static async getCurrentTier(userId: string): Promise<SubscriptionTier> {
    try {
      const { data, error } = await supabase
        .from('user_tiers')
        .select('tier')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      return data?.tier || 'Premium'; // Default to Basic if no tier is set
    } catch (error) {
      console.error('Error fetching tier:', error);
      return 'Basic'; // Default to Basic on error
    }
  }

  static async setUserTier(userId: string, tier: SubscriptionTier): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_tiers')
        .upsert({ 
          user_id: userId, 
          tier: tier,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting tier:', error);
      return false;
    }
  }
} 