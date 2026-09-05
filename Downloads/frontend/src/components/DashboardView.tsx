import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product, MarketRecommendation, Enquiry, ArtisanProfile } from '../types';
import {
  PlusCircle,
  TrendingUp,
  PackageCheck,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  PackageOpen,
  RefreshCw,
} from 'lucide-react';

interface DashboardViewProps {
  artisan: ArtisanProfile;
  products: Product[];
  recommendations: MarketRecommendation[];
  enquiries: Enquiry[];
  onAddProductClick: () => void;
  onViewMarketsClick: () => void;
  onViewCatalogClick: () => void;
  onViewEnquiryClick: (enquiryId?: string) => void;
  onSelectProductDetails: (product: Product) => void;
  isLoadingProducts?: boolean;
  productFetchError?: string | null;
  onRetryFetchProducts?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  artisan,
  products,
  recommendations,
  enquiries,
  onAddProductClick,
  onViewMarketsClick,
  onViewCatalogClick,
  onViewEnquiryClick,
  onSelectProductDetails,
  isLoadingProducts = false,
  productFetchError = null,
  onRetryFetchProducts,
}) => {
  const { t, getLocalizedField } = useLanguage();

  const activeProductsCount = products.length;
  const activeEnquiriesCount = enquiries.length;
  const topMatch = recommendations.length > 0 ? recommendations[0] : null;
  const totalPipelineValue = enquiries.reduce(
    (acc, curr) => acc + (curr.offeredPricePerUnit || 1200) * curr.targetQuantity,
    0
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner with Heritage Motif */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#2C241E] via-[#3C3026] to-[#4D3A2C] text-white p-6 sm:p-10 shadow-lg border border-[#634E3C]/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C85A32] text-amber-100 border border-amber-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{artisan.community}</span>
            </span>
            {artisan.giTagCertified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-200 border border-emerald-500/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>GI Tag Custodian</span>
              </span>
            )}
            {artisan.stateAwardee && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-900/60 text-amber-200 border border-amber-500/40">
                <Award className="w-3.5 h-3.5" />
                <span>State Merit Master</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#FDF9F3] tracking-tight leading-tight">
            {t.dashboard.title}: {artisan.name}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-sans max-w-2xl">
            {getLocalizedField(artisan, 'craftTradition') || artisan.craftTradition} •{' '}
            <span className="text-amber-200 font-medium">{artisan.experienceYears} Years of Generational Craftsmanship</span>
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onAddProductClick}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white font-semibold text-sm shadow-md shadow-[#C85A32]/30 transition transform active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t.dashboard.quickAddProduct}</span>
            </button>
            <button
              onClick={onViewMarketsClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-amber-100 border border-white/20 font-medium text-sm transition cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{t.dashboard.exploreOpportunities} ({recommendations.length})</span>
            </button>
          </div>
        </div>

        {/* Decorative corner artisan stamp pattern */}
        <div className="absolute right-4 bottom-4 sm:right-10 sm:bottom-10 opacity-10 pointer-events-none hidden md:block">
          <div className="w-48 h-48 rounded-full border-8 border-amber-300 flex items-center justify-center font-serif text-5xl font-bold">
            कला
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Active Products */}
        <div
          onClick={onViewCatalogClick}
          className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs hover:shadow-md hover:border-[#C85A32]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              {t.dashboard.totalProducts}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#C85A32] group-hover:scale-110 transition-transform">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1F2421] font-sans">{activeProductsCount}</span>
            <span className="text-xs font-medium text-emerald-600">100% AI Cataloged</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <span>{t.common.view} {t.nav.catalog}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Matched Opportunities */}
        <div
          onClick={onViewMarketsClick}
          className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs hover:shadow-md hover:border-emerald-500/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              {t.dashboard.matchedOpportunities}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1F2421] font-sans">{recommendations.length}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Avg 94% Match
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-700 flex items-center gap-1 font-medium">
            <span>{t.markets.title}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Active Enquiries */}
        <div
          onClick={() => onViewEnquiryClick()}
          className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs hover:shadow-md hover:border-[#C85A32]/40 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              {t.dashboard.activeEnquiries}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1F2421] font-sans">{activeEnquiriesCount}</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              2 Negotiating
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <span>{t.enquiries.openChat}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>

        {/* Order Pipeline */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8DFD3] shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              {t.dashboard.pipelineValue}
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 font-serif font-bold">
              ₹
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#1F2421] font-sans">
              ₹{totalPipelineValue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Zero commission artisan payout</p>
        </div>
      </div>

      {/* Main Grid: Featured Market Match & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Recommendation Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#1F2421] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C85A32]" />
              <span>{t.markets.title}</span>
            </h2>
            <button
              onClick={onViewMarketsClick}
              className="text-xs font-bold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t.common.view} {t.common.all} ({recommendations.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {topMatch ? (
            <div className="bg-white rounded-2xl border border-[#E6DED3] overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-stone-200">
                <img
                  src={topMatch.opportunity.bannerImage}
                  alt={getLocalizedField(topMatch.opportunity, 'title')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Match Score Badge */}
                <div className="absolute top-4 right-4 bg-emerald-500 text-white font-bold text-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{topMatch.matchScore}% {t.markets.matchScore}</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-amber-200 uppercase tracking-wider">
                    {topMatch.opportunity.type}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1 leading-snug">
                    {getLocalizedField(topMatch.opportunity, 'title')}
                  </h3>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 gap-y-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C85A32]" />
                    <span>{topMatch.opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{t.markets.deadline}: {topMatch.opportunity.deadline}</span>
                  </div>
                </div>

                {/* Why This Matches Checklist */}
                <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#EFE8DE] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t.markets.whyThisMatches}:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {topMatch.matchedFactors.slice(0, 3).map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <div>
                          <span className="font-semibold">{getLocalizedField(factor, 'label')}: </span>
                          <span className="text-gray-600">{getLocalizedField(factor, 'detail')}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">
                    Expected Volume: <strong className="text-gray-800">{topMatch.opportunity.expectedOrderVolume}</strong>
                  </span>
                  <button
                    onClick={onViewMarketsClick}
                    className="px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    {t.markets.sendEnquiry}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-dashed border-gray-300">
              {t.markets.noOpportunities}
            </div>
          )}
        </div>

        {/* Right Column: Catalog Quick Preview & Recent Enquiries (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Craft Listings */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6DED3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#1F2421]">
                {t.dashboard.totalProducts} ({products.length})
              </h3>
              <button
                onClick={onViewCatalogClick}
                className="text-xs font-semibold text-[#C85A32] hover:underline cursor-pointer"
              >
                {t.common.view} {t.common.all}
              </button>
            </div>

            {/* Error State */}
            {productFetchError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{productFetchError}</span>
                </div>
                {onRetryFetchProducts && (
                  <button
                    type="button"
                    onClick={onRetryFetchProducts}
                    className="flex items-center gap-1 font-semibold text-red-800 hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoadingProducts ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-400">
                <Loader2 className="w-6 h-6 animate-spin text-[#C85A32]" />
                <span className="text-xs">Loading craft products from database...</span>
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="py-6 px-4 rounded-xl bg-[#FAF7F2] border border-dashed border-[#D8CFC3] text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-100/60 text-[#C85A32] flex items-center justify-center">
                  <PackageOpen className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#1F2421]">No Crafts Listed Yet</h4>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  {t.dashboard.noProductsYet}
                </p>
                <button
                  type="button"
                  onClick={onAddProductClick}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C85A32] text-white text-xs font-medium shadow-xs hover:bg-[#B34C26] transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add First Craft</span>
                </button>
              </div>
            ) : (
              /* Success / Populated State */
              <div className="space-y-3">
                {products.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onSelectProductDetails(product)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FBF8F3] border border-transparent hover:border-[#E8DFD3] transition cursor-pointer"
                  >
                    <img
                      src={product.imageUrl}
                      alt={getLocalizedField(product, 'title')}
                      className="w-14 h-14 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {getLocalizedField(product, 'title')}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">
                        {getLocalizedField(product, 'category')} • {product.stockAvailable} {t.common.units}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-[#C85A32]">
                          ₹{product.pricePerUnit.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {t.review.minimumOrderQuantity}: {product.minimumOrderQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onAddProductClick}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#C85A32]/60 text-[#C85A32] bg-amber-50/50 hover:bg-amber-50 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.dashboard.quickAddProduct}</span>
            </button>
          </div>

          {/* Active Direct Linkage Enquiries */}
          <div className="bg-white rounded-2xl p-5 border border-[#E6DED3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#1F2421]">
                {t.enquiries.title} ({enquiries.length})
              </h3>
              <button
                onClick={() => onViewEnquiryClick()}
                className="text-xs font-semibold text-[#C85A32] hover:underline cursor-pointer"
              >
                {t.common.view} {t.common.all}
              </button>
            </div>

            <div className="space-y-3">
              {enquiries.slice(0, 2).map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => onViewEnquiryClick(enq.id)}
                  className="p-3 rounded-xl border border-gray-100 bg-[#FAF7F2] hover:border-[#C85A32]/40 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{enq.buyerOrg}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enq.status === 'Negotiating'
                          ? 'bg-amber-100 text-amber-800'
                          : enq.status === 'Responded'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 italic">
                    "{enq.messages[enq.messages.length - 1]?.content || enq.initialMessage}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>
                      {enq.targetQuantity} units @ ₹{enq.offeredPricePerUnit}
                    </span>
                    <span className="text-[#C85A32] font-semibold flex items-center gap-1">
                      {t.enquiries.openChat} <ArrowRight className="w-3 h-3" />
                    </span>
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
