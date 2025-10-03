// Common types used throughout the application

// Navigation and routing
export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  current?: boolean;
  disabled?: boolean;
  badge?: string | number;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

// UI Components
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'search' | 'date' | 'time';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  label?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onChange?: (value: string) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  children: React.ReactNode;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Data fetching and API
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams {
  pagination?: PaginationParams;
  sorting?: SortParams;
  filters?: FilterParams;
  search?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}

// Form handling
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'time';
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: SelectOption[]; // for select, radio
  rows?: number; // for textarea
}

export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  defaultValues?: Record<string, any>;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Theme and styling
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animations: boolean;
}

// Language and localization
export type Language = 'en' | 'uk';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface LocaleConfig {
  language: Language;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: 'USD' | 'EUR' | 'UAH';
  timezone: string;
}

// Settings and preferences
export interface UserPreferences {
  theme: Theme;
  language: Language;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareUsageData: boolean;
  };
  display: {
    itemsPerPage: number;
    showAnimations: boolean;
    compactMode: boolean;
  };
}

// File handling
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadConfig {
  maxSize: number; // bytes
  allowedTypes: string[];
  maxFiles?: number;
  compress?: boolean;
}

// Charts and data visualization
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  meta?: any;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: ChartDataPoint[];
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: any;
    scales?: any;
  };
}

// Search and filtering
export interface SearchResult<T = any> {
  id: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  data: T;
  relevance?: number;
}

export interface SearchResponse<T = any> {
  results: SearchResult<T>[];
  total: number;
  query: string;
  suggestions?: string[];
  facets?: Record<string, number>;
}

// Notifications
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

// Feature flags
export interface FeatureFlags {
  emailVerification: boolean;
  passwordReset: boolean;
  aiGeneration: boolean;
  libraryExport: boolean;
  paymentGateway: boolean;
  socialLogin: boolean;
  twoFactorAuth: boolean;
  darkMode: boolean;
  betaFeatures: boolean;
}

// App configuration
export interface AppConfig {
  name: string;
  version: string;
  buildTime: string;
  apiUrl: string;
  features: FeatureFlags;
  limits: {
    maxFileSize: number;
    maxGenerationsPerHour: number;
    maxLibraryItems: number;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
  social: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

// Error boundaries
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Performance monitoring
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};