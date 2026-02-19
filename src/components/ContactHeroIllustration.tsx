/**
 * Contact page hero illustration
 * Person with floating communication icons (email, WhatsApp, Telegram)
 */

import React from "react";
import { Mail } from "lucide-react";
import { WhatsAppIcon, TelegramIcon } from "./icons/ContactIcons";

export function ContactHeroIllustration({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="relative w-full max-w-[240px] aspect-square mx-auto">
        {/* Background circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-[85%] rounded-full bg-primary/5" />
          <div className="absolute size-[65%] rounded-full bg-primary/[0.07]" />
        </div>

        {/* Gear icon - subtle */}
        <div className="absolute top-2 right-4 size-12 rounded-full bg-muted/40 flex items-center justify-center opacity-40">
          <svg viewBox="0 0 24 24" className="size-6 text-muted-foreground" fill="currentColor">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" />
          </svg>
        </div>

        {/* Person avatar - center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
            <div className="size-20 rounded-full bg-primary/15 flex flex-col items-center justify-center gap-1 pt-2">
              <div className="flex gap-2">
                <div className="size-1.5 rounded-full bg-foreground/50" />
                <div className="size-1.5 rounded-full bg-foreground/50" />
              </div>
              <div className="w-6 h-2 rounded-full border border-foreground/30" />
            </div>
          </div>
        </div>

        {/* Floating icons */}
        <div className="absolute top-6 left-4 size-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center animate-[float_5s_ease-in-out_infinite]">
          <Mail className="size-5 text-primary" />
        </div>
        <div className="absolute top-8 right-2 size-10 rounded-xl bg-emerald-500/20 border border-emerald-600/40 flex items-center justify-center animate-[float_5.5s_ease-in-out_infinite_0.5s]">
          <WhatsAppIcon className="size-5 text-emerald-600" />
        </div>
        <div className="absolute bottom-12 right-6 size-10 rounded-xl bg-blue-500/20 border border-blue-600/40 flex items-center justify-center animate-[float_6s_ease-in-out_infinite_1s]">
          <TelegramIcon className="size-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
