/**
 * Indian Farm Profile & Memory Service
 */

const STORAGE_KEYS = {
  FARM_PROFILE: 'agri_advisor_farm_profile_in',
  DIAGNOSTICS: 'agri_advisor_diagnostics_log_in',
  RECOMMENDATIONS: 'agri_advisor_recommendations_log_in',
  CHAT_HISTORY: 'agri_advisor_chat_history_in',
};

export const MemoryService = {
  getFarmProfile() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FARM_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored profile:', e);
    }

    return {
      farmName: 'Kisan Vikas Agro Farm',
      farmerName: 'Gurpreet Singh',
      locationName: 'Ludhiana, Punjab',
      latitude: 30.9010,
      longitude: 75.8573,
      area: 5,
      unit: 'acre',
      soilType: 'Alluvial',
      ph: 6.8,
      nitrogen: 95,
      phosphorus: 48,
      potassium: 58,
      primaryCrop: 'wheat',
      irrigationSystem: 'drip',
    };
  },

  saveFarmProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.FARM_PROFILE, JSON.stringify(profile));
      return true;
    } catch (e) {
      return false;
    }
  },

  getChatHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  saveChatHistory(messages) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (e) {}
  },

  clearChatHistory() {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },
};
