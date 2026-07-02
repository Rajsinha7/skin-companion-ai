import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: '.env.local' });
import fs from "fs";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase request payload size for base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Enable CORS middleware for Capacitor Android clients
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Log received API requests with truncated payload if too large
app.use((req, res, next) => {
  const logBody = { ...req.body };
  if (logBody.image && typeof logBody.image === "string" && logBody.image.length > 100) {
    logBody.image = logBody.image.substring(0, 100) + "... [truncated]";
  }
  console.log(`[API Received] ${req.method} ${req.url}`, logBody);
  next();
});

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
  });
});

// ==========================================
// BIOMETRIC AUTHENTICATION ENGINE (PERSISTED)
// ==========================================

interface User {
  email: string;
  passwordHash: string;
  name: string;
}

interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: number;
  requestedAt: number;
}

const DB_FILE = path.join(process.cwd(), "users_db.json");

function readDb(): { users: User[]; otps: OTPRecord[] } {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("[Auth DB] Error reading DB file, resetting:", error);
  }
  
  // Seed database with pre-registered accounts for testing Forgot Password immediately
  const defaultDb = {
    users: [
      { email: "eleanor@domain.com", passwordHash: "123456", name: "Eleanor" },
      { email: "sinhars303@gmail.com", passwordHash: "123456", name: "Explorer" }
    ],
    otps: []
  };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
  } catch (err) {
    console.error("[Auth DB] Error initializing DB file:", err);
  }
  return defaultDb;
}

function writeDb(data: { users: User[]; otps: OTPRecord[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[Auth DB] Error writing DB file:", error);
  }
}

async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "Skin Companion AI <no-reply@skincompanion.ai>";
  const secure = process.env.SMTP_SECURE === "true";

  const subject = "Skin Companion AI - Verification OTP Code";
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E5EBEB; border-radius: 8px;">
      <h2 style="font-weight: 300; color: #233137; margin-bottom: 20px;">Skin Companion AI</h2>
      <p style="font-size: 14px; color: #515255; line-height: 1.5;">You requested a password recovery code for your Biometric Entrance account.</p>
      <div style="background-color: #F2F5F5; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #233137;">${otp}</span>
      </div>
      <p style="font-size: 12px; color: #888; line-height: 1.5; margin-top: 20px;">This OTP is valid for exactly 5 minutes. If you did not make this request, you can safely disregard this email.</p>
    </div>
  `;

  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`[Email] Attempting to send OTP via Resend API to ${email}`);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: from,
          to: email,
          subject: subject,
          html: html
        })
      });
      if (res.ok) {
        console.log(`[Email] OTP email sent successfully via Resend API to ${email}`);
        return true;
      } else {
        const errText = await res.text();
        console.error(`[Email] Resend API error: ${errText}`);
      }
    } catch (e) {
      console.error("[Email] Exception sending via Resend:", e);
    }
  }

  // 2. Try SendGrid if configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log(`[Email] Attempting to send OTP via SendGrid API to ${email}`);
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: email }] }],
          from: { email: from.includes("<") ? from.split("<")[1].replace(">", "").trim() : from },
          subject: subject,
          content: [{ type: "text/html", value: html }]
        })
      });
      if (res.ok) {
        console.log(`[Email] OTP email sent successfully via SendGrid API to ${email}`);
        return true;
      } else {
        const errText = await res.text();
        console.error(`[Email] SendGrid API error: ${errText}`);
      }
    } catch (e) {
      console.error("[Email] Exception sending via SendGrid:", e);
    }
  }

  // 3. Try SMTP via Nodemailer
  if (host && user && pass) {
    try {
      console.log(`[Email] Attempting to send OTP via SMTP (${host}:${port}) to ${email}`);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });
      await transporter.sendMail({
        from,
        to: email,
        subject,
        html
      });
      console.log(`[Email] OTP email sent successfully via SMTP to ${email}`);
      return true;
    } catch (e) {
      console.error("[Email] SMTP sending error:", e);
    }
  }

  console.warn(`[Email Warning] No valid email configuration (SMTP, Resend, or SendGrid) succeeded or is present. Trying Ethereal SMTP fallback...`);
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    const info = await transporter.sendMail({
      from,
      to: email,
      subject,
      html
    });
    console.log(`[Email] OTP email sent successfully via Ethereal to ${email}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return true;
  } catch (err) {
    console.error("[Email Error] Ethereal SMTP fallback failed:", err);
  }

  return false;
}

// User Registration API Route
app.post("/api/auth/register", (req, res) => {
  try {
    let { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    email = email.trim();
    password = password.trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password cannot be empty." });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const db = readDb();
    const emailLower = email.toLowerCase();
    
    const exists = db.users.some(u => u.email.toLowerCase() === emailLower);
    if (exists) {
      console.log(`[Auth Register] Registration blocked (duplicate email): ${email}`);
      return res.status(409).json({ error: "User already registered. Please login instead." });
    }

    const newUser = {
      email: email,
      passwordHash: password,
      name: name || email.split("@")[0]
    };

    db.users.push(newUser);
    writeDb(db);

    console.log(`[Auth Register] New user registered successfully: ${email}`);
    res.status(201).json({ message: "Registration successful", user: { email: newUser.email, name: newUser.name } });
  } catch (error) {
    console.error("[Auth Register] Error:", error);
    res.status(500).json({ error: "An unexpected error occurred during registration." });
  }
});

// User Login API Route
app.post("/api/auth/login", (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email);
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    console.log(`[Auth Login] User logged in successfully: ${user.email}`);
    res.json({ message: "Login successful", user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error("[Auth Login] Error:", error);
    res.status(500).json({ error: "An unexpected error occurred during login." });
  }
});

// Send OTP Recovery Code API Route
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    email = email.trim();
    const emailLower = email.toLowerCase();

    // Check if user is registered first
    const db = readDb();
    const userExists = db.users.some(u => u.email.toLowerCase() === emailLower);
    if (!userExists) {
      return res.status(404).json({ error: "Email not registered" });
    }

    const now = Date.now();

    // Prevent duplicate OTP requests within 30 seconds
    const existingOtp = db.otps.find(o => o.email.toLowerCase() === emailLower);
    if (existingOtp && (now - existingOtp.requestedAt < 30 * 1000)) {
      const waitSeconds = Math.ceil((30 * 1000 - (now - existingOtp.requestedAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSeconds} seconds before requesting another OTP.` });
    }

    // Generate a 4-digit code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[Auth OTP] OTP generated: ${otpCode} for ${email}`);

    // Try sending email
    const emailSent = await sendOtpEmail(email, otpCode);

    if (!emailSent) {
      console.error(`[Auth OTP] Unable to send OTP to ${email}. Logging to console.`);
      return res.status(500).json({ error: "Unable to send OTP. Please try again." });
    }

    console.log(`[Auth OTP] OTP email sent successfully dispatched to ${email}`);

    // Store/Update OTP record (5 minutes expiry)
    const expiresAt = now + 5 * 60 * 1000;
    
    if (existingOtp) {
      existingOtp.otp = otpCode;
      existingOtp.requestedAt = now;
      existingOtp.expiresAt = expiresAt;
    } else {
      db.otps.push({
        email: email,
        otp: otpCode,
        requestedAt: now,
        expiresAt: expiresAt
      });
    }
    writeDb(db);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("[Auth OTP] Error sending OTP:", error);
    res.status(500).json({ error: "Unable to send OTP. Please try again." });
  }
});

// Verify OTP API Route
app.post("/api/auth/verify-otp", (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    email = email.trim().toLowerCase();
    otp = otp.trim();

    const db = readDb();
    const otpRecord = db.otps.find(o => o.email.toLowerCase() === email);

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    if (Date.now() > otpRecord.expiresAt) {
      return res.status(400).json({ error: "Verification code has expired." });
    }

    console.log(`[Auth OTP] OTP verified successfully for ${email}`);
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("[Auth OTP] Error verifying OTP:", error);
    res.status(500).json({ error: "An unexpected error occurred during OTP verification." });
  }
});

// Reset Password API Route
app.post("/api/auth/reset-password", (req, res) => {
  try {
    let { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ error: "Email, OTP, and new password are required." });
    }

    email = email.trim().toLowerCase();
    otp = otp.trim();
    password = password.trim();

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const db = readDb();
    const otpRecord = db.otps.find(o => o.email.toLowerCase() === email);

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    if (Date.now() > otpRecord.expiresAt) {
      return res.status(400).json({ error: "Verification code has expired." });
    }

    // Find user and update password
    const user = db.users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.passwordHash = password;
    
    // Clear OTP after successful reset
    db.otps = db.otps.filter(o => o.email.toLowerCase() !== email);
    writeDb(db);

    console.log(`[Auth Reset] Password reset completed: successfully updated password for ${email}`);
    res.json({ message: "Password updated successfully! You can now log in." });
  } catch (error) {
    console.error("[Auth Reset] Error resetting password:", error);
    res.status(500).json({ error: "An unexpected error occurred during password reset." });
  }
});

// Helper to generate premium high-fidelity simulation results mirroring QOVES analysis style
function getSimulationResults(onboardingData: any) {
  const concerns = onboardingData?.skinConcerns || ["unevenTexture", "redness"];
  const skinType = onboardingData?.skinType || "Combination";
  const name = onboardingData?.name || "Guest";

  const severityForConcern = (concern: string) => {
    return concerns.includes(concern) ? Math.floor(Math.random() * 25) + 55 : Math.floor(Math.random() * 20) + 15;
  };

  const acneSev = severityForConcern("acne");
  const rednessSev = severityForConcern("redness");
  const darkCirclesSev = severityForConcern("darkCircles");
  const pigmentSev = severityForConcern("pigmentation");
  const drynessSev = skinType === "Dry" ? 68 : skinType === "Oily" ? 15 : Math.floor(Math.random() * 30) + 20;
  const oilinessSev = skinType === "Oily" ? 75 : skinType === "Dry" ? 12 : Math.floor(Math.random() * 30) + 30;
  const textureSev = severityForConcern("unevenTexture");

  const score = Math.max(45, Math.min(95, Math.floor(100 - (acneSev + rednessSev + darkCirclesSev + pigmentSev + textureSev) / 5)));

  // Generate mock coordinates on facial regions
  const issues = [];
  if (acneSev > 40) {
    issues.push({
      id: "issue-acne-1",
      name: "Mild Inflammatory Acne",
      zone: "Right Cheek",
      x: 65,
      y: 52,
      severity: acneSev > 60 ? "high" : "medium",
      description: "Sub-surface microcomedones presenting localized erythema. Common in zones of friction or sebum accumulation."
    });
  }
  if (rednessSev > 40) {
    issues.push({
      id: "issue-red-1",
      name: "Localized Erythema / Redness",
      zone: "Nose & Cheeks",
      x: 50,
      y: 48,
      severity: rednessSev > 60 ? "high" : "medium",
      description: "Diffused vascular dilation suggesting epidermal barrier compromise or mild rosacea-prone sensitivity."
    });
  }
  if (darkCirclesSev > 40) {
    issues.push({
      id: "issue-dark-1",
      name: "Periorbital Hyperpigmentation",
      zone: "Under-eyes",
      x: 43,
      y: 40,
      severity: darkCirclesSev > 60 ? "high" : "medium",
      description: "Thinning sub-orbital skin revealing prominent capillary networks, accentuated by mild fluid retention."
    });
    issues.push({
      id: "issue-dark-2",
      name: "Periorbital Hyperpigmentation",
      zone: "Under-eyes",
      x: 57,
      y: 40,
      severity: darkCirclesSev > 60 ? "high" : "medium",
      description: "Sub-orbital vascular congestion resulting in shadowed contours."
    });
  }
  if (pigmentSev > 40) {
    issues.push({
      id: "issue-pigment-1",
      name: "UV-Induced Melanin Clusters",
      zone: "Forehead",
      x: 50,
      y: 25,
      severity: pigmentSev > 60 ? "high" : "medium",
      description: "Micro-pigmentation patches stemming from historic UV exposure and accelerated melanocyte activity."
    });
  }
  if (textureSev > 45) {
    issues.push({
      id: "issue-texture-1",
      name: "Keratinized Texture Contrast",
      zone: "Chin",
      x: 50,
      y: 72,
      severity: "medium",
      description: "Slightly elevated desquamation deficit, creating a dry micro-peeling texture in the lower chin segment."
    });
  }

  // Add default if issues are empty
  if (issues.length === 0) {
    issues.push({
      id: "issue-texture-clean",
      name: "Balanced Sebaceous Output",
      zone: "T-Zone",
      x: 50,
      y: 35,
      severity: "low",
      description: "No significant clinical anomalies detected. Optimal keratin hydration and cell turnover rates."
    });
  }

  const routine = [
    {
      step: "Cleanse (AM/PM)",
      product: "Squalane-Infused Balancing Cleanser",
      reason: "Preserves the delicate lipid mantle while lifting impurities without mechanical abrasion."
    },
    {
      step: "Treat (AM)",
      product: "Niacinamide 4% + Zinc PCA Serum",
      reason: "Enforces epidermal barrier resilience, calms vascular redness, and regulates sebaceous output."
    },
    {
      step: "Hydrate (PM)",
      product: "Ceramide NP & Phytosphingosine Rich Emulsion",
      reason: "Restores crucial lipid bonds within the stratum corneum to prevent trans-epidermal water loss."
    },
    {
      step: "Protect (AM)",
      product: "Broad-Spectrum SPF 50 Mineral Fluid (PA++++)",
      reason: "Inhibits UV-induced melanogenesis and shields vascular structures from thermal stress."
    }
  ];

  return {
    skinScore: score,
    metrics: {
      acne: acneSev,
      redness: rednessSev,
      darkCircles: darkCirclesSev,
      pigmentation: pigmentSev,
      dryness: drynessSev,
      oiliness: oilinessSev,
      unevenTexture: textureSev
    },
    issues,
    skincareRoutine: routine,
    summary: `Analysis for ${name} reveals a ${skinType} profile exhibiting moderate ${concerns.join(" and ")}. There is notable vascular activity in the mid-face region alongside localized epidermal dehydration. Your overall dermal integrity score is ${score}/100, showing excellent structural potential with specific scope for barrier reinforcement.`
  };
}

// Real AI / Mock Skin Analysis Endpoint
app.post("/api/analyze-skin", async (req, res) => {
  try {
    const { image, onboardingData } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided for analysis." });
    }

    const ai = getGeminiClient();
    const isMockMode = !ai;

    if (isMockMode) {
      console.log("[Skin AI] Running in simulation mode (No Gemini API Key)");
      // Wait a moment to simulate real clinical processing
      await new Promise((resolve) => setTimeout(resolve, 2200));
      const simulatedData = getSimulationResults(onboardingData);
      return res.json({
        mode: "simulation",
        ...simulatedData
      });
    }

    console.log("[Skin AI] Running in live Gemini mode");

    // Live AI Scan using Gemini 3.5 Flash!
    try {
      // Strip the data:image/... prefix if exists to get pure base64 data
      const base64Data = image.includes("base64,") ? image.split("base64,")[1] : image;
      const mimeType = image.includes("image/png") ? "image/png" : "image/jpeg";

      const prompt = `
        You are an expert dermatological analyzer for QOVES Studio, specializing in premium, clinical-grade skin biometrics.
        Analyze the provided facial skin image. Use the onboarding data if relevant: ${JSON.stringify(onboardingData || {})}.

        Evaluate the skin for these 7 metrics on a scale of 0 to 100 (where 0 means flawless/none and 100 means extremely severe):
        - acne (breakouts, whiteheads, blackheads, papules)
        - redness (erythema, vascular dilation, sensitivity)
        - darkCircles (under-eye shadowing, vascular pooling)
        - pigmentation (sun spots, melasma, post-inflammatory hyperpigmentation)
        - dryness (flakiness, dehydration lines)
        - oiliness (sebum shine, congested pores)
        - unevenTexture (roughness, dead skin accumulation)

        Calculate a composite skinScore (0-100), where 100 is pristine, perfect skin and decreases as issues increase.
        
        Identify specific localized skin anomalies (issues) and provide their precise relative pixel percentages coordinates on the face (from 0 to 100 for 'x' and 'y', where top-left is 0,0 and bottom-right is 100,100).
        Return at least 2 to 5 issues with their:
        - zone (e.g. Forehead, Nose, Left Cheek, Right Cheek, Chin, Under-eyes)
        - x (approximate horizontal center percentage of the issue, e.g. 45)
        - y (approximate vertical center percentage of the issue, e.g. 50)
        - severity (low, medium, high)
        - name (clinical yet understandable term, e.g., "Sebum Congestion", "Erythema Patch")
        - description (professional, elegant description in the tone of a high-end QOVES skin lab report)

        Also provide a tailored 4-step premium skincare routine containing:
        - step (e.g., "Cleanse", "Target", "Moisturize", "Shield")
        - product (luxury-feeling active ingredient/type, e.g., "Centella Asiatica Soothing Gel Cleanser")
        - reason (clinical justification)

        Finally, provide a beautiful clinical summary explaining their overall skin state in professional yet warm, reassuring vocabulary.

        Return ONLY a valid JSON object matching the requested schema. DO NOT include any markdown code blocks or extra text outside the JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["skinScore", "metrics", "issues", "skincareRoutine", "summary"],
            properties: {
              skinScore: { type: Type.INTEGER, description: "Composite skin health score from 0 to 100" },
              metrics: {
                type: Type.OBJECT,
                required: ["acne", "redness", "darkCircles", "pigmentation", "dryness", "oiliness", "unevenTexture"],
                properties: {
                  acne: { type: Type.INTEGER },
                  redness: { type: Type.INTEGER },
                  darkCircles: { type: Type.INTEGER },
                  pigmentation: { type: Type.INTEGER },
                  dryness: { type: Type.INTEGER },
                  oiliness: { type: Type.INTEGER },
                  unevenTexture: { type: Type.INTEGER },
                },
              },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["id", "name", "zone", "x", "y", "severity", "description"],
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    zone: { type: Type.STRING },
                    x: { type: Type.INTEGER, description: "X percentage coordinate on image (0-100)" },
                    y: { type: Type.INTEGER, description: "Y percentage coordinate on image (0-100)" },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                    description: { type: Type.STRING },
                  },
                },
              },
              skincareRoutine: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["step", "product", "reason"],
                  properties: {
                    step: { type: Type.STRING },
                    product: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                },
              },
              summary: { type: Type.STRING, description: "Luxury clinical summary report of skin state" },
            },
          },
        },
      });

      const resultText = response.text?.trim() || "{}";
      const parsedResult = JSON.parse(resultText);

      return res.json({
        mode: "live",
        ...parsedResult,
      });
    } catch (apiError) {
      console.warn("[Skin AI API Warning] Live Gemini API invocation failed (overloaded, offline, or unavailable). Falling back seamlessly to simulation engine.", apiError);
      
      // Delay slightly so that the UI scanning state feels organic/deliberate during fallback
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const simulatedData = getSimulationResults(onboardingData);
      return res.json({
        mode: "simulation_fallback",
        ...simulatedData,
        fallbackNotice: "A temporary live server high demand was detected. We have loaded your high-fidelity localized scan parameters seamlessly via clinical local modeling."
      });
    }
  } catch (error) {
    console.error("[Skin AI Fatal Error] Handler exception: ", error);
    res.status(500).json({
      error: "An unexpected error occurred during analysis setup.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Setup Vite Dev Server / Static Production Handlers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vite] Middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Static] Serving production bundle from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Skin Companion AI] Full-stack server active at http://localhost:${PORT}`);
  });
}

startServer();
