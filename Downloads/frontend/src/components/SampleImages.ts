export interface CraftSampleImage {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  presetNotes: string;
}

export const sampleCraftImages: CraftSampleImage[] = [
  {
    id: 'sample-terracotta',
    name: 'Kathakali Terracotta Necklace Set',
    category: 'Handmade Jewellery',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    presetNotes: 'Sculpted from Vaigai riverbed clay in Madurai, kiln-fired and hand-painted with Kathakali face motifs.',
  },
  {
    id: 'sample-bamboo',
    name: 'Handwoven Bamboo Baskets',
    category: 'Home Decor & Storage',
    imageUrl: 'https://images.unsplash.com/photo-1590483736622-39da86788790?w=800&auto=format&fit=crop&q=80',
    presetNotes: 'Santhal tribal bamboo craft from Mayurbhanj, treated with non-toxic herbal smoke for long life.',
  },
  {
    id: 'sample-bluepottery',
    name: 'Jaipur Blue Pottery Glazed Vase',
    category: 'Pottery & Ceramics',
    imageUrl: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&auto=format&fit=crop&q=80',
    presetNotes: 'GI Tagged craft from Kot Jewar, made with crushed quartz and cobalt blue floral paint.',
  },
  {
    id: 'sample-diya',
    name: 'Peacock Terracotta Wall Lamp',
    category: 'Festive & Temple Decor',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=80',
    presetNotes: 'Handcrafted temple lamp with sculpted peacock crest, designed for wall illumination.',
  },
];
