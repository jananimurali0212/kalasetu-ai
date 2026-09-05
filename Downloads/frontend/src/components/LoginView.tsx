import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { authService } from '../services/authService';
import { UserRole } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  Sparkles, 
  Palette, 
  ShoppingBag, 
  ArrowRight, 
  Globe2, 
  User as UserIcon,
  Phone,
  MapPin,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { t, language, setLanguage } = useLanguage();

  // Mode toggles: 'login' or 'signup'
  const [artisanMode, setArtisanMode] = useState<'login' | 'signup'>('login');
  const [buyerMode, setBuyerMode] = useState<'login' | 'signup'>('login');

  // Artisan form state
  const [artisanName, setArtisanName] = useState('');
  const [artisanPhone, setArtisanPhone] = useState('');
  const [artisanPlace, setArtisanPlace] = useState('');
  const [artisanEmail, setArtisanEmail] = useState('');
  const [artisanPassword, setArtisanPassword] = useState('');
  const [artisanLoading, setArtisanLoading] = useState(false);
  const [artisanError, setArtisanError] = useState<string | null>(null);

  // Buyer form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerPlace, setBuyerPlace] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [buyerError, setBuyerError] = useState<string | null>(null);

  const handleArtisanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtisanError(null);
    setArtisanLoading(true);

    try {
      if (artisanMode === 'signup') {
        const result = await authService.signUpWithEmail(artisanEmail.trim(), artisanPassword, {
          fullName: artisanName.trim() || 'Master Artisan',
          phone: artisanPhone.trim() || '+91 98421 55210',
          location: artisanPlace.trim() || 'Madurai, Tamil Nadu',
          role: 'artisan',
          language,
        });

        if (result.error) {
          setArtisanError(result.error);
          setArtisanLoading(false);
          return;
        }
      } else {
        const result = await authService.signInWithEmail(artisanEmail.trim(), artisanPassword);
        if (result.error) {
          setArtisanError(result.error);
          setArtisanLoading(false);
          return;
        }
      }

      onLoginSuccess('artisan');
    } catch (err: any) {
      setArtisanError(err?.message || 'Authentication request failed. Please try again.');
    } finally {
      setArtisanLoading(false);
    }
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyerError(null);
    setBuyerLoading(true);

    try {
      if (buyerMode === 'signup') {
        const result = await authService.signUpWithEmail(buyerEmail.trim(), buyerPassword, {
          fullName: buyerName.trim() || 'Procurement Partner',
          phone: buyerPhone.trim() || '+91 98200 44312',
          location: buyerPlace.trim() || 'Mumbai, Maharashtra',
          role: 'buyer',
          language,
        });

        if (result.error) {
          setBuyerError(result.error);
          setBuyerLoading(false);
          return;
        }
      } else {
        const result = await authService.signInWithEmail(buyerEmail.trim(), buyerPassword);
        if (result.error) {
          setBuyerError(result.error);
          setBuyerLoading(false);
          return;
        }
      }

      onLoginSuccess('buyer');
    } catch (err: any) {
      setBuyerError(err?.message || 'Authentication request failed. Please try again.');
    } finally {
      setBuyerLoading(false);
    }
  };

  const handleQuickArtisan = () => {
    authService.loginAsArtisan({
      name: 'Master Artisan',
      phone: '+91 98421 55210',
      place: 'Madurai, Tamil Nadu',
    });
    onLoginSuccess('artisan');
  };

  const handleQuickBuyer = () => {
    authService.loginAsBuyer({
      name: 'Procurement Partner',
      phone: '+91 98200 44312',
      place: 'Mumbai, Maharashtra',
    });
    onLoginSuccess('buyer');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2421] flex flex-col justify-between selection:bg-[#C85A32]/20">
      {/* Top Header with Language Selector */}
      <header className="border-b border-[#E6DFD5] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#A04322] flex items-center justify-center text-white font-serif font-bold text-xl shadow-md shadow-[#C85A32]/20">
              क
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-[#1F2421]">
                KalaSetu
              </span>
              <span className="text-xs text-[#7A7369] ml-2 hidden sm:inline font-serif italic">
                கலாசேது • कलासेतु
              </span>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#7A7369]" />
            <div className="inline-flex rounded-lg border border-[#E6DFD5] bg-[#F4EFEA] p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-[#C85A32] font-semibold shadow-xs'
                    : 'text-[#5C564D] hover:text-[#1F2421]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'ta'
                    ? 'bg-white text-[#C85A32] font-semibold shadow-xs'
                    : 'text-[#5C564D] hover:text-[#1F2421]'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-white text-[#C85A32] font-semibold shadow-xs'
                    : 'text-[#5C564D] hover:text-[#1F2421]'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 md:py-14">
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EADCC9]/50 border border-[#D8C6B0] text-xs font-semibold text-[#8C3D1E] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>AI-Powered Market Linkage Platform</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1F2421] tracking-tight leading-tight">
            {t.auth.welcomeBack}
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#5C564D]">
            {t.auth.demoNotice}
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 1. ARTISAN PORTAL CARD */}
          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C85A32] to-[#E28352]" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#1F2421]">
                      {t.auth.artisanLoginTitle}
                    </h2>
                    <p className="text-xs text-[#8C3D1E] font-medium">
                      {t.auth.artisanSubtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Login / Sign Up Tab Toggle */}
              <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E6DFD5] mb-5">
                <button
                  type="button"
                  onClick={() => { setArtisanMode('login'); setArtisanError(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    artisanMode === 'login'
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'text-[#5C564D] hover:text-[#1F2421]'
                  }`}
                >
                  {language === 'ta' ? 'உள்நுழைக' : language === 'hi' ? 'लॉग इन' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setArtisanMode('signup'); setArtisanError(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    artisanMode === 'signup'
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'text-[#5C564D] hover:text-[#1F2421]'
                  }`}
                >
                  {language === 'ta' ? 'பதிவுசெய்க' : language === 'hi' ? 'साइन अप' : 'Sign Up'}
                </button>
              </div>

              {/* Error Alert */}
              {artisanError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span className="flex-1 leading-relaxed">{artisanError}</span>
                </div>
              )}

              {/* Form strictly styled for Artisan */}
              <form onSubmit={handleArtisanSubmit} className="space-y-3.5">
                {artisanMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[#7A7369]" />
                        <span>{t.auth.nameLabel}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={artisanName}
                        onChange={(e) => setArtisanName(e.target.value)}
                        placeholder="e.g., Master Artisan"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#7A7369]" />
                        <span>{t.auth.phoneLabel}</span>
                      </label>
                      <input
                        type="tel"
                        value={artisanPhone}
                        onChange={(e) => setArtisanPhone(e.target.value)}
                        placeholder="e.g., +91 98421 55210"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#7A7369]" />
                        <span>{t.auth.placeLabel}</span>
                      </label>
                      <input
                        type="text"
                        value={artisanPlace}
                        onChange={(e) => setArtisanPlace(e.target.value)}
                        placeholder="e.g., Madurai, Tamil Nadu"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-colors"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#7A7369]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={artisanEmail}
                    onChange={(e) => setArtisanEmail(e.target.value)}
                    placeholder="artisan@kalasetu.in"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#7A7369]" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={artisanPassword}
                    onChange={(e) => setArtisanPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A32]/30 focus:border-[#C85A32] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={artisanLoading}
                  className="w-full mt-3 py-3 px-4 bg-[#C85A32] hover:bg-[#B34C26] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {artisanLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {artisanMode === 'signup'
                          ? (language === 'ta' ? 'கைவினைஞர் கணக்கை உருவாக்கு' : language === 'hi' ? 'शिल्पकार खाता बनाएं' : 'Create Artisan Account')
                          : t.auth.enterArtisan}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* 2. BUYER PORTAL CARD */}
          <div className="bg-white border border-[#E6DFD5] rounded-2xl p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2A4365] to-[#4299E1]" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#2A4365]/10 text-[#2A4365] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#1F2421]">
                      {t.auth.buyerLoginTitle}
                    </h2>
                    <p className="text-xs text-[#2A4365] font-medium">
                      {t.auth.buyerSubtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Login / Sign Up Tab Toggle */}
              <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#E6DFD5] mb-5">
                <button
                  type="button"
                  onClick={() => { setBuyerMode('login'); setBuyerError(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    buyerMode === 'login'
                      ? 'bg-[#2A4365] text-white shadow-xs'
                      : 'text-[#5C564D] hover:text-[#1F2421]'
                  }`}
                >
                  {language === 'ta' ? 'உள்நுழைக' : language === 'hi' ? 'लॉग इन' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setBuyerMode('signup'); setBuyerError(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    buyerMode === 'signup'
                      ? 'bg-[#2A4365] text-white shadow-xs'
                      : 'text-[#5C564D] hover:text-[#1F2421]'
                  }`}
                >
                  {language === 'ta' ? 'பதிவுசெய்க' : language === 'hi' ? 'साइन अप' : 'Sign Up'}
                </button>
              </div>

              {/* Error Alert */}
              {buyerError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span className="flex-1 leading-relaxed">{buyerError}</span>
                </div>
              )}

              {/* Form strictly styled for Buyer */}
              <form onSubmit={handleBuyerSubmit} className="space-y-3.5">
                {buyerMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-[#7A7369]" />
                        <span>{t.auth.nameLabel}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="e.g., Procurement Partner"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4365]/30 focus:border-[#2A4365] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#7A7369]" />
                        <span>{t.auth.phoneLabel}</span>
                      </label>
                      <input
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="e.g., +91 98200 44312"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4365]/30 focus:border-[#2A4365] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#7A7369]" />
                        <span>{t.auth.placeLabel}</span>
                      </label>
                      <input
                        type="text"
                        value={buyerPlace}
                        onChange={(e) => setBuyerPlace(e.target.value)}
                        placeholder="e.g., Mumbai, Maharashtra"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4365]/30 focus:border-[#2A4365] transition-colors"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#7A7369]" />
                    <span>Business Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="procurement@boutique.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4365]/30 focus:border-[#2A4365] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C564D] mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#7A7369]" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={buyerPassword}
                    onChange={(e) => setBuyerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D5CDC2] bg-[#FAF7F2] text-[#1F2421] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A4365]/30 focus:border-[#2A4365] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={buyerLoading}
                  className="w-full mt-3 py-3 px-4 bg-[#2A4365] hover:bg-[#1A2E40] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {buyerLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {buyerMode === 'signup'
                          ? (language === 'ta' ? 'கொள்முதல் கணக்கை உருவாக்கு' : language === 'hi' ? 'खरीदार खाता बनाएं' : 'Create Buyer Account')
                          : t.auth.enterBuyer}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 1-Click Instant Access Bar */}
        <div className="mt-10 max-w-xl mx-auto p-5 bg-white/70 border border-[#E6DFD5] rounded-2xl text-center shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7A7369] mb-3">
            {t.auth.quickAccess}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleQuickArtisan}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#D8CFC3] text-[#8C3D1E] font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Palette className="w-4 h-4 text-[#C85A32]" />
              <span>{t.auth.continueAsArtisan}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickBuyer}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#D8CFC3] text-[#2A4365] font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#2A4365]" />
              <span>{t.auth.continueAsBuyer}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6DFD5] bg-white py-4 px-6 text-center text-xs text-[#7A7369]">
        <p>KalaSetu © 2026 • AI-Powered Market Linkage Platform for Traditional and Marginalized Artisans</p>
      </footer>
    </div>
  );
};
