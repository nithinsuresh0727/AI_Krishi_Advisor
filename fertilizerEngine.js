/**
 * Indian Precision Fertilizer Calculator Engine
 * Supports Neem Coated Urea, DAP, MOP, SSP, NPK 19:19:19, and Bigha/Guntha/Acre units.
 */

export const CROP_TARGET_NPK = {
  paddy_rice: { n: 120, p: 60, k: 60, name: 'Paddy Rice (Dhan)' },
  wheat: { n: 120, p: 60, k: 40, name: 'Wheat (Gehun)' },
  cotton: { n: 100, p: 50, k: 50, name: 'Cotton (Kapas)' },
  mustard: { n: 80, p: 40, k: 40, name: 'Mustard (Sarson)' },
  chickpea: { n: 20, p: 50, k: 20, name: 'Chickpea (Chana)' },
  sugarcane: { n: 250, p: 100, k: 120, name: 'Sugarcane (Ganna)' },
  bajra: { n: 60, p: 30, k: 30, name: 'Pearl Millet (Bajra)' },
  tomato: { n: 120, p: 80, k: 100, name: 'Tomato (Tamatar)' },
  onion: { n: 100, p: 50, k: 80, name: 'Onion (Pyaz)' },
};

export const FertilizerEngine = {
  calculateFertilizer(inputs) {
    const {
      cropId = 'wheat',
      currentN = 60,
      currentP = 30,
      currentK = 30,
      ph = 6.5,
      area = 1,
      unit = 'acre', // 'acre', 'hectare', 'bigha', 'guntha'
    } = inputs;

    // Convert area to Hectares
    let areaHectares = area;
    if (unit === 'acre') areaHectares = area * 0.404686;
    else if (unit === 'bigha') areaHectares = area * 0.2529; // Standard North Indian Bigha (~0.625 Acre)
    else if (unit === 'guntha') areaHectares = area * 0.010117; // Maharashtra/Karnataka Guntha (1/40 Acre)

    const target = CROP_TARGET_NPK[cropId] || CROP_TARGET_NPK.wheat;

    const nDeficitHa = Math.max(0, target.n - currentN);
    const pDeficitHa = Math.max(0, target.p - currentP);
    const kDeficitHa = Math.max(0, target.k - currentK);

    const totalNNeeded = nDeficitHa * areaHectares;
    const totalPNeeded = pDeficitHa * areaHectares;
    const totalKNeeded = kDeficitHa * areaHectares;

    // Inorganic Calculation (DAP + Neem Coated Urea + MOP)
    const dapKg = totalPNeeded / 0.46;
    const nFromDap = dapKg * 0.18;
    const remainingN = Math.max(0, totalNNeeded - nFromDap);
    const ureaKg = remainingN / 0.46;
    const mopKg = totalKNeeded / 0.60;

    // Standard 45kg Bags (Indian standard Neem Coated Urea is 45kg, DAP & MOP are 50kg)
    const ureaBags = (ureaKg / 45).toFixed(1);
    const dapBags = (dapKg / 50).toFixed(1);
    const mopBags = (mopKg / 50).toFixed(1);

    // Alternative SSP (Single Super Phosphate 16% P + 11% Sulfur)
    const sspKg = totalPNeeded / 0.16;
    const sspBags = (sspKg / 50).toFixed(1);

    // Organic Jeevamrut / Vermicompost Recommendation
    const vermiCompostTons = (totalNNeeded / 15).toFixed(1);
    const jeevamrutLiters = Math.round(areaHectares * 500); // 200 Liters / Acre per month

    const schedule = [
      {
        stage: 'Basal Application (At Sowing / Transplanting)',
        timeframe: 'Day 0',
        ureaKg: Math.round(ureaKg * 0.25),
        dapKg: Math.round(dapKg),
        mopKg: Math.round(mopKg * 0.75),
        purpose: 'Promotes strong root architecture and early seedling vigor.',
      },
      {
        stage: 'First Top Dressing (Tillering / Vegetative)',
        timeframe: 'Day 21 - 30',
        ureaKg: Math.round(ureaKg * 0.45),
        dapKg: 0,
        mopKg: Math.round(mopKg * 0.25),
        purpose: 'Boosts leaf canopy, tillers, and chlorophyll synthesis.',
      },
      {
        stage: 'Second Top Dressing (Panicle / Flowering)',
        timeframe: 'Day 45 - 60',
        ureaKg: Math.round(ureaKg * 0.30),
        dapKg: 0,
        mopKg: 0,
        purpose: 'Fills grain/pods and prevents premature leaf drop.',
      },
    ];

    return {
      cropName: target.name,
      area,
      unit,
      deficits: {
        n: Math.round(nDeficitHa),
        p: Math.round(pDeficitHa),
        k: Math.round(kDeficitHa),
      },
      inorganic: {
        ureaKg: Math.round(ureaKg),
        ureaBags: parseFloat(ureaBags),
        dapKg: Math.round(dapKg),
        dapBags: parseFloat(dapBags),
        mopKg: Math.round(mopKg),
        mopBags: parseFloat(mopBags),
        sspKg: Math.round(sspKg),
        sspBags: parseFloat(sspBags),
      },
      organic: {
        vermiCompostTons: parseFloat(vermiCompostTons),
        jeevamrutLiters,
        biofertilizer: 'Azotobacter / Rhizobium (2 kg/ha) + PSB (Phosphate Solubilizing Bacteria - 2 kg/ha)',
      },
      schedule,
    };
  },
};
