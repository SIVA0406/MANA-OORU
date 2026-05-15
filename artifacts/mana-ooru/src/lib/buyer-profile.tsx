import { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "buyer" | "farmer";

export interface BuyerProfile {
  name: string;
  photoUrl: string | null;
  role: UserRole;
}

interface BuyerProfileContextValue {
  profile: BuyerProfile | null;
  setProfile: (p: BuyerProfile) => void;
  isSetupDone: boolean;
}

const BuyerProfileContext = createContext<BuyerProfileContextValue | null>(null);

const STORAGE_KEY = "mana-ooru-buyer";

export function BuyerProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<BuyerProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as BuyerProfile;
      if (!parsed.role) return null;
      return parsed;
    } catch {
      return null;
    }
  });

  const setProfile = (p: BuyerProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfileState(p);
  };

  return (
    <BuyerProfileContext.Provider value={{ profile, setProfile, isSetupDone: !!profile }}>
      {children}
    </BuyerProfileContext.Provider>
  );
}

export function useBuyerProfile() {
  const ctx = useContext(BuyerProfileContext);
  if (!ctx) throw new Error("useBuyerProfile must be used within BuyerProfileProvider");
  return ctx;
}
