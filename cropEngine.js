/**
 * Indian Crop Recommendation Engine for AI Agriculture Advisor
 * Evaluates Indian soil types (Alluvial, Black Cotton, Red, Laterite) & Seasons (Kharif, Rabi, Zaid).
 */

export const CROP_DATABASE = [
  {
    id: 'paddy_rice',
    name: 'Paddy Rice (Paddy / Dhan)',
    category: 'Cereal / Kharif Staple',
    idealN: [80, 140],
    idealP: [35, 75],
    idealK: [40, 90],
    idealPh: [5.5, 7.2],
    idealTemp: [20, 37],
    idealRainfall: [1000, 2500],
    soilTypes: ['Alluvial', 'Clay', 'Clay Loam', 'Silt'],
    seasons: ['Kharif', 'Summer'],
    waterDemand: 'High',
    durationDays: '120 - 150',
    expectedYield: '4.5 - 6.5 Tons/Ha (18-26 Qtl/Acre)',
    marketDemand: 'Very High',
    priceIndex: '₹2,203 - ₹4,500 / Quintal',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    tips: 'Maintain 2-5 cm standing water during tillering. Apply Neem Coated Urea in 3 splits.',
    companionCrops: ['Azolla biofertilizer', 'Fish farming', 'Dhaincha green manure'],
  },
  {
    id: 'wheat',
    name: 'Wheat (Gehun)',
    category: 'Cereal / Rabi Staple',
    idealN: [100, 150],
    idealP: [40, 80],
    idealK: [30, 70],
    idealPh: [6.0, 7.5],
    idealTemp: [12, 26],
    idealRainfall: [450, 850],
    soilTypes: ['Alluvial', 'Loam', 'Clay Loam', 'Sandy Loam'],
    seasons: ['Rabi', 'Winter'],
    waterDemand: 'Medium',
    durationDays: '115 - 135',
    expectedYield: '4.0 - 5.5 Tons/Ha (16-22 Qtl/Acre)',
    marketDemand: 'Very High',
    priceIndex: '₹2,275 / Quintal (MSP)',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    tips: 'Crown Root Initiation (CRI) watering at 21 days is vital. Best suited for Indo-Gangetic Alluvial plains.',
    companionCrops: ['Mustard (Sarson)', 'Gram (Chana)', 'Safflower'],
  },
  {
    id: 'cotton',
    name: 'Cotton (Kapas)',
    category: 'Cash Crop / Commercial',
    idealN: [90, 140],
    idealP: [35, 70],
    idealK: [40, 90],
    idealPh: [6.0, 8.0],
    idealTemp: [22, 38],
    idealRainfall: [600, 1200],
    soilTypes: ['Black Cotton', 'Clay', 'Clay Loam', 'Deep Alluvial'],
    seasons: ['Kharif'],
    waterDemand: 'Medium',
    durationDays: '150 - 180',
    expectedYield: '2.2 - 3.5 Tons/Ha (9-14 Qtl/Acre)',
    marketDemand: 'High',
    priceIndex: '₹6,620 - ₹7,020 / Quintal (MSP)',
    icon: '☁️',
    image: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
    tips: 'Thrives in Black Regur soils of Maharashtra, Gujarat & MP. Monitor Pink Bollworm attacks.',
    companionCrops: ['Marigold trap crop', 'Pigeonpea', 'Cowpea'],
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed (Sarson)',
    category: 'Oilseed / Rabi',
    idealN: [60, 100],
    idealP: [30, 60],
    idealK: [30, 60],
    idealPh: [6.0, 7.5],
    idealTemp: [10, 25],
    idealRainfall: [350, 650],
    soilTypes: ['Alluvial', 'Loam', 'Sandy Loam'],
    seasons: ['Rabi', 'Winter'],
    waterDemand: 'Low-Medium',
    durationDays: '105 - 125',
    expectedYield: '1.8 - 2.8 Tons/Ha (7-11 Qtl/Acre)',
    marketDemand: 'High',
    priceIndex: '₹5,650 / Quintal (MSP)',
    icon: '🌼',
    image: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=600&q=80',
    tips: 'Requires Sulfur application (SSP fertilizer) for high seed oil percentage. Low water requirement.',
    companionCrops: ['Wheat', 'Barley', 'Chickpea'],
  },
  {
    id: 'chickpea',
    name: 'Chickpea / Bengal Gram (Chana)',
    category: 'Pulse / Legume',
    idealN: [15, 40],
    idealP: [40, 80],
    idealK: [20, 60],
    idealPh: [6.0, 7.8],
    idealTemp: [15, 28],
    idealRainfall: [350, 700],
    soilTypes: ['Alluvial', 'Black Cotton', 'Loam', 'Red Soil'],
    seasons: ['Rabi', 'Winter'],
    waterDemand: 'Low',
    durationDays: '100 - 120',
    expectedYield: '1.5 - 2.8 Tons/Ha (6-11 Qtl/Acre)',
    marketDemand: 'High',
    priceIndex: '₹5,440 / Quintal (MSP)',
    icon: '🫘',
    image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=600&q=80',
    tips: 'Fixes nitrogen naturally! Avoid heavy nitrogen fertilizer. Nipping of top shoots increases branching.',
    companionCrops: ['Mustard', 'Wheat', 'Linseed'],
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Ganna)',
    category: 'Cash Crop / Long Duration',
    idealN: [130, 220],
    idealP: [50, 100],
    idealK: [80, 160],
    idealPh: [6.0, 7.8],
    idealTemp: [22, 38],
    idealRainfall: [1100, 2200],
    soilTypes: ['Alluvial', 'Black Cotton', 'Loam', 'Clay Loam'],
    seasons: ['Kharif', 'All-Year'],
    waterDemand: 'Very High',
    durationDays: '300 - 365',
    expectedYield: '70 - 110 Tons/Ha (300-450 Qtl/Acre)',
    marketDemand: 'High',
    priceIndex: '₹315 / Quintal (FRP)',
    icon: '🎋',
    image: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?auto=format&fit=crop&w=600&q=80',
    tips: 'Heavy Potash feeder. Use trash mulching between rows to conserve moisture.',
    companionCrops: ['Onion', 'Garlic', 'Coriander'],
  },
  {
    id: 'bajra',
    name: 'Pearl Millet (Bajra)',
    category: 'Millet / Nutri-Cereal',
    idealN: [40, 80],
    idealP: [25, 50],
    idealK: [20, 50],
    idealPh: [6.0, 8.2],
    idealTemp: [25, 40],
    idealRainfall: [250, 600],
    soilTypes: ['Sandy Loam', 'Red Soil', 'Loam', 'Light Soil'],
    seasons: ['Kharif', 'Zaid'],
    waterDemand: 'Very Low',
    durationDays: '80 - 95',
    expectedYield: '2.5 - 4.0 Tons/Ha (10-16 Qtl/Acre)',
    marketDemand: 'High',
    priceIndex: '₹2,500 / Quintal (MSP)',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    tips: 'Extremely drought tolerant. Ideal for arid regions of Rajasthan, Gujarat, and Haryana.',
    companionCrops: ['Cowpea', 'Moth bean', 'Sesame'],
  },
  {
    id: 'tomato',
    name: 'Tomato (Tamatar)',
    category: 'Horticulture Vegetable',
    idealN: [80, 140],
    idealP: [50, 100],
    idealK: [60, 120],
    idealPh: [6.0, 7.0],
    idealTemp: [18, 32],
    idealRainfall: [400, 900],
    soilTypes: ['Loam', 'Red Soil', 'Sandy Loam', 'Alluvial'],
    seasons: ['All-Year', 'Kharif', 'Rabi'],
    waterDemand: 'Medium-High',
    durationDays: '90 - 120',
    expectedYield: '25 - 45 Tons/Ha (100-180 Qtl/Acre)',
    marketDemand: 'Very High',
    priceIndex: '₹1,500 - ₹5,000 / Quintal',
    icon: '🍅',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    tips: 'Staking mandatory. Apply Calcium Nitrate to prevent Blossom End Rot during fruit set.',
    companionCrops: ['Marigold', 'Basil', 'Garlic'],
  },
  {
    id: 'onion',
    name: 'Onion (Pyaz)',
    category: 'Horticulture Bulb',
    idealN: [70, 120],
    idealP: [40, 80],
    idealK: [50, 100],
    idealPh: [6.0, 7.2],
    idealTemp: [14, 30],
    idealRainfall: [400, 750],
    soilTypes: ['Alluvial', 'Loam', 'Sandy Loam', 'Red Soil'],
    seasons: ['Rabi', 'Kharif'],
    waterDemand: 'Medium',
    durationDays: '120 - 150',
    expectedYield: '20 - 30 Tons/Ha (80-120 Qtl/Acre)',
    marketDemand: 'Very High',
    priceIndex: '₹1,800 - ₹4,000 / Quintal',
    icon: '🧅',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    tips: 'Requires frequent light irrigation. Sulfur application improves bulb storage life and pungency.',
    companionCrops: ['Carrot', 'Beetroot'],
  },
];

export const CropEngine = {
  recommendCrops(inputs) {
    const {
      nitrogen = 90,
      phosphorus = 45,
      potassium = 50,
      ph = 6.5,
      soilType = 'Alluvial',
      season = 'Kharif',
      rainfall = 750,
      temp = 28,
    } = inputs;

    const scored = CROP_DATABASE.map((crop) => {
      const scoreN = this.calculateParamScore(nitrogen, crop.idealN);
      const scoreP = this.calculateParamScore(phosphorus, crop.idealP);
      const scoreK = this.calculateParamScore(potassium, crop.idealK);
      const scorePh = this.calculateParamScore(ph, crop.idealPh);
      const scoreTemp = this.calculateParamScore(temp, crop.idealTemp);
      const scoreRain = this.calculateParamScore(rainfall, crop.idealRainfall);

      const soilBonus = crop.soilTypes.includes(soilType) ? 6 : -8;
      const seasonBonus = crop.seasons.includes(season) || crop.seasons.includes('All-Year') ? 6 : -10;

      const baseScore =
        scoreN * 0.18 +
        scoreP * 0.14 +
        scoreK * 0.14 +
        scorePh * 0.20 +
        scoreTemp * 0.17 +
        scoreRain * 0.17;

      let totalScore = Math.round(Math.min(100, Math.max(15, baseScore + soilBonus + seasonBonus)));

      const limitingFactors = [];
      if (nitrogen < crop.idealN[0]) limitingFactors.push(`Nitrogen Deficit (${nitrogen} < min ${crop.idealN[0]})`);
      if (phosphorus < crop.idealP[0]) limitingFactors.push(`Phosphorus Deficit (${phosphorus} < min ${crop.idealP[0]})`);
      if (potassium < crop.idealK[0]) limitingFactors.push(`Potassium Deficit (${potassium} < min ${crop.idealK[0]})`);
      if (ph < crop.idealPh[0] || ph > crop.idealPh[1]) limitingFactors.push(`pH ${ph} outside optimal (${crop.idealPh[0]}-${crop.idealPh[1]})`);

      return {
        ...crop,
        matchScore: totalScore,
        limitingFactors,
        suitabilityTier: totalScore >= 82 ? 'Optimal' : totalScore >= 68 ? 'Good' : 'Moderate',
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore);
  },

  calculateParamScore(val, idealRange) {
    const [min, max] = idealRange;
    if (val >= min && val <= max) return 100;
    if (val < min) {
      const diff = min - val;
      return Math.max(10, Math.round(100 - (diff / (min * 0.75)) * 100));
    } else {
      const diff = val - max;
      return Math.max(10, Math.round(100 - (diff / (max * 0.75)) * 100));
    }
  },
};
