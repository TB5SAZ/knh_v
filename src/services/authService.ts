import { supabase } from '@/src/lib/supabase';
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

/** Validates and retrieves the registration key via secure RPC */
const verifyRegistrationKey = async (key: string) => {
  const { data: keyData, error: keyError } = await supabase
    .rpc('verify_registration_key', { p_key_value: key });

  if (keyError || !keyData) {
    logger.error('[authService] Key verify error:', keyError);
    throw new Error('Geçersiz veya daha önce kullanılmış bir yetki anahtarı girdiniz.');
  }
  // RPC returns the row JSON which acts identically to the object returned by .single()
  return keyData;
};

/** Burns the registration key securely via RPC so it cannot be used again */
const burnRegistrationKey = async (key: string) => {
  const { error: burnError } = await supabase
    .rpc('burn_registration_key', { p_key_value: key });

  if (burnError) {
    logger.error('[authService] Key burn error:', burnError);
  }
};

interface ProfileData {
  userId: string;
  tcKimlik: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string | null;
}

/** Creates a profile for the newly registered user */
const createProfile = async ({
  userId,
  tcKimlik,
  firstName,
  lastName,
  role,
  departmentId,
}: ProfileData) => {
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      tc_kimlik_no: tcKimlik,
      first_name: firstName,
      last_name: lastName,
      role: role,
      department_id: departmentId,
    });

  if (profileError) {
    logger.error('[authService] Profile insert error:', profileError);
    throw new Error('Kullanıcı hesabı oluşturuldu ancak profil bilgileri kaydedilemedi.');
  }
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
    throw new Error('Kullanıcı profil bilgileri alınamadı.');
  }
  return profileData.role;
};

// --- Exported Service ---

/** Registers a completely new user with Supabase */
const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    logger.error('[authService] SignUp error:', error);
    throw new Error('Kayıt işlemi sırasında bir hata oluştu. Bilgilerinizi kontrol edip tekrar deneyiniz.');
  }
  if (!data.user) {
    throw new Error('Kullanıcı doğrulanamadı.');
  }
  return data.user;
};

/** Authenticates an existing user via Supabase */
const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logger.error('[authService] SignIn error:', error);
    throw new Error('Giriş başarısız. Lütfen T.C. Kimlik numaranızı ve şifrenizi kontrol ediniz.');
  }
  if (!data.user) {
    throw new Error('Kullanıcı doğrulanamadı.');
  }
  return data.user;
};

/** Signs out the current user via Supabase */
const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    logger.error('[authService] SignOut error:', error);
    throw new Error('Çıkış yaparken bir hata oluştu.');
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
   */
  async registerWithKey({ tcKimlik, firstName, lastName, key, password }: RegisterParams) {
    // 1. Verify Registration Key
    const keyData = await verifyRegistrationKey(key);

    // 2. Supabase Auth Sign Up
    const email = await generateGhostEmail(tcKimlik);
    const user = await signUpUser(email, password);

    // 3. Insert into Profiles Table
    await createProfile({
      userId: user.id,
      tcKimlik,
      firstName,
      lastName,
      role: keyData.assigned_role,
      departmentId: keyData.department_id
    });

    // 4. Burn the used Registration Key
    await burnRegistrationKey(key);

    return user;
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
