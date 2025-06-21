import { z } from 'zod';

// Zod schemas for validation
export const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

export const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z
    .array(z.string())
    .min(1, 'At least one description point is required'),
});

export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  location: z.string().optional(),
  graduationDate: z.string().optional(),
  gpa: z.string().optional(),
});

export const skillCategorySchema = z.object({
  category: z.string().min(1, 'Skill category is required'),
  items: z.array(z.string()).min(1, 'At least one skill is required'),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Project description is required'),
  technologies: z.array(z.string()).optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().optional(),
});

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string().min(10, 'Summary should be at least 10 characters'),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillCategorySchema),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
});

// TypeScript interfaces derived from schemas
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;

// Default/empty resume data
export const defaultResumeData: ResumeData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
};

// Helper function to validate resume data
export function validateResumeData(data: unknown): {
  success: boolean;
  data?: ResumeData;
  errors?: string[];
} {
  try {
    const validatedData = resumeDataSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`,
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Helper function to merge partial resume data with defaults
export function mergeWithDefaults(
  partialData: Partial<ResumeData>,
): ResumeData {
  return {
    personalInfo: {
      ...defaultResumeData.personalInfo,
      ...partialData.personalInfo,
    },
    summary: partialData.summary || defaultResumeData.summary,
    experience: partialData.experience || defaultResumeData.experience,
    education: partialData.education || defaultResumeData.education,
    skills: partialData.skills || defaultResumeData.skills,
    projects: partialData.projects || defaultResumeData.projects,
    certifications:
      partialData.certifications || defaultResumeData.certifications,
  };
}
