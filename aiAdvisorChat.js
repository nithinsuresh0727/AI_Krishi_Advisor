/**
 * AI Agriculture Chatbot & Contextual Advisor Service
 * Interacts with farm memory, live weather, and tool engines to answer farm queries.
 */

import { MemoryService } from './memoryService.js';
import { CropEngine } from './cropEngine.js';
import { FertilizerEngine } from './fertilizerEngine.js';
import { IrrigationEngine } from './irrigationEngine.js';
import { DISEASE_DATABASE } from './diseaseDetector.js';

export const AIAdvisorChat = {
  /**
   * Generate AI response based on query and full farm memory context
   */
  async queryAdvisor(userMessage, currentWeather = null) {
    // Artificial typing delay for smooth chat UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    const msg = userMessage.toLowerCase();
    const profile = MemoryService.getFarmProfile();

    // 1. Weather Queries
    if (msg.includes('weather') || msg.includes('rain') || msg.includes('temp') || msg.includes('forecast')) {
      if (currentWeather && currentWeather.current) {
        const c = currentWeather.current;
        const adv = currentWeather.advisory?.[0]?.message || 'No weather warnings present.';
        return `🌦️ **Current Weather & Agronomic Advisory for ${profile.locationName}:**

* **Temperature:** ${c.temp}°C (Feels like ${c.feelsLike}°C)
* **Humidity:** ${c.humidity}%
* **Wind Speed:** ${c.windSpeed} km/h
* **Condition:** ${c.condition}

💡 **Agronomic Guidance:** ${adv}`;
      }
      return `🌦️ **Weather Overview for ${profile.locationName}:**
Temperatures are moderate with favorable humidity for ${profile.primaryCrop}. Make sure to check the **Live Weather** tab for full 7-day precipitation and evapotranspiration charts.`;
    }

    // 2. Crop Recommendation Queries
    if (msg.includes('crop') || msg.includes('plant') || msg.includes('recommend') || msg.includes('grow')) {
      const topCrops = CropEngine.recommendCrops({
        nitrogen: profile.nitrogen,
        phosphorus: profile.phosphorus,
        potassium: profile.potassium,
        ph: profile.ph,
        soilType: profile.soilType,
        season: 'Kharif',
      });
      const best = topCrops.slice(0, 3);

      return `🌱 **Top Crop Recommendations for ${profile.farmName}:**

Based on your active soil test (N:${profile.nitrogen}, P:${profile.phosphorus}, K:${profile.potassium}, pH:${profile.ph}, ${profile.soilType}):

1. **${best[0].name}** — **${best[0].matchScore}% Match** (${best[0].suitabilityTier})
   * Expected Yield: ${best[0].expectedYield}
   * Key Tip: ${best[0].tips}
2. **${best[1].name}** — **${best[1].matchScore}% Match** (${best[1].suitabilityTier})
   * Expected Yield: ${best[1].expectedYield}
3. **${best[2].name}** — **${best[2].matchScore}% Match** (${best[2].suitabilityTier})

👉 Visit the **Crop Recommender** tab to tweak soil parameters and see full profitability analyses.`;
    }

    // 3. Fertilizer Queries
    if (msg.includes('fertilizer') || msg.includes('urea') || msg.includes('dap') || msg.includes('npk') || msg.includes('manure')) {
      const fert = FertilizerEngine.calculateFertilizer({
        cropId: profile.primaryCrop,
        currentN: profile.nitrogen,
        currentP: profile.phosphorus,
        currentK: profile.potassium,
        ph: profile.ph,
        area: profile.area,
        unit: profile.unit,
      });

      return `🧪 **Fertilizer Plan for ${fert.cropName} (${profile.area} ${profile.unit}s):**

* **Urea (46% N):** ${fert.inorganic.ureaKg} kg (~${fert.inorganic.ureaBags} bags)
* **DAP (18% N, 46% P₂O₅):** ${fert.inorganic.dapKg} kg (~${fert.inorganic.dapBags} bags)
* **MOP (60% K₂O):** ${fert.inorganic.mopKg} kg (~${fert.inorganic.mopBags} bags)

📅 **Application Schedule:**
* **Basal (At Sowing):** Apply 100% DAP (${fert.inorganic.dapKg}kg) + 75% MOP + 25% Urea.
* **Top Dressing (Day 25):** Apply 45% Urea.
* **Top Dressing (Day 50):** Apply remaining 30% Urea.

${fert.phAmendment ? `⚠️ **Soil Amendment:** ${fert.phAmendment.recommendation}` : ''}`;
    }

    // 4. Irrigation Queries
    if (msg.includes('water') || msg.includes('irrigation') || msg.includes('drip') || msg.includes('schedule')) {
      return `💧 **Smart Irrigation Guidance for ${profile.farmName}:**

* **Primary Crop:** ${profile.primaryCrop.toUpperCase()}
* **Irrigation Method:** ${profile.irrigationSystem.toUpperCase()}
* **Soil Retention:** ${profile.soilType} Soil

💡 **Best Practices:**
* Apply water early morning (6:00 AM - 9:00 AM) to reduce evaporation by up to 25%.
* Check the **Irrigation Planner** tab for your precise 7-day daily water volume and drip pump run-time.`;
    }

    // 5. Disease / Pest Queries
    if (msg.includes('disease') || msg.includes('pest') || msg.includes('spot') || msg.includes('yellow') || msg.includes('blight') || msg.includes('rust')) {
      const dis = DISEASE_DATABASE[0];
      return `🍂 **Crop Health & Disease Management:**

Common issues like **${dis.name}** present with ${dis.symptoms.join(', ')}.

🌿 **Organic Remediation:**
${dis.organicTreatment}

🔬 **Chemical Remediation:**
${dis.chemicalTreatment}

📸 *Tip:* Go to the **Disease Detector** tab to upload a photo of your leaf for instant computer vision scanning!`;
    }

    // Default Fallback / General Assistant Response
    return `🌾 **AI Agriculture Advisor here!**

I have loaded your farm profile: **${profile.farmName}** (${profile.locationName}, ${profile.area} ${profile.unit}s, Soil pH ${profile.ph}).

How can I assist your farming operations today?
* 1. Recommend optimal crops for your current soil test
* 2. Calculate exact Urea, DAP, and MOP fertilizer doses
* 3. Generate a 7-day weather-adjusted irrigation schedule
* 4. Diagnose leaf symptoms or pest attacks`;
  },
};
