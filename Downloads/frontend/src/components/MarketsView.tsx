import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { MarketOpportunity, MarketRecommendation, Product } from '../types';
import { marketService } from '../services/marketService';
import {
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Send,
  Layers,
  Award,
  Filter,
} from 'lucide-react';

interface MarketsViewProps {
  products: Product[];
  selectedProductForMatch?: Product;
  onSendOpportunityEnquiry: (opp: MarketOpportunity, product: Product) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  products,
  selectedProductForMatch,
  onSendOpportunityEnquiry,
}) => {
  const { t, getLocalizedField } = useLanguage();

  // Active product selector for market matching
  const [activeProductId, setActiveProductId] = useState<string>(
    selectedProductForMatch?.id || (products.length > 0 ? products[0].id : '')
  );

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];

  // Calculate deterministic recommendations for the active product
  const recommendations: MarketRecommendation[] = activeProduct
    ? marketService.getRecommendationsForProduct(activeProduct)
    : [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DFD5] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-serif font-bold text-[#1F2421]">
                {t.markets.title}
              </h1>
            </div>
            <p className="text-xs text-gray-600 max-w-2xl">
              {t.markets.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <span>Weighted Deterministic Algorithm (Category 30%, Material 25%, Keywords 15%)</span>
          </div>
        </div>

        {/* Product selector: match against specific product */}
        {products.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Match Opportunities For Craft Product:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {products.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => setActiveProductId(prod.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    activeProductId === prod.id
                      ? 'bg-[#C85A32] text-white shadow-xs'
                      : 'bg-[#FAF7F2] border border-[#D9CFBF] text-gray-700 hover:bg-[#F3ECE0]'
                  }`}
                >
                  <img
                    src={prod.imageUrl}
                    alt={getLocalizedField(prod, 'title')}
                    className="w-5 h-5 rounded-md object-cover bg-white"
                  />
                  <span className="max-w-[200px] truncate">{getLocalizedField(prod, 'title')}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.map((rec) => {
          const opp = rec.opportunity;
          return (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs hover:shadow-md transition"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Opportunity Image & Visual Info (4 cols) */}
                <div className="lg:col-span-4 relative min-h-[200px] lg:min-h-full bg-stone-100 overflow-hidden">
                  <img
                    src={opp.bannerImage}
                    alt={getLocalizedField(opp, 'title')}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* High Confidence Match Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{rec.matchScore}% {t.markets.matchScore}</span>
                    </span>
                  </div>

                  {opp.boothGrantSubsidized && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>Subsidized Grant</span>
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                      {opp.type}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-white leading-snug mt-0.5">
                      {getLocalizedField(opp, 'title')}
                    </h3>
                    <p className="text-xs text-stone-200 truncate mt-0.5">{opp.organizer}</p>
                  </div>
                </div>

                {/* Opportunity Details & Match Breakdown (8 cols) */}
                <div className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    {/* Key Meta Badges */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#C85A32]" />
                        <span>{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{opp.eventDates}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <span>{t.markets.deadline}: {opp.deadline}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {getLocalizedField(opp, 'description') || opp.description_en}
                    </p>

                    {/* Requirements Tags */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        {t.markets.requirements}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                          Category: {opp.categoryRequired}
                        </span>
                        {opp.materialRequired.map((mat, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
                          >
                            Material: {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* "Why This Matches" Breakdown Checklist */}
                    <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#EBE4D8] space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2421] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{t.markets.whyThisMatches} ({rec.productTitle}):</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                        {rec.matchedFactors.map((factor, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold text-sm">✓</span>
                            <div>
                              <strong className="text-gray-900 font-semibold">
                                {getLocalizedField(factor, 'label')}:{' '}
                              </strong>
                              <span className="text-gray-600">{getLocalizedField(factor, 'detail')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Commercial Expectations & Apply CTA */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Estimated Order Volume
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {opp.expectedOrderVolume}
                      </span>
                    </div>

                    <button
                      onClick={() => activeProduct && onSendOpportunityEnquiry(opp, activeProduct)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C85A32] to-[#B84A22] hover:from-[#B84A22] hover:to-[#9F3918] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-200" />
                      <span>{t.markets.sendEnquiry}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
