import { motion } from "framer-motion";
import { Sprout, LogIn, Tractor, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";
import { useLanguage } from "@/lib/language";

export default function LoginPage() {
  const { login } = useAuth();
  const { t, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 130 + 40,
              height: Math.random() * 130 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="inline-flex bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 shadow-2xl mb-5"
          >
            <Sprout className="w-14 h-14 text-green-200" />
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white"
          >
            {t.appName}
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-green-200 mt-1 text-base"
          >
            {t.appSubtitle}
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-7">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{t.loginTitle}</h2>
            <p className="text-gray-500 text-sm text-center mb-6">{t.loginSubtitle}</p>

            <div className="grid grid-cols-3 gap-3 mb-7">
              {[
                { icon: Tractor, label: t.loginFeature1 },
                { icon: Users, label: t.loginFeature2 },
                { icon: BarChart3, label: t.loginFeature3 },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 border border-green-100">
                  <Icon className="w-5 h-5 text-green-700" />
                  <span className="text-[10px] font-medium text-green-800 text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={login}
              size="lg"
              className="w-full font-semibold bg-green-700 hover:bg-green-800 text-white shadow-md"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t.loginButton}
            </Button>

            <p className="text-xs text-gray-400 text-center mt-4">{t.loginHint}</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={toggleLanguage}
          className="mt-5 mx-auto block text-green-200/70 text-sm hover:text-green-100 transition-colors"
        >
          {t.langToggle}
        </motion.button>
      </motion.div>
    </div>
  );
}
