"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BAR_COLOR, BAR_PX, DOCK_COLOR, DOCK_PX, wallpaperCssUrl } from "./desktopArt";

export const OWNER_NAME = "Alan Fresco";
const WALLPAPER = wallpaperCssUrl();

/** Date and time the way the GNOME top bar writes them, in the visitor's locale: "Nov 22  11:15". */
export function formatClock(date: Date) {
  const day = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${day}  ${time}`;
}

const subscribeClock = (notify: () => void) => {
  const id = window.setInterval(notify, 1000);
  return () => window.clearInterval(id);
};

const subscribeLanguage = (notify: () => void) => {
  window.addEventListener("languagechange", notify);
  return () => window.removeEventListener("languagechange", notify);
};

const subscribeOnline = (notify: () => void) => {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
};

type Battery = { level: number; charging: boolean };
type BatteryManager = Battery & EventTarget;

/** Battery of the visitor's device. Only Chromium browsers expose it; elsewhere this stays null. */
function useBattery() {
  const [battery, setBattery] = useState<Battery | null>(null);

  useEffect(() => {
    const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery;
    if (!getBattery) return;
    let manager: BatteryManager | null = null;
    let cancelled = false;
    const read = () => manager && setBattery({ level: manager.level, charging: manager.charging });

    getBattery
      .call(navigator)
      .then((found) => {
        if (cancelled) return;
        manager = found;
        read();
        manager.addEventListener("levelchange", read);
        manager.addEventListener("chargingchange", read);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      manager?.removeEventListener("levelchange", read);
      manager?.removeEventListener("chargingchange", read);
    };
  }, []);

  return battery;
}

function NetworkIcon({ online }: { online: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 20.5 1.5 8.2C4.4 5.6 8 4 12 4s7.6 1.6 10.5 4.2L12 20.5z" opacity={online ? 1 : 0.35} />
      {!online && <path d="M4 3.5 20.5 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M3 9.5v5h3.8L12 19V5L6.8 9.5H3z" />
      <path d="M14.8 8.4a5 5 0 0 1 0 7.2M17.3 5.6a8.6 8.6 0 0 1 0 12.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon({ battery }: { battery: Battery | null }) {
  const level = battery?.level ?? 1;
  const fill = Math.max(1, Math.round(14 * level));
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <rect x="10" y="2" width="4" height="2.2" rx="0.6" />
      <rect x="7" y="4.6" width="10" height="17" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8.6" y={20 - fill} width="6.8" height={fill} rx="0.6" />
      {battery?.charging && <path d="M12.8 7.5 9.4 13.4h2.3l-.6 4.1 3.5-6h-2.3l.5-4z" fill={BAR_COLOR} stroke={BAR_COLOR} strokeWidth="0.4" />}
    </svg>
  );
}

function PowerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 3v8" />
      <path d="M6.3 6.6a8 8 0 1 0 11.4 0" />
    </svg>
  );
}

/** Ubuntu-style desktop shown full page once the camera is inside the laptop screen. */
export function UbuntuDesktop({ active, onLeave }: { active: boolean; onLeave: () => void }) {
  const clock = useSyncExternalStore(subscribeClock, () => formatClock(new Date()), () => "");
  const language = useSyncExternalStore(subscribeLanguage, () => navigator.language, () => "en");
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const battery = useBattery();
  const percent = battery ? `${Math.round(battery.level * 100)}%` : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [powerOpen, setPowerOpen] = useState(false);
  const trayRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setPowerOpen(false);
  };
  const shutDown = () => {
    closeMenu();
    onLeave();
  };

  // Leaving the screen any other way (Esc) closes the menu too.
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) closeMenu();
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !trayRef.current?.contains(target)) closeMenu();
    };
    // While the menu is open, Esc closes it instead of leaving the screen.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      closeMenu();
      trayRef.current?.focus();
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [menuOpen]);

  return (
    <div
      className="absolute inset-0 select-none bg-cover bg-center text-white"
      style={{ backgroundImage: WALLPAPER, fontFamily: "Ubuntu, system-ui, sans-serif" }}
    >
      {/* Top bar */}
      <header data-desktop-bar className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 text-[13px] font-semibold" style={{ background: BAR_COLOR, height: BAR_PX }}>
        <span>{OWNER_NAME}</span>
        <time className="absolute left-1/2 -translate-x-1/2 whitespace-pre" suppressHydrationWarning>
          {clock}
        </time>
        <div className="flex items-center gap-3">
          <span data-bar-item title={`Language: ${language}`}>{language.split("-")[0].toLowerCase()}</span>
          <button
            ref={trayRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            tabIndex={active ? 0 : -1}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="System menu"
            className={`-my-1 flex items-center gap-3 rounded-full px-2.5 py-1 hover:bg-white/15 focus-visible:outline-white ${menuOpen ? "bg-white/20" : ""}`}
          >
            <span data-bar-item className="flex" title={online ? "Connected" : "Offline"} role="img" aria-label={online ? "Network: connected" : "Network: offline"}>
              <NetworkIcon online={online} />
            </span>
            <span data-bar-item className="flex" role="img" aria-label="Sound">
              <SoundIcon />
            </span>
            <span
              className="flex items-center gap-1"
              title={percent ? `Battery: ${percent}${battery?.charging ? ", charging" : ""}` : "Battery"}
              role="img"
              aria-label={percent ? `Battery: ${percent}` : "Battery"}
            >
              <span data-bar-item className="flex">
                <BatteryIcon battery={battery} />
              </span>
              {percent && (
                <span data-bar-item className="font-medium">
                  {percent}
                </span>
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Dock: empty for now. */}
      <nav aria-label="Dock" className="absolute bottom-0 left-0" style={{ background: DOCK_COLOR, top: BAR_PX, width: DOCK_PX }} />

      {/* System menu, like GNOME's quick settings under the status icons. */}
      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="System menu"
          className="absolute right-2 z-20 w-72 rounded-2xl bg-[#2b2b2b] p-3 text-[13px] font-medium shadow-2xl ring-1 ring-white/10"
          style={{ top: BAR_PX + 6 }}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="flex items-center gap-2 text-white/80">
              <BatteryIcon battery={battery} />
              {percent ?? "Battery"}
            </span>
            <button
              type="button"
              role="menuitem"
              onClick={() => setPowerOpen((open) => !open)}
              aria-expanded={powerOpen}
              aria-label="Power options"
              title="Power Off / Log Out"
              className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-white ${powerOpen ? "bg-white/20" : "bg-white/10"}`}
            >
              <PowerIcon />
            </button>
          </div>

          {powerOpen ? (
            <div className="rounded-xl bg-white/5 p-1">
              <p className="flex items-center gap-2 px-3 pt-2 pb-1 text-[12px] font-semibold text-white/60">
                <PowerIcon className="h-3.5 w-3.5" /> Power Off
              </p>
              <button
                type="button"
                role="menuitem"
                autoFocus
                onClick={shutDown}
                className="block w-full rounded-lg px-3 py-2 text-left hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
              >
                Power Off…
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-full bg-[#e95420] px-3 py-2.5">
                <NetworkIcon online={online} />
                <span className="truncate">{online ? "Wi-Fi" : "Offline"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2.5">
                <SoundIcon />
                <span className="truncate">Sound</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
