export interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  practitionerName: string;
  practitionerTitle: string;
  address: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Vision Eye Care',
  phone: '+91 90045 12000',
  email: 'info@visioneyecare.com',
  practitionerName: 'Kiran Shantaram Sanap',
  practitionerTitle: 'Optometrist',
  address: '123 Specs Market Mall, Optical Corridor, Mumbai 400001'
};

export function getStoreSettings(): StoreSettings {
  try {
    const stored = localStorage.getItem('vision_eyecare_store_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse store settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoreSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem('vision_eyecare_store_settings', JSON.stringify(settings));
    // Dispatch custom event to notify other components/windows
    window.dispatchEvent(new Event('store_settings_updated'));
  } catch (e) {
    console.error('Failed to save store settings:', e);
  }
}
