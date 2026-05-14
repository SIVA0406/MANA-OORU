import { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "te";

const translations = {
  en: {
    appName: "Mana Ooru",
    appSubtitle: "Smart Village Crop Procurement",

    navProcurement: "Procurement",
    navDashboard: "Dashboard",

    procurementTitle: "Procurement Register",
    procurementSubtitle: "Manage and track daily crop procurement from village farmers.",
    addRecord: "Add Record",
    newRecord: "New Procurement Record",
    editRecord: "Edit Procurement Record",

    colFarmer: "Farmer",
    colLocation: "Location",
    colCropDetail: "Crop Detail",
    colPayment: "Payment",
    colActions: "Actions",

    fieldFarmerName: "Farmer Name",
    fieldVillage: "Village",
    fieldCrop: "Crop",
    fieldQuantity: "Quantity (Quintals)",
    fieldMoisture: "Moisture %",
    fieldBankAccount: "Bank Account",

    saveRecord: "Save Record",
    updateRecord: "Update Record",
    saving: "Saving...",

    pay: "Pay",
    revert: "Revert",
    edit: "Edit",
    delete: "Delete",
    pending: "Pending",
    completed: "Completed",

    idLabel: "ID:",
    qt: "Qt",
    moist: "Moist.",

    noRecords: "No records yet",
    noRecordsHint: "Add a farmer to start tracking procurement.",

    toastFarmerSaved: "Farmer recorded",
    toastFarmerSavedDesc: "The procurement record has been saved.",
    toastUpdated: "Record updated",
    toastDeleted: "Record deleted",
    toastPaymentUpdated: "Payment status updated",
    toastError: "Error",
    toastSaveFailed: "Failed to save farmer record.",
    toastUpdateFailed: "Failed to update record.",
    confirmDelete: "Are you sure you want to delete this record?",

    dashboardTitle: "Dashboard",
    dashboardSubtitle: "Season procurement summary across all villages.",
    statFarmers: "Total Farmers",
    statQuantity: "Total Quantity",
    statCompleted: "Completed Payments",
    statPending: "Pending Payments",
    villagesServed: "Villages Served",
    cropsHandled: "Crops Handled",
    noVillages: "No villages recorded.",
    noCrops: "No crops recorded.",

    langToggle: "తెలుగు",
  },
  te: {
    appName: "మన ఊరు",
    appSubtitle: "స్మార్ట్ గ్రామ పంట కొనుగోలు",

    navProcurement: "కొనుగోలు",
    navDashboard: "డాష్‌బోర్డ్",

    procurementTitle: "కొనుగోలు నమోదు",
    procurementSubtitle: "గ్రామ రైతుల నుండి రోజువారీ పంట కొనుగోలును నిర్వహించండి.",
    addRecord: "రికార్డు జోడించు",
    newRecord: "కొత్త కొనుగోలు రికార్డు",
    editRecord: "కొనుగోలు రికార్డు మార్చు",

    colFarmer: "రైతు",
    colLocation: "స్థానం",
    colCropDetail: "పంట వివరాలు",
    colPayment: "చెల్లింపు",
    colActions: "చర్యలు",

    fieldFarmerName: "రైతు పేరు",
    fieldVillage: "గ్రామం",
    fieldCrop: "పంట",
    fieldQuantity: "పరిమాణం (క్వింటాళ్లు)",
    fieldMoisture: "తేమ %",
    fieldBankAccount: "బ్యాంకు ఖాతా",

    saveRecord: "రికార్డు సేవ్ చేయి",
    updateRecord: "రికార్డు నవీకరించు",
    saving: "సేవ్ అవుతోంది...",

    pay: "చెల్లించు",
    revert: "వెనక్కి",
    edit: "మార్చు",
    delete: "తొలగించు",
    pending: "పెండింగ్",
    completed: "పూర్తయింది",

    idLabel: "ఐడి:",
    qt: "క్వి",
    moist: "తేమ.",

    noRecords: "రికార్డులు లేవు",
    noRecordsHint: "కొనుగోలు ట్రాకింగ్ ప్రారంభించడానికి రైతును జోడించండి.",

    toastFarmerSaved: "రైతు నమోదు చేయబడ్డారు",
    toastFarmerSavedDesc: "కొనుగోలు రికార్డు సేవ్ చేయబడింది.",
    toastUpdated: "రికార్డు నవీకరించబడింది",
    toastDeleted: "రికార్డు తొలగించబడింది",
    toastPaymentUpdated: "చెల్లింపు స్థితి నవీకరించబడింది",
    toastError: "లోపం",
    toastSaveFailed: "రైతు రికార్డు సేవ్ చేయడం విఫలమైంది.",
    toastUpdateFailed: "రికార్డు నవీకరించడం విఫలమైంది.",
    confirmDelete: "మీరు ఈ రికార్డును తొలగించాలనుకుంటున్నారా?",

    dashboardTitle: "డాష్‌బోర్డ్",
    dashboardSubtitle: "అన్ని గ్రామాల వ్యాప్తంగా సీజన్ కొనుగోలు సారాంశం.",
    statFarmers: "మొత్తం రైతులు",
    statQuantity: "మొత్తం పరిమాణం",
    statCompleted: "పూర్తయిన చెల్లింపులు",
    statPending: "పెండింగ్ చెల్లింపులు",
    villagesServed: "సేవలు అందిన గ్రామాలు",
    cropsHandled: "నిర్వహించిన పంటలు",
    noVillages: "గ్రామాలు నమోదు కాలేదు.",
    noCrops: "పంటలు నమోదు కాలేదు.",

    langToggle: "English",
  },
};

export type Translations = typeof translations.en;

interface LanguageContextValue {
  lang: Language;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem("mana-ooru-lang");
    return (stored === "te" ? "te" : "en") as Language;
  });

  useEffect(() => {
    localStorage.setItem("mana-ooru-lang", lang);
  }, [lang]);

  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "te" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
