export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  avatar_url?: string | null;
  sustainability_score: number;
  eco_tier: string;
  current_streak: number;
  last_scan_date?: string | null;
  total_scans_count: number;
  total_recycled_count: number;
  diverted_weight_kg: number;
  carbon_saved_kg: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface WastePrediction {
  category: string;
  subcategory?: string | null;
  confidence: number;
  is_recyclable: boolean;
  material_composition?: string | null;
  target_bin_color: string;
  disposal_instructions: string;
  preparation_steps: string[];
  estimated_carbon_saved_kg: number;
  estimated_weight_kg: number;
  model_version: string;
  model_status: string;
  model_message?: string | null;
}

export interface WasteScan {
  id: number;
  user_id: number;
  image_path: string;
  image_filename: string;
  category: string;
  subcategory?: string | null;
  confidence: number;
  is_recyclable: boolean;
  material_composition?: string | null;
  disposal_instructions: string;
  preparation_steps?: string | null;
  target_bin_color: string;
  estimated_carbon_saved_kg: number;
  estimated_weight_kg: number;
  user_feedback_correct?: boolean | null;
  model_version: string;
  notes?: string | null;
  created_at: string;
}

export interface RecyclingCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  latitude: number;
  longitude: number;
  phone?: string | null;
  website?: string | null;
  operating_hours: string;
  accepted_materials: string[];
  is_municipal: boolean;
  is_active: boolean;
  rating: number;
  distance_km?: number | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export interface SustainabilityScoreResponse {
  score: number;
  tier: string;
  next_tier: string;
  points_to_next_tier: number;
  streak_days: number;
  total_scans: number;
  recycled_count: number;
  recycling_rate: number;
  carbon_saved_kg: number;
  diverted_weight_kg: number;
  badges: Badge[];
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
  recyclable_count: number;
}

export interface MonthlyTrendPoint {
  month: string;
  scans_count: number;
  recycled_count: number;
  diverted_kg: number;
}

export interface WeeklyActivityPoint {
  day: string;
  scans: number;
  recycled: number;
}

export interface EcoRecommendationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: string;
  estimated_saving: string;
}

export interface DashboardStats {
  sustainability: SustainabilityScoreResponse;
  category_breakdown: CategoryBreakdown[];
  monthly_trends: MonthlyTrendPoint[];
  weekly_activity: WeeklyActivityPoint[];
  recommendations: EcoRecommendationItem[];
}

export interface AdminStats {
  total_users: number;
  total_scans: number;
  total_recycled_items: number;
  total_diverted_kg: number;
  total_carbon_saved_kg: number;
  total_recycling_centers: number;
  ai_predictions_count: number;
  overall_recycling_rate: number;
  top_waste_categories: CategoryBreakdown[];
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'achievement' | 'tip' | 'system' | 'alert';
  is_read: boolean;
  link_url?: string | null;
  created_at: string;
}

export interface AIModelStatus {
  model_name: string;
  version: string;
  status: string;
  confidence_threshold: number;
  is_pytorch_available: boolean;
  custom_weights_loaded: boolean;
  supported_categories: string[];
  total_classes: number;
  architecture: string;
}
