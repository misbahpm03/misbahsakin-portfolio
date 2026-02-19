/**
 * Contact Form Page
 *
 * Full-page form for Get In Touch. Sends via EmailJS.
 * Production-grade layout with contact sidebar, accessibility, and document title.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Send, CheckCircle2, Loader2, ArrowLeft, Mail, Target, Zap, Code } from "lucide-react";
import emailjs from "@emailjs/browser";
import { contactConfig, emailJsConfig } from "../config/contact";
import { cn } from "../components/ui/utils";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { WhatsAppIcon, TelegramIcon } from "../components/icons/ContactIcons";
import { ContactHeroIllustration } from "../components/ContactHeroIllustration";

const PAGE_TITLE = "Get in Touch | Md Misbahul Islam";
const DEFAULT_TITLE = "Md Misbahul Islam | Portfolio";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState | "_submit", string>>;

const initialFormState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validateForm(data: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_REGEX.test(data.email.trim())) errors.email = "Please enter a valid email";
  if (!data.message.trim()) errors.message = "Message is required";
  return errors;
}

export function ContactPage() {
  /* Form State */
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const successBackLinkRef = useRef<HTMLAnchorElement>(null);

  /* Document title */
  useEffect(() => {
    document.title = PAGE_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  /* Focus back link on success for accessibility */
  useEffect(() => {
    if (isSuccess && successBackLinkRef.current) {
      successBackLinkRef.current.focus({ preventScroll: true });
    }
  }, [isSuccess]);

  /* AI Planner State */
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<null | {
    overview: string;
    features: string[];
    techStack: { frontend: string; backend: string; database: string };
    timeline: { discovery: string; design: string; dev: string; launch: string };
  }>(null);

  const generatePlan = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      // Simple keyword matching for demo purposes
      const prompt = aiPrompt.toLowerCase();
      let plan = {
        overview: "A scalable, modern solution tailored to your requirements, focusing on performance and user experience.",
        features: ["User Authentication", "responsive Dashboard", "Real-time Notifications", "Analytics Integration", "Admin Panel"],
        techStack: { frontend: "React + Tailwind", backend: "Node.js", database: "PostgreSQL" },
        timeline: { discovery: "1 Week", design: "2 Weeks", dev: "4-6 Weeks", launch: "1 Week" }
      };

      if (prompt.includes("shop") || prompt.includes("commerce") || prompt.includes("store")) {
         plan = {
          overview: "A robust e-commerce platform designed for high conversion and seamless inventory management.",
          features: ["Product Catalog", "Secure Checkout", "Payment Gateway Integration", "Order Management", "Customer Reviews"],
          techStack: { frontend: "Next.js + Shopify", backend: "Node.js", database: "PostgreSQL" },
          timeline: { discovery: "2 Weeks", design: "3 Weeks", dev: "6-8 Weeks", launch: "2 Weeks" }
        };
      } else if (prompt.includes("ai") || prompt.includes("bot") || prompt.includes("gpt")) {
         plan = {
          overview: "An intelligent application leveraging LLMs to automate tasks and provide smart insights.",
          features: ["LLM Integration", "Context Management", "Streamed Responses", "User History", "Fine-tuning Pipeline"],
          techStack: { frontend: "React + Vercel AI SDK", backend: "Python/FastAPI", database: "Vector DB (Pinecone)" },
          timeline: { discovery: "2 Weeks", design: "2 Weeks", dev: "5-7 Weeks", launch: "1 Week" }
        };
      }

      setGeneratedPlan(plan);
      setIsGenerating(false);
    }, 1500);
  };

  const handleApplyToForm = () => {
    setFormData(prev => ({
      ...prev,
      subject: `Project Inquiry: ${aiPrompt}`,
      message: `I'd like to discuss building a project. \n\nProposed Plan:\n${generatedPlan?.overview}\n\nKey Features:\n- ${generatedPlan?.features.join('\n- ')}`
    }));
    setGeneratedPlan(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Handlers */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormState]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await emailjs.send(
        emailJsConfig.serviceId,
        emailJsConfig.templateId,
        {
          from_name: formData.name.trim(),
          from_email: formData.email.trim(),
          subject: formData.subject.trim() || "(No subject)",
          message: formData.message.trim(),
          to_email: contactConfig.formRecipientEmail,
        },
        emailJsConfig.publicKey
      );
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to send email:", err);
      setErrors({
        _submit: `Couldn't send. Please try again or email directly at ${contactConfig.email}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoHref = `mailto:${encodeURIComponent(contactConfig.email)}`;
  const telegramHref = `https://t.me/${contactConfig.telegramUsername}`;

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <AnimatedBackground />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Back to portfolio</span>
          </Link>
        </div>

        {/* Header: title + subtitle | illustration */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12 mb-8 lg:mb-12">
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-10xl">
              Interested in collaborating or have a project in mind? Let&apos;s create something amazing together!
            </p>
          </div>
        
        </div>

        {/* Form card - full width */}
        <Card className="border border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300 mb-8">
            {isSuccess ? (
              <CardContent className="p-8 lg:p-12 text-center animate-fade-in">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                  <CheckCircle2 className="size-10" strokeWidth={2} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-foreground">Message Successfully Sent</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                  Thanks for getting in touch. I usually respond within <span className="font-semibold text-foreground">24–48 hours</span>.
                </p>
                <Link to="/" ref={successBackLinkRef}>
                  <Button variant="outline" size="lg" className="rounded-xl border-border hover:border-primary/50">
                    <ArrowLeft className="mr-2 size-4" />
                    Back to portfolio
                  </Button>
                </Link>
              </CardContent>
            ) : (
              <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    
                    {/* Name + Email: stack on small screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          aria-required
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "name-error" : undefined}
                          className={cn(
                            errors.name && "border-destructive"
                          )}
                          disabled={isSubmitting}
                        />
                        {errors.name && <p id="name-error" className="text-xs text-destructive mt-1.5 font-medium" role="alert">{errors.name}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          aria-required
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "email-error" : undefined}
                          className={cn(
                            errors.email && "border-destructive"
                          )}
                          disabled={isSubmitting}
                        />
                        {errors.email && <p id="email-error" className="text-xs text-destructive mt-1.5 font-medium" role="alert">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subject <span className="text-xs font-normal text-muted-foreground ml-1.5">(Optional)</span>
                      </Label>
                      <Input
                        id="subject"
                        placeholder="Project Inquiry, Collaboration..."
                        autoComplete="off"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell me about your goals, timeline, and budget..."
                        autoComplete="off"
                        aria-required
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        className={cn(
                          "min-h-[120px]",
                          errors.message && "border-destructive"
                        )}
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {errors.message && <p id="message-error" className="text-xs text-destructive mt-1.5 font-medium" role="alert">{errors.message}</p>}
                    </div>

                    {errors._submit && (
                      <div className="rounded-lg bg-destructive/10 dark:bg-destructive/15 px-4 py-3 flex items-start gap-3 border border-destructive/20" role="alert">
                         <div className="text-destructive mt-0.5">•</div>
                         <p className="text-sm text-destructive font-medium leading-relaxed">{errors._submit}</p>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="lg"
                        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 size-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground mt-2" style={{ marginTop: "10px" }}>
                        Trusted by startups and growing brands. Typical response time: 24-48 hours.
                      </p>
                    </div>
                  </form>
                </CardContent>
            )}
          </Card>

        {/* Bottom section: two cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Or reach out directly */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold tracking-tight mb-4">Or reach out directly</h2>
              <ul className="space-y-3">
                <li>
                  <a
                    href={mailtoHref}
                    className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors"
                  >
                    <div className="bg-muted rounded-lg p-2 group-hover/item:bg-primary/10 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="truncate">{contactConfig.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={contactConfig.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors"
                  >
                    <div className="bg-muted rounded-lg p-2 group-hover/item:bg-primary/10 transition-colors">
                      <WhatsAppIcon className="h-4 w-4" />
                    </div>
                    <span>WhatsApp</span>
                  </a>
                </li>
                <li>
                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors"
                  >
                    <div className="bg-muted rounded-lg p-2 group-hover/item:bg-primary/10 transition-colors">
                      <TelegramIcon className="h-4 w-4" />
                    </div>
                    <span>Telegram</span>
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Not Sure How to Start? Let Me Help! */}
          <Card className="border border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold tracking-tight mb-3">Not Sure How to Start? Let Me Help!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Describe your ideas and get a structured project plan instantly.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["SaaS Dashboard", "E-commerce Store", "Portfolio Redesign", "AI Tool"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setAiPrompt(tag)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <Input
                  placeholder="What do you want to create?"
                  className="flex-1 min-w-0"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generatePlan()}
                />
                <Button
                  onClick={generatePlan}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shrink-0 min-w-[120px] h-10 px-6 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60"
                >
                  {isGenerating ? <Loader2 className="size-4 animate-spin" /> : "Generate"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Usually reply within 24-48 hours.</p>

              {/* Generated Plan Display */}
              {generatedPlan && (
                <div className="mt-6 pt-6 border-t border-border space-y-4" id="generated-plan">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Target className="size-4 text-primary" /> Project Overview
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed bg-muted p-3 rounded-lg border border-border">
                        {generatedPlan.overview}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Zap className="size-4 text-yellow-500" /> Key Features
                      </h4>
                      <ul className="text-muted-foreground text-sm space-y-1.5 bg-muted p-3 rounded-lg border border-border">
                        {generatedPlan.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-primary shrink-0" /> {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                      <Code className="size-4 text-blue-500" /> Suggested Stack
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Frontend</div>
                        <div className="text-sm font-medium">{generatedPlan.techStack.frontend}</div>
                      </div>
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Backend</div>
                        <div className="text-sm font-medium">{generatedPlan.techStack.backend}</div>
                      </div>
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Database</div>
                        <div className="text-sm font-medium">{generatedPlan.techStack.database}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center pt-2">
                    <Button size="sm" onClick={handleApplyToForm} className="rounded-xl bg-foreground text-background hover:bg-foreground/90">
                      Let&apos;s Build This <ArrowLeft className="ml-2 size-4 rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
