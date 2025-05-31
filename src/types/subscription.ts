
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  stripe_price_id: string;
  features: string[];
  limitations?: string[];
  max_uploads?: number;
  max_ads?: number;
  priority_level: number;
  analytics_level: 'basic' | 'advanced' | 'premium';
  voice_options?: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingInfo {
  customer_id: string;
  payment_method?: {
    type: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
  next_invoice_date?: string;
  total_invoices: number;
}

export interface ContentUsage {
  songs_uploaded: number;
  ads_created: number;
  storage_used: number; // in MB
  monthly_plays: number;
}

export interface DashboardStats {
  total_plays: number;
  unique_listeners: number;
  avg_listen_time: number;
  top_content: Array<{
    id: string;
    title: string;
    plays: number;
    type: 'song' | 'ad';
  }>;
  recent_activity: Array<{
    date: string;
    plays: number;
    listeners: number;
  }>;
}
