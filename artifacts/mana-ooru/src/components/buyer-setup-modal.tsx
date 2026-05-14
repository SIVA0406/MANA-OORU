import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sprout, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBuyerProfile } from "@/lib/buyer-profile";
import { useLanguage } from "@/lib/language";

export function BuyerSetupModal({ onDone }: { onDone: () => void }) {
  const { setProfile } = useBuyerProfile();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProfile({ name: name.trim(), photoUrl });
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-foreground font-semibold text-base">{t.setupTitle}</p>
            <p className="text-muted-foreground text-sm mt-1">{t.setupSubtitle}</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-dashed border-primary/40 hover:border-primary transition-colors bg-muted flex items-center justify-center group"
            >
              {previewSrc ? (
                <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                  <Camera className="w-7 h-7" />
                  <span className="text-[10px] font-medium">{t.addPhoto}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
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

          <Button
            type="submit"
            disabled={!name.trim() || uploading}
            className="w-full font-semibold"
            size="lg"
          >
            {t.getStarted}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
