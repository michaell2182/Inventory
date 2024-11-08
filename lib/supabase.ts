import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Add this function temporarily to create the test account
export async function createTestAccount() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123',
    options: {
      data: {
        display_name: 'Test User',
      },
    },
  });
  
  if (error) {
    console.error('Error creating test account:', error);
  } else {
    console.log('Test account created successfully');
  }
} 