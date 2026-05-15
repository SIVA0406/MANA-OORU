import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

interface OtpEntry {
  otp: string;
  expiry: number;
}

const otpStore = new Map<string, OtpEntry>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/otp/send", (req: Request, res: Response) => {
  const { mobile } = req.body as { mobile?: string };

  if (!mobile || mobile.length < 10) {
    res.status(400).json({ error: "Valid mobile number required." });
    return;
  }

  const otp = generateOtp();
  const expiry = Date.now() + 10 * 60 * 1000;

  otpStore.set(mobile, { otp, expiry });

  req.log.info({ mobile: mobile.slice(-4).padStart(mobile.length, "*") }, "OTP generated");

  res.json({ success: true, devOtp: otp });
});

router.post("/otp/verify", (req: Request, res: Response) => {
  const { mobile, otp } = req.body as { mobile?: string; otp?: string };

  if (!mobile || !otp) {
    res.status(400).json({ error: "Mobile and OTP are required." });
    return;
  }

  const entry = otpStore.get(mobile);
  if (!entry) {
    res.status(400).json({ error: "OTP not found. Please request a new one." });
    return;
  }

  if (Date.now() > entry.expiry) {
    otpStore.delete(mobile);
    res.status(400).json({ error: "OTP has expired. Please request a new one." });
    return;
  }

  if (entry.otp !== otp) {
    res.status(400).json({ error: "Incorrect OTP. Please try again." });
    return;
  }

  otpStore.delete(mobile);
  res.json({ success: true });
});

export default router;
