/**
 * Contact Me - Redesigned
 *
 * Opens a polished modal with WhatsApp, Telegram, and Email options.
 * Each option is a tappable card with brand styling.
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import { Mail, ChevronRight } from "lucide-react";
import { WhatsAppIcon, TelegramIcon } from "./icons/ContactIcons";
import { contactConfig } from "../config/contact";
import { cn } from "./ui/utils";

const mailtoHref = `mailto:${encodeURIComponent(contactConfig.email)}`;
const telegramHref = `https://t.me/${encodeURIComponent(contactConfig.telegramUsername)}`;

const options = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    sublabel: "Chat instantly",
    href: contactConfig.whatsappLink,
    icon: WhatsAppIcon,
    accent: "emerald",
  },
  {
    id: "telegram",
    label: "Telegram",
    sublabel: `@${contactConfig.telegramUsername}`,
    href: telegramHref,
    icon: TelegramIcon,
    accent: "sky",
  },
  {
    id: "email",
    label: "Email",
    sublabel: contactConfig.email,
    href: mailtoHref,
    icon: Mail,
    accent: "primary",
  },
];

const accentStyles = {
  emerald: "hover:bg-emerald-500/10 hover:border-emerald-500/40 dark:hover:bg-emerald-500/10 [&_.icon-wrap]:bg-emerald-500/15 [&_.icon-wrap]:text-emerald-600 dark:[&_.icon-wrap]:text-emerald-400",
  sky: "hover:bg-sky-500/10 hover:border-sky-500/40 dark:hover:bg-sky-500/10 [&_.icon-wrap]:bg-sky-500/15 [&_.icon-wrap]:text-sky-600 dark:[&_.icon-wrap]:text-sky-400",
  primary: "hover:bg-primary/10 hover:border-primary/40 [&_.icon-wrap]:bg-primary/15 [&_.icon-wrap]:text-primary",
};

export function ContactDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden border-border bg-card shadow-xl">
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Contact Me
            </DialogTitle>
            <DialogDescription>
              Choose how you&apos;d like to reach out. I typically respond within 24 hours.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Contact options */}
        <div className="p-4 space-y-2">
          {options.map((opt) => {
            const disabled = opt.id === "whatsapp" && !opt.href;
            const isExternal = opt.id !== "email";

            return (
              <a
                key={opt.id}
                href={disabled ? undefined : opt.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-disabled={disabled}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl border border-border",
                  "transition-all duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : accentStyles[opt.accent as keyof typeof accentStyles],
                )}
                aria-label={`Open ${opt.label}`}
              >
                <div className="icon-wrap flex items-center justify-center size-11 rounded-xl shrink-0 transition-colors">
                  <opt.icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {opt.sublabel}
                  </div>
                </div>
                {!disabled && (
                  <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" aria-hidden />
                )}
              </a>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
