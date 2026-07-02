export interface OnboardingData {
  name: string;
  age: number;
  gender: string;
  skinType: string;
  skinConcerns: string[];
  goals: string[];
  notifications: boolean;
}

export interface SkinMetrics {
  acne: number;
  redness: number;
  darkCircles: number;
  pigmentation: number;
  dryness: number;
  oiliness: number;
  unevenTexture: number;
}

export interface SkinIssue {
  id: string;
  name: string;
  zone: string;
  x: number; // 0-100 percentage from left of image container
  y: number; // 0-100 percentage from top of image container
  severity: "low" | "medium" | "high";
  description: string;
}

export interface SkincareStep {
  step: string;
  product: string;
  reason: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  mode: "simulation" | "live";
  skinScore: number;
  metrics: SkinMetrics;
  issues: SkinIssue[];
  skincareRoutine: SkincareStep[];
  summary: string;
  imageUri: string;
}

export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: string;
  skinType: string;
  skinConcerns: string[];
  goals: string[];
}

export type AppScreen =
  | "landing"
  | "auth"
  | "onboarding_1" // Name & Age
  | "onboarding_2" // Gender & Skin Type
  | "onboarding_3" // Concerns & Goals
  | "home"
  | "scan"
  | "results"
  | "history"
  | "profile";
