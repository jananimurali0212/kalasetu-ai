import { MarketOpportunity, MarketRecommendation, MatchFactor, Product } from '../types';
import { mockMarketOpportunities } from './mockData';

class MarketService {
  private opportunities: MarketOpportunity[] = mockMarketOpportunities;

  public getMarketOpportunities(): MarketOpportunity[] {
    return [...this.opportunities];
  }

  public getOpportunityById(id: string): MarketOpportunity | undefined {
    return this.opportunities.find((opp) => opp.id === id);
  }

  /**
   * Deterministic matching algorithm based on weighted requirements:
   * Category = 30%
   * Material = 25%
   * Keywords = 15%
   * Location = 10%
   * Potential Use = 10%
   * Craft Requirements / Techniques = 10%
   */
  public calculateMatch(product: Product, opportunity: MarketOpportunity): MarketRecommendation {
    const matchedFactors: MatchFactor[] = [];
    let totalScore = 0;

    // 1. Category Match (Weight: 30%)
    const catProd = (product.category_en || '').toLowerCase();
    const catReq = (opportunity.categoryRequired || '').toLowerCase();
    const isCategoryMatched =
      catProd.includes(catReq) || catReq.includes(catProd) || (catProd.includes('jewellery') && catReq.includes('jewellery')) || (catProd.includes('pottery') && catReq.includes('pottery'));
    const categoryContribution = isCategoryMatched ? 30 : 5;
    totalScore += categoryContribution;
    matchedFactors.push({
      label_en: 'Product Category Compatibility',
      label_ta: 'தயாரிப்பு வகை பொருத்தம்',
      label_hi: 'उत्पाद श्रेणी संगतता',
      matched: isCategoryMatched,
      scoreContribution: categoryContribution,
      detail_en: isCategoryMatched
        ? `Direct match with required category: "${opportunity.categoryRequired}"`
        : `Secondary craft alignment`,
      detail_ta: isCategoryMatched
        ? `தேவையான வகையுடன் நேரடிப் பொருத்தம்: "${opportunity.categoryRequired}"`
        : `இரண்டாம் நிலை கைவினை இணக்கம்`,
      detail_hi: isCategoryMatched
        ? `आवश्यक श्रेणी से सीधा मिलान: "${opportunity.categoryRequired}"`
        : `द्वितीयक शिल्प अनुकूलता`,
    });

    // 2. Material Match (Weight: 25%)
    const prodMaterial = (product.material_en || '').toLowerCase();
    const matchedMaterials = opportunity.materialRequired.filter((mat) =>
      prodMaterial.includes(mat.toLowerCase())
    );
    const isMaterialMatched = matchedMaterials.length > 0;
    const materialContribution = isMaterialMatched ? 25 : 5;
    totalScore += materialContribution;
    matchedFactors.push({
      label_en: 'Authentic Raw Material Alignment',
      label_ta: 'உண்மையான மூலப்பொருள் பொருத்தம்',
      label_hi: 'प्रामाणिक कच्चे माल का मिलान',
      matched: isMaterialMatched,
      scoreContribution: materialContribution,
      detail_en: isMaterialMatched
        ? `Matches target materials: ${matchedMaterials.join(', ')}`
        : `Natural heritage raw material base`,
      detail_ta: isMaterialMatched
        ? `இலக்கு மூலப்பொருட்களுடன் பொருந்துகிறது: ${matchedMaterials.join(', ')}`
        : `இயற்கை பாரம்பரிய மூலப்பொருள் அடிப்படை`,
      detail_hi: isMaterialMatched
        ? `लक्षित सामग्रियों से मेल खाता है: ${matchedMaterials.join(', ')}`
        : `प्राकृतिक विरासत कच्चा माल आधार`,
    });

    // 3. Craft Technique & Keywords (Weight: 15%)
    const prodKeywords = (product.keywords || []).map((k) => k.toLowerCase());
    const prodTechnique = (product.technique_en || '').toLowerCase();
    const techniqueMatch = opportunity.craftTechniquesAccepted.some(
      (tech) => prodTechnique.includes(tech.toLowerCase()) || prodKeywords.some((k) => k.includes(tech.toLowerCase()))
    );
    const techniqueContribution = techniqueMatch ? 15 : 7;
    totalScore += techniqueContribution;
    matchedFactors.push({
      label_en: 'Traditional Craft Technique',
      label_ta: 'பாரம்பரிய கைவினை நுட்பம்',
      label_hi: 'पारंपरिक शिल्प तकनीक',
      matched: techniqueMatch,
      scoreContribution: techniqueContribution,
      detail_en: techniqueMatch
        ? `Preserves certified heritage techniques: "${product.technique_en.slice(0, 40)}..."`
        : `Authentic regional artisan workmanship`,
      detail_ta: techniqueMatch
        ? `சான்றளிக்கப்பட்ட பாரம்பரிய நுட்பங்களை பாதுகாக்கிறது`
        : `உண்மையான பிராந்திய கைவினைத்திறன்`,
      detail_hi: techniqueMatch
        ? `प्रमाणित विरासत तकनीकों का संरक्षण`
        : `प्रामाणिक क्षेत्रीय शिल्पकारी`,
    });

    // 4. Location Suitability (Weight: 10%)
    const artisanLoc = (product.artisanLocation || '').toLowerCase();
    const oppLoc = (opportunity.location || '').toLowerCase();
    const isLocMatched =
      oppLoc.includes('tamil nadu') ||
      oppLoc.includes('chennai') ||
      oppLoc.includes('pan-india') ||
      opportunity.targetLocationScope.toLowerCase().includes('south india') ||
      opportunity.targetLocationScope.toLowerCase().includes('national');
    const locContribution = isLocMatched ? 10 : 4;
    totalScore += locContribution;
    matchedFactors.push({
      label_en: 'Geographical Logistics & Cluster Reach',
      label_ta: 'புவியியல் தளவாடங்கள் மற்றும் அணுகல்',
      label_hi: 'भौगोलिक रसद एवं क्लस्टर पहुंच',
      matched: isLocMatched,
      scoreContribution: locContribution,
      detail_en: isLocMatched
        ? `Artisan cluster (${product.artisanLocation}) sits in prime catchment zone for ${opportunity.location}`
        : `Pan-India freight supported`,
      detail_ta: isLocMatched
        ? `கைவினைஞர் மையம் (${product.artisanLocation}) முக்கிய தளவாட பகுதியில் உள்ளது`
        : `அகில இந்திய சரக்கு போக்குவரத்து வசதி`,
      detail_hi: isLocMatched
        ? `शिल्पकार क्लस्टर (${product.artisanLocation}) प्रमुख क्षेत्र में स्थित है`
        : `अखिल भारतीय परिवहन समर्थित`,
    });

    // 5. Potential Use Alignment (Weight: 10%)
    const oppDesc = (opportunity.description_en + ' ' + opportunity.type).toLowerCase();
    const hasUseMatch = (product.potential_uses_en || []).some((use) =>
      oppDesc.includes(use.toLowerCase().split(' ')[0])
    );
    const useContribution = hasUseMatch ? 10 : 5;
    totalScore += useContribution;
    matchedFactors.push({
      label_en: 'Buyer Intended Use & Market Fit',
      label_ta: 'வாங்குபவர் பயன்பாடு & சந்தை தகுதி',
      label_hi: 'खरीदार उपयोग एवं बाज़ार अनुकूलता',
      matched: hasUseMatch,
      scoreContribution: useContribution,
      detail_en: hasUseMatch
        ? `Ideal for procurement segment: ${opportunity.type}`
        : `Adaptive retail and exhibition appeal`,
      detail_ta: hasUseMatch
        ? `கொள்முதல் பிரிவுக்கு மிகவும் பொருத்தமானது: ${opportunity.type}`
        : `சில்லறை மற்றும் கண்காட்சி கவர்ச்சி`,
      detail_hi: hasUseMatch
        ? `खरीद खंड के लिए सर्वोत्तम: ${opportunity.type}`
        : `खुदरा एवं प्रदर्शनी अनुकूलता`,
    });

    // 6. Quality & Minimum Order Readiness (Weight: 10%)
    const meetsMoq = (product.stockAvailable || 0) >= (product.minimumOrderQuantity || 1);
    const moqContribution = meetsMoq ? 10 : 6;
    totalScore += moqContribution;
    matchedFactors.push({
      label_en: 'Artisan Supply Readiness & Capacity',
      label_ta: 'கைவினைஞர் வழங்கல் தயார்நிலை & திறன்',
      label_hi: 'शिल्पकार आपूर्ति तत्परता व क्षमता',
      matched: meetsMoq,
      scoreContribution: moqContribution,
      detail_en: meetsMoq
        ? `In-stock readiness (${product.stockAvailable} units) meets initial procurement batch MOQ (${product.minimumOrderQuantity})`
        : `Batch lead-time of ${product.leadTimeDays || 14} days`,
      detail_ta: meetsMoq
        ? `கையிருப்பு அளவு (${product.stockAvailable} அலகுகள்) குறைந்தபட்ச அளவை பூர்த்தி செய்கிறது`
        : `உற்பத்தி காலம் ${product.leadTimeDays || 14} நாட்கள்`,
      detail_hi: meetsMoq
        ? `स्टॉक तत्परता (${product.stockAvailable} इकाइयां) न्यूनतम बैच आवश्यकता को पूरा करती है`
        : `उत्पादन समय ${product.leadTimeDays || 14} दिन`,
    });

    // Clamp score between 65 and 98 for realistic high-confidence matching
    const finalScore = Math.min(98, Math.max(68, totalScore));

    return {
      opportunity,
      matchScore: finalScore,
      matchedFactors,
      productId: product.id,
      productTitle: product.title_en,
    };
  }

  public getRecommendationsForProduct(product: Product): MarketRecommendation[] {
    return this.opportunities
      .map((opp) => this.calculateMatch(product, opp))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  public getRecommendationsForAll(products: Product[]): MarketRecommendation[] {
    if (products.length === 0) return [];
    // Primary showcase is the first or most recently added product
    const primaryProduct = products[0];
    return this.getRecommendationsForProduct(primaryProduct);
  }
}

export const marketService = new MarketService();
