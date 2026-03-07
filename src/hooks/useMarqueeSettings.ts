import { useState, useEffect } from 'react';
import type { MarqueeSettings } from '@/components/Admin';

const DEFAULT_TEXT = "مؤسسة حسين إبراهيم حسين للمجوهرات و للذهب ☆ أفضل أسعار الذهب ☆ سبيكة ذهب عيار 24 ☆ توصيل لجميع المناطق ☆ مؤسسة حسين إبراهيم حسين للمجوهرات و للذهب ☆ أفضل أسعار الذهب ☆ سبيكة ذهب عيار 24 ☆ توصيل لجميع المناطق ☆";
const STORAGE_KEY = 'marquee_settings';

export const useMarqueeSettings = () => {
  const [settings, setSettings] = useState<MarqueeSettings>({
    text: DEFAULT_TEXT,
    enabled: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          text: parsed.text || DEFAULT_TEXT,
          enabled: parsed.enabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading marquee settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = (newSettings: Partial<MarqueeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving marquee settings:', error);
      }
      return updated;
    });
  };

  const setText = (text: string) => updateSettings({ text });
  const setEnabled = (enabled: boolean) => updateSettings({ enabled });

  return {
    settings,
    setText,
    setEnabled,
    updateSettings,
    isLoaded,
  };
};
