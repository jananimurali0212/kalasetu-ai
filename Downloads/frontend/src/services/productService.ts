import { Product } from '../types';
import { initialProducts } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PRODUCTS_STORAGE_KEY = 'kalasetu_products';

class ProductService {
  private products: Product[];

  constructor() {
    this.products = this.loadProducts();
  }

  private loadProducts(): Product[] {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load products from local storage');
    }
    return [...initialProducts];
  }

  private saveProducts(): void {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(this.products));
    } catch (e) {
      console.warn('Failed to save products to local storage');
    }
  }

  /**
   * Helper to map a Supabase products table row into the application Product model.
   */
  private mapRowToProduct(row: any): Product {
    const ml = row.multilingual_data || {};

    return {
      id: row.id,
      artisanId: row.artisan_id,
      artisanName: ml.artisanName || 'Traditional Artisan',
      artisanLocation: ml.artisanLocation || 'Madurai, Tamil Nadu',
      imageUrl: row.image_url,
      additionalImages: ml.additionalImages || [],

      // Multilingual titles
      title_en: ml.title_en || row.product_name,
      title_ta: ml.title_ta || row.product_name,
      title_hi: ml.title_hi || row.product_name,

      // Descriptions
      description_en: ml.description_en || row.description || '',
      description_ta: ml.description_ta || row.description || '',
      description_hi: ml.description_hi || row.description || '',

      // Categories
      category_en: ml.category_en || row.category || 'Handmade Crafts',
      category_ta: ml.category_ta || row.category || 'கைவினைப் பொருட்கள்',
      category_hi: ml.category_hi || row.category || 'हस्तनिर्मित शिल्प',

      subcategory_en: ml.subcategory_en || 'Artisan Craft',
      subcategory_ta: ml.subcategory_ta || 'கைவினை',
      subcategory_hi: ml.subcategory_hi || 'शिल्प',

      // Materials
      material_en: ml.material_en || row.material || 'Natural Crafts',
      material_ta: ml.material_ta || row.material || 'இயற்கை கைவினை',
      material_hi: ml.material_hi || row.material || 'प्राकृतिक शिल्प',

      // Techniques
      technique_en: ml.technique_en || row.craft_technique || 'Handmade',
      technique_ta: ml.technique_ta || row.craft_technique || 'கைவினை',
      technique_hi: ml.technique_hi || row.craft_technique || 'हस्तनिर्मित',

      // Style
      style_en: ml.style_en || row.style || 'Traditional Folk Art',
      style_ta: ml.style_ta || row.style || 'பாரம்பரிய கலை',
      style_hi: ml.style_hi || row.style || 'पारंपरिक कला',

      colors: ml.colors || ['Terracotta', 'Natural Ochre'],

      // Potential uses
      potential_uses_en: ml.potential_uses_en || row.potential_uses || [],
      potential_uses_ta: ml.potential_uses_ta || row.potential_uses || [],
      potential_uses_hi: ml.potential_uses_hi || row.potential_uses || [],

      keywords: ml.keywords || row.tags || ['artisan', 'handmade'],

      // Tags
      tags_en: ml.tags_en || row.tags || ['Handmade', 'Traditional'],
      tags_ta: ml.tags_ta || row.tags || ['கைவினை', 'பாரம்பரியம்'],
      tags_hi: ml.tags_hi || row.tags || ['हस्तनिर्मित', 'पारंपरिक'],

      // Commercial Specs
      pricePerUnit: Number(row.price_per_unit) || 1200,
      currency: row.currency || 'INR',
      minimumOrderQuantity: Number(row.minimum_order_quantity) || 1,
      leadTimeDays: Number(row.lead_time_days) || 7,
      stockAvailable: Number(row.stock_available) || 10,
      isPublished: row.is_published ?? true,
      createdAt: row.created_at || new Date().toISOString(),
      confidenceScore: ml.confidenceScore || 96,
    };
  }

  /**
   * Fetch products from Supabase PostgreSQL table.
   * If artisanId is provided, filters for that artisan.
   * Falls back to memory/local storage if Supabase is unconfigured.
   */
  public async fetchProducts(artisanId?: string): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      return this.getProducts(artisanId);
    }

    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (artisanId) {
        query = query.eq('artisan_id', artisanId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase fetch products notice:', error.message);
        return this.getProducts(artisanId);
      }

      if (data) {
        const fetchedProducts = data.map((row) => this.mapRowToProduct(row));
        // If we retrieved products from Supabase, update our cache
        if (fetchedProducts.length > 0) {
          if (!artisanId) {
            this.products = fetchedProducts;
            this.saveProducts();
          } else {
            // Merge with existing
            const others = this.products.filter((p) => p.artisanId !== artisanId);
            this.products = [...fetchedProducts, ...others];
            this.saveProducts();
          }
          return fetchedProducts;
        } else if (artisanId) {
          // If this artisan legitimately has 0 products in Supabase, return empty array
          return [];
        }
      }
    } catch (err) {
      console.warn('Error connecting to Supabase products table:', err);
    }

    return this.getProducts(artisanId);
  }

  /**
   * Synchronous getter for current memory cache
   */
  public getProducts(artisanId?: string): Product[] {
    if (artisanId) {
      return this.products.filter((p) => p.artisanId === artisanId);
    }
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  /**
   * Insert product into Supabase PostgreSQL and cache locally
   */
  public async addProductAsync(
    productData: Omit<Product, 'id' | 'createdAt'>,
    artisanId: string
  ): Promise<Product> {
    const defaultId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const localProduct: Product = {
      ...productData,
      id: defaultId,
      artisanId,
      createdAt: nowIso,
    };

    if (isSupabaseConfigured()) {
      try {
        const payload = {
          artisan_id: artisanId,
          image_url: productData.imageUrl,
          product_name: productData.title_en || 'Handcrafted Craft',
          description: productData.description_en || '',
          category: productData.category_en || 'Handmade Crafts',
          material: productData.material_en || '',
          craft_technique: productData.technique_en || '',
          style: productData.style_en || '',
          tags: productData.tags_en || [],
          potential_uses: productData.potential_uses_en || [],
          language: 'en',
          price_per_unit: productData.pricePerUnit || 0,
          currency: productData.currency || 'INR',
          minimum_order_quantity: productData.minimumOrderQuantity || 1,
          lead_time_days: productData.leadTimeDays || 7,
          stock_available: productData.stockAvailable || 10,
          is_published: productData.isPublished ?? true,
          multilingual_data: {
            title_en: productData.title_en,
            title_ta: productData.title_ta,
            title_hi: productData.title_hi,
            description_en: productData.description_en,
            description_ta: productData.description_ta,
            description_hi: productData.description_hi,
            category_en: productData.category_en,
            category_ta: productData.category_ta,
            category_hi: productData.category_hi,
            subcategory_en: productData.subcategory_en,
            subcategory_ta: productData.subcategory_ta,
            subcategory_hi: productData.subcategory_hi,
            material_en: productData.material_en,
            material_ta: productData.material_ta,
            material_hi: productData.material_hi,
            technique_en: productData.technique_en,
            technique_ta: productData.technique_ta,
            technique_hi: productData.technique_hi,
            style_en: productData.style_en,
            style_ta: productData.style_ta,
            style_hi: productData.style_hi,
            tags_en: productData.tags_en,
            tags_ta: productData.tags_ta,
            tags_hi: productData.tags_hi,
            potential_uses_en: productData.potential_uses_en,
            potential_uses_ta: productData.potential_uses_ta,
            potential_uses_hi: productData.potential_uses_hi,
            colors: productData.colors,
            confidenceScore: productData.confidenceScore,
            artisanName: productData.artisanName,
            artisanLocation: productData.artisanLocation,
          },
        };

        const { data, error } = await supabase
          .from('products')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('Failed to insert product into Supabase:', error.message);
        } else if (data) {
          const savedProduct = this.mapRowToProduct(data);
          this.products.unshift(savedProduct);
          this.saveProducts();
          return savedProduct;
        }
      } catch (err) {
        console.error('Error inserting product to Supabase:', err);
      }
    }

    // Fallback or offline save
    this.products.unshift(localProduct);
    this.saveProducts();
    return localProduct;
  }

  /**
   * Synchronous addProduct for backward compatibility
   */
  public addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    this.products.unshift(newProduct);
    this.saveProducts();

    // Trigger async sync if Supabase is active
    if (isSupabaseConfigured() && productData.artisanId) {
      this.addProductAsync(productData, productData.artisanId).catch((e) =>
        console.warn('Async product sync background error:', e)
      );
    }

    return newProduct;
  }

  public async deleteProductAsync(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Supabase delete product error:', error.message);
        }
      } catch (e) {
        console.error('Delete product error:', e);
      }
    }
    return this.deleteProduct(id);
  }

  public deleteProduct(id: string): boolean {
    const beforeCount = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length !== beforeCount) {
      this.saveProducts();
      return true;
    }
    return false;
  }
}

export const productService = new ProductService();
