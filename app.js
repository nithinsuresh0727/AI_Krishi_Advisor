/**
 * Main Indian Agriculture & Live Weather Orchestrator for AI Agriculture Advisor
 */

import { WeatherService } from './weatherService.js';
import { CropEngine } from './cropEngine.js';
import { FertilizerEngine } from './fertilizerEngine.js';
import { IrrigationEngine } from './irrigationEngine.js';
import { DiseaseDetector } from './diseaseDetector.js';
import { MemoryService } from './memoryService.js';
import { AIAdvisorChat } from './aiAdvisorChat.js';

let currentWeatherState = null;
let activeLocation = null;
let chartEt0Instance = null;
let chartSoilInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();

  initTabNavigation();
  renderFarmProfile();

  // Auto-Detect Live GPS Location on startup
  await initLiveLocationAndWeather();

  initCropRecommender();
  initFertilizerTool();
  initIrrigationPlanner();
  initDiseaseDetector();
  initAIChat();
  initModalEvents();
  initWeatherSearch();
});

/* ==========================================================================
   LIVE GPS AUTO-LOCATION & WEATHER LOAD
   ========================================================================== */
async function initLiveLocationAndWeather() {
  const profile = MemoryService.getFarmProfile();

  // Try auto-detecting user's current GPS location first
  const detected = await WeatherService.detectLiveLocation();
  activeLocation = detected;

  // Save detected city to profile if GPS was active
  if (detected.isLiveGPS) {
    profile.locationName = detected.name + ', ' + detected.region;
    profile.latitude = detected.latitude;
    profile.longitude = detected.longitude;
    MemoryService.saveFarmProfile(profile);
  }

  // Render header tag with live indicator
  const tag = document.getElementById('header-location-tag');
  if (tag) {
    tag.innerHTML = `${detected.name}, ${detected.region} ${detected.isLiveGPS ? '<span class="live-dot" title="Live GPS Connected">● LIVE</span>' : ''}`;
  }

  await loadWeatherData(detected.latitude, detected.longitude);
}

async function loadWeatherData(lat, lon) {
  const data = await WeatherService.fetchWeather(lat, lon);
  currentWeatherState = data;

  document.getElementById('dash-temp').textContent = `${data.current.temp}°C`;
  document.getElementById('dash-weather-text').textContent = `${data.current.condition} • ${data.current.humidity}% Humidity`;
  document.getElementById('dash-water').textContent = `${data.metrics.avgEt0} mm/day`;

  renderWeatherStrip('dash-weather-strip', data.forecast);
  renderWeatherStrip('weather-view-strip', data.forecast);
  renderAdvisories(data.advisory);
  renderWeatherChart(data.forecast);

  runCropEngineDashboard();
}

/* ==========================================================================
   WEATHER SEARCH & LOCATION SELECTOR
   ========================================================================== */
function initWeatherSearch() {
  const searchInput = document.getElementById('weather-search-input');
  const searchBtn = document.getElementById('btn-search-weather');
  const resultsBox = document.getElementById('weather-search-results');
  const gpsBtn = document.getElementById('btn-auto-gps');

  const doSearch = async () => {
    const q = searchInput.value;
    if (!q || q.trim().length < 2) return;
    resultsBox.innerHTML = '<span style="color: var(--primary-400); font-size: 0.85rem;">Searching Indian weather stations...</span>';
    
    const results = await WeatherService.searchLocation(q);
    if (results.length === 0) {
      resultsBox.innerHTML = '<span style="color: var(--rose-500); font-size: 0.85rem;">No weather stations found. Try New Delhi, Ludhiana, Pune, Karnal...</span>';
      return;
    }

    resultsBox.innerHTML = results
      .map(
        (r) => `
      <button class="btn-secondary btn-city-pick" data-lat="${r.latitude}" data-lon="${r.longitude}" data-name="${r.name}, ${r.region}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
        📍 ${r.name}, ${r.region}
      </button>
    `
      )
      .join('');

    document.querySelectorAll('.btn-city-pick').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const lat = parseFloat(btn.getAttribute('data-lat'));
        const lon = parseFloat(btn.getAttribute('data-lon'));
        const name = btn.getAttribute('data-name');

        const profile = MemoryService.getFarmProfile();
        profile.locationName = name;
        profile.latitude = lat;
        profile.longitude = lon;
        MemoryService.saveFarmProfile(profile);

        document.getElementById('header-location-tag').textContent = name;
        document.getElementById('sidebar-location').textContent = name;
        resultsBox.innerHTML = `<span style="color: var(--primary-400); font-size: 0.85rem;">✅ Live Weather updated for ${name}</span>`;

        await loadWeatherData(lat, lon);
      });
    });
  };

  searchBtn?.addEventListener('click', doSearch);
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  gpsBtn?.addEventListener('click', async () => {
    resultsBox.innerHTML = '<span style="color: var(--primary-400); font-size: 0.85rem;">📡 Detecting your GPS live location...</span>';
    await initLiveLocationAndWeather();
    resultsBox.innerHTML = '<span style="color: var(--primary-400); font-size: 0.85rem;">✅ GPS location connected!</span>';
  });

  document.getElementById('btn-refresh-weather')?.addEventListener('click', () => {
    const profile = MemoryService.getFarmProfile();
    loadWeatherData(profile.latitude, profile.longitude);
  });
}

/* ==========================================================================
   NAVIGATION & TABS
   ========================================================================== */
function initTabNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-content');

  const titles = {
    dashboard: { title: 'Indian Agricultural Intelligence Dashboard', subtitle: 'Live weather forecasts, soil analytics, and crop advisory.' },
    weather: { title: 'Live Weather Station (India)', subtitle: '7-Day precipitation, monsoon alerts, humidity, and evapotranspiration.' },
    crops: { title: 'Crop Recommendation Engine', subtitle: 'Matching Indian soil types (Alluvial, Black Cotton, Red, Laterite) & Kharif/Rabi seasons.' },
    fertilizer: { title: 'Indian Precision Fertilizer Calculator', subtitle: 'Dosages for Neem Coated Urea, DAP, MOP, SSP, and Organic Vermicompost.' },
    irrigation: { title: 'Smart Irrigation & Water Budget Planner', subtitle: 'Weather-adjusted watering schedule and drip run times.' },
    disease: { title: 'Crop Disease Diagnostic AI', subtitle: 'Leaf photo scanner and clinical symptom wizard for Indian crops.' },
    chat: { title: 'AI Krishi Advisor Chatbot', subtitle: 'Context-aware agricultural assistant synchronized with your farm profile.' },
  };

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = item.getAttribute('data-tab');

      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');

      tabs.forEach((t) => (t.style.display = 'none'));
      const activeTab = document.getElementById(`tab-${tabName}`);
      if (activeTab) activeTab.style.display = 'block';

      const meta = titles[tabName] || titles.dashboard;
      document.getElementById('header-view-title').textContent = meta.title;
      document.getElementById('header-view-subtitle').textContent = meta.subtitle;

      if (window.lucide) lucide.createIcons();
    });
  });

  document.getElementById('btn-quick-scan')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="disease"]')?.click();
  });
  document.getElementById('btn-dash-open-chat')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="chat"]')?.click();
  });
}

function renderFarmProfile() {
  const profile = MemoryService.getFarmProfile();

  document.getElementById('sidebar-farm-name').textContent = profile.farmName;
  document.getElementById('sidebar-location').textContent = profile.locationName;
  document.getElementById('header-location-tag').textContent = profile.locationName;

  const nScore = Math.min(100, Math.round((profile.nitrogen / 140) * 100));
  document.getElementById('dash-soil-score').textContent = `${nScore} / 100`;
  document.getElementById('dash-soil-text').textContent = `pH ${profile.ph} • N:${profile.nitrogen} P:${profile.phosphorus} K:${profile.potassium}`;

  renderSoilChart(profile);
}

function renderSoilChart(profile) {
  const ctx = document.getElementById('chart-soil-npk')?.getContext('2d');
  if (!ctx) return;

  if (chartSoilInstance) chartSoilInstance.destroy();

  chartSoilInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'pH Level (x10)'],
      datasets: [
        {
          label: 'Current Soil Level',
          data: [profile.nitrogen, profile.phosphorus, profile.potassium, profile.ph * 10],
          backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(14, 165, 233, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(168, 85, 247, 0.7)'],
          borderRadius: 8,
        },
        {
          label: 'Optimal Target',
          data: [120, 60, 60, 68],
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

function renderWeatherStrip(containerId, forecast) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = forecast
    .map(
      (day) => `
    <div class="weather-day-card">
      <div class="weather-day-name">${day.dayName}</div>
      <div class="weather-icon">${getIconEmoji(day.icon)}</div>
      <div class="weather-temps">
        <span class="temp-max">${day.tempMax}°</span>
        <span class="temp-min">${day.tempMin}°</span>
      </div>
      <div class="weather-precip">💧 ${day.precipSum}mm</div>
    </div>
  `
    )
    .join('');
}

function getIconEmoji(icon) {
  if (icon.includes('sun')) return '☀️';
  if (icon.includes('rain')) return '🌧️';
  if (icon.includes('drizzle')) return '🌦️';
  if (icon.includes('lightning')) return '🌩️';
  return '⛅';
}

function renderAdvisories(advisories) {
  const container = document.getElementById('dash-advisory-list');
  const fullContainer = document.getElementById('weather-advisories-full');
  if (!container) return;

  const html = advisories
    .map(
      (a) => `
    <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); border-left: 4px solid ${
      a.type === 'danger' ? '#f43f5e' : a.type === 'warning' ? '#f59e0b' : '#10b981'
    }; padding: 0.85rem; border-radius: var(--radius-md);">
      <h5 style="color: #fff; font-size: 0.9rem; font-weight: 700;">${a.title}</h5>
      <p style="color: var(--slate-300); font-size: 0.8rem; margin-top: 0.25rem;">${a.message}</p>
    </div>
  `
    )
    .join('');

  container.innerHTML = html;
  if (fullContainer) fullContainer.innerHTML = html;
}

function renderWeatherChart(forecast) {
  const ctx = document.getElementById('chart-et0-rain')?.getContext('2d');
  if (!ctx) return;

  if (chartEt0Instance) chartEt0Instance.destroy();

  chartEt0Instance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: forecast.map((f) => f.dayName),
      datasets: [
        {
          label: 'Rainfall (mm)',
          data: forecast.map((f) => f.precipSum),
          backgroundColor: 'rgba(14, 165, 233, 0.7)',
          borderRadius: 6,
          yAxisID: 'yRain',
        },
        {
          label: 'Evapotranspiration ET0 (mm/day)',
          data: forecast.map((f) => f.et0),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          type: 'line',
          tension: 0.4,
          yAxisID: 'yEt',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        yRain: { position: 'left', ticks: { color: '#0ea5e9' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        yEt: { position: 'right', ticks: { color: '#10b981' }, grid: { display: false } },
      },
    },
  });
}

function initCropRecommender() {
  const inputN = document.getElementById('input-n');
  const inputP = document.getElementById('input-p');
  const inputK = document.getElementById('input-k');
  const inputPh = document.getElementById('input-ph');

  const updateLabels = () => {
    document.getElementById('val-n').textContent = inputN.value;
    document.getElementById('val-p').textContent = inputP.value;
    document.getElementById('val-k').textContent = inputK.value;
    document.getElementById('val-ph').textContent = inputPh.value;
  };

  [inputN, inputP, inputK, inputPh].forEach((inp) => inp?.addEventListener('input', updateLabels));
  document.getElementById('btn-run-crop-engine')?.addEventListener('click', runCropEngine);

  runCropEngine();
}

function runCropEngineDashboard() {
  const profile = MemoryService.getFarmProfile();
  const results = CropEngine.recommendCrops({
    nitrogen: profile.nitrogen,
    phosphorus: profile.phosphorus,
    potassium: profile.potassium,
    ph: profile.ph,
    soilType: profile.soilType,
  });

  const best = results[0];
  document.getElementById('dash-top-crop').textContent = best.name.split(' (')[0];
  document.getElementById('dash-crop-score').textContent = `${best.matchScore}% Match (${best.suitabilityTier})`;

  const listContainer = document.getElementById('dash-top-crops-list');
  if (listContainer) {
    listContainer.innerHTML = results
      .slice(0, 3)
      .map(
        (c) => `
      <div style="background: rgba(15,23,42,0.7); border: 1px solid var(--glass-border); padding: 0.75rem 1rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">${c.icon}</span>
          <div>
            <h4 style="color: #fff; font-size: 0.95rem; font-weight: 700;">${c.name}</h4>
            <p style="color: var(--primary-400); font-size: 0.78rem; font-weight: 600;">Price: ${c.priceIndex}</p>
          </div>
        </div>
        <div class="match-badge">${c.matchScore}% Match</div>
      </div>
    `
      )
      .join('');
  }
}

function runCropEngine() {
  const inputs = {
    nitrogen: parseFloat(document.getElementById('input-n').value),
    phosphorus: parseFloat(document.getElementById('input-p').value),
    potassium: parseFloat(document.getElementById('input-k').value),
    ph: parseFloat(document.getElementById('input-ph').value),
    soilType: document.getElementById('input-soil-type').value,
    season: document.getElementById('input-season').value,
  };

  const results = CropEngine.recommendCrops(inputs);
  renderCropCards(results);
}

function renderCropCards(crops) {
  const container = document.getElementById('crop-results-container');
  if (!container) return;

  container.innerHTML = crops
    .map(
      (c) => `
    <div class="crop-card">
      <img src="${c.image}" alt="${c.name}" class="crop-image">
      <div class="crop-body">
        <div class="crop-header-row">
          <h4 class="crop-title">${c.icon} ${c.name}</h4>
          <span class="match-badge">${c.matchScore}% Match</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--primary-400); font-weight: 600;">Category: ${c.category}</div>
        
        <div class="crop-meta-row">
          <div class="crop-meta-item">⏱️ ${c.durationDays} days</div>
          <div class="crop-meta-item">🌾 ${c.expectedYield}</div>
        </div>
        <div style="font-size: 0.82rem; color: var(--amber-500); font-weight: 700; margin: 0.3rem 0;">💰 Market Rate: ${c.priceIndex}</div>

        <p style="font-size: 0.8rem; color: var(--slate-300); margin-top: 0.4rem;">💡 ${c.tips}</p>
        
        ${
          c.limitingFactors.length > 0
            ? `<div class="limiting-pill">⚠️ ${c.limitingFactors[0]}</div>`
            : `<div class="limiting-pill" style="background: rgba(16,185,129,0.15); color: var(--primary-400);">✅ Optimal Soil Match</div>`
        }
      </div>
    </div>
  `
    )
    .join('');
}

function initFertilizerTool() {
  document.getElementById('btn-calc-fert')?.addEventListener('click', runFertilizerCalculator);
  runFertilizerCalculator();
}

function runFertilizerCalculator() {
  const cropId = document.getElementById('fert-crop-select').value;
  const area = parseFloat(document.getElementById('fert-area').value);
  const unit = document.getElementById('fert-unit').value;
  const currentN = parseFloat(document.getElementById('fert-current-n').value);
  const currentP = parseFloat(document.getElementById('fert-current-p').value);
  const currentK = parseFloat(document.getElementById('fert-current-k').value);

  const profile = MemoryService.getFarmProfile();

  const res = FertilizerEngine.calculateFertilizer({
    cropId,
    area,
    unit,
    currentN,
    currentP,
    currentK,
    ph: profile.ph,
  });

  const view = document.getElementById('fert-results-view');
  if (!view) return;

  view.innerHTML = `
    <div class="glass-card" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="package"></i>
          <h3>Indian Fertilizer Requirements (${res.area} ${res.unit} ${res.cropName})</h3>
        </div>
      </div>

      <div class="grid-cols-3" style="margin-bottom: 0;">
        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1.25rem; border-radius: var(--radius-md); text-align: center;">
          <h5 style="color: var(--slate-400); font-size: 0.85rem;">NEEM COATED UREA (46% N)</h5>
          <h2 style="color: var(--primary-400); font-size: 2rem; font-weight: 800; margin: 0.3rem 0;">${res.inorganic.ureaKg} kg</h2>
          <span style="font-size: 0.85rem; color: #fff; font-weight: 600;">~${res.inorganic.ureaBags} Bags (45kg bag)</span>
        </div>

        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1.25rem; border-radius: var(--radius-md); text-align: center;">
          <h5 style="color: var(--slate-400); font-size: 0.85rem;">DAP (18% N, 46% P₂O₅)</h5>
          <h2 style="color: var(--sky-500); font-size: 2rem; font-weight: 800; margin: 0.3rem 0;">${res.inorganic.dapKg} kg</h2>
          <span style="font-size: 0.85rem; color: #fff; font-weight: 600;">~${res.inorganic.dapBags} Bags (50kg bag)</span>
        </div>

        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1.25rem; border-radius: var(--radius-md); text-align: center;">
          <h5 style="color: var(--slate-400); font-size: 0.85rem;">MOP (60% K₂O)</h5>
          <h2 style="color: var(--amber-500); font-size: 2rem; font-weight: 800; margin: 0.3rem 0;">${res.inorganic.mopKg} kg</h2>
          <span style="font-size: 0.85rem; color: #fff; font-weight: 600;">~${res.inorganic.mopBags} Bags (50kg bag)</span>
        </div>
      </div>

      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border); font-size: 0.85rem; color: var(--slate-300);">
        🌿 <strong>Organic Alternative:</strong> Apply ~${res.organic.vermiCompostTons} Tons Vermicompost + ${res.organic.jeevamrutLiters} Liters Jeevamrut bio-liquid.
      </div>
    </div>

    <div class="glass-card">
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="clock"></i>
          <h3>Split Application Schedule</h3>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${res.schedule
          .map(
            (s) => `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid var(--glass-border); border-left: 4px solid var(--primary-500); padding: 1rem; border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4 style="color: #fff; font-weight: 700;">${s.stage}</h4>
              <span style="background: rgba(255,255,255,0.1); color: var(--primary-400); padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.78rem; font-weight: 700;">${s.timeframe}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--slate-300); margin: 0.4rem 0;">${s.purpose}</p>
            <div style="font-size: 0.88rem; font-weight: 700; color: #fff;">
              Apply: Urea: ${s.ureaKg}kg | DAP: ${s.dapKg}kg | MOP: ${s.mopKg}kg
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function initIrrigationPlanner() {
  document.getElementById('btn-calc-irrig')?.addEventListener('click', runIrrigationPlanner);
  runIrrigationPlanner();
}

function runIrrigationPlanner() {
  const cropId = document.getElementById('irrig-crop-select').value;
  const stage = document.getElementById('irrig-stage-select').value;
  const systemType = document.getElementById('irrig-system-select').value;

  const profile = MemoryService.getFarmProfile();
  const forecast = currentWeatherState ? currentWeatherState.forecast : [];

  const res = IrrigationEngine.calculateSchedule({
    cropId,
    stage,
    soilType: profile.soilType.toLowerCase(),
    systemType,
    area: profile.area,
    unit: profile.unit,
    forecast,
  });

  const view = document.getElementById('irrig-results-view');
  if (!view) return;

  view.innerHTML = `
    <div class="glass-card" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="droplets"></i>
          <h3>Water Need Summary: ${res.cropName} (${res.stageName})</h3>
        </div>
      </div>
      
      <p style="color: var(--slate-300); font-size: 0.9rem; margin-bottom: 1rem;">💡 ${res.summaryAdvisory}</p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
          <span style="color: var(--slate-400); font-size: 0.8rem;">Crop Factor Kc</span>
          <h3 style="color: var(--primary-400); font-size: 1.6rem; font-weight: 800;">${res.kcValue}</h3>
        </div>
        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
          <span style="color: var(--slate-400); font-size: 0.8rem;">7-Day Water Budget</span>
          <h3 style="color: var(--sky-500); font-size: 1.6rem; font-weight: 800;">${(res.totalLiters / 1000).toFixed(1)} kL</h3>
        </div>
        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
          <span style="color: var(--slate-400); font-size: 0.8rem;">Expected Rain</span>
          <h3 style="color: var(--amber-500); font-size: 1.6rem; font-weight: 800;">${res.totalRainfallMm} mm</h3>
        </div>
      </div>
    </div>

    <div class="glass-card">
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="calendar"></i>
          <h3>7-Day Irrigation Schedule</h3>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${res.dailySchedule
          .map(
            (d) => `
          <div style="background: rgba(15,23,42,0.7); border: 1px solid var(--glass-border); padding: 0.85rem 1.1rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${d.dayName} (${d.date})</div>
              <div style="font-size: 0.8rem; color: var(--slate-400);">${d.note}</div>
            </div>
            <div style="text-align: right;">
              <span style="background: ${d.action === 'Skip Irrigation' ? 'rgba(16,185,129,0.2)' : 'rgba(14,165,233,0.2)'}; color: ${d.action === 'Skip Irrigation' ? '#10b981' : '#0ea5e9'}; padding: 0.3rem 0.75rem; border-radius: 20px; font-weight: 800; font-size: 0.82rem;">
                ${d.action}
              </span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function initDiseaseDetector() {
  const dropzone = document.getElementById('disease-dropzone');
  const fileInput = document.getElementById('disease-file-input');
  const previewImg = document.getElementById('disease-img-preview');
  const previewContainer = document.getElementById('disease-preview-container');

  dropzone?.addEventListener('click', () => fileInput.click());

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  });

  function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      previewImg.src = evt.target.result;
      previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  document.getElementById('btn-analyze-scanned-photo')?.addEventListener('click', async () => {
    const file = fileInput.files[0] || { name: 'leaf_scan.jpg' };
    const res = await DiseaseDetector.analyzeImage(file);
    renderDiseaseResults(res.disease, res.confidenceScore);
  });

  document.getElementById('btn-run-symptom-diag')?.addEventListener('click', () => {
    const cropId = document.getElementById('diag-crop-select').value;
    const checked = Array.from(document.querySelectorAll('.symptom-chip input:checked')).map((c) => c.value);

    const res = DiseaseDetector.diagnoseBySymptoms(cropId, checked);
    if (!res.matched) {
      alert(res.message);
      return;
    }
    renderDiseaseResults(res.bestMatch, res.confidenceScore);
  });
}

function renderDiseaseResults(disease, confidence) {
  const output = document.getElementById('disease-results-output');
  if (!output) return;

  output.innerHTML = `
    <div class="glass-card" style="border-left: 4px solid var(--rose-500);">
      <div class="card-header">
        <div class="card-title">
          <i data-lucide="shield-alert"></i>
          <h3>Diagnostic Result: ${disease.name}</h3>
        </div>
        <span class="match-badge" style="background: linear-gradient(135deg, var(--rose-500), #e11d48);">${confidence}% Confidence</span>
      </div>

      <p style="color: var(--slate-300); font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.25rem;">${disease.description}</p>

      <div class="grid-cols-3" style="margin-bottom: 0;">
        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md);">
          <h4 style="color: var(--primary-400); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">🌿 Organic Treatment</h4>
          <p style="font-size: 0.85rem; color: var(--slate-300);">${disease.organicTreatment}</p>
        </div>

        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md);">
          <h4 style="color: var(--sky-500); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">🔬 Chemical Control</h4>
          <p style="font-size: 0.85rem; color: var(--slate-300);">${disease.chemicalTreatment}</p>
        </div>

        <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--glass-border); padding: 1rem; border-radius: var(--radius-md);">
          <h4 style="color: var(--amber-500); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">🛡️ Prevention & Culture</h4>
          <p style="font-size: 0.85rem; color: var(--slate-300);">${disease.prevention}</p>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function initAIChat() {
  const input = document.getElementById('chat-input-text');
  const sendBtn = document.getElementById('btn-send-chat');
  const box = document.getElementById('chat-messages-box');

  const sendMessage = async (text) => {
    if (!text || text.trim() === '') return;

    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = text;
    box.appendChild(userBubble);
    input.value = '';
    box.scrollTop = box.scrollHeight;

    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble ai';
    typingBubble.textContent = 'Krishi AI is analyzing farm memory...';
    box.appendChild(typingBubble);
    box.scrollTop = box.scrollHeight;

    const response = await AIAdvisorChat.queryAdvisor(text, currentWeatherState);
    typingBubble.innerHTML = response.replace(/\n/g, '<br>');
    box.scrollTop = box.scrollHeight;
  };

  sendBtn?.addEventListener('click', () => sendMessage(input.value));
  input?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(input.value);
  });

  document.querySelectorAll('.prompt-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      sendMessage(prompt);
    });
  });
}

function initModalEvents() {
  const modal = document.getElementById('farm-profile-modal');
  const openBtn = document.getElementById('btn-open-modal');
  const closeBtn = document.getElementById('btn-close-modal');
  const editSoilBtn = document.getElementById('btn-edit-soil-dash');
  const form = document.getElementById('form-farm-profile');

  const openModal = () => {
    const profile = MemoryService.getFarmProfile();
    document.getElementById('modal-farm-name').value = profile.farmName;
    document.getElementById('modal-location-name').value = profile.locationName;
    document.getElementById('modal-area').value = profile.area;
    document.getElementById('modal-unit').value = profile.unit;
    document.getElementById('modal-n').value = profile.nitrogen;
    document.getElementById('modal-p').value = profile.phosphorus;
    document.getElementById('modal-k').value = profile.potassium;
    document.getElementById('modal-ph').value = profile.ph;

    modal.classList.add('active');
  };

  const closeModal = () => modal.classList.remove('active');

  openBtn?.addEventListener('click', openModal);
  editSoilBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      farmName: document.getElementById('modal-farm-name').value,
      locationName: document.getElementById('modal-location-name').value,
      area: parseFloat(document.getElementById('modal-area').value),
      unit: document.getElementById('modal-unit').value,
      nitrogen: parseFloat(document.getElementById('modal-n').value),
      phosphorus: parseFloat(document.getElementById('modal-p').value),
      potassium: parseFloat(document.getElementById('modal-k').value),
      ph: parseFloat(document.getElementById('modal-ph').value),
      soilType: document.getElementById('input-soil-type')?.value || 'Alluvial',
      primaryCrop: 'wheat',
      irrigationSystem: 'drip',
    };

    MemoryService.saveFarmProfile(updated);
    renderFarmProfile();
    runCropEngineDashboard();
    closeModal();
  });
}
