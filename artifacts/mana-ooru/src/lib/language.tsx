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
    fieldCropGrade: "Crop Grade",
    fieldHarvestDate: "Harvest Date",
    fieldNotes: "Notes / Remarks",
    fieldMedia: "Photos & Videos",

    cropGradePlaceholder: "e.g. A, B, Grade 1",
    notesPlaceholder: "Any additional remarks...",
    uploadMedia: "Upload Photos / Videos",
    uploading: "Uploading...",
    uploadDone: "uploaded",
    mediaSection: "Crop Media",
    removeMedia: "Remove",
    viewMedia: "View",

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
    gradeLabel: "Grade",

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
    toastUploadFailed: "Failed to upload file.",
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

    summaryFarmers: "Total Farmers",
    summaryQuantity: "Total Quantity",
    summaryPending: "Pending Payments",
    summaryCompleted: "Completed Payments",

    logout: "Log Out",
    back: "Back",
    next: "Next",
    skipForNow: "Skip for now",
    verified: "Verified",

    mobileVerification: "Mobile Verification",
    enterMobile: "Enter your mobile number",
    enterMobileHint: "We will send a 6-digit OTP to verify your number.",
    sendOtp: "Send OTP",
    enterOtp: "000000",
    verifyOtp: "Verify OTP",
    resendOtp: "Resend OTP",
    demoOtpHint: "Demo OTP",
    otpVerified: "Mobile verified",

    personalDetails: "Personal Details",
    aadharNumber: "Aadhaar Number",
    farmerNamePlaceholder: "e.g. Ramu Reddy",

    bankDetails: "Bank Details",
    bankDetailsHint: "Your payment will be credited to this account.",
    bankAccountNumber: "Bank Account Number",
    ifscCode: "IFSC Code",
    bankName: "Bank Name",

    farmerPortalTitle: "Farmer Portal",
    farmerWelcome: "Welcome",
    farmerSubmitSubtitle: "Submit your crop details for procurement.",
    submitCrop: "Submit Crop",
    submitCropTitle: "Submit New Crop",
    submitCropBtn: "Submit Crop",
    cropSubmitted: "Crop submitted successfully!",
    cropSubmittedDesc: "Your crop record has been added. The buyer will review it.",
    mySubmissions: "My Submissions",

    roleSelectTitle: "Who are you?",
    roleSelectSubtitle: "Select your role to get started.",
    roleFarmer: "Farmer",
    roleFarmerDesc: "I bring crops to sell.",
    roleBuyer: "Buyer / Agent",
    roleBuyerDesc: "I procure crops from farmers.",

    cropStatusLabel: "Crop Status",
    cropStatusNone: "Not Set",
    cropStatusOnHold: "On Hold",
    cropStatusPartiallySold: "Partially Sold",
    cropStatusFullySold: "Fully Sold",
    cropStatusSoldOut: "Sold Out",

    filterAll: "All Records",
    filterPending: "Pending Payments",
    filterCompleted: "Completed Payments",
    filterByVillage: "Village",
    filterByCrop: "Crop",
    clearFilter: "Clear Filter",

    clickToView: "Click to view",

    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to access the procurement platform.",
    loginButton: "Log In",
    loginHint: "Secure login powered by your account.",
    loginFeature1: "Track Farmers",
    loginFeature2: "Payments",
    loginFeature3: "Analytics",

    setupTitle: "Welcome, Buyer!",
    setupSubtitle: "Tell us about yourself to get started.",
    welcomeBack: "Welcome back,",
    tapToContinue: "Tap anywhere to continue",
    addPhoto: "Add Photo",
    buyerPhotoHint: "Optional — tap to upload your photo",
    yourName: "Your Name",
    buyerNamePlaceholder: "e.g. Ravi Shankar",
    getStarted: "Get Started",
    fieldFarmerPhoto: "Farmer Photo",
    farmerPhotoHint: "Optional profile photo",
    editProfile: "Edit Profile",

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
    fieldCropGrade: "పంట గ్రేడ్",
    fieldHarvestDate: "పంట కోత తేదీ",
    fieldNotes: "గమనికలు / వ్యాఖ్యలు",
    fieldMedia: "ఫోటోలు & వీడియోలు",

    cropGradePlaceholder: "ఉదా: A, B, గ్రేడ్ 1",
    notesPlaceholder: "ఏదైనా అదనపు వ్యాఖ్యలు...",
    uploadMedia: "ఫోటోలు / వీడియోలు అప్లోడ్ చేయి",
    uploading: "అప్లోడ్ అవుతోంది...",
    uploadDone: "అప్లోడ్",
    mediaSection: "పంట మీడియా",
    removeMedia: "తొలగించు",
    viewMedia: "చూడు",

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
    gradeLabel: "గ్రేడ్",

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
    toastUploadFailed: "ఫైల్ అప్లోడ్ విఫలమైంది.",
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

    summaryFarmers: "మొత్తం రైతులు",
    summaryQuantity: "మొత్తం పరిమాణం",
    summaryPending: "పెండింగ్ చెల్లింపులు",
    summaryCompleted: "పూర్తయిన చెల్లింపులు",

    logout: "లాగ్ అవుట్",
    back: "వెనుకకు",
    next: "తదుపరి",
    skipForNow: "ఇప్పుడు దాటవేయి",
    verified: "ధృవీకరించారు",

    mobileVerification: "మొబైల్ ధృవీకరణ",
    enterMobile: "మీ మొబైల్ నంబర్ నమోదు చేయండి",
    enterMobileHint: "మేము మీ నంబర్‌ను ధృవీకరించడానికి 6-అంకెల OTP పంపుతాము.",
    sendOtp: "OTP పంపండి",
    enterOtp: "000000",
    verifyOtp: "OTP ధృవీకరించండి",
    resendOtp: "OTP మళ్ళీ పంపండి",
    demoOtpHint: "డెమో OTP",
    otpVerified: "మొబైల్ ధృవీకరించబడింది",

    personalDetails: "వ్యక్తిగత వివరాలు",
    aadharNumber: "ఆధార్ నంబర్",
    farmerNamePlaceholder: "ఉదా: రాము రెడ్డి",

    bankDetails: "బ్యాంక్ వివరాలు",
    bankDetailsHint: "మీ చెల్లింపు ఈ ఖాతాకు జమ చేయబడుతుంది.",
    bankAccountNumber: "బ్యాంక్ ఖాతా నంబర్",
    ifscCode: "IFSC కోడ్",
    bankName: "బ్యాంక్ పేరు",

    farmerPortalTitle: "రైతు పోర్టల్",
    farmerWelcome: "స్వాగతం",
    farmerSubmitSubtitle: "మీ పంట వివరాలను కొనుగోలు కోసం నమోదు చేయండి.",
    submitCrop: "పంట నమోదు",
    submitCropTitle: "కొత్త పంట నమోదు",
    submitCropBtn: "పంట నమోదు చేయి",
    cropSubmitted: "పంట విజయంగా నమోదైంది!",
    cropSubmittedDesc: "మీ పంట రికార్డు జోడించబడింది. కొనుగోలుదారు సమీక్షిస్తారు.",
    mySubmissions: "నా నమోదులు",

    roleSelectTitle: "మీరు ఎవరు?",
    roleSelectSubtitle: "ప్రారంభించడానికి మీ పాత్రను ఎంచుకోండి.",
    roleFarmer: "రైతు",
    roleFarmerDesc: "నేను పంటలు అమ్మడానికి తీసుకొస్తాను.",
    roleBuyer: "కొనుగోలుదారు / ఏజెంట్",
    roleBuyerDesc: "నేను రైతుల నుండి పంటలు కొనుగోలు చేస్తాను.",

    cropStatusLabel: "పంట స్థితి",
    cropStatusNone: "నిర్ణయించబడలేదు",
    cropStatusOnHold: "నిలిపి ఉంచారు",
    cropStatusPartiallySold: "పాక్షికంగా అమ్మారు",
    cropStatusFullySold: "పూర్తిగా అమ్మారు",
    cropStatusSoldOut: "స్టాక్ అయిపోయింది",

    filterAll: "అన్ని రికార్డులు",
    filterPending: "పెండింగ్ చెల్లింపులు",
    filterCompleted: "పూర్తయిన చెల్లింపులు",
    filterByVillage: "గ్రామం",
    filterByCrop: "పంట",
    clearFilter: "ఫిల్టర్ తొలగించు",

    clickToView: "క్లిక్ చేసి చూడండి",

    loginTitle: "స్వాగతం",
    loginSubtitle: "కొనుగోలు వేదికను యాక్సెస్ చేయడానికి లాగిన్ చేయండి.",
    loginButton: "లాగిన్",
    loginHint: "మీ ఖాతాతో సురక్షిత లాగిన్.",
    loginFeature1: "రైతుల ట్రాకింగ్",
    loginFeature2: "చెల్లింపులు",
    loginFeature3: "విశ్లేషణలు",

    setupTitle: "స్వాగతం, బయ్యర్!",
    setupSubtitle: "ప్రారంభించడానికి మీ గురించి చెప్పండి.",
    welcomeBack: "స్వాగతం,",
    tapToContinue: "కొనసాగించడానికి నొక్కండి",
    addPhoto: "ఫోటో జోడించు",
    buyerPhotoHint: "ఐచ్ఛికం — మీ ఫోటో అప్లోడ్ చేయడానికి నొక్కండి",
    yourName: "మీ పేరు",
    buyerNamePlaceholder: "ఉదా. రవి శంకర్",
    getStarted: "ప్రారంభించు",
    fieldFarmerPhoto: "రైతు ఫోటో",
    farmerPhotoHint: "ఐచ్ఛిక ప్రొఫైల్ ఫోటో",
    editProfile: "ప్రొఫైల్ మార్చు",

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
