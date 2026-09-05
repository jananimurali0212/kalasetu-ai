import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product, UserRole } from '../types';
import {
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Eye,
  Package,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  currentRole: UserRole;
  onSelectProduct: (product: Product) => void;
  onViewProductMarkets: (product: Product) => void;
  onAddProductClick: () => void;
  onSendEnquiry: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  currentRole,
  onSelectProduct,
  onViewProductMarkets,
  onAddProductClick,
  onSendEnquiry,
}) => {
  const { t, getLocalizedField } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Handmade Jewellery', 'Home Decor & Storage', 'Home Decor & Pottery'];

  const filteredProducts = products.filter((product) => {
    const title = (getLocalizedField(product, 'title') || product.title_en).toLowerCase();
    const material = (getLocalizedField(product, 'material') || product.material_en).toLowerCase();
    const category = product.category_en;
    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      material.includes(searchTerm.toLowerCase()) ||
      product.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1F2421]">
            {t.catalog.title}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t.catalog.subtitle} ({filteredProducts.length} {t.common.units} {t.common.active})
          </p>
        </div>

        {currentRole === 'artisan' && (
          <button
            onClick={onAddProductClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.dashboard.quickAddProduct}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DFD5]">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D9CFBF] text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <Filter className="w-3.5 h-3.5 text-gray-500 ml-1 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'bg-white border border-[#D9CFBF] text-gray-700 hover:bg-[#F3ECE0]'
              }`}
            >
              {cat === 'All' ? t.catalog.allCategories : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[#E6DFD5] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group"
            >
              {/* Image & Badge Overlay */}
              <div
                onClick={() => onSelectProduct(product)}
                className="relative h-56 bg-stone-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={product.imageUrl}
                  alt={getLocalizedField(product, 'title')}
                  className="w-full h-full object-cover group-hover:scale-104 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-gray-800 shadow-xs">
                    {getLocalizedField(product, 'category')}
                  </span>
                  {product.confidenceScore && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{product.confidenceScore}% AI</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[11px] font-medium text-amber-200 truncate">
                    {product.artisanName} • {product.artisanLocation}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="font-serif font-bold text-base text-[#1F2421] group-hover:text-[#C85A32] transition line-clamp-2 cursor-pointer"
                  >
                    {getLocalizedField(product, 'title')}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {getLocalizedField(product, 'description') || product.description_en}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[11px] text-gray-500 font-medium bg-stone-100 px-2 py-0.5 rounded">
                      {getLocalizedField(product, 'material') || product.material_en}
                    </span>
                  </div>
                </div>

                {/* Commercial specs & Actions */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Unit Price</span>
                      <span className="text-base font-bold text-[#C85A32]">
                        ₹{product.pricePerUnit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {t.review.minimumOrderQuantity} / Stock
                      </span>
                      <span className="text-xs font-semibold text-gray-700">
                        {product.minimumOrderQuantity} / {product.stockAvailable} units
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="flex-1 py-2 px-3 rounded-xl border border-gray-200 hover:bg-[#FAF7F2] text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      <span>{t.catalog.viewDetails}</span>
                    </button>

                    {currentRole === 'artisan' ? (
                      <button
                        onClick={() => onViewProductMarkets(product)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{t.catalog.viewRecommendations}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSendEnquiry(product)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t.markets.sendEnquiry}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 space-y-3">
          <Package className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-gray-700">
            {t.catalog.noProducts}
          </h3>
          <p className="text-xs text-gray-500">
            Try adjusting your search query or add a new craft using the AI scanner.
          </p>
          {currentRole === 'artisan' && (
            <button
              onClick={onAddProductClick}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-semibold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.dashboard.quickAddProduct}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
