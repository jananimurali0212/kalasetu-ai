import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { BuyerRequirement, Product, ArtisanProfile } from '../types';
import { buyerService, BuyerSearchResult } from '../services/buyerService';
import {
  Search,
  Sparkles,
  Package,
  Layers,
  MapPin,
  ShieldCheck,
  Award,
  ArrowRight,
  Send,
  Eye,
  User,
  CheckCircle,
} from 'lucide-react';

interface BuyerViewProps {
  onSelectProduct: (product: Product) => void;
  onSelectArtisan: (artisan: ArtisanProfile) => void;
  onSendEnquiry: (product: Product, artisan?: ArtisanProfile) => void;
}

export const BuyerView: React.FC<BuyerViewProps> = ({
  onSelectProduct,
  onSelectArtisan,
  onSendEnquiry,
}) => {
  const { t, getLocalizedField } = useLanguage();

  const [query, setQuery] = useState(
    'I need 100 handmade bamboo baskets for a sustainable retail store.'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [requirement, setRequirement] = useState<BuyerRequirement | null>(null);
  const [searchResults, setSearchResults] = useState<BuyerSearchResult[]>([]);

  // Initial search trigger
  useEffect(() => {
    handleSearch(query);
  }, []);

  const sampleQueries = [
    'I need 100 handmade bamboo baskets for a sustainable retail store.',
    'Looking for 50 handcrafted terracotta necklace sets for cultural festive gifting.',
    'Procuring 25 blue pottery floral vases for heritage hotel lobby decor.',
    'Require 75 traditional clay peacock oil lamps for Deepawali corporate gifts.',
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const parsedReq = await buyerService.parseRequirement(searchQuery);
      setRequirement(parsedReq);
      const results = buyerService.searchArtisansAndProducts(parsedReq);
      setSearchResults(results);
    } catch (err) {
      console.error('Buyer search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Search & Intent Banner */}
      <div className="bg-gradient-to-br from-[#27211C] via-[#352B24] to-[#43352B] rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#C85A32] text-amber-100 uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Natural Language Procurement Engine</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#FDF9F3]">
            {t.buyer.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300">
            {t.buyer.subtitle}
          </p>
        </div>

        {/* Natural Language Query Bar */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.buyer.searchPlaceholder}
              className="w-full pl-5 pr-28 sm:pr-36 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium shadow-md focus:outline-hidden focus:ring-4 focus:ring-[#C85A32]/40"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 sm:right-2.5 px-4 sm:px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isSearching ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Search Artisans</span>
            </button>
          </div>

          {/* Sample Query Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-amber-200/80 font-medium">Try asking:</span>
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  handleSearch(sample);
                }}
                className="text-[11px] px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition cursor-pointer text-left line-clamp-1"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Extracted Procurement Parameters Card */}
      {requirement && (
        <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs space-y-4 animate-in fade-in-50">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <span>{t.buyer.extractedParameters}</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Procurement Intent Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DE]">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">
                {t.buyer.extractedProduct}
              </span>
              <span className="font-bold text-gray-900 mt-1 block">
                {requirement.extractedProduct}
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DE]">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">
                {t.buyer.extractedQuantity}
              </span>
              <span className="font-bold text-gray-900 mt-1 block">
                {requirement.extractedQuantity}
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DE]">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">
                {t.buyer.extractedMaterial}
              </span>
              <span className="font-bold text-gray-900 mt-1 block">
                {requirement.extractedMaterial}
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DE]">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">
                {t.buyer.extractedPurpose}
              </span>
              <span className="font-bold text-gray-900 mt-1 block truncate">
                {requirement.extractedPurpose}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Matching Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-xl text-[#1F2421]">
            {t.buyer.matchingArtisans} ({searchResults.length} Verified Custodians)
          </h2>
          <span className="text-xs text-gray-500">Sorted by relevance and production capacity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {searchResults.map((result) => {
            const { product, artisan, relevanceScore, matchReasons } = result;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Product Showcase */}
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={getLocalizedField(product, 'title')}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Match Score Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{relevanceScore}% Match</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] uppercase font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-amber-200">
                        {getLocalizedField(product, 'category')}
                      </span>
                      <h3 className="font-serif font-bold text-base text-white truncate mt-1">
                        {getLocalizedField(product, 'title')}
                      </h3>
                    </div>
                  </div>

                  {/* Artisan Lineage Pill */}
                  <div className="p-4 bg-[#FAF7F2] border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={artisan.avatarUrl}
                        alt={artisan.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#C85A32]/30"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">{artisan.name}</span>
                          {artisan.giTagCertified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="GI Tag Custodian" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {artisan.clusterLocation} • {artisan.experienceYears}y experience
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectArtisan(artisan)}
                      className="px-2.5 py-1 rounded-lg border border-gray-300 hover:bg-white text-[11px] font-semibold text-gray-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      <User className="w-3 h-3 text-[#C85A32]" />
                      <span>{t.buyer.viewArtisan}</span>
                    </button>
                  </div>

                  {/* Body Specs & Match Reasons */}
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Wholesale Unit Price</span>
                        <span className="font-bold text-base text-[#C85A32]">
                          ₹{product.pricePerUnit.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">MOQ / Stock</span>
                        <span className="font-semibold text-gray-800">
                          {product.minimumOrderQuantity} / {product.stockAvailable} units ready
                        </span>
                      </div>
                    </div>

                    {/* Match Reasons Checklist */}
                    <div className="space-y-1 pt-1">
                      {matchReasons.map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-1.5 text-xs text-gray-700">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 hover:bg-[#FAF7F2] text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>{t.buyer.viewProduct}</span>
                  </button>

                  <button
                    onClick={() => onSendEnquiry(product, artisan)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-200" />
                    <span>{t.buyer.sendEnquiry}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
