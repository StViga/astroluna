// Astrology and AI generation related types

export type ServiceType = 
  | 'natal_chart' 
  | 'compatibility' 
  | 'forecast' 
  | 'transit_analysis' 
  | 'solar_return';

export interface BirthData {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

export interface PersonData {
  name: string;
  birth_data: BirthData;
}

// AI Generation Request Types
export interface NatalChartRequest {
  person: PersonData;
  analysis_depth: 'basic' | 'detailed' | 'comprehensive';
  include_aspects: boolean;
  include_houses: boolean;
  language: 'en' | 'uk';
}

export interface CompatibilityRequest {
  person1: PersonData;
  person2: PersonData;
  analysis_type: 'romantic' | 'friendship' | 'business';
  language: 'en' | 'uk';
}

export interface ForecastRequest {
  person: PersonData;
  forecast_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  language: 'en' | 'uk';
}

export interface TransitRequest {
  person: PersonData;
  transit_date: string;
  analysis_period: 'day' | 'week' | 'month' | 'year';
  language: 'en' | 'uk';
}

export interface SolarReturnRequest {
  person: PersonData;
  return_year: number;
  language: 'en' | 'uk';
}

export type AIGenerationRequest = 
  | { type: 'natal_chart'; data: NatalChartRequest }
  | { type: 'compatibility'; data: CompatibilityRequest }
  | { type: 'forecast'; data: ForecastRequest }
  | { type: 'transit_analysis'; data: TransitRequest }
  | { type: 'solar_return'; data: SolarReturnRequest };

// AI Generation Response
export interface AIGenerationResponse {
  id: number;
  user_id: number;
  service_type: ServiceType;
  content: string;
  prompt_data: Record<string, any>;
  generation_time_ms: number;
  credits_used: number;
  created_at: string;
}

export interface GenerationResult {
  success: boolean;
  result?: AIGenerationResponse;
  error?: string;
  code?: string;
}

// Library Types
export interface LibraryItem {
  id: number;
  user_id: number;
  title: string;
  content: string;
  service_type: ServiceType;
  tags?: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibrarySearchParams {
  q?: string;
  service_type?: ServiceType;
  is_favorite?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface LibraryResponse {
  success: boolean;
  items: LibraryItem[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

export interface SaveToLibraryData {
  title: string;
  content: string;
  service_type: ServiceType;
  tags?: string[];
  is_favorite?: boolean;
}

// Location and timezone types
export interface LocationSuggestion {
  city: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

export interface TimezoneInfo {
  timezone: string;
  offset: number;
  dst: boolean;
  abbreviation: string;
}

// Chart visualization types
export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  number: number;
  sign: string;
  degree: number;
  ruler: string;
}

export interface AspectInfo {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  exact: boolean;
}

export interface NatalChart {
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects: AspectInfo[];
  ascendant: string;
  midheaven: string;
}

// Generation statistics
export interface GenerationStats {
  total_generations: number;
  generations_by_type: Record<ServiceType, number>;
  total_credits_used: number;
  average_generation_time: number;
  most_used_service: ServiceType;
  last_generation_date?: string;
}

// Export formats
export type ExportFormat = 'pdf' | 'docx' | 'html' | 'md';

export interface ExportOptions {
  format: ExportFormat;
  include_charts?: boolean;
  include_metadata?: boolean;
  custom_styling?: boolean;
}

// Demo mode
export interface DemoData {
  service_type: ServiceType;
  sample_request: any;
  sample_response: string;
  preview_text: string;
}

// Subscription and credits
export interface CreditTransaction {
  id: number;
  user_id: number;
  type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface CreditBalance {
  current_balance: number;
  last_transaction?: CreditTransaction;
  total_earned: number;
  total_spent: number;
}

// Service pricing
export interface ServicePricing {
  service_type: ServiceType;
  credits_required: number;
  estimated_time_minutes: number;
  description: string;
  features: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonus_credits?: number;
  validity_days: number;
  popular?: boolean;
  features: string[];
}