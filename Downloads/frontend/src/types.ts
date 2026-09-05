export type SupportedLanguage = 'en' | 'ta' | 'hi';

export type UserRole = 'artisan' | 'buyer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  location: string;
  languagePreference: SupportedLanguage;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  name: string;
  craftTradition: string;
  craftTradition_ta?: string;
  craftTradition_hi?: string;
  clusterLocation: string;
  clusterLocation_ta?: string;
  clusterLocation_hi?: string;
  experienceYears: number;
  bio_en: string;
  bio_ta: string;
  bio_hi: string;
  avatarUrl: string;
  coverImageUrl?: string;
  giTagCertified: boolean;
  giCertificateNumber?: string;
  stateAwardee: boolean;
  nationalMeritHolder: boolean;
  community: string;
  totalProductsListed: number;
  completedOrders: number;
  rating: number;
  contactNumber: string;
  languagesSpoken: string[];
}

export interface BuyerProfile {
  id: string;
  userId: string;
  organizationName: string;
  buyerType: 'Retail Boutique' | 'Wholesale Exporter' | 'Sustainable Brand' | 'Corporate Gifting' | 'Art Gallery';
  location: string;
  website?: string;
  verifiedGST: boolean;
  procurementBudget: string;
}

export interface MultilingualField {
  en: string;
  ta: string;
  hi: string;
}

export interface Product {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanLocation: string;
  imageUrl: string;
  additionalImages?: string[];
  
  // Multilingual Core Fields
  title_en: string;
  title_ta: string;
  title_hi: string;
  
  description_en: string;
  description_ta: string;
  description_hi: string;
  
  category_en: string;
  category_ta: string;
  category_hi: string;
  
  subcategory_en: string;
  subcategory_ta: string;
  subcategory_hi: string;
  
  material_en: string;
  material_ta: string;
  material_hi: string;
  
  technique_en: string;
  technique_ta: string;
  technique_hi: string;
  
  style_en: string;
  style_ta: string;
  style_hi: string;
  
  colors: string[];
  
  potential_uses_en: string[];
  potential_uses_ta: string[];
  potential_uses_hi: string[];
  
  keywords: string[];
  
  tags_en: string[];
  tags_ta: string[];
  tags_hi: string[];
  
  // Commercial Specs
  pricePerUnit: number;
  currency: string;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  stockAvailable: number;
  isPublished: boolean;
  createdAt: string;
  confidenceScore: number;
}

export interface MarketOpportunity {
  id: string;
  title_en: string;
  title_ta: string;
  title_hi: string;
  organizer: string;
  location: string;
  type: 'Exhibition' | 'Craft Fair' | 'Wholesale Buyer' | 'Retail Buyer' | 'Sustainable Business' | 'Corporate Gifting' | 'Boutique Store';
  categoryRequired: string;
  materialRequired: string[];
  craftTechniquesAccepted: string[];
  targetLocationScope: string;
  expectedOrderVolume?: string;
  boothGrantSubsidized?: boolean;
  deadline: string;
  eventDates?: string;
  description_en: string;
  description_ta: string;
  description_hi: string;
  bannerImage: string;
}

export interface MatchFactor {
  label_en: string;
  label_ta: string;
  label_hi: string;
  matched: boolean;
  scoreContribution: number;
  detail_en: string;
  detail_ta: string;
  detail_hi: string;
}

export interface MarketRecommendation {
  opportunity: MarketOpportunity;
  matchScore: number;
  matchedFactors: MatchFactor[];
  productId: string;
  productTitle: string;
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  rawQuery: string;
  extractedProduct: string;
  extractedQuantity: string;
  extractedMaterial: string;
  extractedPurpose: string;
  extractedPreferences: string;
  searchKeywords: string[];
  createdAt: string;
}

export type EnquiryStatus = 'Sent' | 'Viewed' | 'Responded' | 'Negotiating' | 'Completed';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
}

export interface Enquiry {
  id: string;
  artisanId: string;
  artisanName: string;
  buyerId: string;
  buyerName: string;
  buyerOrg: string;
  productId: string;
  productTitle: string;
  productImage: string;
  targetQuantity: number;
  offeredPricePerUnit?: number;
  initialMessage: string;
  status: EnquiryStatus;
  opportunityId?: string;
  opportunityTitle?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}
