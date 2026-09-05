import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { UserRole, Product, MarketOpportunity, ArtisanProfile, Enquiry } from './types';
import { authService } from './services/authService';
import { productService } from './services/productService';
import { marketService } from './services/marketService';
import { enquiryService } from './services/enquiryService';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AddProductFlow } from './components/AddProductFlow';
import { CatalogView } from './components/CatalogView';
import { MarketsView } from './components/MarketsView';
import { BuyerView } from './components/BuyerView';
import { EnquiriesView } from './components/EnquiriesView';

import { ProductDetailsModal } from './components/ProductDetailsModal';
import { ArtisanProfileModal } from './components/ArtisanProfileModal';
import { SendEnquiryModal } from './components/SendEnquiryModal';
import { LoginView } from './components/LoginView';

import {
  Sparkles,
  Heart,
  Globe,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';

function MainApp() {
  const { t, language, setLanguage } = useLanguage();

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => authService.isLoggedIn());

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>(() => authService.getCurrentUser().role);
  const [currentView, setCurrentView] = useState<string>(() => 
    authService.getCurrentUser().role === 'buyer' ? 'buyerSearch' : 'dashboard'
  );

  // Core Data State
  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [productFetchError, setProductFetchError] = useState<string | null>(null);

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() =>
    enquiryService.getEnquiries(currentRole, authService.getCurrentUser().id)
  );

  // Active Artisan / User
  const currentUser = authService.getCurrentUser();
  const currentArtisan = authService.getArtisanProfile();

  // Load products from Supabase
  const loadSupabaseProducts = async () => {
    setIsLoadingProducts(true);
    setProductFetchError(null);
    try {
      const user = authService.getCurrentUser();
      const artisanFilter = user.role === 'artisan' ? user.id : undefined;
      const prods = await productService.fetchProducts(artisanFilter);
      setProducts(prods);
    } catch (err: any) {
      console.error('Failed to load products from database:', err);
      setProductFetchError('Unable to load latest products from database.');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Auth session listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentRole(user.role);
        loadSupabaseProducts();
      } else {
        setIsLoggedIn(false);
      }
    });
    return unsubscribe;
  }, []);

  // Initial products fetch on mount / login
  useEffect(() => {
    if (isLoggedIn) {
      loadSupabaseProducts();
    }
  }, [isLoggedIn, currentRole]);

  // Recommendations calculated dynamically
  const recommendations = marketService.getRecommendationsForAll(products);

  // Modal States
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedArtisanProfile, setSelectedArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [selectedProductForMatch, setSelectedProductForMatch] = useState<Product | undefined>(undefined);
  const [activeEnquiryIdForChat, setActiveEnquiryIdForChat] = useState<string | undefined>(undefined);

  const [enquiryModal, setEnquiryModal] = useState<{
    isOpen: boolean;
    product?: Product;
    opportunity?: MarketOpportunity;
    artisan?: ArtisanProfile;
  }>({
    isOpen: false,
  });

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync role change
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const updatedUser = authService.switchRole(role);
    setEnquiries(enquiryService.getEnquiries(role, updatedUser.id));
  };

  const reloadData = () => {
    setProducts(productService.getProducts());
    setEnquiries(enquiryService.getEnquiries(currentRole, authService.getCurrentUser().id));
  };

  // When a product is newly published through the Add Product flow
  const handleProductPublished = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
    reloadData();
    loadSupabaseProducts();
    setSelectedProductForMatch(newProduct);
    showToast(
      language === 'ta'
        ? `"${newProduct.title_ta}" வெற்றிகரமாக வெளியிடப்பட்டது! 5 சந்தை வாய்ப்புகள் இணைக்கப்பட்டுள்ளன.`
        : language === 'hi'
        ? `"${newProduct.title_hi}" सफलतापूर्वक प्रकाशित! 5 बाज़ार अवसर जोड़े गए।`
        : `"${newProduct.title_en}" successfully published! 5 market opportunities matched.`
    );
    // Transition straight to Recommended Markets to complete the flow
    setCurrentView('markets');
  };

  // Handlers for Opening Modals and Navigation
  const handleOpenProductDetails = (product: Product) => {
    setSelectedProductDetails(product);
  };

  const handleOpenArtisanProfile = (artisan: ArtisanProfile) => {
    setSelectedArtisanProfile(artisan);
  };

  const handleViewProductMarkets = (product: Product) => {
    setSelectedProductForMatch(product);
    setCurrentView('markets');
  };

  const handleOpenSendEnquiry = (
    product?: Product,
    opportunity?: MarketOpportunity,
    artisan?: ArtisanProfile
  ) => {
    setEnquiryModal({
      isOpen: true,
      product,
      opportunity,
      artisan: artisan || (product ? authService.getArtisanProfile(product.artisanId) : undefined),
    });
  };

  const handleEnquiryCreatedSuccess = () => {
    setEnquiryModal({ isOpen: false });
    reloadData();
    showToast(
      language === 'ta'
        ? 'நேரடி கொள்முதல் விசாரணை வெற்றிகரமாக அனுப்பப்பட்டது!'
        : language === 'hi'
        ? 'प्रत्यक्ष खरीद पूछताछ सफलतापूर्वक भेजी गई!'
        : 'Direct procurement enquiry sent successfully!'
    );
    setCurrentView('enquiries');
  };

  const handleLoginSuccess = (role: UserRole) => {
    setIsLoggedIn(true);
    setCurrentRole(role);
    setCurrentView(role === 'buyer' ? 'buyerSearch' : 'dashboard');
    reloadData();
    loadSupabaseProducts();
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2421] flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-700 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold leading-relaxed flex-1">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        openEnquiryCount={enquiries.filter((e) => e.status !== 'Completed').length}
        marketMatchCount={recommendations.length}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Artisan Dashboard */}
        {currentView === 'dashboard' && (
          <DashboardView
            artisan={currentArtisan}
            products={products}
            recommendations={recommendations}
            enquiries={enquiries}
            isLoadingProducts={isLoadingProducts}
            productFetchError={productFetchError}
            onRetryFetchProducts={loadSupabaseProducts}
            onAddProductClick={() => setCurrentView('addProduct')}
            onViewMarketsClick={() => {
              setSelectedProductForMatch(undefined);
              setCurrentView('markets');
            }}
            onViewCatalogClick={() => setCurrentView('catalog')}
            onViewEnquiryClick={(enqId) => {
              setActiveEnquiryIdForChat(enqId);
              setCurrentView('enquiries');
            }}
            onSelectProductDetails={handleOpenProductDetails}
          />
        )}

        {/* Add Product Flow with AI Scan */}
        {currentView === 'addProduct' && (
          <AddProductFlow
            onProductPublished={handleProductPublished}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {/* Product Catalog */}
        {currentView === 'catalog' && (
          <CatalogView
            products={products}
            currentRole={currentRole}
            onSelectProduct={handleOpenProductDetails}
            onViewProductMarkets={handleViewProductMarkets}
            onAddProductClick={() => setCurrentView('addProduct')}
            onSendEnquiry={(prod) => handleOpenSendEnquiry(prod)}
          />
        )}

        {/* Recommended Markets */}
        {currentView === 'markets' && (
          <MarketsView
            products={products}
            selectedProductForMatch={selectedProductForMatch}
            onSendOpportunityEnquiry={(opp, prod) => handleOpenSendEnquiry(prod, opp)}
          />
        )}

        {/* Buyer Natural Language Search */}
        {currentView === 'buyerSearch' && (
          <BuyerView
            onSelectProduct={handleOpenProductDetails}
            onSelectArtisan={handleOpenArtisanProfile}
            onSendEnquiry={(prod, art) => handleOpenSendEnquiry(prod, undefined, art)}
          />
        )}

        {/* Direct Linkage Enquiries & Chat */}
        {currentView === 'enquiries' && (
          <EnquiriesView
            enquiries={enquiries}
            currentRole={currentRole}
            currentUserId={currentUser.id}
            currentUserName={currentUser.name}
            selectedEnquiryId={activeEnquiryIdForChat}
            onEnquiriesUpdated={reloadData}
          />
        )}
      </main>

      {/* Global Modals */}
      {selectedProductDetails && (
        <ProductDetailsModal
          product={selectedProductDetails}
          artisan={authService.getArtisanProfile(selectedProductDetails.artisanId)}
          currentRole={currentRole}
          onClose={() => setSelectedProductDetails(null)}
          onViewArtisan={handleOpenArtisanProfile}
          onSendEnquiry={(prod) => handleOpenSendEnquiry(prod)}
        />
      )}

      {selectedArtisanProfile && (
        <ArtisanProfileModal
          artisan={selectedArtisanProfile}
          products={products}
          onClose={() => setSelectedArtisanProfile(null)}
          onSelectProduct={handleOpenProductDetails}
          onSendEnquiry={(prod) => handleOpenSendEnquiry(prod, undefined, selectedArtisanProfile)}
        />
      )}

      {enquiryModal.isOpen && (
        <SendEnquiryModal
          product={enquiryModal.product}
          opportunity={enquiryModal.opportunity}
          artisan={enquiryModal.artisan}
          currentRole={currentRole}
          onClose={() => setEnquiryModal({ isOpen: false })}
          onSuccess={handleEnquiryCreatedSuccess}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E6DFD5] bg-[#FAF7F2] py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#C85A32] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-sm text-[#1F2421]">KalaSetu</span>
              <span className="text-gray-400 ml-2">| கலாசேது | कलासेतु</span>
              <p className="text-[11px] text-gray-400">
                AI Market Linkage for Traditional & Marginalized Indian Artisans
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GI Tag Certified Crafts</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Direct Artisan Prosperity</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
