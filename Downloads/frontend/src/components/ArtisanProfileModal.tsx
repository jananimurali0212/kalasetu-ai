import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ArtisanProfile, Product, SupportedLanguage } from '../types';
import {
  X,
  ShieldCheck,
  Award,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Package,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ArtisanProfileModalProps {
  artisan: ArtisanProfile;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSendEnquiry: (product: Product) => void;
}

export const ArtisanProfileModal: React.FC<ArtisanProfileModalProps> = ({
  artisan,
  products,
  onClose,
  onSelectProduct,
  onSendEnquiry,
}) => {
  const { language } = useLanguage();
  const [profileLang, setProfileLang] = useState<SupportedLanguage>(language);

  const getBio = (): string => {
    if (profileLang === 'ta' && artisan.bio_ta) return artisan.bio_ta;
    if (profileLang === 'hi' && artisan.bio_hi) return artisan.bio_hi;
    return artisan.bio_en;
  };

  const getTradition = (): string => {
    if (profileLang === 'ta' && artisan.craftTradition_ta) return artisan.craftTradition_ta;
    if (profileLang === 'hi' && artisan.craftTradition_hi) return artisan.craftTradition_hi;
    return artisan.craftTradition;
  };

  const artisanProducts = products.filter((p) => p.artisanId === artisan.id || artisan.id === 'artisan-1');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E6DFD5] shadow-2xl overflow-hidden my-8 animate-in fade-in-50 zoom-in-95">
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-200 overflow-hidden">
          <img
            src={artisan.coverImageUrl}
            alt={artisan.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on cover */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2">
              {artisan.giTagCertified && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 backdrop-blur-xs text-white flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>GI Tag Custodian: {artisan.giCertificateNumber}</span>
                </span>
              )}
              {artisan.stateAwardee && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 backdrop-blur-xs text-white flex items-center gap-1.5 shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>State Merit Master</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 sm:px-8 pt-4 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 -mt-14 relative z-10">
            <div className="flex items-end gap-4">
              <img
                src={artisan.avatarUrl}
                alt={artisan.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md bg-stone-100"
              />
              <div className="mb-1">
                <h2 className="text-2xl font-serif font-bold text-[#1F2421]">
                  {artisan.name}
                </h2>
                <p className="text-xs text-[#C85A32] font-semibold">{artisan.community}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{artisan.clusterLocation}</span>
                </div>
              </div>
            </div>

            {/* Language Switcher for Story */}
            <div className="flex items-center p-1 rounded-xl bg-[#EFE8DC] border border-[#DDD4C5]">
              {(['en', 'ta', 'hi'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setProfileLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    profileLang === lang
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8] text-center text-xs">
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Tradition</span>
              <span className="text-base font-bold text-[#C85A32]">{artisan.experienceYears}+ Years</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Completed Orders</span>
              <span className="text-base font-bold text-gray-900">{artisan.completedOrders} Orders</span>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[10px] block">Cluster Rating</span>
              <span className="text-base font-bold text-emerald-700">★ {artisan.rating} / 5.0</span>
            </div>
          </div>

          {/* Heritage Story & Tradition */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-base text-[#1F2421]">
              {getTradition()}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8]">
              {getBio()}
            </p>
          </div>

          {/* Catalog of Works */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#1F2421]">
                Handcrafted Catalog ({artisanProducts.length} Items Listed)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {artisanProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] transition group"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.title_en}
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-[#C85A32] transition">
                      {p.title_en}
                    </h4>
                    <p className="text-[11px] text-[#C85A32] font-semibold mt-0.5">
                      ₹{p.pricePerUnit.toLocaleString('en-IN')} / unit
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProduct(p);
                        }}
                        className="text-[10px] font-bold text-gray-600 hover:text-black"
                      >
                        View Details →
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onSendEnquiry(p);
                        }}
                        className="text-[10px] font-bold text-[#C85A32] hover:underline"
                      >
                        Send Enquiry
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
