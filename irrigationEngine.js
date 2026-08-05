/**
 * Irrigation Planner & Smart Water Schedule Engine for AI Agriculture Advisor
 * Computes daily crop evapotranspiration (ETc), soil water deficit, and drip/sprinkler run times.
 */

export const CROP_KC_FACTORS = {
  rice: { name: 'Rice', initial: 1.05, dev: 1.15, mid: 1.20, late: 0.90, method: 'Flood / Drip' },
  wheat: { name: 'Wheat', initial: 0.40, dev: 0.80, mid: 1.15, late: 0.40, method: 'Sprinkler / Furrow' },
  maize: { name: 'Maize', initial: 0.40, dev: 0.80, mid: 1.20, late: 0.60, method: 'Drip / Furrow' },
  cotton: { name: 'Cotton', initial: 0.45, dev: 0.75, mid: 1.15, late: 0.70, method: 'Drip Irrigation' },
  tomato: { name: 'Tomato', initial: 0.45, dev: 0.75, mid: 1.15, late: 0.80, method: 'Drip Irrigation' },
  potato: { name: 'Potato', initial: 0.50, dev: 0.75, mid: 1.15, late: 0.75, method: 'Sprinkler / Drip' },
  chickpea: { name: 'Chickpea', initial: 0.40, dev: 0.70, mid: 1.00, late: 0.35, method: 'Light Sprinkler' },
  soybean: { name: 'Soybean', initial: 0.40, dev: 0.75, mid: 1.15, late: 0.50, method: 'Sprinkler / Furrow' },
  sugarcane: { name: 'Sugarcane', initial: 0.40, dev: 0.80, mid: 1.25, late: 0.75, method: 'Sub-surface Drip' },
  groundnut: { name: 'Groundnut', initial: 0.40, dev: 0.75, mid: 1.05, late: 0.55, method: 'Sprinkler / Drip' },
  onion: { name: 'Onion', initial: 0.50, dev: 0.75, mid: 1.05, late: 0.75, method: 'Drip / Micro-Sprinkler' },
  coffee: { name: 'Coffee', initial: 0.90, dev: 0.95, mid: 1.05, late: 0.95, method: 'Drip / Overhead' },
};

export const SOIL_RETENTION = {
  sandy: { name: 'Sandy Soil', holdingCapacity: 0.6, drainSpeed: 'Fast', frequencyMultiplier: 1.4 },
  sandyLoam: { name: 'Sandy Loam', holdingCapacity: 0.8, drainSpeed: 'Moderate-Fast', frequencyMultiplier: 1.2 },
  loam: { name: 'Loam Soil', holdingCapacity: 1.0, drainSpeed: 'Optimal', frequencyMultiplier: 1.0 },
  clayLoam: { name: 'Clay Loam', holdingCapacity: 1.2, drainSpeed: 'Moderate-Slow', frequencyMultiplier: 0.85 },
  clay: { name: 'Clay Soil', holdingCapacity: 1.4, drainSpeed: 'Slow', frequencyMultiplier: 0.7 },
};

export const IrrigationEngine = {
  /**
   * Calculate 7-Day Irrigation Schedule based on Weather Forecast & Crop Stage
   */
  calculateSchedule(inputs) {
    const {
      cropId = 'wheat',
      stage = 'mid', // 'initial', 'dev', 'mid', 'late'
      soilType = 'loam',
      systemType = 'drip', // 'drip', 'sprinkler', 'furrow'
      area = 1,
      unit = 'acre', // 'acre', 'hectare'
      forecast = [], // 7-day forecast array from WeatherService
    } = inputs;

    const cropInfo = CROP_KC_FACTORS[cropId] || CROP_KC_FACTORS.wheat;
    const kc = cropInfo[stage] || cropInfo.mid;
    const soilInfo = SOIL_RETENTION[soilType] || SOIL_RETENTION.loam;

    // Convert area to acres for standard volume calculation
    const areaAcres = unit === 'hectare' ? area * 2.47105 : area;

    // Efficiency factors
    const systemEfficiency = systemType === 'drip' ? 0.90 : systemType === 'sprinkler' ? 0.75 : 0.60;
    // Drip application rate: ~4000 Liters / hour / acre (standard 4 LPH dripper spacing)
    const dripFlowRateLph = 4000;

    let totalWaterDeficitLiters = 0;
    let totalRainfallMm = 0;

    const dailySchedule = forecast.map((day, idx) => {
      const et0 = day.et0 || 4.2;
      const rainMm = day.precipSum || 0;
      totalRainfallMm += rainMm;

      // Crop Evapotranspiration ETc (mm/day)
      const etcMm = et0 * kc;

      // Effective Rainfall (75% of rainfall over 5mm is usable)
      const effectiveRainMm = rainMm > 5 ? (rainMm - 2) * 0.75 : 0;

      // Net Irrigation Needed (mm/day)
      const netNeedMm = Math.max(0, etcMm - effectiveRainMm);

      // Gross Need adjusting for system efficiency and soil retention
      const grossNeedMm = netNeedMm / systemEfficiency;

      // Convert mm to Liters per Acre (1 mm rain/irrigation on 1 acre = 4,046.86 Liters)
      const litersPerAcre = Math.round(grossNeedMm * 4046.86 * areaAcres);
      totalWaterDeficitLiters += litersPerAcre;

      // Drip / Sprinkler Run Time
      const runTimeHours = (litersPerAcre / (dripFlowRateLph * areaAcres)).toFixed(1);
      const runTimeMins = Math.round(parseFloat(runTimeHours) * 60);

      // Action determination
      let action = 'Water Needed';
      let statusColor = 'blue';
      let note = `Apply ${litersPerAcre.toLocaleString()} L (${runTimeMins} mins)`;

      if (effectiveRainMm >= etcMm) {
        action = 'Skip Irrigation';
        statusColor = 'green';
        note = `Natural rain (${rainMm}mm) satisfies crop water needs.`;
      } else if (rainMm > 0) {
        action = 'Reduced Irrigation';
        statusColor = 'amber';
        note = `Rain (${rainMm}mm) reduces irrigation needs to ${runTimeMins} mins.`;
      }

      return {
        date: day.date,
        dayName: day.dayName || `Day ${idx + 1}`,
        et0: et0.toFixed(1),
        etc: etcMm.toFixed(1),
        rainMm: rainMm.toFixed(1),
        netNeedMm: netNeedMm.toFixed(1),
        liters: litersPerAcre,
        runTimeMins,
        action,
        statusColor,
        note,
      };
    });

    // Smart Advisory summary
    let summaryAdvisory = '';
    if (totalRainfallMm > 25) {
      summaryAdvisory = `Significant rain (${totalRainfallMm.toFixed(1)}mm) expected this week. Save water and prevent soil saturation by pausing automated pumps on rain days.`;
    } else {
      summaryAdvisory = `Total 7-day crop water demand is ${(totalWaterDeficitLiters / 1000).toFixed(1)} kL. Best irrigation times are early morning (6:00 - 9:00 AM) to minimize evaporation losses.`;
    }

    return {
      cropName: cropInfo.name,
      stageName: stage === 'initial' ? 'Initial / Seedling' : stage === 'dev' ? 'Vegetative Development' : stage === 'mid' ? 'Mid-Season / Flowering' : 'Late-Season / Ripening',
      kcValue: kc,
      soilName: soilInfo.name,
      systemName: systemType.toUpperCase(),
      totalLiters: totalWaterDeficitLiters,
      totalRainfallMm: totalRainfallMm.toFixed(1),
      dailySchedule,
      summaryAdvisory,
    };
  },
};
