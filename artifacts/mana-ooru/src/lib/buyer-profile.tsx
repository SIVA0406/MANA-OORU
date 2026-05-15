import { createContext, useContext, useState } from "react";

export type UserRole = "buyer" | "farmer";

export interface BuyerProfile {
  name: string;
  photoUrl: string | null;
  role: UserRole;
  mobile: string;
  aadhar: string;
  bankAccount: string;
  ifscCode: string;
  bankName?: string;
  village?: string;
}

interface BuyerProfileContextValue {
  profile: BuyerProfile | null;
  setProfile: (p: BuyerProfile) => void;
  updateProfile: (partial: Partial<BuyerProfile>) => void;
  isSetupDone: boolean;
}

const BuyerProfileContext = createContext<BuyerProfileContextValue | null>(null);

const STORAGE_KEY = "mana-ooru-buyer-v2";

export function BuyerProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<BuyerProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as BuyerProfile;
      if (!parsed.role || !parsed.mobile) return null;
      return parsed;
    } catch {
      return null;
    }
  });

  const setProfile = (p: BuyerProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfileState(p);
  };

  const updateProfile = (partial: Partial<BuyerProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfileState(updated);
  };

  return (
    <BuyerProfileContext.Provider value={{ profile, setProfile, updateProfile, isSetupDone: !!profile }}>
      {children}
    </BuyerProfileContext.Provider>
  );
}

export function useBuyerProfile() {
  const ctx = useContext(BuyerProfileContext);
  if (!ctx) throw new Error("useBuyerProfile must be used within BuyerProfileProvider");
  return ctx;
}
