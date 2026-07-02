import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ClipboardList,
  Camera,
  CheckCircle2,
  Mail,
  Info,
  Send,
  Phone,
  Settings,
  Heart,
  Activity,
  Layers,
  FileCode,
  Smartphone
} from "lucide-react";

// Types
interface Testimonial {
  id: number;
  name: string;
  role: string;
  review: string;
  rating: number;
  avatar: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function SkincareLanding() {
  // Draggable Slider State (Before/After)
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Contact/Inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Handler for Before/After Slider drag
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isDragging) {
      handleSliderMove(e.clientX);
    }
  };

  // Testimonials Carousel auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Marcus Vance",
      role: "Architect & Creative Director",
      review: "The biometric mapping predicted my seasonal moisture collapse three weeks before it manifested. It replaced guesswork with precision science.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Sophia Lindqvist",
      role: "Product Designer",
      review: "QOVES-style detail right in my browser. The dynamic reports and chronological timeline helped me repair my lipid barrier in under 30 days.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Dr. Elena Rostova",
      role: "Biomedical Researcher",
      review: "As a scientist, I appreciate the transparency. Ephemeral RAM processing respects biometric privacy, and the formulas align with peer-reviewed skincare science.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
    }
  ];

  const FAQs: FAQItem[] = [
    {
      id: 1,
      question: "How does the computer vision skin analysis work?",
      answer: "Our engine maps 120 key facial coordinates. By checking pore density gradients, subsurface hyperpigmentation shadows, and micro-texture variations, it determines your custom score with real-time feedback."
    },
    {
      id: 2,
      question: "Is my personal scan data kept strictly private?",
      answer: "Yes. We operate on a zero-trust architecture. Photos uploaded for AI scanning are analyzed exclusively inside volatile server memory and are immediately scrubbed. We never store or sell your biometric markers."
    },
    {
      id: 3,
      question: "Can this system substitute professional medical advice?",
      answer: "No. While our reports utilize high-fidelity clinical syntax, they are designed to track baseline skin metrics and optimize daily skincare layering. For chronic conditions like cystic acne or eczema, we advise consulting a dermatologist."
    },
    {
      id: 4,
      question: "How often should I scan my skin?",
      answer: "For optimum consistency, we suggest performing a face scan every 7 to 10 days. Always scan at the same time of day under the same ambient lighting to ensure the high-resolution metrics track progress accurately."
    }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setInquiryName("");
      setInquiryEmail("");
      setInquiryMsg("");
    }, 4000);
  };

  return (
    <div className="w-full text-[#1E2226] font-sans selection:bg-[#1E2226] selection:text-[#F8F8F6] overflow-hidden mt-16 border-t border-[#E5EBEB]">
      
      {/* SECTION 1: WHAT YOU WILL LEARN */}
      <section id="what-you-will-learn" className="py-24 px-6 md:px-12 bg-[#F8F8F6] border-b border-[#E5EBEB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-[10px] tracking-[0.25em] font-bold text-[#5F6C76] uppercase"
            >
              Clinical Curriculum
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-light tracking-tight text-[#1E2226]"
            >
              What You Will Learn
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "60px" }}
              viewport={{ once: true }}
              className="h-[1px] bg-[#CBD5DB] mx-auto mt-4"
            />
          </div>

          {/* 4 Vertically Stacked Premium Cards */}
          <div className="space-y-8 max-w-4xl mx-auto">
            {[
              {
                id: "biometrics",
                title: "Your Biometrics",
                subtitle: "Deep-layer mapping of structural lipid balance, sebum secretion indexes, and epidermal thickness variations relative to your age group.",
                image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop",
                tag: "01 / BASELINE"
              },
              {
                id: "breakdown",
                title: "Feature Breakdown",
                subtitle: "Micro-pore geometry evaluations, hydration distribution indexes, and localized vascular redness scores modeled on medical scale metrics.",
                image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
                tag: "02 / ANATOMY"
              },
              {
                id: "harmony",
                title: "Facial Harmony",
                subtitle: "Evaluation of cellular density balance, surface light reflectance coordinates, and melanin distribution consistency across facial vectors.",
                image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
                tag: "03 / SYMMETRY"
              },
              {
                id: "improvement",
                title: "Improvement Opportunities",
                subtitle: "Algorithmic synthesis of exact chemical compound formulas (eg. ceramides, peptides) formatted in precise layering order.",
                image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop",
                tag: "04 / METABOLISM"
              }
            ].map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.015 }}
                className="group relative flex flex-col md:flex-row items-stretch bg-white/40 backdrop-blur-md rounded-[32px] border border-[#CBD5DB]/30 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* Image side */}
                <div className="w-full md:w-[40%] min-h-[220px] md:min-h-auto relative overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
                  <div className="absolute top-4 left-4 bg-[#1E2226]/80 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest text-white">
                    {card.tag}
                  </div>
                </div>

                {/* Text side */}
                <div className="p-8 md:p-10 flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E2226]/60" />
                    <span className="text-[10px] tracking-widest font-mono font-bold text-[#5F6C76]">BIOMETRIC SEGMENT</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-light text-[#1E2226] tracking-tight group-hover:text-black transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#5F6C76] leading-relaxed font-light">
                    {card.subtitle}
                  </p>
                  
                  <div className="pt-2 flex items-center text-xs font-semibold text-[#1E2226] gap-1.5 group-hover:gap-2.5 transition-all duration-300 pointer-events-none">
                    <span>Explore diagnostics</span>
                    <ArrowRight size={13} className="text-[#5F6C76]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: NO NEED FOR SURGERY (Before / After Comparison) */}
      <section id="no-surgery" className="py-24 bg-[#1E2226] text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(95,108,118,0.15),transparent_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Headline side (Left or Top) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#CBD5DB] uppercase block">
              Non-Invasive Protocols
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-tight">
              No Need for<br />Invasive Surgery
            </h2>
            <p className="text-sm text-[#CBD5DB]/80 leading-relaxed font-light">
              We model natural micro-adjustments using clean cosmetic chemistry, bio-identical lipids, and targeted facial exercises. Our AI projecting engine visualizes your dermal outcome without scalpel intervention.
            </p>
            
            <div className="space-y-4 pt-4 border-t border-[#CBD5DB]/10">
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={16} className="text-[#CBD5DB] shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Project barrier recovery</h4>
                  <p className="text-xs text-[#CBD5DB]/70 leading-relaxed">Predict cell turnover rates and hydration index expansion mathematically.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle2 size={16} className="text-[#CBD5DB] shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Structural skin firming</h4>
                  <p className="text-xs text-[#CBD5DB]/70 leading-relaxed">Boost collagen synthesis naturally with balanced peptide and retinol stacking guides.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Before/After Comparison Card (Right or Bottom) */}
          <div className="lg:col-span-7 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[480px] aspect-[4/5] rounded-[32px] overflow-hidden border border-[#CBD5DB]/20 shadow-2xl bg-black select-none"
              ref={sliderRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {/* After Image (Full width background) */}
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop"
                alt="Projection Radiant Skin"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute bottom-6 right-6 z-20 bg-[#1E2226]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[9px] font-mono tracking-widest font-bold text-white uppercase shadow-sm">
                PROJECTION
              </div>

              {/* Before Image (Cropped overlay) */}
              <div
                className="absolute inset-0 overflow-hidden z-10"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1200&auto=format&fit=crop"
                  alt="Original Skin Baseline"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ width: sliderRef.current?.getBoundingClientRect().width || 480, maxWidth: "none" }}
                />
                <div className="absolute bottom-6 left-6 z-20 bg-white/95 px-3.5 py-1.5 rounded-full text-[9px] font-mono tracking-widest font-bold text-[#1E2226] uppercase shadow-sm">
                  BEFORE
                </div>
              </div>

              {/* Drag line divider */}
              <div
                className="absolute top-0 bottom-0 z-30 w-[2px] bg-white cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#1E2226] border border-[#CBD5DB] flex items-center justify-center shadow-lg transform -translate-x-1/2">
                  <div className="flex gap-0.5">
                    <ChevronLeft size={12} className="shrink-0 text-[#1E2226]" />
                    <ChevronRight size={12} className="shrink-0 text-[#1E2226]" />
                  </div>
                </div>
              </div>

              {/* Bottom Instructions Badge */}
              <div className="absolute inset-x-0 top-6 z-20 flex justify-center pointer-events-none">
                <span className="bg-black/40 backdrop-blur-xs px-3.5 py-1 rounded-full text-[8px] tracking-widest font-mono text-white/80">
                  DRAG SLIDER TO REVEAL DIFFERENCE
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 3: PERSONALIZED REPORT PREVIEW */}
      <section id="report-preview" className="py-24 px-6 md:px-12 bg-white border-b border-[#E5EBEB]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Timeline and details */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#5F6C76] uppercase block">
              Continuous Optimization
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-[#1E2226] leading-tight">
              Get Your<br />Personalized Protocol
            </h2>
            <p className="text-sm text-[#5F6C76] leading-relaxed font-light">
              Our comprehensive reports map local anomalies and compound solutions. We generate a visual baseline, formulation sequence, and progress tracker updated on every scan.
            </p>

            {/* Timelined Bullets */}
            <div className="relative border-l border-[#CBD5DB] ml-3 pl-6 space-y-6 py-2">
              {[
                { step: "1", title: "Biometric Scan", desc: "Upload facial capture or use physical camera device." },
                { step: "2", title: "Neural Analysis", desc: "Multi-layered visual extraction maps lipid, redness, and hydration zones." },
                { step: "3", title: "Interactive Visualization", desc: "Tap dermal pins to study clinical metrics and sebum scores." },
                { step: "4", title: "Timeline Progression", desc: "Compare previous scans to visualize actual lipid barrier repair." }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#F8F8F6] border-2 border-[#1E2226] flex items-center justify-center text-[7.5px] font-bold font-mono text-[#1E2226] group-hover:bg-[#1E2226] group-hover:text-white transition-all duration-300">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E2226] uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[11px] text-[#5F6C76] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Floating Premium Report Mockup */}
          <div className="lg:col-span-7 flex justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[460px] bg-white rounded-[32px] border border-[#CBD5DB]/40 p-6 shadow-[0_20px_50px_rgba(30,34,38,0.08)] transform rotate-1 hover:rotate-0 transition-all duration-500 overflow-hidden"
            >
              {/* Header inside report card */}
              <div className="border-b border-[#CBD5DB]/20 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-mono tracking-widest font-bold text-[#5F6C76] uppercase">CLINICAL DOSSIER</span>
                  <h3 className="text-sm font-bold text-[#1E2226]">ELEANOR_BASELINE_REPORT</h3>
                  <p className="text-[8px] text-[#5F6C76]">ID: scan-17203923 • Age 28 • Skin: Dry/Combination</p>
                </div>
                <div className="bg-[#1E2226] text-white px-3 py-1.5 rounded-full text-center">
                  <p className="text-[7px] tracking-widest uppercase font-mono text-white/60">INDEX</p>
                  <p className="text-sm font-bold font-mono tracking-tight leading-none">82</p>
                </div>
              </div>

              {/* Score breakdown metrics visualizers */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-[#1E2226]">Stratum Corneum Hydration</span>
                    <span className="font-mono text-[#5F6C76]">88 / 100 (Optimal)</span>
                  </div>
                  <div className="bg-[#F8F8F6] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-[#1E2226]">Sebum Regulation Index</span>
                    <span className="font-mono text-[#5F6C76]">64 / 100 (Moderate Sebum)</span>
                  </div>
                  <div className="bg-[#F8F8F6] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "64%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-[#1E2226]">Erythema & Redness Density</span>
                    <span className="font-mono text-[#5F6C76]">41 / 100 (Low Irritation)</span>
                  </div>
                  <div className="bg-[#F8F8F6] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#1E2226] h-full rounded-full" style={{ width: "41%" }} />
                  </div>
                </div>
              </div>

              {/* Localized pin analysis mockup */}
              <div className="mt-6 bg-[#F8F8F6] rounded-2xl p-4 border border-[#CBD5DB]/20">
                <div className="flex gap-2 items-center mb-1.5">
                  <Sparkles size={12} className="text-[#1E2226]" />
                  <span className="text-[9px] font-bold tracking-widest uppercase text-[#1E2226]">DIAGNOSTIC INSIGHT</span>
                </div>
                <p className="text-[10px] text-[#5F6C76] leading-relaxed">
                  "Micro-pores show 12% expansion near bilateral cheek sectors. Apply a 2% Salicylic Acid compound specifically to the T-zone prior to ceramide locking."
                </p>
              </div>

              {/* Routine layer layout preview */}
              <div className="mt-4 border-t border-[#CBD5DB]/20 pt-4">
                <p className="text-[8px] font-mono tracking-widest font-bold text-[#5F6C76] uppercase mb-2">INTELLIGENT LAYERING ORDER</p>
                <div className="grid grid-cols-4 gap-2 text-center text-[8px]">
                  <div className="bg-[#F8F8F6] py-2 px-1 rounded-lg border border-[#CBD5DB]/20">
                    <p className="font-bold text-[#1E2226]">01. WASH</p>
                    <p className="text-[#5F6C76] mt-0.5 truncate">pH 5.5 Cleanser</p>
                  </div>
                  <div className="bg-[#F8F8F6] py-2 px-1 rounded-lg border border-[#CBD5DB]/20">
                    <p className="font-bold text-[#1E2226]">02. HYDRATE</p>
                    <p className="text-[#5F6C76] mt-0.5 truncate">Hyaluronic Ac.</p>
                  </div>
                  <div className="bg-[#F8F8F6] py-2 px-1 rounded-lg border border-[#CBD5DB]/20">
                    <p className="font-bold text-[#1E2226]">03. TREAT</p>
                    <p className="text-[#5F6C76] mt-0.5 truncate">Niacinamide</p>
                  </div>
                  <div className="bg-[#F8F8F6] py-2 px-1 rounded-lg border border-[#CBD5DB]/20">
                    <p className="font-bold text-[#1E2226]">04. LOCK</p>
                    <p className="text-[#5F6C76] mt-0.5 truncate">Ceramide Emul.</p>
                  </div>
                </div>
              </div>

              {/* Watermark/Verify */}
              <div className="mt-4 flex justify-between items-center text-[7px] text-[#CBD5DB] font-mono border-t border-[#CBD5DB]/10 pt-3">
                <span>VERIFIED BY GEMINI PRO-VISION</span>
                <span>AUTHENTIC SKIN COMPANION REPORT</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-[#1E2226]/5 border-t border-b border-[#CBD5DB]/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#5F6C76] uppercase block">
              Workflow Mechanics
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-[#1E2226]">
              How It Works
            </h2>
            <div className="h-[1px] bg-[#CBD5DB] w-12 mx-auto mt-4" />
          </div>

          {/* 4 Horizontal Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "STEP 1",
                title: "Upload",
                desc: "Capture a portrait using our high-fidelity web app or select from your camera roll.",
                icon: <Camera size={20} className="text-[#1E2226]" />
              },
              {
                step: "STEP 2",
                title: "Analyze",
                desc: "Our neural computer vision processes facial contrast, texture shadows, and vascular distribution.",
                icon: <Sparkles size={20} className="text-[#1E2226]" />
              },
              {
                step: "STEP 3",
                title: "Build Plan",
                desc: "Receive structured chemical compounds and a chronological layering sequence tailored to your goals.",
                icon: <ClipboardList size={20} className="text-[#1E2226]" />
              },
              {
                step: "STEP 4",
                title: "Track Progress",
                desc: "Log your skin reports over days and watch your hydration index repair and stabilize.",
                icon: <TrendingUp size={20} className="text-[#1E2226]" />
              }
            ].map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="group p-6 bg-white rounded-3xl border border-[#CBD5DB]/30 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F8F8F6] border border-[#CBD5DB]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <p className="text-[9px] font-mono tracking-widest text-[#5F6C76] font-bold mt-6">
                  {step.step}
                </p>
                <h3 className="text-lg font-bold text-[#1E2226] mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#5F6C76] leading-relaxed font-light">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 5: WHY USERS LOVE IT */}
      <section id="why-users-love-it" className="py-24 px-6 md:px-12 bg-white border-b border-[#E5EBEB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#5F6C76] uppercase block">
              System Advantages
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-[#1E2226]">
              Why Users Love It
            </h2>
            <div className="h-[1px] bg-[#CBD5DB] w-12 mx-auto mt-4" />
          </div>

          {/* Bento Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI Analysis",
                desc: "High-density coordinate matrices scan your epidermal layers, providing pore-level transparency without dermatological wait times.",
                icon: <Layers size={18} className="text-[#1E2226]" />
              },
              {
                title: "Personalized Reports",
                desc: "Get granular details identifying moisture indices, redness percentages, and specific chemical compound contraindications.",
                icon: <ClipboardList size={18} className="text-[#1E2226]" />
              },
              {
                title: "Progress Tracking",
                desc: "Maintain a local private archive of your reports, tracking your exact barrier score trajectory chronological weeks after weeks.",
                icon: <TrendingUp size={18} className="text-[#1E2226]" />
              },
              {
                title: "Privacy First",
                desc: "Zero storage policies on raw facial photos. Your scans process exclusively inside high-speed volatile server RAM and evaporate instantly.",
                icon: <Lock size={18} className="text-[#1E2226]" />
              },
              {
                title: "Fast Results",
                desc: "Real-time diagnostics synthesized inside under twelve seconds. Perfect for routine dynamic adjustments before makeup or sleep.",
                icon: <Sparkles size={18} className="text-[#1E2226]" />
              },
              {
                title: "Mobile Ready",
                desc: "The entire workspace simulates a production-grade Expo mobile app, allowing responsive fluid interactions on any viewport size.",
                icon: <Smartphone size={18} className="text-[#1E2226]" />
              }
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-6 bg-white rounded-[24px] border border-[#CBD5DB]/30 shadow-xs hover:border-[#1E2226]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F8F6] border border-[#CBD5DB]/20 flex items-center justify-center text-[#1E2226]">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-[#1E2226] tracking-tight">{card.title}</h3>
                  <p className="text-xs text-[#5F6C76] leading-relaxed font-light">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIAL SECTION */}
      <section id="testimonials" className="py-24 bg-[#1E2226] text-white relative overflow-hidden">
        {/* Abstract blur backdrop circles */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-white/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#CBD5DB] uppercase block">
              Verified Radiance
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">
              Why Users Love It
            </h2>
            <div className="h-[1px] bg-white/20 w-12 mx-auto mt-4" />
          </div>

          {/* Testimonial slider */}
          <div className="relative min-h-[220px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {testimonials.map((t, idx) => {
                if (idx !== activeTestimonial) return null;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-3xl bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 p-8 md:p-12 shadow-xl flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start"
                  >
                    {/* Portrait Avatar */}
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-md shrink-0"
                    />

                    {/* Review text */}
                    <div className="flex-1 space-y-4 text-center md:text-left">
                      <div className="flex justify-center md:justify-start text-amber-400 text-sm">
                        {"★".repeat(t.rating)}
                      </div>
                      <p className="text-base md:text-lg text-white/90 leading-relaxed font-light italic">
                        "{t.review}"
                      </p>
                      <div>
                        <h4 className="text-sm font-bold tracking-wide">{t.name}</h4>
                        <p className="text-[11px] text-[#CBD5DB]/70">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              title="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeTestimonial ? "bg-white w-5" : "bg-white/30"
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              title="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 7: FAQ (Accordion layout) */}
      <section id="faq" className="py-24 px-6 md:px-12 bg-[#F8F8F6] border-b border-[#E5EBEB]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] tracking-[0.25em] font-bold text-[#5F6C76] uppercase block">
              Common Inquiries
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-[#1E2226]">
              Frequently Asked Questions
            </h2>
            <div className="h-[1px] bg-[#CBD5DB] w-12 mx-auto mt-4" />
          </div>

          {/* Accordion container */}
          <div className="space-y-4">
            {FAQs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-[#CBD5DB]/30 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full text-left p-6 flex justify-between items-center gap-4 hover:bg-[#F8F8F6]/50 transition-colors"
                  >
                    <span className="text-sm md:text-base font-semibold text-[#1E2226] tracking-tight">
                      {faq.question}
                    </span>
                    <div className={`p-1.5 rounded-full bg-[#F8F8F6] text-[#1E2226] transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#1E2226] text-white" : ""
                    }`}>
                      <ChevronDown size={14} />
                    </div>
                  </button>

                  {/* Animated expandable panel */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-xs md:text-sm text-[#5F6C76] leading-relaxed border-t border-[#CBD5DB]/15 pt-4 font-light">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 8: CONTACT + FOOTER (Premium soft gradient background) */}
      <section className="bg-gradient-to-b from-white to-[#CBD5DB]/30 border-t border-[#CBD5DB]/30 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          
          {/* Brand block (Col 1-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#1E2226] text-[#F8F8F6] rounded-full">
                <Heart size={16} />
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-[#1E2226]">SKIN COMPANION AI</span>
            </div>
            
            <p className="text-sm text-[#5F6C76] leading-relaxed font-light">
              We empower individuals to take granular control of their daily epidermal health through rigorous computer vision and custom formulation sequencing.
            </p>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-[#1E2226] uppercase tracking-wider">Social Channels</p>
              <div className="flex gap-4 text-xs font-mono text-[#5F6C76]">
                <a href="#instagram" className="hover:text-[#1E2226] transition-colors underline">Instagram</a>
                <a href="#linkedin" className="hover:text-[#1E2226] transition-colors underline">LinkedIn</a>
                <a href="#email" className="hover:text-[#1E2226] transition-colors underline">Contact Email</a>
              </div>
            </div>
          </div>

          {/* Quick Newsletter Callback Request (Col 6-12) */}
          <div className="lg:col-span-7 bg-white rounded-[32px] border border-[#CBD5DB]/40 p-8 shadow-xs max-w-xl lg:ml-auto w-full">
            <h3 className="text-lg font-bold text-[#1E2226] mb-2">Request Consultation Callback</h3>
            <p className="text-xs text-[#5F6C76] mb-6">Enter your credentials to receive premium wellness insights and direct diagnostic callback coordinates from our biochemist team.</p>
            
            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2"
              >
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Callback logged successfully!</p>
                  <p className="text-emerald-700/80 mt-0.5">We will reach out to your electronic mail within 24 standard business hours.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-[#5F6C76] uppercase tracking-wider block mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="Eleanor"
                      className="w-full bg-[#F8F8F6] border border-[#CBD5DB]/40 rounded-xl px-4 py-2.5 text-xs text-[#1E2226] focus:outline-none focus:ring-1 focus:ring-[#1E2226]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#5F6C76] uppercase tracking-wider block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="eleanor@domain.com"
                      className="w-full bg-[#F8F8F6] border border-[#CBD5DB]/40 rounded-xl px-4 py-2.5 text-xs text-[#1E2226] focus:outline-none focus:ring-1 focus:ring-[#1E2226]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-[#5F6C76] uppercase tracking-wider block mb-1.5">Skincare Objective (Optional)</label>
                  <textarea
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    placeholder="Tell us about your main skin barrier concern (redness, dryness, lipid regulation)..."
                    className="w-full bg-[#F8F8F6] border border-[#CBD5DB]/40 rounded-xl p-4 text-xs text-[#1E2226] focus:outline-none focus:ring-1 focus:ring-[#1E2226] min-h-[80px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E2226] hover:bg-black text-white text-xs font-bold py-3 px-6 rounded-full tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={12} />
                  <span>Request Callback</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Legal copyright footer bar */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-[#CBD5DB]/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#5F6C76] tracking-wider uppercase">
          <div>
            &copy; {new Date().getFullYear()} Skin Companion AI. Ephemeral RAM computer vision.
          </div>
          <div className="flex gap-6">
            <a href="#privacy-policy" className="hover:text-[#1E2226] transition-colors">Privacy Policy</a>
            <a href="#terms-of-service" className="hover:text-[#1E2226] transition-colors">Terms &amp; Conditions</a>
            <a href="#biometrics-policy" className="hover:text-[#1E2226] transition-colors">Biometric Policy</a>
          </div>
        </div>
      </section>

    </div>
  );
}
