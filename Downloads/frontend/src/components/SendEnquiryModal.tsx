import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product, MarketOpportunity, ArtisanProfile, UserRole } from '../types';
import { enquiryService } from '../services/enquiryService';
import { authService } from '../services/authService';
import {
  X,
  Send,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  PackageCheck,
} from 'lucide-react';

interface SendEnquiryModalProps {
  product?: Product;
  opportunity?: MarketOpportunity;
  artisan?: ArtisanProfile;
  currentRole: UserRole;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendEnquiryModal: React.FC<SendEnquiryModalProps> = ({
  product,
  opportunity,
  artisan,
  currentRole,
  onClose,
  onSuccess,
}) => {
  const { t, getLocalizedField } = useLanguage();
  const currentUser = authService.getCurrentUser();

  const [quantity, setQuantity] = useState<number>(
    product?.minimumOrderQuantity ? Math.max(product.minimumOrderQuantity, 25) : 50
  );
  const [offeredPrice, setOfferedPrice] = useState<number>(
    product?.pricePerUnit ? product.pricePerUnit : 1400
  );
  const [message, setMessage] = useState<string>(() => {
    if (opportunity && product) {
      return `Namaste! We are applying to showcase our certified handcrafted "${product.title_en}" at the "${opportunity.title_en}". We can commit to a production volume of ${quantity} units.`;
    }
    if (currentRole === 'buyer' && product) {
      return `Namaste! We are interested in procuring ${quantity} units of your handcrafted "${product.title_en}" for our sustainable retail store collection. Can you confirm if delivery can be fulfilled within 3 weeks?`;
    }
    return `Namaste, we would like to discuss a procurement partnership for this artisan craft.`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const prodId = product?.id || 'prod-general';
    const prodTitle = product ? getLocalizedField(product, 'title') || product.title_en : 'Artisan Craft Selection';
    const prodImage =
      product?.imageUrl ||
      opportunity?.bannerImage ||
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80';

    const targetArtisanId = artisan?.id || product?.artisanId || 'artisan-1';
    const targetArtisanName = artisan?.name || product?.artisanName || 'Meenakshi Devi';

    enquiryService.createEnquiry({
      artisanId: targetArtisanId,
      artisanName: targetArtisanName,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerOrg: currentRole === 'buyer' ? 'EcoCrafts Sustainable Boutique' : 'Master Artisan Direct Guild',
      productId: prodId,
      productTitle: prodTitle,
      productImage: prodImage,
      targetQuantity: Number(quantity),
      offeredPricePerUnit: Number(offeredPrice),
      initialMessage: message.trim(),
      opportunityId: opportunity?.id,
      opportunityTitle: opportunity?.title_en,
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E6DFD5] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-[#C85A32]">
              <Send className="w-4 h-4" />
            </span>
            <h2 className="font-serif font-bold text-base text-[#1F2421]">
              {opportunity ? 'Apply & Submit Market Enquiry' : 'Send Direct Procurement Enquiry'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-gray-500 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Item Pill */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8]">
            <img
              src={
                product?.imageUrl ||
                opportunity?.bannerImage ||
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80'
              }
              alt="Context"
              className="w-12 h-12 rounded-lg object-cover bg-white"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-gray-900 truncate">
                {product ? getLocalizedField(product, 'title') || product.title_en : opportunity?.title_en}
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                {opportunity
                  ? `Exhibition Organizer: ${opportunity.organizer}`
                  : `Master Artisan: ${artisan?.name || product?.artisanName || 'Meenakshi Devi'}`}
              </p>
            </div>
          </div>

          {/* Volume & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Target Quantity (Units)
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-300 bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Offered Unit Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  min={10}
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold text-[#C85A32] rounded-xl border border-gray-300 bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]/30"
                />
              </div>
            </div>
          </div>

          {/* Total Value Banner */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Estimated Procurement Value:</span>
            <span className="font-bold text-sm text-[#C85A32]">
              ₹{(quantity * offeredPrice).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Procurement Message & Requirements
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="State your required timeline, packaging, custom motifs, or delivery address..."
              className="w-full px-3.5 py-2.5 text-xs text-gray-800 rounded-xl border border-gray-300 bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]/30 leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white text-xs font-bold shadow-md shadow-[#C85A32]/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Enquiry Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
