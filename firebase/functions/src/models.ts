import { z } from "zod";

export interface FormConfig {
  schema: z.ZodObject<z.ZodRawShape>;
  notifyEmail: string;
  subject: string;
  confirmationSubject: string;
  requiredFields: string[];
  optionalFields: string[];
}

const formConfigs: Record<string, FormConfig> = {
  "contact": {
    schema: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      message: z.string().min(1),
    }),
    requiredFields: ["name", "email", "message"],
    optionalFields: ["phone"],
    notifyEmail: "REPLACE_ME@example.com",
    subject: "New Contact Form Submission",
    confirmationSubject: "We received your message",
  },
  "careers": {
    schema: z.object({
      name: z.string().min(1),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      // Same rule as the client (careers.vue): at least 7 digits.
      phone: z.string().refine((v) => v.replace(/\D/g, "").length >= 7, "Phone needs at least 7 digits"),
      position: z.string().min(1),
      location: z.string().optional(),
      availability: z.string().optional(),
      history: z.string().max(5000).optional(),
    }),
    requiredFields: ["firstName", "lastName", "email", "phone", "position"],
    optionalFields: ["location", "availability", "history"],
    notifyEmail: "jobs@havanarumbaonline.com",
    subject: "New Employment Application",
    confirmationSubject: "We received your application",
  },
  // Add more form types here (e.g., "request-demo", "newsletter")
  // following the same shape.
};

export default formConfigs;
