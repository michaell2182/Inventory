import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';
import { TierManager } from '../lib/TierManager';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Add this function temporarily to create the test account
export async function createTestAccount() {
  try {
    // First, create the auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
      options: {
        data: {
          display_name: 'Test User',
        },
      },
    });
    
    if (authError) {
      console.error('Error creating test account:', authError);
      return;
    }

    if (!authData.user) {
      console.error('No user data returned');
      return;
    }

    // Then, set the Premium tier for the user
    const { error: tierError } = await supabase
      .from('user_tiers')
      .upsert({ 
        user_id: authData.user.id,
        tier: 'Premium',
        updated_at: new Date().toISOString()
      });

    if (tierError) {
      console.error('Error setting premium tier:', tierError);
      return;
    }

    console.log('Test account created successfully:', {
      userId: authData.user.id,
      email: authData.user.email,
      tier: 'Premium'
    });

  } catch (error) {
    console.error('Error in createTestAccount:', error);
  }
}

// Optional: Add a function to update existing test account to Premium
export async function updateTestAccountToPremium() {
  try {
    // First get the test account user ID
    const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123',
    });

    if (userError || !userData.user) {
      console.error('Error finding test account:', userError);
      return;
    }

    // Update the tier to Premium
    const { error: tierError } = await supabase
      .from('user_tiers')
      .upsert({ 
        user_id: userData.user.id,
        tier: 'Premium',
        updated_at: new Date().toISOString()
      });

    if (tierError) {
      console.error('Error updating to premium tier:', tierError);
      return;
    }

    console.log('Test account updated to Premium tier successfully');

  } catch (error) {
    console.error('Error in updateTestAccountToPremium:', error);
  }
} 