import React from "react";
import { LayoutDashboard, Network, Cpu, KeyRound, User } from "lucide-react";

interface BottomNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  
  // Custom technical synthesizer click for mobile tactile feedback
  const playTactileClick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Subtle fast high pitch click, sounds like a high-end smartwatch touch
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Browsers blocks autoplay before interaction: ignore gracefully
    }
  };

  const handleTabClick = (tabId: string) => {
    playTactileClick();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setCurrentTab(tabId);
    
    // Smooth scroll scrollable main container to top when changing views
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "home", label: "总览", icon: LayoutDashboard },
    { id: "tower", label: "团队", icon: Network },
    { id: "store", label: "机房", icon: Cpu },
    { id: "items", label: "服务", icon: KeyRound },
    { id: "my", label: "后台", icon: User },
  ];

  const getTabStroke = (tabId: string, active: boolean) => {
    if (!active) return "currentColor";
    switch (tabId) {
      case "home":
      case "store":
      case "my":
        return "url(#gradient-cyan-blue)";
      case "tower":
        return "url(#gradient-purple-pink)";
      case "items":
        return "url(#gradient-emerald-teal)";
      default:
        return "url(#gradient-cyan-blue)";
    }
  };

  const getTabGlowClass = (tabId: string, active: boolean) => {
    if (!active) return "";
    switch (tabId) {
      case "home":
      case "store":
      case "my":
        return "icon-glow-cyan";
      case "tower":
        return "icon-glow-purple";
      case "items":
        return "icon-glow-emerald";
      default:
        return "icon-glow-cyan";
    }
  };

  return (
    <div className="md:hidden fixed bottom-[calc(8px+env(safe-area-inset-bottom))] left-3 right-3 z-50 bg-[#090b11]/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.05)] px-4 py-1.5 sm:py-2">
      <nav className="flex justify-around items-center" id="mobile-navigation-bar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="flex flex-col items-center justify-center py-1.5 relative focus:outline-none select-none flex-1 touch-manipulation cursor-pointer"
              style={{ minHeight: "44px" }} // Explicit compliance with minimum target touch size
            >
              {/* Highlight active halo effect */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-[2.5px] rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-fade-in" />
              )}

              <div
                className={`transition-all duration-300 ${
                  isActive
                    ? "scale-110"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              >
                <IconComponent 
                  stroke={getTabStroke(item.id, isActive)}
                  className={`size-5 ${getTabGlowClass(item.id, isActive)} ${item.id === "tower" && isActive ? "animate-spin" : ""}`} 
                  style={item.id === "tower" && isActive ? { animationDuration: "12s" } : undefined}
                />
              </div>

              <span
                className={`text-[8.5px] font-semibold mt-1 tracking-wider uppercase transition-colors duration-200 ${
                  isActive ? "text-[#22d3ee] font-black" : "text-zinc-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
