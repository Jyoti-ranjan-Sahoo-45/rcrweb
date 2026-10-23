import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, ShieldCheck, Download, ArrowRight, Smartphone } from "lucide-react";
import heroBannerImg from "../../assets/hero_banner.jpg";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  /* Environment Overlays */
  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 60px 60px;
      background-image: 
          linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  /* Physical Skeuomorphic Materials & 3D Depth */
  .text-3d-matte {
      color: #F8FAFC;
      text-shadow: 
          0 10px 30px rgba(255, 255, 255, 0.15), 
          0 2px 4px rgba(255, 255, 255, 0.1);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.45) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter: 
          drop-shadow(0px 10px 20px rgba(255, 255, 255, 0.15)) 
          drop-shadow(0px 2px 4px rgba(255, 255, 255, 0.1));
  }

  .text-card-silver-matte {
      background: linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter: 
          drop-shadow(0px 12px 24px rgba(0,0,0,0.8)) 
          drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  /* Deep Physical Card with Dynamic Mouse Lighting */
  .premium-depth-card {
      background: linear-gradient(145deg, #0F1F4D 0%, #030712 100%);
      box-shadow: 
          0 40px 100px -20px rgba(0, 0, 0, 0.9),
          0 20px 40px -20px rgba(0, 0, 0, 0.8),
          inset 0 1px 2px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.08) 0%, transparent 40%);
      mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  /* Realistic iPhone Mockup Hardware */
  .iphone-bezel {
      background-color: #0A0F1D;
      box-shadow: 
          inset 0 0 0 2px #334155, 
          inset 0 0 0 7px #020617, 
          0 40px 80px -15px rgba(0,0,0,0.95),
          0 15px 25px -5px rgba(0,0,0,0.8);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #475569 0%, #1E293B 100%);
      box-shadow: 
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }
  
  .screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
      box-shadow: 
          0 10px 20px rgba(0,0,0,0.4),
          inset 0 1px 1px rgba(255,255,255,0.08),
          inset 0 -1px 1px rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.05);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
      backdrop-filter: blur(24px); 
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.12),
          0 25px 50px -12px rgba(0, 0, 0, 0.9),
          inset 0 1px 1px rgba(255,255,255,0.25),
          inset 0 -1px 1px rgba(0,0,0,0.6);
  }

  /* Tactile Physical Buttons */
  .btn-modern-light, .btn-modern-dark {
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:active {
      transform: translateY(1px);
      background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1), inset 0 3px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.02);
  }
  .btn-modern-dark {
      background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
      color: #FFFFFF;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
      transform: translateY(-3px);
      background: linear-gradient(180deg, #334155 0%, #1E293B 100%);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.2), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:active {
      transform: translateY(1px);
      background: #0F172A;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.05), inset 0 3px 8px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(0,0,0,0.5);
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }
`;

export function CinematicHero({
  brandName = "RCR FINANCE",
  tagline1 = "Instant Digital Loans,",
  tagline2 = "Engineered for Ambition.",
  cardHeading = "Digital NBFC, Redefined.",
  cardDescription = (
    <>
      <span className="text-white font-semibold">RCR Finance</span> empowers ambitious individuals and MSMEs across India with paperless credit, algorithmic underwriting, and real-time bank disbursals in 15 minutes.
    </>
  ),
  metricValue = 250000,
  metricLabel = "Disbursed (₹)",
  ctaHeading = "Finance your next milestone.",
  ctaDescription = "Join 48,000+ borrowers across India with 100% digital approvals and zero hidden fees.",
  className = "",
  ...props
}) {
  const containerRef = useRef(null);
  const mainCardRef = useRef(null);
  const mockupRef = useRef(null);
  const requestRef = useRef(0);
  const navigate = useNavigate();

  // 1. High-Performance Mouse Interaction Logic (requestAnimationFrame)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);

      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 2. Cinematic Scroll Timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const scrollDistance = isMobile ? "+=900" : "+=1300";

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: scrollDistance,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.08, filter: "blur(12px)", opacity: 0.15, ease: "power2.inOut", duration: 1 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 1 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 0.8 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 150, z: -300, rotationX: 30, rotationY: -15, autoAlpha: 0, scale: 0.75 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "power3.out", duration: 1.2 }, "-=0.4"
        )
        .fromTo(".phone-widget", { y: 25, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.08, ease: "power2.out", duration: 0.8 }, "-=0.8")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 1, ease: "power2.inOut" }, "-=0.6")
        .to(".counter-val", { 
          innerHTML: metricValue, 
          snap: { innerHTML: 1000 }, 
          duration: 1, 
          ease: "power3.out",
          onUpdate: function() {
            const el = document.querySelector(".counter-val");
            if (el) {
              const val = Math.round(Number(el.innerHTML));
              el.innerHTML = "₹" + val.toLocaleString('en-IN');
            }
          }
        }, "-=1.0")
        .fromTo(".floating-badge", { y: 60, autoAlpha: 0, scale: 0.8, rotationZ: -5 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "power3.out", duration: 0.8, stagger: 0.1 }, "-=0.9")
        .fromTo(".card-left-text", { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power3.out", duration: 0.8 }, "-=0.8")
        .fromTo(".card-right-text", { x: 30, autoAlpha: 0, scale: 0.9 }, { x: 0, autoAlpha: 1, scale: 1, ease: "power3.out", duration: 0.8 }, "<")
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 }) 
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.95, y: -20, autoAlpha: 0, ease: "power2.in", duration: 0.6, stagger: 0.03,
        })
        // Responsive card pullback sizing
        .to(".main-card", { 
          width: isMobile ? "92vw" : "85vw", 
          height: isMobile ? "92vh" : "85vh", 
          borderRadius: isMobile ? "32px" : "40px", 
          ease: "power3.inOut", 
          duration: 0.9 
        }, "pullback") 
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "power3.inOut", duration: 0.9 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 150, ease: "power2.in", duration: 0.8 });

    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[calc(100dvh-5rem)] sm:h-screen overflow-hidden flex items-center justify-center bg-slate-950 text-slate-100 font-sans antialiased ${className}`}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-40" aria-hidden="true" />

      {/* Atmospheric Hero Image Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src={heroBannerImg}
          alt="RCR Finance Digital Hero"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-screen filter saturate-125 contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
      </div>

      {/* BACKGROUND LAYER 1: Hero Intro Typography */}
      <div className="hero-text-wrapper absolute inset-0 z-10 flex flex-col items-center justify-center text-center w-full px-4 will-change-transform transform-style-3d -translate-y-6 sm:translate-y-0">
        <h1 className="text-track gsap-reveal text-3d-matte text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black tracking-tight mb-1 sm:mb-2 leading-tight">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black tracking-tighter leading-tight">
          {tagline2}
        </h1>
        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-400 font-semibold bg-blue-950/70 px-3.5 py-1.5 rounded-full border border-blue-800/60 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Scroll gently to explore</span>
          </div>
          <a
            href="#calculator"
            className="text-xs sm:text-sm text-slate-300 hover:text-white font-semibold bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 transition"
          >
            Calculate EMI &darr;
          </a>
        </div>
      </div>

      {/* BACKGROUND LAYER 2: Tactile CTA Buttons */}
      <div className="cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 gsap-reveal pointer-events-auto will-change-transform">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight text-silver-matte">
          {ctaHeading}
        </h2>
        <p className="text-slate-400 text-sm sm:text-lg md:text-xl mb-8 max-w-xl mx-auto font-normal leading-relaxed">
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Link
            to="/register"
            className="btn-modern-light flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Zap size={20} className="fill-current" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-[-2px]">100% Paperless</div>
              <div className="text-lg font-extrabold leading-none tracking-tight text-slate-900">Apply for Loan</div>
            </div>
          </Link>
          <a
            href="/rcr_finance.apk"
            download="rcr_finance.apk"
            className="btn-modern-dark flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
              <Smartphone size={20} />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase mb-[-2px]">Official Release</div>
              <div className="text-lg font-extrabold leading-none tracking-tight">Download Android APK</div>
            </div>
          </a>
        </div>
      </div>

      {/* FOREGROUND LAYER: The Physical Deep Blue 3D Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          {/* Card Inner Ambient Image */}
          <div className="absolute inset-0 z-0 opacity-25 overflow-hidden pointer-events-none">
            <img
              src={heroBannerImg}
              alt="Card Atmosphere"
              className="w-full h-full object-cover object-center filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-[#0F1F4D]/70 to-transparent" />
          </div>

          {/* DYNAMIC RESPONSIVE GRID: Flex-col on mobile to force order, Grid on desktop */}
          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">
            
            {/* 1. TOP (Mobile) / RIGHT (Desktop): BRAND NAME */}
            <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-4xl sm:text-6xl md:text-[6rem] lg:text-[7rem] font-black uppercase tracking-tighter text-card-silver-matte lg:mt-0 leading-none text-center lg:text-right">
                {brandName}
              </h2>
            </div>

            {/* 2. MIDDLE (Mobile) / CENTER (Desktop): IPHONE MOCKUP */}
            <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
              
              {/* Inner wrapper for safe CSS scaling */}
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.7] md:scale-85 lg:scale-100">
                
                {/* The iPhone Bezel */}
                <div
                  ref={mockupRef}
                  className="relative w-[280px] h-[580px] rounded-[3rem] iphone-bezel flex flex-col will-change-transform transform-style-3d"
                >
                  {/* Physical Hardware Buttons */}
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                  {/* Inner Screen Container */}
                  <div className="absolute inset-[7px] bg-[#030712] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
                    <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                    {/* Dynamic Island Notch */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                      <span className="text-[9px] font-bold text-emerald-400">⚡ LIVE</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                    </div>

                    {/* App Interface */}
                    <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col justify-between">
                      <div className="phone-widget flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">RCR Digital Portal</span>
                          <span className="text-base font-black tracking-tight text-white drop-shadow-md">Active Sanction</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30 shadow-lg">
                          RCR
                        </div>
                      </div>

                      {/* Circular Gauge */}
                      <div className="phone-widget relative w-40 h-40 mx-auto flex items-center justify-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                          <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                          <circle className="progress-ring" cx="80" cy="80" r="58" fill="none" stroke="#2563EB" strokeWidth="10" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="counter-val text-2xl font-black tracking-tighter text-emerald-400">₹0</span>
                          <span className="text-[8px] text-blue-200/70 uppercase tracking-[0.1em] font-bold mt-0.5">{metricLabel}</span>
                          <span className="text-[8px] text-slate-400 font-mono">11.5% p.a.</span>
                        </div>
                      </div>

                      {/* Phone In-App Widgets */}
                      <div className="space-y-2.5">
                        <div className="phone-widget widget-depth rounded-2xl p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-400/20 shadow-inner">
                              <Zap size={15} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white leading-tight">Disbursal Approved</p>
                              <p className="text-[9px] text-slate-400 font-mono">IMPS Ref #88921</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            Success
                          </span>
                        </div>

                        <div className="phone-widget widget-depth rounded-2xl p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-400/20 shadow-inner">
                              <ShieldCheck size={15} />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white leading-tight">Digital KYC Verified</p>
                              <p className="text-[9px] text-slate-400">Aadhaar & PAN Match</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                            100%
                          </span>
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[3px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                {/* Floating Glass Badges */}
                <div className="floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-blue-500/30 to-blue-900/10 flex items-center justify-center border border-blue-400/30 shadow-inner text-blue-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">₹180+ Cr Disbursed</p>
                    <p className="text-blue-200/70 text-[10px] lg:text-xs font-medium">Instant Bank IMPS</p>
                  </div>
                </div>

                <div className="floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-emerald-500/30 to-emerald-900/10 flex items-center justify-center border border-emerald-400/30 shadow-inner text-emerald-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">RBI NBFC Partner</p>
                    <p className="text-emerald-200/70 text-[10px] lg:text-xs font-medium">256-Bit SSL Encrypted</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. BOTTOM (Mobile) / LEFT (Desktop): COPY & VALUE PROPOSITION */}
            <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-2 lg:mb-5 tracking-tight">
                {cardHeading}
              </h3>
              <p className="hidden md:block text-blue-100/70 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                {cardDescription}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
