import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const fullNameSchema = z.string()
  .min(2, 'Full name must be at least 2 characters')
  .max(255, 'Full name must be less than 255 characters')
  .regex(/^[a-zA-Zа-яА-ЯіІїЇєЄёЁ\s\-']+$/, 'Full name contains invalid characters');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

export const languageSchema = z.enum(['en', 'uk'], {
  errorMap: () => ({ message: 'Language must be either "en" or "uk"' })
});

export const currencySchema = z.enum(['USD', 'EUR', 'UAH'], {
  errorMap: () => ({ message: 'Currency must be USD, EUR, or UAH' })
});

// Authentication schemas
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: fullNameSchema,
  phone: phoneSchema,
  language: languageSchema.default('en'),
  currency: currencySchema.default('EUR')
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  language: languageSchema.optional()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required')
});

// Profile update schemas
export const updateProfileSchema = z.object({
  full_name: fullNameSchema.optional(),
  phone: phoneSchema,
  language: languageSchema.optional(),
  currency: currencySchema.optional()
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema
});

// AI Generation schemas
export const aiGenerationSchema = z.object({
  service_type: z.enum([
    'natal_chart', 
    'compatibility', 
    'forecast', 
    'transit_analysis', 
    'solar_return'
  ]),
  prompt_data: z.record(z.any()),
  save_to_library: z.boolean().default(false),
  library_title: z.string().max(255).optional()
});

// Library schemas
export const saveToLibrarySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  service_type: z.enum([
    'natal_chart', 
    'compatibility', 
    'forecast', 
    'transit_analysis', 
    'solar_return'
  ]),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  is_favorite: z.boolean().default(false)
});

export const updateLibraryItemSchema = z.object({
  title: z.string().max(255, 'Title too long').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  is_favorite: z.boolean().optional()
});

export const librarySearchSchema = z.object({
  q: z.string().optional(),
  service_type: z.enum([
    'natal_chart', 
    'compatibility', 
    'forecast', 
    'transit_analysis', 
    'solar_return'
  ]).optional(),
  is_favorite: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

// Birth data validation for astrology
export const birthDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timezone: z.string().min(1, 'Timezone is required')
  })
});

export const compatibilityDataSchema = z.object({
  person1: z.object({
    name: z.string().min(1, 'Person 1 name is required'),
    birth_data: birthDataSchema
  }),
  person2: z.object({
    name: z.string().min(1, 'Person 2 name is required'),
    birth_data: birthDataSchema
  }),
  analysis_type: z.enum(['romantic', 'friendship', 'business']).default('romantic')
});

export const transitDataSchema = z.object({
  birth_data: birthDataSchema,
  transit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  analysis_period: z.enum(['day', 'week', 'month', 'year']).default('month')
});

// Utility validation functions
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateAndSanitizeInput(schema: z.ZodSchema, data: any) {
  // First validate the structure
  const validated = schema.parse(data);
  
  // Then sanitize string fields
  const sanitized = JSON.parse(JSON.stringify(validated, (key, value) => {
    if (typeof value === 'string') {
      return sanitizeString(value);
    }
    return value;
  }));
  
  return sanitized;
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  windowMs: z.number().int().min(1000).default(60000), // 1 minute default
  maxRequests: z.number().int().min(1).default(100),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false)
});

// Pagination helpers
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function validatePagination(page?: string | number, limit?: string | number): PaginationParams {
  const validatedPage = Math.max(1, parseInt(String(page)) || 1);
  const validatedLimit = Math.min(50, Math.max(1, parseInt(String(limit)) || 20));
  const offset = (validatedPage - 1) * validatedLimit;
  
  return {
    page: validatedPage,
    limit: validatedLimit,
    offset
  };
}

// Error formatting for validation errors
export function formatValidationError(error: z.ZodError): { field: string; message: string }[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
}

// Custom validation for Ukrainian phone numbers
export function validateUkrainianPhone(phone: string): boolean {
  // Ukrainian phone formats: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX
  const ukrainePhoneRegex = /^(\+?380|0)[0-9]{9}$/;
  return ukrainePhoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Birth date validation (not in future, not too old)
export function validateBirthDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(now.getFullYear() - 100);
    
    return date <= now && date >= hundredYearsAgo;
  } catch {
    return false;
  }
}

// AI Generation validation schemas
export const horoscopeGenerationSchema = z.object({
  zodiacSign: z.string().min(1).max(50).optional(),
  birthDate: z.string().optional().refine((date) => {
    if (!date) return true;
    return validateBirthDate(date);
  }, 'Invalid birth date'),
  birthTime: z.string().optional(),
  birthPlace: z.string().max(200).optional(),
  type: z.enum(['daily', 'weekly', 'monthly', 'compatibility']),
  partnerSign: z.string().min(1).max(50).optional()
});

export const tarotGenerationSchema = z.object({
  question: z.string().max(500).optional(),
  spread: z.enum(['single', 'three-card', 'celtic-cross', 'five-card']),
  cards: z.array(z.string()).optional()
});

export const zodiacGenerationSchema = z.object({
  sign: z.string().min(1).max(50),
  query: z.string().min(1).max(500),
  type: z.enum(['personality', 'compatibility', 'career', 'love'])
});

// Zodiac signs validation
const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export function validateZodiacSign(sign: string): boolean {
  return zodiacSigns.includes(sign);
}

// Time validation (24-hour format)
export function validateTime(timeString: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

// Coordinate validation
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: { field: string; message: string }[];
}

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatValidationError(error) };
    }
    return { 
      success: false, 
      errors: [{ field: 'unknown', message: 'Validation failed' }] 
    };
  }
}