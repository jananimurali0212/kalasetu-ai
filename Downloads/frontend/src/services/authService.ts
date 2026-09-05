import { User, UserRole, ArtisanProfile, BuyerProfile, SupportedLanguage } from '../types';
import { mockUsers, mockArtisans, mockBuyers } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const CURRENT_USER_KEY = 'kalasetu_current_user';
const IS_LOGGED_IN_KEY = 'kalasetu_is_logged_in';

export interface AuthStateListener {
  (user: User | null, session: any): void;
}

class AuthService {
  private currentUser: User;
  private loggedIn: boolean;
  private listeners: AuthStateListener[] = [];
  private initialized: boolean = false;

  constructor() {
    this.currentUser = this.loadInitialUser();
    this.loggedIn = this.loadInitialLoginState();
    this.initSupabaseAuthListener();
  }

  private loadInitialLoginState(): boolean {
    try {
      const saved = sessionStorage.getItem(IS_LOGGED_IN_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  }

  private loadInitialUser(): User {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read saved user from localStorage');
    }
    return mockUsers[0]; // Default Master Artisan
  }

  private async initSupabaseAuthListener() {
    if (!isSupabaseConfigured()) return;

    try {
      // 1. Check existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        await this.syncUserFromSupabase(session.user);
      }

      // 2. Listen to auth changes (sign in, sign out, token refresh)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await this.syncUserFromSupabase(session.user);
          this.notifyListeners(this.currentUser, session);
        } else if (event === 'SIGNED_OUT') {
          this.loggedIn = false;
          try {
            sessionStorage.removeItem(IS_LOGGED_IN_KEY);
            localStorage.removeItem(CURRENT_USER_KEY);
          } catch {}
          this.notifyListeners(null, null);
        }
      });
      this.initialized = true;
    } catch (err) {
      console.warn('Supabase auth listener initialization notice:', err);
    }
  }

  public onAuthStateChanged(listener: AuthStateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(user: User | null, session: any) {
    this.listeners.forEach((l) => {
      try {
        l(user, session);
      } catch (e) {
        console.error('Error in auth listener:', e);
      }
    });
  }

  /**
   * Synchronize Supabase user and profile with local state
   */
  public async syncUserFromSupabase(supabaseUser: any): Promise<User> {
    let role: UserRole = 'artisan';
    let fullName = supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Artisan';
    let phone = supabaseUser.user_metadata?.phone || '';
    let location = supabaseUser.user_metadata?.location || 'India';
    let languagePreference: SupportedLanguage = (supabaseUser.user_metadata?.preferred_language as SupportedLanguage) || 'en';

    try {
      // Attempt to load from public.profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profile && !error) {
        fullName = profile.full_name || fullName;
        phone = profile.phone || phone;
        location = profile.location || location;
        role = (profile.role as UserRole) || role;
        languagePreference = (profile.preferred_language as SupportedLanguage) || languagePreference;
      }
    } catch (err) {
      console.warn('Profiles table sync notice:', err);
    }

    const appUser: User = {
      id: supabaseUser.id,
      name: fullName,
      email: supabaseUser.email || '',
      role,
      phone,
      location,
      languagePreference,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
    };

    this.setCurrentUser(appUser);
    this.loggedIn = true;
    try {
      sessionStorage.setItem(IS_LOGGED_IN_KEY, 'true');
    } catch {}

    return appUser;
  }

  /**
   * Supabase Email/Password Sign Up
   */
  public async signUpWithEmail(
    email: string,
    password: string,
    metadata: {
      fullName: string;
      phone?: string;
      location?: string;
      role: UserRole;
      language?: SupportedLanguage;
    }
  ): Promise<{ user?: User; error?: string }> {
    if (!isSupabaseConfigured()) {
      // Fallback in demo/unconfigured mode
      const demoUser: User = {
        id: `user-${Date.now()}`,
        name: metadata.fullName || 'Artisan Partner',
        email,
        phone: metadata.phone || '',
        location: metadata.location || 'India',
        role: metadata.role,
        languagePreference: metadata.language || 'en',
      };
      this.setCurrentUser(demoUser);
      this.loggedIn = true;
      try {
        sessionStorage.setItem(IS_LOGGED_IN_KEY, 'true');
      } catch {}
      return { user: demoUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
            phone: metadata.phone,
            location: metadata.location,
            role: metadata.role,
            preferred_language: metadata.language || 'en',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create or update profiles row in database
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: metadata.fullName,
            email: data.user.email,
            phone: metadata.phone || '',
            location: metadata.location || '',
            role: metadata.role,
            preferred_language: metadata.language || 'en',
          });
        } catch (dbErr: any) {
          console.warn('Could not insert profile into profiles table:', dbErr?.message);
        }

        const appUser = await this.syncUserFromSupabase(data.user);
        return { user: appUser };
      }

      return { error: 'Failed to create user account' };
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred during signup' };
    }
  }

  /**
   * Supabase Email/Password Sign In
   */
  public async signInWithEmail(email: string, password: string): Promise<{ user?: User; error?: string }> {
    if (!isSupabaseConfigured()) {
      const isArtisan = email.toLowerCase().includes('artisan');
      const demoUser: User = isArtisan
        ? this.loginAsArtisan({ name: email.split('@')[0] })
        : this.loginAsBuyer({ name: email.split('@')[0] });
      return { user: demoUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const appUser = await this.syncUserFromSupabase(data.user);
        return { user: appUser };
      }

      return { error: 'Authentication failed' };
    } catch (err: any) {
      return { error: err?.message || 'An unexpected error occurred during login' };
    }
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to persist user');
    }
  }

  public loginAsArtisan(details?: { name?: string; phone?: string; place?: string }): User {
    const artisanUser: User = {
      ...mockUsers[0],
      name: details?.name?.trim() || 'Master Artisan',
      phone: details?.phone?.trim() || '+91 98421 55210',
      location: details?.place?.trim() || 'Madurai, Tamil Nadu',
      role: 'artisan',
    };

    if (mockArtisans[0]) {
      mockArtisans[0].name = artisanUser.name;
      if (details?.phone?.trim()) {
        mockArtisans[0].contactNumber = details.phone.trim();
      }
      if (details?.place?.trim()) {
        mockArtisans[0].clusterLocation = details.place.trim();
      }
    }

    this.setCurrentUser(artisanUser);
    this.loggedIn = true;
    try {
      sessionStorage.setItem(IS_LOGGED_IN_KEY, 'true');
    } catch {}
    return artisanUser;
  }

  public loginAsBuyer(details?: { name?: string; phone?: string; place?: string }): User {
    const buyerUser: User = {
      ...mockUsers[1],
      name: details?.name?.trim() || 'Procurement Partner',
      phone: details?.phone?.trim() || '+91 98200 44312',
      location: details?.place?.trim() || 'Mumbai, Maharashtra',
      role: 'buyer',
    };

    if (mockBuyers[0]) {
      mockBuyers[0].organizationName = buyerUser.name;
      if (details?.place?.trim()) {
        mockBuyers[0].location = details.place.trim();
      }
    }

    this.setCurrentUser(buyerUser);
    this.loggedIn = true;
    try {
      sessionStorage.setItem(IS_LOGGED_IN_KEY, 'true');
    } catch {}
    return buyerUser;
  }

  public async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut notice:', err);
      }
    }
    this.loggedIn = false;
    try {
      sessionStorage.removeItem(IS_LOGGED_IN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {}
    this.notifyListeners(null, null);
  }

  public switchRole(role: UserRole): User {
    const targetUser = mockUsers.find((u) => u.role === role) || {
      ...this.currentUser,
      role,
    };
    this.setCurrentUser(targetUser);
    return targetUser;
  }

  public getArtisanProfile(userId?: string): ArtisanProfile {
    const uid = userId || this.currentUser.id;
    const found = mockArtisans.find((a) => a.userId === uid || a.id === uid);
    if (found) return found;

    return {
      id: `artisan-${uid}`,
      userId: uid,
      name: this.currentUser.name || 'Traditional Artisan',
      craftTradition: 'Traditional Handcrafts',
      craftTradition_ta: 'பாரம்பரிய கைவினைப் பொருட்கள்',
      craftTradition_hi: 'पारंपरिक हस्तशिल्प',
      clusterLocation: this.currentUser.location || 'Tamil Nadu, India',
      experienceYears: 15,
      bio_en: 'Dedicated master artisan preserving generational traditional craft techniques.',
      bio_ta: 'தலைமுறை தலைமுறையாக பாரம்பரிய கைவினை நுட்பங்களைப் பாதுகாக்கும் அர்ப்பணிப்புள்ள மாஸ்டர் கைவினைஞர்.',
      bio_hi: 'पीढ़ी-दर-पीढ़ी पारंपरिक शिल्प तकनीकों को संरक्षित करने वाले समर्पित मास्टर शिल्पकार।',
      avatarUrl: this.currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      giTagCertified: true,
      stateAwardee: true,
      nationalMeritHolder: false,
      community: 'Craft Guild Custodian',
      totalProductsListed: 1,
      completedOrders: 28,
      rating: 4.9,
      contactNumber: this.currentUser.phone || '+91 98421 55210',
      languagesSpoken: ['Tamil', 'Hindi', 'English'],
    };
  }

  public getBuyerProfile(userId?: string): BuyerProfile {
    const uid = userId || this.currentUser.id;
    const found = mockBuyers.find((b) => b.userId === uid || b.id === uid);
    if (found) return found;

    return {
      id: `buyer-${uid}`,
      userId: uid,
      organizationName: this.currentUser.name || 'Procurement Partner',
      buyerType: 'Retail Boutique',
      location: this.currentUser.location || 'Mumbai, Maharashtra',
      verifiedGST: true,
      procurementBudget: '₹5,00,000 / month',
    };
  }

  public getAllArtisans(): ArtisanProfile[] {
    return mockArtisans;
  }
}

export const authService = new AuthService();
