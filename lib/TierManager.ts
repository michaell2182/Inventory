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

      if (error) {
        console.error('Error fetching tier:', error);
        return 'Basic'; // Default to Basic if there's an error
      }
      
      return (data?.tier as SubscriptionTier) || 'Basic';
    } catch (error) {
      console.error('Error in getCurrentTier:', error);
      return 'Basic';
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
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error in setUserTier:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setUserTier:', error);
      return false;
    }
  }
} 