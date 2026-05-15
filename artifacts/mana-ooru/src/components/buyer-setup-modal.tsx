import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Camera, Loader2, ArrowRight, Phone, KeyRound, User, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBuyerProfile } from "@/lib/buyer-profile";
import type { BuyerProfile } from "@/lib/buyer-profile";
import { useLanguage } from "@/lib/language";
import farmerImg from "@/assets/role-farmer.png";
import buyerImg from "@/assets/role-buyer.png";

type Role = "farmer" | "buyer";
type Step = "role" | "mobile" | "personal" | "bank";

const STEPS: Step[] = ["role", "mobile", "personal", "bank"];
const STEP_LABELS = ["Role", "Mobile", "Details", "Bank"];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-1.5 mb-5">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
              i < idx ? "bg-primary text-primary-foreground" :
              i === idx ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1" :
              "bg-muted text-muted-foreground"
            }`}
          >
            {i < idx ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-6 rounded ${i < idx ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function BuyerSetupModal({ onDone }: { onDone: () => void }) {
  const { setProfile } = useBuyerProfile();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [aadhar, setAadhar] = useState("");
  const [village, setVillage] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (file: File) => {
    setPreviewSrc(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      const { uploadURL, objectPath } = await res.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      setPhotoUrl(objectPath as string);
    } catch {
      setPreviewSrc(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSendOtp = async () => {
    if (mobile.length < 10) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json() as { success?: boolean; devOtp?: string; error?: string };
      if (data.success) {
        setOtpSent(true);
        if (data.devOtp) setDevOtp(data.devOtp);
      } else {
        setOtpError(data.error ?? "Failed to send OTP.");
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        setMobileVerified(true);
        setStep("personal");
      } else {
        setOtpError(data.error ?? "Invalid OTP.");
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFinish = () => {
    const profile: BuyerProfile = {
      name: name.trim() || mobile,
      photoUrl,
      role: role!,
      mobile,
      aadhar,
      bankAccount,
      ifscCode,
      bankName,
      village,
    };
    setProfile(profile);
    onDone();
  };

  const canGoPersonal = name.trim().length > 0;
  const canGoBank = true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 230, damping: 24 }}
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm overflow-hidden"
      >
        <div className="bg-gradient-to-br from-green-700 to-emerald-600 p-5 flex items-center gap-3">
          <div className="bg-white/15 rounded-xl p-2.5">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold leading-tight">{t.appName}</h2>
            <p className="text-green-100 text-xs">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="p-5">
          {step !== "role" && <StepIndicator current={step} />}

          <AnimatePresence mode="wait">
            {step === "role" && (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-center font-semibold text-base text-foreground mb-1">{t.roleSelectTitle}</p>
                <p className="text-center text-muted-foreground text-sm mb-5">{t.roleSelectSubtitle}</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { role: "farmer" as Role, img: farmerImg, label: t.roleFarmer, desc: t.roleFarmerDesc },
                    { role: "buyer" as Role, img: buyerImg, label: t.roleBuyer, desc: t.roleBuyerDesc },
                  ]).map(({ role: r, img, label, desc }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setStep("mobile"); }}
                      className="flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <img
                        src={img}
                        alt={label}
                        className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div className="text-center">
                        <p className="font-semibold text-sm text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "mobile" && (
              <motion.div key="mobile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-3">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">{t.mobileVerification}</span>
                  </div>
                  <p className="font-semibold text-base text-foreground">{t.enterMobile}</p>
                  <p className="text-muted-foreground text-xs mt-1">{t.enterMobileHint}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 rounded-md border bg-muted text-sm font-medium text-muted-foreground shrink-0">
                      +91
                    </div>
                    <Input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "")); setOtpSent(false); setOtp(""); setDevOtp(""); }}
                      placeholder="9876543210"
                      className="flex-1"
                      autoFocus
                    />
                  </div>

                  {!otpSent ? (
                    <Button
                      onClick={handleSendOtp}
                      disabled={mobile.length < 10 || otpLoading}
                      className="w-full"
                    >
                      {otpLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                      {t.sendOtp}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      {devOtp && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                          <p className="text-xs text-amber-800">
                            {t.demoOtpHint}: <span className="font-bold tracking-widest">{devOtp}</span>
                          </p>
                        </div>
                      )}
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                        placeholder={t.enterOtp}
                        className="text-center text-2xl font-bold tracking-[0.5em] h-14"
                        autoFocus
                      />
                      {otpError && <p className="text-xs text-destructive text-center">{otpError}</p>}
                      <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || otpLoading} className="w-full">
                        {otpLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        {t.verifyOtp}
                      </Button>
                      <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="w-full text-xs text-muted-foreground hover:text-primary text-center transition-colors">
                        {t.resendOtp}
                      </button>
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="sm" onClick={() => setStep("role")} className="w-full text-muted-foreground">{t.back}</Button>
              </motion.div>
            )}

            {step === "personal" && (
              <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full mb-3">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">+91 {mobile} {t.verified}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">{t.personalDetails}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="relative w-18 h-18 rounded-full overflow-hidden border-3 border-dashed border-primary/40 hover:border-primary transition-colors bg-muted flex items-center justify-center group w-[72px] h-[72px]"
                  >
                    {previewSrc ? <img src={previewSrc} alt="you" className="w-full h-full object-cover" /> : <Camera className="w-7 h-7 text-muted-foreground group-hover:text-primary" />}
                    {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                  </button>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{t.addPhoto}</p>
                  <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])} />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground">{t.yourName} *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={role === "farmer" ? t.farmerNamePlaceholder : t.buyerNamePlaceholder} className="mt-1" autoFocus />
                  </div>
                  {role === "farmer" && (
                    <div>
                      <label className="text-xs font-medium text-foreground">{t.fieldVillage}</label>
                      <Input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g. Kondapur" className="mt-1" />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-foreground">{t.aadharNumber}</label>
                    <Input
                      value={aadhar}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                        const formatted = digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
                        setAadhar(formatted);
                      }}
                      placeholder="XXXX-XXXX-XXXX"
                      className="mt-1"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" onClick={() => setStep("mobile")} className="flex-1">{t.back}</Button>
                  <Button onClick={() => setStep("bank")} disabled={!canGoPersonal} className="flex-1">
                    <ArrowRight className="w-4 h-4 mr-1" />{t.next}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "bank" && (
              <motion.div key="bank" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-2">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">{t.bankDetails}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{t.bankDetailsHint}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground">{t.bankAccountNumber}</label>
                    <Input
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ""))}
                      placeholder="12345678901"
                      inputMode="numeric"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">{t.ifscCode}</label>
                    <Input
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="SBIN0001234"
                      className="mt-1 font-mono uppercase"
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">{t.bankName}</label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. State Bank of India" className="mt-1" />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" onClick={() => setStep("personal")} className="flex-1">{t.back}</Button>
                  <Button onClick={handleFinish} disabled={!canGoBank} className="flex-1 bg-green-700 hover:bg-green-800">
                    <Check className="w-4 h-4 mr-1" />{t.getStarted}
                  </Button>
                </div>
                <button type="button" onClick={handleFinish} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                  {t.skipForNow}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
