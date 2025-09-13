"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  companyName: string;
  logoUrl: string;
  contactDetails: string;
}

const defaultSettings: Settings = {
  companyName: 'CRT Reports Dashboard',
  logoUrl: '',
  contactDetails: 'contact@crtdashboard.com',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem('apex-settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
    } catch (error) {
        // Do nothing if localStorage is not available
    }
  }, []);

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('apex-settings', JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
