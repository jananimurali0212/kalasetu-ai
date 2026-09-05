import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product, SupportedLanguage, ArtisanProfile, UserRole } from '../types';
import {
  X,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  Send,
  User,
  Clock,
  Tag,
  Layers,
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product;
  artisan?: ArtisanProfile;
  currentRole: UserRole;
  onClose: () => void;
  onViewArtisan: (artisan: ArtisanProfile) => void;
  onSendEnquiry: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  artisan,
  currentRole,
  onClose,
  onViewArtisan,
  onSendEnquiry,
}) => {
  const { t, language } = useLanguage();
  const [detailLang, setDetailLang] = useState<SupportedLanguage>(language);

  const getLangField = (fieldPrefix: string): string => {
    const key = `${fieldPrefix}_${detailLang}`;
    const val = (product as any)[key];
    if (val && typeof val === 'string' && val.trim()) return val;
    const fallback = (product as any)[`${fieldPrefix}_en`];
    return fallback || (product as any)[fieldPrefix] || '';
  };

  const getLangArray = (fieldPrefix: string): string[] => {
    const key = `${fieldPrefix}_${detailLang}`;
    const val = (product as any)[key];
    if (Array.isArray(val) && val.length > 0) return val;
    const fallback = (product as any)[`${fieldPrefix}_en`];
    return Array.isArray(fallback) ? fallback : [];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E6DFD5] shadow-2xl overflow-hidden my-8 animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-[#C85A32] border border-amber-200">
              {getLangField('category')}
            </span>
            {product.confidenceScore && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{product.confidenceScore}% AI Authenticity</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-gray-500 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Visual & Key Specs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 rounded-2xl overflow-hidden bg-stone-100 max-h-80 border border-amber-200/50">
              <img
                src={product.imageUrl}
                alt={getLangField('title')}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1F2421] leading-snug">
                  {getLangField('title')}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Crafted by <strong className="text-gray-900">{product.artisanName}</strong> in{' '}
                  <span className="text-[#C85A32] font-medium">{product.artisanLocation}</span>
                </p>
              </div>

              {/* Commercial Specs Box */}
              <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EBE4D8] space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Wholesale Price</span>
                  <span className="text-2xl font-bold text-[#C85A32]">
                    ₹{product.pricePerUnit.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs border-t border-gray-200/60 pt-3">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">MOQ</span>
                    <span className="font-bold text-gray-800">{product.minimumOrderQuantity} units</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Lead Time</span>
                    <span className="font-bold text-gray-800">{product.leadTimeDays} days</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Ready Stock</span>
                    <span className="font-bold text-emerald-700">{product.stockAvailable} units</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {artisan && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewArtisan(artisan);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 hover:bg-[#FAF7F2] text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>View Artisan Profile</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onSendEnquiry(product);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Enquiry</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multilingual Description & Craft Story Section */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Multilingual AI Craft Details
              </h3>

              {/* Language Switch Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-[#EFE8DC] border border-[#DDD4C5]">
                {(['en', 'ta', 'hi'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setDetailLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      detailLang === lang
                        ? 'bg-[#C85A32] text-white shadow-xs'
                        : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिन्दी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Body */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE4D8]">
              {getLangField('description')}
            </p>

            {/* Craft Specs Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-400 uppercase text-[10px] block">
                  {t.review.materialLabel}
                </span>
                <span className="font-semibold text-gray-900 block">{getLangField('material')}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-400 uppercase text-[10px] block">
                  {t.review.techniqueLabel}
                </span>
                <span className="font-semibold text-gray-900 block">{getLangField('technique')}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-400 uppercase text-[10px] block">
                  {t.review.styleLabel}
                </span>
                <span className="font-semibold text-gray-900 block">{getLangField('style')}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-gray-400 uppercase text-[10px] block">
                  {t.review.colorsLabel}
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {product.colors.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-gray-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Potential Uses */}
            <div>
              <span className="font-bold text-gray-400 uppercase text-[10px] block mb-1.5">
                {t.review.potentialUsesLabel}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getLangArray('potential_uses').map((use, uIdx) => (
                  <span
                    key={uIdx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                  >
                    ✓ {use}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
