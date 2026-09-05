import React, { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage, Product } from '../types';
import { aiService, AiAnalysisResult } from '../services/aiService';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { productService } from '../services/productService';
import { sampleCraftImages, CraftSampleImage } from './SampleImages';
import {
  UploadCloud,
  Camera,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  Eye,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AddProductFlowProps {
  onProductPublished: (product: Product) => void;
  onCancel: () => void;
}

type Step = 'upload' | 'analyzing' | 'review';

export const AddProductFlow: React.FC<AddProductFlowProps> = ({
  onProductPublished,
  onCancel,
}) => {
  const { t, language: appLanguage } = useLanguage();

  const [step, setStep] = useState<Step>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [analyzingProgressText, setAnalyzingProgressText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Multilingual review tab
  const [activeReviewLang, setActiveReviewLang] = useState<SupportedLanguage>(appLanguage);

  // Form State initialized after AI Vision analysis
  const [formData, setFormData] = useState({
    title_en: '',
    title_ta: '',
    title_hi: '',

    category_en: '',
    category_ta: '',
    category_hi: '',

    subcategory_en: '',
    subcategory_ta: '',
    subcategory_hi: '',

    material_en: '',
    material_ta: '',
    material_hi: '',

    technique_en: '',
    technique_ta: '',
    technique_hi: '',

    style_en: '',
    style_ta: '',
    style_hi: '',

    colors: ['Terracotta Red', 'Vivid Green', 'Natural Ochre'],

    potential_uses_en: [] as string[],
    potential_uses_ta: [] as string[],
    potential_uses_hi: [] as string[],

    description_en: '',
    description_ta: '',
    description_hi: '',

    tags_en: [] as string[],
    tags_ta: [] as string[],
    tags_hi: [] as string[],

    confidenceScore: 96,

    // Commercial Terms
    pricePerUnit: 1450,
    minimumOrderQuantity: 15,
    leadTimeDays: 14,
    stockAvailable: 40,
  });

  const [newTagInput, setNewTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle image file selection
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Sample image quick pick
  const handleSelectSample = (sample: CraftSampleImage) => {
    setSelectedFile(null);
    setSelectedImage(sample.imageUrl);
    setUploadedImageUrl(sample.imageUrl);
    setUserNotes(sample.presetNotes);
  };

  // Trigger AI Vision Scan
  const handleStartAnalysis = async () => {
    if (!selectedImage) return;

    setStep('analyzing');
    setAnalyzingProgressText(t.addProduct.stepProgress1);

    const timer1 = setTimeout(() => {
      setAnalyzingProgressText(t.addProduct.stepProgress2);
    }, 900);

    const timer2 = setTimeout(() => {
      setAnalyzingProgressText(t.addProduct.stepProgress3);
    }, 1800);

    try {
      // Step 1: Upload image to Supabase Storage if a File was selected
      if (selectedFile) {
        const currentUser = authService.getCurrentUser();
        const uploadResult = await storageService.uploadProductImage(
          selectedFile,
          currentUser?.id || 'artisan',
          selectedFile.name
        );
        if (uploadResult.url) {
          setUploadedImageUrl(uploadResult.url);
        }
      }

      // Step 2: Run existing Gemini vision analysis
      const result: AiAnalysisResult = await aiService.analyzeProductImage(
        selectedImage,
        'image/jpeg',
        userNotes
      );

      clearTimeout(timer1);
      clearTimeout(timer2);

      // Populate form state with AI-generated multilingual fields
      setFormData((prev) => ({
        ...prev,
        title_en: result.title_en || 'Handcrafted Traditional Craft Masterpiece',
        title_ta: result.title_ta || 'பாரம்பரிய கைவினை கலைப்படைப்பு',
        title_hi: result.title_hi || 'हस्तनिर्मित पारंपरिक उत्कृष्ट शिल्प',

        category_en: result.category_en || 'Handmade Crafts',
        category_ta: result.category_ta || 'கைவினைப் பொருட்கள்',
        category_hi: result.category_hi || 'हस्तनिर्मित शिल्प',

        subcategory_en: result.subcategory_en || 'Artisan Decor & Accessories',
        subcategory_ta: result.subcategory_ta || 'கைவினை அலங்காரம்',
        subcategory_hi: result.subcategory_hi || 'शिल्प सजावट एवं सहायक सामग्री',

        material_en: result.material_en || 'Eco-friendly natural clay and fiber',
        material_ta: result.material_ta || 'இயற்கை களிமண் மற்றும் நார்',
        material_hi: result.material_hi || 'पर्यावरण-अनुकूल प्राकृतिक मिट्टी और रेशा',

        technique_en: result.technique_en || 'Hand-moulded and hand-painted',
        technique_ta: result.technique_ta || 'கைகளால் வார்க்கப்பட்டு வர்ணம் தீட்டப்பட்டது',
        technique_hi: result.technique_hi || 'हाथ से गढ़ा हुआ और चित्रित कार्य',

        style_en: result.style_en || 'Traditional Folk Art',
        style_ta: result.style_ta || 'பாரம்பரிய நாட்டுப்புற கலை',
        style_hi: result.style_hi || 'पारंपरिक लोक कला',

        colors: result.colors || ['Terracotta Red', 'Green', 'Yellow'],

        potential_uses_en: result.potential_uses_en || ['Festive Gift', 'Ethnic Accessory', 'Retail Store Item'],
        potential_uses_ta: result.potential_uses_ta || ['பண்டிகை பரிசு', 'பாரம்பரிய அலங்காரம்'],
        potential_uses_hi: result.potential_uses_hi || ['त्योहारी उपहार', 'पारंपरिक परिधान सहायक'],

        description_en: result.description_en || '',
        description_ta: result.description_ta || '',
        description_hi: result.description_hi || '',

        tags_en: result.tags_en || ['Handmade', 'Artisan', 'GI Tag', 'Traditional'],
        tags_ta: result.tags_ta || ['கைவினை', 'பாரம்பரியம்', 'சுற்றுச்சூழல் நட்பு'],
        tags_hi: result.tags_hi || ['हस्तनिर्मित', 'पारंपरिक', 'पर्यावरण-अनुकूल'],

        confidenceScore: result.confidence_score || 96,
      }));

      setStep('review');
    } catch (err) {
      console.error('Analysis error:', err);
      setStep('review');
    }
  };

  // Add tag handler
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const langKey = `tags_${activeReviewLang}` as 'tags_en' | 'tags_ta' | 'tags_hi';
    setFormData((prev) => ({
      ...prev,
      [langKey]: [...prev[langKey], newTagInput.trim()],
    }));
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const langKey = `tags_${activeReviewLang}` as 'tags_en' | 'tags_ta' | 'tags_hi';
    setFormData((prev) => ({
      ...prev,
      [langKey]: prev[langKey].filter((t) => t !== tagToRemove),
    }));
  };

  // Publish Craft to Supabase
  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    const currentUser = authService.getCurrentUser();
    const finalImageUrl = uploadedImageUrl || selectedImage || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80';

    const productPayload: Omit<Product, 'id' | 'createdAt'> = {
      artisanId: currentUser?.id || 'artisan-1',
      artisanName: currentUser?.name || 'Master Artisan',
      artisanLocation: currentUser?.location || 'Traditional Craft Cluster, Tamil Nadu',
      imageUrl: finalImageUrl,
      
      title_en: formData.title_en,
      title_ta: formData.title_ta,
      title_hi: formData.title_hi,

      description_en: formData.description_en,
      description_ta: formData.description_ta,
      description_hi: formData.description_hi,

      category_en: formData.category_en,
      category_ta: formData.category_ta,
      category_hi: formData.category_hi,

      subcategory_en: formData.subcategory_en,
      subcategory_ta: formData.subcategory_ta,
      subcategory_hi: formData.subcategory_hi,

      material_en: formData.material_en,
      material_ta: formData.material_ta,
      material_hi: formData.material_hi,

      technique_en: formData.technique_en,
      technique_ta: formData.technique_ta,
      technique_hi: formData.technique_hi,

      style_en: formData.style_en,
      style_ta: formData.style_ta,
      style_hi: formData.style_hi,

      colors: formData.colors,

      potential_uses_en: formData.potential_uses_en,
      potential_uses_ta: formData.potential_uses_ta,
      potential_uses_hi: formData.potential_uses_hi,

      keywords: [...formData.tags_en, formData.category_en, formData.material_en],

      tags_en: formData.tags_en,
      tags_ta: formData.tags_ta,
      tags_hi: formData.tags_hi,

      pricePerUnit: Number(formData.pricePerUnit),
      currency: 'INR',
      minimumOrderQuantity: Number(formData.minimumOrderQuantity),
      leadTimeDays: Number(formData.leadTimeDays),
      stockAvailable: Number(formData.stockAvailable),
      isPublished: true,
      confidenceScore: formData.confidenceScore,
    };

    try {
      const savedProduct = await productService.addProductAsync(productPayload, currentUser?.id || 'artisan-1');
      setIsPublishing(false);
      onProductPublished(savedProduct);
    } catch (err: any) {
      console.error('Failed to publish craft:', err);
      setPublishError(err?.message || 'Failed to save product to database.');
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header & Steps Breadcrumb */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1F2421]">
              {t.nav.addProduct}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              KalaSetu AI Vision Auto-Cataloging & Market Linkage
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            {t.common.cancel}
          </button>
        </div>

        {/* 4-Step Indicator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-medium">
          <div
            className={`p-2.5 rounded-xl flex items-center gap-2 border ${
              step === 'upload'
                ? 'bg-amber-50 border-[#C85A32] text-[#C85A32] font-semibold'
                : selectedImage
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white shadow-xs">
              1
            </span>
            <span className="truncate">Photo Upload</span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex items-center gap-2 border ${
              step === 'analyzing'
                ? 'bg-amber-50 border-[#C85A32] text-[#C85A32] font-semibold animate-pulse'
                : step === 'review'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white shadow-xs">
              2
            </span>
            <span className="truncate">AI Vision</span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex items-center gap-2 border ${
              step === 'review'
                ? 'bg-amber-50 border-[#C85A32] text-[#C85A32] font-semibold'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white shadow-xs">
              3
            </span>
            <span className="truncate">Multilingual Review</span>
          </div>

          <div
            className={`p-2.5 rounded-xl flex items-center gap-2 border ${
              step === 'review'
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white shadow-xs">
              4
            </span>
            <span className="truncate">Publish & Match</span>
          </div>
        </div>
      </div>

      {/* STEP 1: Upload View */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6DFD5] shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1F2421]">
                {t.addProduct.step1Title}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {t.addProduct.step1Subtitle}
              </p>
            </div>

            {/* Drag and drop zone */}
            {!selectedImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center ${
                  isDragOver
                    ? 'border-[#C85A32] bg-amber-50/70 scale-101'
                    : 'border-[#D9CFBF] bg-[#FAF7F2] hover:border-[#C85A32]/60'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-100/80 text-[#C85A32] flex items-center justify-center mb-4 shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  {t.addProduct.dragDropText}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t.addProduct.supportedFormats}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B84A22] text-white font-semibold text-xs transition shadow-xs cursor-pointer"
                  >
                    Select Photo from Device
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#D9CFBF] hover:bg-stone-50 text-gray-700 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#C85A32]" />
                    <span>{t.addProduct.cameraCapture}</span>
                  </button>

                  {/* Hidden inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              /* Selected Image Preview */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-amber-200 bg-black/5 max-h-96 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Craft to analyze"
                    className="w-full max-h-96 object-contain rounded-xl"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/80 text-white text-xs font-semibold flex items-center gap-1 backdrop-blur-xs transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t.addProduct.replacePhoto}</span>
                    </button>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Artisan Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {t.addProduct.userNotesLabel}
                  </label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder={t.addProduct.userNotesPlaceholder}
                    rows={2}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9CFBF] bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#C85A32]/30 transition"
                  />
                </div>

                {/* Scan Button */}
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C85A32] to-[#B84A22] hover:from-[#B84A22] hover:to-[#9F3918] text-white font-bold text-sm shadow-md shadow-[#C85A32]/30 flex items-center justify-center gap-2.5 transition transform active:scale-99 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-200 animate-spin" />
                  <span>{t.addProduct.startAiScan}</span>
                </button>
              </div>
            )}

            {/* Quick Sample Selector for immediate one-click testing */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quick Test: Pick from Authentic Craft Samples
                </span>
                <span className="text-[11px] text-[#C85A32] font-semibold">1-Click Auto Scan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sampleCraftImages.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="group text-left p-2 rounded-xl border border-gray-200 hover:border-[#C85A32] hover:bg-amber-50/40 transition cursor-pointer"
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      className="w-full h-24 object-cover rounded-lg bg-stone-100 group-hover:scale-102 transition-transform"
                    />
                    <div className="mt-2">
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{sample.name}</p>
                      <p className="text-[10px] text-gray-500">{sample.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Analyzing Loading State */}
      {step === 'analyzing' && (
        <div className="bg-white rounded-2xl p-10 sm:p-14 border border-[#E6DFD5] text-center space-y-6 shadow-sm">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-full h-full rounded-full border-4 border-amber-200 border-t-[#C85A32] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-[#C85A32]">
              <Sparkles className="w-10 h-10 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-serif font-bold text-[#1F2421]">
              {t.addProduct.scanningTitle}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t.addProduct.scanningSub}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#C85A32]">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{analyzingProgressText}</span>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: Multilingual Review and Commercial Setup */}
      {step === 'review' && (
        <div className="space-y-6">
          {/* AI Vision Badge Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-emerald-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {t.addProduct.aiConfidence}: {formData.confidenceScore}% Authenticity Match
                </h4>
                <p className="text-xs text-emerald-700">
                  Traditional technique, raw materials, and motifs successfully identified across 3 languages.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold bg-white px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-800">
                Gemini Vision Multilingual Engine
              </span>
            </div>
          </div>

          {/* Multilingual Tabs Header */}
          <div className="bg-white rounded-2xl border border-[#E6DFD5] shadow-xs overflow-hidden">
            <div className="bg-[#FAF7F2] p-4 sm:p-5 border-b border-[#E6DFD5] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1F2421]">
                  {t.review.tabsHeader}
                </h3>
                <p className="text-xs text-gray-500">
                  Switch tabs to preview and edit the AI-generated descriptions in each supported language.
                </p>
              </div>

              {/* Language Switch Tabs (English | தமிழ் | हिन्दी) */}
              <div className="flex items-center p-1 rounded-xl bg-[#EBE4D8] border border-[#DDD4C5]">
                {(['en', 'ta', 'hi'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveReviewLang(lang)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeReviewLang === lang
                        ? 'bg-[#C85A32] text-white shadow-xs'
                        : 'text-gray-700 hover:text-[#1F2421] hover:bg-black/5'
                    }`}
                  >
                    {lang === 'en' ? t.review.tabEn : lang === 'ta' ? t.review.tabTa : t.review.tabHi}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Multilingual Form */}
            <div className="p-6 space-y-5">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t.review.titleLabel} ({activeReviewLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={
                    activeReviewLang === 'en'
                      ? formData.title_en
                      : activeReviewLang === 'ta'
                      ? formData.title_ta
                      : formData.title_hi
                  }
                  onChange={(e) => {
                    const key = `title_${activeReviewLang}` as 'title_en' | 'title_ta' | 'title_hi';
                    setFormData({ ...formData, [key]: e.target.value });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900 bg-[#FAF7F2] focus:bg-white focus:ring-2 focus:ring-[#C85A32]/30 focus:outline-hidden"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.review.categoryLabel}
                  </label>
                  <input
                    type="text"
                    value={
                      activeReviewLang === 'en'
                        ? formData.category_en
                        : activeReviewLang === 'ta'
                        ? formData.category_ta
                        : formData.category_hi
                    }
                    onChange={(e) => {
                      const key = `category_${activeReviewLang}` as 'category_en' | 'category_ta' | 'category_hi';
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.review.subcategoryLabel}
                  </label>
                  <input
                    type="text"
                    value={
                      activeReviewLang === 'en'
                        ? formData.subcategory_en
                        : activeReviewLang === 'ta'
                        ? formData.subcategory_ta
                        : formData.subcategory_hi
                    }
                    onChange={(e) => {
                      const key = `subcategory_${activeReviewLang}` as 'subcategory_en' | 'subcategory_ta' | 'subcategory_hi';
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Raw Material & Craft Technique */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.review.materialLabel}
                  </label>
                  <input
                    type="text"
                    value={
                      activeReviewLang === 'en'
                        ? formData.material_en
                        : activeReviewLang === 'ta'
                        ? formData.material_ta
                        : formData.material_hi
                    }
                    onChange={(e) => {
                      const key = `material_${activeReviewLang}` as 'material_en' | 'material_ta' | 'material_hi';
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.review.techniqueLabel}
                  </label>
                  <input
                    type="text"
                    value={
                      activeReviewLang === 'en'
                        ? formData.technique_en
                        : activeReviewLang === 'ta'
                        ? formData.technique_ta
                        : formData.technique_hi
                    }
                    onChange={(e) => {
                      const key = `technique_${activeReviewLang}` as 'technique_en' | 'technique_ta' | 'technique_hi';
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Aesthetic Style & Color Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.review.styleLabel}
                  </label>
                  <input
                    type="text"
                    value={
                      activeReviewLang === 'en'
                        ? formData.style_en
                        : activeReviewLang === 'ta'
                        ? formData.style_ta
                        : formData.style_hi
                    }
                    onChange={(e) => {
                      const key = `style_${activeReviewLang}` as 'style_en' | 'style_ta' | 'style_hi';
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-800 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t.review.colorsLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.colors.map((color, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t.review.descriptionLabel} ({activeReviewLang.toUpperCase()})
                </label>
                <textarea
                  rows={3}
                  value={
                    activeReviewLang === 'en'
                      ? formData.description_en
                      : activeReviewLang === 'ta'
                      ? formData.description_ta
                      : formData.description_hi
                  }
                  onChange={(e) => {
                    const key = `description_${activeReviewLang}` as 'description_en' | 'description_ta' | 'description_hi';
                    setFormData({ ...formData, [key]: e.target.value });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs leading-relaxed text-gray-800 bg-[#FAF7F2] focus:bg-white focus:ring-2 focus:ring-[#C85A32]/30 focus:outline-hidden"
                />
              </div>

              {/* Suggested Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {t.review.tagsLabel} ({activeReviewLang.toUpperCase()})
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(activeReviewLang === 'en'
                    ? formData.tags_en
                    : activeReviewLang === 'ta'
                    ? formData.tags_ta
                    : formData.tags_hi
                  ).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-gray-800 border border-gray-200"
                    >
                      <Tag className="w-3 h-3 text-[#C85A32]" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add tag..."
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-[#FAF7F2] focus:bg-white flex-1 focus:outline-hidden"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-black text-white text-xs font-semibold cursor-pointer"
                  >
                    {t.review.addTag}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Commercial & Supply Details */}
          <div className="bg-white rounded-2xl p-6 border border-[#E6DFD5] shadow-xs space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1F2421]">
                {t.addProduct.step4Title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t.addProduct.step4Subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {t.review.pricePerUnit}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {t.review.minimumOrderQuantity}
                </label>
                <input
                  type="number"
                  value={formData.minimumOrderQuantity}
                  onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {t.review.leadTimeDays}
                </label>
                <input
                  type="number"
                  value={formData.leadTimeDays}
                  onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {t.review.stockAvailable}
                </label>
                <input
                  type="number"
                  value={formData.stockAvailable}
                  onChange={(e) => setFormData({ ...formData, stockAvailable: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-[#FAF7F2] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Publish Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
              >
                ← Back to Upload
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-800 text-xs font-medium cursor-pointer"
                >
                  {t.review.saveDraft}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C85A32] to-[#B84A22] hover:from-[#B84A22] hover:to-[#9F3918] text-white font-bold text-xs shadow-md shadow-[#C85A32]/30 flex items-center gap-2 transition transform active:scale-98 cursor-pointer disabled:opacity-60"
                >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                  )}
                  <span>{isPublishing ? 'Saving Craft...' : t.review.publishButton}</span>
                </button>
              </div>
            </div>

            {publishError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{publishError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
