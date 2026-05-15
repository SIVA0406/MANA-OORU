import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Camera, Loader2, Tractor, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBuyerProfile } from "@/lib/buyer-profile";
import { useLanguage } from "@/lib/language";

type Role = "farmer" | "buyer";

export function BuyerSetupModal({ onDone }: { onDone: () => void }) {
  const { setProfile } = useBuyerProfile();
  const { t } = useLanguage();
  const [step, setStep] = useState<"role" | "name">("role");
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep("name");
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role) return;
    setProfile({ name: name.trim(), photoUrl, role });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm mx-4 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-green-700 to-emerald-600 p-6 flex flex-col items-center gap-3">
          <div className="bg-white/10 rounded-2xl p-3">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-bold">{t.appName}</h2>
            <p className="text-green-100 text-sm">{t.appSubtitle}</p>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-foreground font-semibold text-base">{t.roleSelectTitle}</p>
                  <p className="text-muted-foreground text-sm mt-1">{t.roleSelectSubtitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("farmer")}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Tractor className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm text-foreground">{t.roleFarmer}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t.roleFarmerDesc}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("buyer")}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <ShoppingBag className="w-6 h-6 text-blue-700" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm text-foreground">{t.roleBuyer}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{t.roleBuyerDesc}</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === "name" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                      {role === "farmer" ? <Tractor className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                      {role === "farmer" ? t.roleFarmer : t.roleBuyer}
                    </div>
                    <p className="text-foreground font-semibold text-base">{t.setupTitle}</p>
                    <p className="text-muted-foreground text-sm mt-1">{t.setupSubtitle}</p>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={uploading}
                      className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-dashed border-primary/40 hover:border-primary transition-colors bg-muted flex items-center justify-center group"
                    >
                      {previewSrc ? (
                        <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                          <Camera className="w-6 h-6" />
                          <span className="text-[9px] font-medium">{t.addPhoto}</span>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground">{t.buyerPhotoHint}</p>
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                  />

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">{t.yourName}</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.buyerNamePlaceholder}
                      className="text-center"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("role")}
                      className="flex-1"
                    >
                      {t.back}
                    </Button>
                    <Button
                      type="submit"
                      disabled={!name.trim() || uploading}
                      className="flex-1 font-semibold"
                    >
                      <ArrowRight className="w-4 h-4 mr-1" />
                      {t.getStarted}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
