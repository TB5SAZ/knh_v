import { supabase } from '@/src/lib/supabase';

// --- Private Helpers ---

const EMAIL_DOMAIN = '@konyanumune.gov.tr';

/** Extracts ghost email generation logic */
const generateGhostEmail = (tcKimlik: string): string => {
  return `${tcKimlik}${EMAIL_DOMAIN}`;
};

/** Validates and retrieves the registration key */
const verifyRegistrationKey = async (key: string) => {
  const { data: keyData, error: keyError } = await supabase
    .from('registration_keys')
    .select('*')
    .eq('key_value', key)
    .eq('is_used', false)
    .single();

  if (keyError || !keyData) {
    console.error('[authService] Key verify error:', keyError);
    throw new Error('Geçersiz veya daha önce kullanılmış bir yetki anahtarı girdiniz.');
  }
  return keyData;
};

/** Burns the registration key so it cannot be used again */
const burnRegistrationKey = async (key: string) => {
  const { error: burnError } = await supabase
    .from('registration_keys')
    .update({ is_used: true })
    .eq('key_value', key);

  if (burnError) {
    console.error('[authService] Key burn error:', burnError);
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
    console.error('[authService] Profile insert error:', profileError);
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
    console.error('[authService] Profile fetch error:', profileError);
    throw new Error('Kullanıcı profil bilgileri alınamadı.');
  }
  return profileData.role;
};

// --- Exported Service ---

/** Registers a completely new user with Supabase */
const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error('[authService] SignUp error:', error);
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
    console.error('[authService] SignIn error:', error);
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
    console.error('[authService] SignOut error:', error);
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
    const email = generateGhostEmail(tcKimlik);
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
    const email = generateGhostEmail(tcKimlik);
    
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
