import { supabase } from '@/src/lib/supabase';
import { AppError } from '@/src/utils/errors';
import * as Crypto from 'expo-crypto';
import { logger } from '@/src/utils/logger';

// --- Private Helpers ---

const EMAIL_DOMAIN = '@konyanumune.gov.tr';

/** Extracts ghost email generation logic */
const generateGhostEmail = async (tcKimlik: string): Promise<string> => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    tcKimlik
  );
  return `${hash}${EMAIL_DOMAIN}`;
};

/** Fetches a user's role to ensure the profile exists and is accessible */
const fetchProfileRole = async (userId: string) => {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError || !profileData) {
    logger.error('[authService] Profile fetch error:', profileError);
    throw new AppError('Kullanıcı profil bilgileri alınamadı.');
  }
  return profileData.role;
};

// --- Exported Service ---

/** Authenticates an existing user via Supabase */
const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logger.error('[authService] SignIn error:', error);
    throw new AppError('Giriş başarısız. Lütfen T.C. Kimlik numaranızı ve şifrenizi kontrol ediniz.');
  }
  if (!data.user) {
    throw new AppError('Kullanıcı doğrulanamadı.');
  }
  return data.user;
};

/** Signs out the current user via Supabase */
const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    logger.error('[authService] SignOut error:', error);
    throw new AppError('Çıkış yaparken bir hata oluştu.');
  }
};

export interface RegisterParams {
  tcKimlik: string;
  firstName: string;
  lastName: string;
  key: string;
  password: string;
}

export const authService = {
  /**
   * Register a user using a pre-defined registration key.
   * Trigger on auth.users will map this data into the public.profiles table securely.
   */
  async registerWithKey({ tcKimlik, firstName, lastName, key, password }: RegisterParams) {
    const email = await generateGhostEmail(tcKimlik);
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          tc_kimlik_no: tcKimlik,
          registration_key: key
        }
      }
    });

    if (error) {
      if (error.message.includes('Geçersiz veya kullanılmış yetki anahtarı')) {
         throw new AppError('Geçersiz veya daha önce kullanılmış bir yetki anahtarı girdiniz.');
      }
      logger.error('[authService] SignUp error:', error);
      throw new AppError('Kayıt işlemi sırasında bir hata oluştu. Bilgilerinizi kontrol edip tekrar deneyiniz.');
    }

    if (!data.user) {
      throw new AppError('Kullanıcı doğrulanamadı.');
    }

    return data.user;
  },

  /**
   * Log in a user using TC Kimlik (ghost email).
   */
  async loginWithTc(tcKimlik: string, password: string) {
    const email = await generateGhostEmail(tcKimlik);
    
    // 1. Supabase Auth Sign In
    const user = await signInUser(email, password);

    // 2. Fetch profile to ensure the user has a valid profile
    try {
      await fetchProfileRole(user.id);
    } catch (error) {
      await signOutUser();
      throw error;
    }

    return user;
  },

  /**
   * Log out the current user.
   */
  async logout() {
    await signOutUser();
  },
};
