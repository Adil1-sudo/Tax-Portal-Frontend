
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiRequest } from "../services/api";

const defaultSettings = {
  businessName: "Zafar Law Chamber",
  email: "",
  phone: "",
  website: "",
  address: "",
  currency: "PKR",
  timezone: "Asia/Karachi",
};

const BusinessSettingsContext = createContext(null);

export function BusinessSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const refreshBusinessSettings = useCallback(async () => {
    try {
      const result = await apiRequest("/public/settings");
      setSettings({
        ...defaultSettings,
        ...(result.settings || {}),
      });
    } catch (error) {
      // Keep defaults if the API is temporarily unavailable.
      console.error("Unable to load business settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBusinessSettings();
  }, [refreshBusinessSettings]);

  return (
    <BusinessSettingsContext.Provider
      value={{
        settings,
        settingsLoading,
        refreshBusinessSettings,
      }}
    >
      {children}
    </BusinessSettingsContext.Provider>
  );
}

export function useBusinessSettings() {
  const context = useContext(BusinessSettingsContext);

  if (!context) {
    throw new Error(
      "useBusinessSettings must be used inside BusinessSettingsProvider."
    );
  }

  return context;
}
