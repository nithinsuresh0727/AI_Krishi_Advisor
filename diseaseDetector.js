/**
 * Crop Disease Diagnostic AI Engine for AI Agriculture Advisor
 * Provides computer vision pattern simulation and symptom-guided clinical diagnosis.
 */

export const DISEASE_DATABASE = [
  {
    id: 'early_blight',
    name: 'Early Blight (Alternaria solani)',
    crop: ['tomato', 'potato'],
    type: 'Fungal Pathogen',
    symptoms: ['brown_spots', 'yellowing', 'concentric_rings', 'lower_leaves'],
    severity: 'Moderate to High',
    description: 'Characterized by dark brown to black spots with distinct target-board concentric rings, surrounded by yellow chlorotic halos on mature leaves.',
    organicTreatment: 'Spray Neem Oil extract (5ml/L) or Copper Hydroxide (2.5g/L). Remove and destroy affected bottom leaves.',
    chemicalTreatment: 'Apply Mancozeb 75% WP @ 2.0g/L or Azoxystrobin 23% SC @ 1.0ml/L at first sign of spots.',
    prevention: 'Ensure 3-year crop rotation. Avoid overhead sprinkler watering to keep leaves dry. Mulch around base.',
    icon: '🍂',
  },
  {
    id: 'late_blight',
    name: 'Late Blight (Phytophthora infestans)',
    crop: ['potato', 'tomato'],
    type: 'Oomycete / Water Mold',
    symptoms: ['water_soaked', 'dark_lesions', 'white_fuzz', 'rapid_wilting'],
    severity: 'Critical / Destructive',
    description: 'Irregular pale-green to dark brown water-soaked lesions that expand rapidly. White cottony fungal growth appears on underside of leaves in humid weather.',
    organicTreatment: 'Bordeaux Mixture (1%) spray. Extract of Garlic + Neem oil as preventive bio-fungicide.',
    chemicalTreatment: 'Systemic fungicide spray: Metalaxyl + Mancozeb @ 2.5g/L or Cymoxanil @ 2.0g/L immediately.',
    prevention: 'Use certified disease-free seed tubers. Destroy volunteer plants. Monitor high humidity forecast.',
    icon: '⚡',
  },
  {
    id: 'rice_blast',
    name: 'Rice Blast (Magnaporthe oryzae)',
    crop: ['rice'],
    type: 'Fungal Pathogen',
    symptoms: ['spindle_spots', 'grey_center', 'neck_rot', 'yellowing'],
    severity: 'High',
    description: 'Diamond or spindle-shaped lesions with gray/white centers and reddish-brown margins on leaves. Can attack nodes and neck joint causing neck rot.',
    organicTreatment: 'Spray Pseudomonas fluorescens @ 10g/L. Apply vermicompost and bio-silica.',
    chemicalTreatment: 'Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L at tillering stage.',
    prevention: 'Avoid excessive nitrogen fertilization. Maintain optimal water level in field. Treat seeds with Carbendazim.',
    icon: '🌾',
  },
  {
    id: 'stripe_rust',
    name: 'Wheat Yellow / Stripe Rust (Puccinia striiformis)',
    crop: ['wheat', 'barley'],
    type: 'Fungal Rust',
    symptoms: ['yellow_stripes', 'powdery_spores', 'leaf_drying'],
    severity: 'High',
    description: 'Linear stripes of bright yellow powdery pustules running parallel to leaf veins. Causes premature leaf senescence and severe grain shriveling.',
    organicTreatment: 'Spray Sulfur 80% WP @ 3.0g/L or Trichoderma viride bio-agent @ 5g/L.',
    chemicalTreatment: 'Propiconazole 25% EC @ 1.0ml/L or Tebuconazole @ 1.0ml/L as soon as yellow stripes appear.',
    prevention: 'Plant resistant wheat cultivars (e.g. HD-2967, PBW-550). Avoid late sowing.',
    icon: '🟡',
  },
  {
    id: 'powdery_mildew',
    name: 'Powdery Mildew (Erysiphaceae)',
    crop: ['maize', 'wheat', 'coffee', 'tomato', 'cucurbits'],
    type: 'Fungal Pathogen',
    symptoms: ['white_powder', 'leaf_curling', 'stunted_growth'],
    severity: 'Moderate',
    description: 'White to grayish flour-like powdery patches covering upper and lower surfaces of leaves and stems. Causes leaves to twist, dry, and drop.',
    organicTreatment: 'Baking soda solution (1 tbsp per gallon water + 1/2 tsp liquid soap) or Neem Oil spray @ 5ml/L.',
    chemicalTreatment: 'Wettable Sulfur 80% WP @ 3.0g/L or Hexaconazole 5% EC @ 1.0ml/L.',
    prevention: 'Provide adequate plant spacing for ventilation. Prune dense foliage to allow full sunlight.',
    icon: '❄️',
  },
  {
    id: 'aphid_infestation',
    name: 'Aphid & Spider Mite Pest Infestation',
    crop: ['cotton', 'maize', 'tomato', 'potato', 'chickpea', 'soybean', 'groundnut', 'onion'],
    type: 'Insect Pest',
    symptoms: ['leaf_curling', 'sticky_honeydew', 'tiny_insects', 'yellow_speckling'],
    severity: 'Moderate',
    description: 'Clusters of tiny green, black, or yellow soft-bodied insects sucking sap on tender shoots and under leaves. Excrete sticky honeydew attracting black mold.',
    organicTreatment: 'Spray Potassium Soap / Insecticidal Soap (15ml/L) or cold-pressed Neem Oil @ 5ml/L with dish soap emulsifier.',
    chemicalTreatment: 'Imidacloprid 17.8% SL @ 0.5ml/L or Acetamiprid 20% SP @ 0.2g/L as foliar spray.',
    prevention: 'Encourage natural predators like Ladybug beetles and Lacewings. Install yellow sticky traps.',
    icon: '🐛',
  },
  {
    id: 'bacterial_blight',
    name: 'Bacterial Blight (Xanthomonas species)',
    crop: ['cotton', 'rice', 'soybean'],
    type: 'Bacterial Pathogen',
    symptoms: ['water_soaked', 'angular_spots', 'black_veins', 'leaf_drop'],
    severity: 'High',
    description: 'Angular water-soaked lesions bounded by leaf veins that turn brown to black. Causes blackarm on stems and boll rot in cotton.',
    organicTreatment: 'Spray Streptomyces bio-bactericide or Copper Oxychloride 50% WP @ 2.5g/L.',
    chemicalTreatment: 'Streptocycline (100 ppm) @ 1.0g per 10 Liters water mixed with Copper Oxychloride @ 25g/10L.',
    prevention: 'Delint cotton seed with acid. Avoid working in fields when foliage is wet.',
    icon: '☣️',
  },
];

export const DiseaseDetector = {
  /**
   * Diagnostic simulation based on uploaded image canvas metrics or uploaded file
   */
  async analyzeImage(fileOrCanvas) {
    // Simulated deep vision inference delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Generate random seed or read basic file properties for deterministic match
    const fileName = fileOrCanvas?.name?.toLowerCase() || '';
    
    let diagnosedDisease = DISEASE_DATABASE[0]; // Early blight default
    let confidence = 93.4;

    if (fileName.includes('rice') || fileName.includes('blast')) {
      diagnosedDisease = DISEASE_DATABASE[2];
      confidence = 96.1;
    } else if (fileName.includes('wheat') || fileName.includes('rust') || fileName.includes('yellow')) {
      diagnosedDisease = DISEASE_DATABASE[3];
      confidence = 94.8;
    } else if (fileName.includes('potato') || fileName.includes('blight')) {
      diagnosedDisease = DISEASE_DATABASE[1];
      confidence = 92.5;
    } else if (fileName.includes('powder') || fileName.includes('white')) {
      diagnosedDisease = DISEASE_DATABASE[4];
      confidence = 95.0;
    } else if (fileName.includes('pest') || fileName.includes('bug') || fileName.includes('aphid')) {
      diagnosedDisease = DISEASE_DATABASE[5];
      confidence = 97.2;
    } else {
      // Pick based on pseudo random calculation
      const idx = Math.floor(Math.random() * DISEASE_DATABASE.length);
      diagnosedDisease = DISEASE_DATABASE[idx];
      confidence = Math.round((88 + Math.random() * 10) * 10) / 10;
    }

    return {
      success: true,
      disease: diagnosedDisease,
      confidenceScore: confidence,
      scanTimestamp: new Date().toISOString(),
    };
  },

  /**
   * Clinical Symptom Checklist Wizard Diagnostic
   */
  diagnoseBySymptoms(cropId, selectedSymptoms) {
    if (!selectedSymptoms || selectedSymptoms.length === 0) {
      return {
        matched: false,
        message: 'Please select at least one symptom observed on the plant.',
      };
    }

    // Rank diseases based on symptom overlap & crop compatibility
    const matches = DISEASE_DATABASE.map((d) => {
      const isCropMatch = d.crop.includes(cropId);
      const matchedSymptoms = d.symptoms.filter((s) => selectedSymptoms.includes(s));
      const matchRatio = matchedSymptoms.length / Math.max(d.symptoms.length, selectedSymptoms.length);

      let score = matchRatio * 80;
      if (isCropMatch) score += 20;

      return {
        disease: d,
        score: Math.round(score),
        matchedSymptomCount: matchedSymptoms.length,
      };
    });

    matches.sort((a, b) => b.score - a.score);
    const best = matches[0];

    return {
      matched: true,
      bestMatch: best.disease,
      confidenceScore: Math.min(98, Math.max(55, best.score)),
      alternatives: matches.slice(1, 3).map((m) => m.disease),
    };
  },
};
