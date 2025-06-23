import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Please check VITE_SUPABASE_URL in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'river-of-life-ministries'
    }
  },
  db: {
    schema: 'public'
  }
});

// Enhanced test connection function with retry logic
export const testSupabaseConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Testing Supabase connection (attempt ${attempt}/${retries})...`);
      
      const { data, error } = await supabase
        .from('resources')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`Supabase connection test failed (attempt ${attempt}):`, error);
        if (attempt === retries) {
          return { success: false, error: error.message };
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      console.log('Supabase connection test successful');
      return { success: true, data };
    } catch (error) {
      console.error(`Supabase connection test error (attempt ${attempt}):`, error);
      if (attempt === retries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: {
            url: supabaseUrl,
            hasKey: !!supabaseAnonKey,
            errorType: error.constructor.name
          }
        };
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Enhanced donation creation with better error handling
export const createDonation = async (donationData: Omit<Donation, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .insert([donationData])
      .select()
      .single();

    if (error) {
      console.error('Supabase donation creation error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Donation creation failed:', error);
    throw error;
  }
};

// Types
export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  created_at: string;
  updated_at: string | null;
}

export interface Devotion {
  id: string;
  title: string;
  scripture: string;
  content: string;
  author: string;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'audio';
  url: string;
  category: string;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  transaction_id?: string;
  pesapal_tracking_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  request: string;
  is_anonymous: boolean;
  status: 'pending' | 'prayed';
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
}

// Auth helper functions
export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};