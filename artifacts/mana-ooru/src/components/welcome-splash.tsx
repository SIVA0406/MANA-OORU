import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout } from "lucide-react";
import { useBuyerProfile } from "@/lib/buyer-profile";
import { useLanguage } from "@/lib/language";

export function WelcomeSplash({ onDone }: { onDone: () => void }) {
  const { profile } = useBuyerProfile();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 cursor-pointer select-none"
          onClick={() => setVisible(false)}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/5"
                style={{
                  width: Math.random() * 120 + 40,
                  height: Math.random() * 120 + 40,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
              <Sprout className="w-16 h-16 text-green-200" />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-white tracking-tight">{t.appName}</h1>
              <p className="text-green-200 mt-1 text-base">{t.appSubtitle}</p>
            </motion.div>

            {profile && (
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center gap-3 mt-2"
              >
                {profile.photoUrl ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                    <img
                      src={`/api/storage${profile.photoUrl}`}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-xl">
                    <span className="text-3xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-green-100 text-sm">{t.welcomeBack}</p>
                  <p className="text-white text-xl font-semibold">{profile.name}</p>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-green-300/60 text-xs mt-4"
            >
              {t.tapToContinue}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
