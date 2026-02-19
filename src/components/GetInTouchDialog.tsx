/**
 * Get In Touch - Redesigned
 *
 * Form with Name, Email, Subject (optional), Message.
 * Validates, sends via EmailJS, shows success state.
 */

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Send, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import emailjs from "@emailjs/browser";
import { contactConfig, emailJsConfig } from "../config/contact";
import { cn } from "./ui/utils";

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

export function GetInTouchDialog({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormState]) setErrors((prev) => ({ ...prev, [id]: undefined }));
  }, [errors]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
    setIsSuccess(false);
  }, []);

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
        _submit: "Couldn't send. Please try again or email directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetForm()}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden border-border bg-card shadow-xl">
        {isSuccess ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-8" strokeWidth={2} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Message sent!</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Thanks for reaching out. I&apos;ll reply to{" "}
                <span className="font-medium text-foreground">{formData.email}</span> soon.
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button variant="outline" className="mt-6 min-w-[140px]" aria-label="Close">
                Close
              </Button>
            </DialogClose>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-b border-border">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="size-5" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Get In Touch
                  </DialogTitle>
                  <DialogDescription>
                    Share your project or question. I&apos;ll get back soon.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              <div className="grid gap-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={cn(errors.name && "border-destructive")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive" role="alert">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={cn(errors.email && "border-destructive")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                <Input
                  id="subject"
                  placeholder="Project inquiry, collaboration..."
                  autoComplete="off"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your project or question..."
                  autoComplete="off"
                  className={cn("min-h-[100px] resize-none", errors.message && "border-destructive")}
                  value={formData.message}
                  onChange={handleChange}
                  aria-required
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p id="message-error" className="text-sm text-destructive" role="alert">{errors.message}</p>
                )}
              </div>

              {errors._submit && (
                <p className="rounded-lg bg-destructive/10 dark:bg-destructive/20 px-3 py-2 text-sm text-destructive" role="alert">
                  {errors._submit}
                </p>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[160px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" aria-hidden />
                      Send Message
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
