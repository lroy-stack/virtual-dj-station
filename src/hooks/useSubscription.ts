
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { UserSubscription, SubscriptionPlan, BillingInfo, ContentUsage } from '@/types/subscription';
import { User } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useSubscription = (user: User | null) => {
  const queryClient = useQueryClient();

  // Get user's current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });

  // Get available plans
  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Get user's content usage
  const { data: usage } = useQuery({
    queryKey: ['content-usage', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_content_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // Return default usage if no record exists
        return {
          songs_uploaded: 0,
          ads_created: 0,
          storage_used: 0,
          monthly_plays: 0,
        } as ContentUsage;
      }
      return data as ContentUsage;
    },
    enabled: !!user,
  });

  // Create checkout session
  const createCheckoutMutation = useMutation({
    mutationFn: async ({ planId, successUrl, cancelUrl }: {
      planId: string;
      successUrl: string;
      cancelUrl: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, successUrl, cancelUrl }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
  });

  // Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
  });

  // Get current plan details
  const currentPlan = plans?.find(plan => plan.id === subscription?.plan_id);

  const hasActiveSubscription = subscription?.status === 'active' || subscription?.status === 'trialing';

  const canUploadSongs = (currentCount: number) => {
    if (!currentPlan) return false;
    if (!currentPlan.max_uploads) return true; // unlimited
    return currentCount < currentPlan.max_uploads;
  };

  const canCreateAds = (currentCount: number) => {
    if (!currentPlan) return false;
    if (!currentPlan.max_ads) return true; // unlimited
    return currentCount < currentPlan.max_ads;
  };

  return {
    subscription,
    currentPlan,
    plans: plans || [],
    usage,
    hasActiveSubscription,
    canUploadSongs,
    canCreateAds,
    subscriptionLoading,
    createCheckout: createCheckoutMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCreatingCheckout: createCheckoutMutation.isPending,
    isCancellingSubscription: cancelSubscriptionMutation.isPending,
  };
};

export const useDashboardStats = (user: User | null) => {
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // Return default stats if no record exists
        return {
          total_plays: 0,
          unique_listeners: 0,
          avg_listen_time: 0,
          top_content: [],
          recent_activity: [],
        };
      }
      return data;
    },
    enabled: !!user,
  });
};
