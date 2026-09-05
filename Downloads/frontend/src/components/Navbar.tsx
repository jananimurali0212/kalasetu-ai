import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage, UserRole } from '../types';
import { authService } from '../services/authService';
import {
  Sparkles,
  Layers,
  PlusCircle,
  TrendingUp,
  MessageSquare,
  Search,
  Globe,
  UserCheck,
  Menu,
  X,
  ChevronDown,
  ArrowRightLeft,
  ShoppingBag,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  openEnquiryCount: number;
  marketMatchCount: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentRole,
  setCurrentRole,
  openEnquiryCount,
  marketMatchCount,
  onLogout,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = authService.getCurrentUser();

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ];

  const handleRoleToggle = () => {
    const newRole = currentRole === 'artisan' ? 'buyer' : 'artisan';
    setCurrentRole(newRole);
    if (newRole === 'buyer' && (currentView === 'addProduct' || currentView === 'catalog')) {
      setCurrentView('buyerSearch');
    } else if (newRole === 'artisan' && currentView === 'buyerSearch') {
      setCurrentView('dashboard');
    }
  };

  const navItems =
    currentRole === 'artisan'
      ? [
          { id: 'dashboard', label: t.nav.dashboard, icon: Layers },
          { id: 'catalog', label: t.nav.catalog, icon: ShoppingBag },
          { id: 'addProduct', label: t.nav.addProduct, icon: PlusCircle, highlight: true },
          { id: 'markets', label: t.nav.markets, icon: TrendingUp, badge: marketMatchCount },
          { id: 'enquiries', label: t.nav.enquiries, icon: MessageSquare, badge: openEnquiryCount },
        ]
      : [
          { id: 'buyerSearch', label: t.nav.buyerSearch, icon: Search, highlight: true },
          { id: 'catalog', label: t.nav.catalog, icon: ShoppingBag },
          { id: 'markets', label: t.nav.markets, icon: TrendingUp },
          { id: 'enquiries', label: t.nav.enquiries, icon: MessageSquare, badge: openEnquiryCount },
        ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DFD5] shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-[#C85A32] text-amber-50 px-4 py-1 text-xs font-medium tracking-wide flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {language === 'ta'
                ? 'நேரடி சந்தை இணைப்பு: பூஜ்ஜிய இடைத்தரகர் கமிஷன்'
                : language === 'hi'
                ? 'प्रत्यक्ष बाज़ार संपर्क: शून्य बिचौलिया कमीशन'
                : 'Direct Artisan Market Linkage: 0% Middlemen Commission'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRoleToggle}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 transition text-amber-100 cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>
                {currentRole === 'artisan' ? t.nav.switchRole + ' → ' + t.nav.buyerMode : t.nav.switchRole + ' → ' + t.nav.artisanMode}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand / Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView(currentRole === 'artisan' ? 'dashboard' : 'buyerSearch')}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#A03E1C] flex items-center justify-center text-white shadow-sm shadow-[#C85A32]/25 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold tracking-tight text-[#1F2421]">
                    {t.app.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-[#C85A32] border border-amber-200">
                    {currentRole === 'artisan' ? t.nav.artisanMode : t.nav.buyerMode}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] hidden sm:block truncate max-w-xs">
                  {t.app.tagline}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#EFE8DC] text-[#C85A32] shadow-xs font-semibold'
                      : item.highlight
                      ? 'bg-[#C85A32] text-white hover:bg-[#B84A22] shadow-xs'
                      : 'text-[#4A5568] hover:text-[#1F2421] hover:bg-[#F3ECE0]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C85A32]' : item.highlight ? 'text-white' : 'text-[#718096]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                        isActive || item.highlight ? 'bg-amber-100 text-[#C85A32]' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Language Selector & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#DED7CB] bg-[#FAF7F2] text-[#2D3748] hover:bg-[#F4EEE3] text-sm font-medium transition cursor-pointer shadow-xs"
                title="Select Interface Language"
              >
                <Globe className="w-4 h-4 text-[#C85A32]" />
                <span className="font-medium">
                  {languages.find((l) => l.code === language)?.native || 'English'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-[#E2D9CD] shadow-lg py-1 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Language / மொழி / भाषा
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition cursor-pointer ${
                        language === lang.code
                          ? 'bg-amber-50 text-[#C85A32] font-semibold'
                          : 'text-[#2D3748] hover:bg-[#FBF8F4]'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-xs text-gray-400 font-normal">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E2D9CD]">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#C85A32]/30">
                <img
                  src={
                    currentRole === 'artisan'
                      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
                  }
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left hidden lg:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#1F2421]">
                    {currentUser.name || (currentRole === 'artisan' ? 'Master Artisan' : 'Procurement Partner')}
                  </span>
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-[11px] text-gray-500 block truncate max-w-[140px]">
                  {currentRole === 'artisan' ? 'Master Artisan (GI Custodian)' : 'Procurement Partner'}
                </span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-1 p-1.5 rounded-lg text-gray-500 hover:text-[#C85A32] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
                  title="Switch Account / Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-[#F0E9DC] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6DFD5] bg-[#FAF7F2] px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#EFE8DC] text-[#C85A32] font-semibold'
                    : item.highlight
                    ? 'bg-[#C85A32] text-white'
                    : 'text-[#2D3748] hover:bg-[#F3ECE0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#E6DFD5] flex items-center justify-between">
            <button
              onClick={() => {
                handleRoleToggle();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-[#C85A32] bg-amber-50 px-3 py-2 rounded-lg border border-amber-200"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{t.nav.switchRole} ({currentRole === 'artisan' ? t.nav.buyerMode : t.nav.artisanMode})</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-[#C85A32] px-3 py-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
