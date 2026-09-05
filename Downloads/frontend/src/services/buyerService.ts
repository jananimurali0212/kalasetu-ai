import { BuyerRequirement, Product, ArtisanProfile } from '../types';
import { productService } from './productService';
import { authService } from './authService';

export interface BuyerSearchResult {
  product: Product;
  artisan: ArtisanProfile;
  relevanceScore: number;
  matchReasons: string[];
}

class BuyerService {
  /**
   * Parse natural language procurement query via server API or local intelligent fallback
   */
  public async parseRequirement(query: string): Promise<BuyerRequirement> {
    try {
      const response = await fetch('/api/parse-buyer-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const d = result.data;
          return {
            id: `req-${Date.now()}`,
            buyerId: authService.getCurrentUser().id,
            rawQuery: query,
            extractedProduct: d.product || 'Artisan Craft Product',
            extractedQuantity: d.quantity || '50 - 100 units',
            extractedMaterial: d.material || 'Traditional Natural Material',
            extractedPurpose: d.purpose || 'Retail & Commercial Gifting',
            extractedPreferences: d.preferences || 'Handmade, eco-friendly, artisan-direct',
            searchKeywords: Array.isArray(d.searchKeywords) ? d.searchKeywords : ['artisan', 'handmade'],
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      console.warn('Server parse failed, utilizing client-side extractor:', err);
    }

    // Client-side intelligent NLP fallback
    const qLower = query.toLowerCase();
    const qtyMatch = query.match(/(\d+[\s\w]*(?:pieces|pcs|units|sets|baskets|items)?)/i);
    const quantity = qtyMatch ? qtyMatch[1].trim() : '50 - 100 units';

    let product = 'Artisan Craft Products';
    let material = 'Traditional Natural Craft Material';
    let purpose = 'Sustainable Retail Store Resale';

    if (qLower.includes('basket')) {
      product = 'Handmade Bamboo Baskets';
      material = 'Wild Bamboo & Cane';
    } else if (qLower.includes('necklace') || qLower.includes('jewellery') || qLower.includes('jewelry') || qLower.includes('terracotta')) {
      product = 'Handcrafted Terracotta Jewellery';
      material = 'Terracotta Clay & Natural Pigments';
    } else if (qLower.includes('pottery') || qLower.includes('vase') || qLower.includes('blue pottery')) {
      product = 'Jaipur Blue Pottery Glazed Vases';
      material = 'Quartz & Natural Cobalt Glaze';
    } else if (qLower.includes('silk') || qLower.includes('dupatta') || qLower.includes('saree')) {
      product = 'Pure Handloom Silk Scarves';
      material = 'Mulberry Silk & Gold Zari';
    }

    if (qLower.includes('hotel') || qLower.includes('decor')) {
      purpose = 'Heritage Hospitality & Interior Decor';
    } else if (qLower.includes('gift') || qLower.includes('corporate') || qLower.includes('diwali')) {
      purpose = 'Corporate & Festive Gift Hampers';
    }

    return {
      id: `req-${Date.now()}`,
      buyerId: authService.getCurrentUser().id,
      rawQuery: query,
      extractedProduct: product,
      extractedQuantity: quantity,
      extractedMaterial: material,
      extractedPurpose: purpose,
      extractedPreferences: '100% Authentic Handmade, GI Certified, Fair-Trade Artisan Direct',
      searchKeywords: [product.toLowerCase(), material.toLowerCase(), 'artisan', 'handmade'],
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Match products and artisans based on extracted requirement
   */
  public searchArtisansAndProducts(requirement: BuyerRequirement): BuyerSearchResult[] {
    const allProducts = productService.getProducts();
    const artisans = authService.getAllArtisans();
    const q = requirement.rawQuery.toLowerCase();
    const prodTarget = requirement.extractedProduct.toLowerCase();
    const matTarget = requirement.extractedMaterial.toLowerCase();

    const results: BuyerSearchResult[] = allProducts.map((product) => {
      const artisan = artisans.find((a) => a.id === product.artisanId) || artisans[0];
      let score = 50; // base score
      const matchReasons: string[] = [];

      // Check product title & category
      const pTitle = product.title_en.toLowerCase();
      const pMat = product.material_en.toLowerCase();
      const pCat = product.category_en.toLowerCase();
      const pUses = (product.potential_uses_en || []).map((u) => u.toLowerCase()).join(' ');

      if (
        (q.includes('basket') && pTitle.includes('basket')) ||
        (q.includes('terracotta') && pTitle.includes('terracotta')) ||
        (q.includes('necklace') && pTitle.includes('necklace')) ||
        (q.includes('pottery') && pTitle.includes('pottery')) ||
        (q.includes('vase') && pTitle.includes('vase')) ||
        (q.includes('diya') && pTitle.includes('diya'))
      ) {
        score += 30;
        matchReasons.push('Direct product form & category match');
      }

      if (
        (q.includes('bamboo') && pMat.includes('bamboo')) ||
        (q.includes('clay') && pMat.includes('clay')) ||
        (q.includes('terracotta') && pMat.includes('terracotta')) ||
        (q.includes('quartz') && pMat.includes('quartz')) ||
        (q.includes('silk') && pMat.includes('silk'))
      ) {
        score += 20;
        matchReasons.push(`Raw material alignment (${product.material_en.slice(0, 35)}...)`);
      }

      if (artisan.giTagCertified) {
        score += 10;
        matchReasons.push('Certified GI-Tag traditional craft custodian');
      }

      if (q.includes('sustainable') || q.includes('store') || q.includes('retail')) {
        if (pUses.includes('retail') || pUses.includes('sustainable') || pUses.includes('gift')) {
          score += 10;
          matchReasons.push('Fit for commercial boutique & retail volumes');
        }
      }

      // Check stock & MOQ readiness
      if (product.stockAvailable > 0) {
        score += 5;
        matchReasons.push(`Active stock ready (${product.stockAvailable} units ready to ship)`);
      }

      const finalScore = Math.min(99, Math.max(70, score));

      return {
        product,
        artisan,
        relevanceScore: finalScore,
        matchReasons,
      };
    });

    // Sort by relevance score descending
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export const buyerService = new BuyerService();
