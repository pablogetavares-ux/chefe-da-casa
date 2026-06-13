export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      account_privacy_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_generations: {
        Row: {
          completion_tokens: number;
          created_at: string;
          error_message: string | null;
          id: string;
          input_snapshot: Json;
          latency_ms: number | null;
          model: string;
          output_snapshot: Json | null;
          prompt_tokens: number;
          recipe_id: string | null;
          status: Database["public"]["Enums"]["AiGenerationStatus"];
          total_tokens: number;
          user_id: string;
        };
        Insert: {
          completion_tokens?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          input_snapshot?: Json;
          latency_ms?: number | null;
          model: string;
          output_snapshot?: Json | null;
          prompt_tokens?: number;
          recipe_id?: string | null;
          status?: Database["public"]["Enums"]["AiGenerationStatus"];
          total_tokens?: number;
          user_id: string;
        };
        Update: {
          completion_tokens?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          input_snapshot?: Json;
          latency_ms?: number | null;
          model?: string;
          output_snapshot?: Json | null;
          prompt_tokens?: number;
          recipe_id?: string | null;
          status?: Database["public"]["Enums"]["AiGenerationStatus"];
          total_tokens?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generations_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_generations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      favorites: {
        Row: {
          created_at: string;
          id: string;
          recipe_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          recipe_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          recipe_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_scans: {
        Row: {
          created_at: string;
          detected_ingredients: Json;
          id: string;
          scene_description: string | null;
          storage_path: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          detected_ingredients?: Json;
          id?: string;
          scene_description?: string | null;
          storage_path: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          detected_ingredients?: Json;
          id?: string;
          scene_description?: string | null;
          storage_path?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ingredient_substitutions: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          is_system: boolean;
          original_name: string;
          original_product_id: string | null;
          reason: string;
          substitute_name: string;
          substitute_product_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_system?: boolean;
          original_name: string;
          original_product_id?: string | null;
          reason: string;
          substitute_name: string;
          substitute_product_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_system?: boolean;
          original_name?: string;
          original_product_id?: string | null;
          reason?: string;
          substitute_name?: string;
          substitute_product_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_substitutions_original_product_id_fkey";
            columns: ["original_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_substitutions_substitute_product_id_fkey";
            columns: ["substitute_product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredients: {
        Row: {
          category: string | null;
          created_at: string;
          created_by_id: string | null;
          id: string;
          is_system: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          is_system?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          created_by_id?: string | null;
          id?: string;
          is_system?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredients_created_by_id_fkey";
            columns: ["created_by_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      market_prices: {
        Row: {
          created_at: string;
          id: string;
          market_name: string;
          price: number;
          product_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          market_name: string;
          price: number;
          product_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          market_name?: string;
          price?: number;
          product_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "market_prices_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      mobile_subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          entitlement_id: string;
          expires_at: string | null;
          id: string;
          is_trial: boolean;
          last_event_at: string | null;
          last_event_type: string | null;
          original_purchase_at: string | null;
          plan: Database["public"]["Enums"]["PlanTier"];
          product_id: string | null;
          revenuecat_app_user_id: string;
          status: Database["public"]["Enums"]["SubscriptionStatus"];
          store: Database["public"]["Enums"]["BillingStore"];
          updated_at: string;
          user_id: string;
          will_renew: boolean;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          entitlement_id?: string;
          expires_at?: string | null;
          id?: string;
          is_trial?: boolean;
          last_event_at?: string | null;
          last_event_type?: string | null;
          original_purchase_at?: string | null;
          plan?: Database["public"]["Enums"]["PlanTier"];
          product_id?: string | null;
          revenuecat_app_user_id: string;
          status?: Database["public"]["Enums"]["SubscriptionStatus"];
          store?: Database["public"]["Enums"]["BillingStore"];
          updated_at?: string;
          user_id: string;
          will_renew?: boolean;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          entitlement_id?: string;
          expires_at?: string | null;
          id?: string;
          is_trial?: boolean;
          last_event_at?: string | null;
          last_event_type?: string | null;
          original_purchase_at?: string | null;
          plan?: Database["public"]["Enums"]["PlanTier"];
          product_id?: string | null;
          revenuecat_app_user_id?: string;
          status?: Database["public"]["Enums"]["SubscriptionStatus"];
          store?: Database["public"]["Enums"]["BillingStore"];
          updated_at?: string;
          user_id?: string;
          will_renew?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "mobile_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      monthly_purchase_items: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          is_purchased: boolean;
          monthly_purchase_list_id: string;
          name: string;
          notes: string | null;
          price_paid: number | null;
          quantity: number | null;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          id?: string;
          is_purchased?: boolean;
          monthly_purchase_list_id: string;
          name: string;
          notes?: string | null;
          price_paid?: number | null;
          quantity?: number | null;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          is_purchased?: boolean;
          monthly_purchase_list_id?: string;
          name?: string;
          notes?: string | null;
          price_paid?: number | null;
          quantity?: number | null;
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "monthly_purchase_items_monthly_purchase_list_id_fkey";
            columns: ["monthly_purchase_list_id"];
            isOneToOne: false;
            referencedRelation: "monthly_purchase_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      monthly_purchase_lists: {
        Row: {
          created_at: string;
          id: string;
          month: number;
          updated_at: string;
          user_id: string;
          year: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          month: number;
          updated_at?: string;
          user_id: string;
          year: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          month?: number;
          updated_at?: string;
          user_id?: string;
          year?: number;
        };
        Relationships: [];
      };
      offer_cashback_entries: {
        Row: {
          amount_cents: number;
          created_at: string;
          id: string;
          metadata: Json;
          offer_id: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          amount_cents?: number;
          created_at?: string;
          id?: string;
          metadata?: Json;
          offer_id?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          id?: string;
          metadata?: Json;
          offer_id?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offer_cashback_entries_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "regional_offers";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_categories: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          legacy_enum: Database["public"]["Enums"]["OfferCategory"] | null;
          metadata: Json;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
          vertical_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          legacy_enum?: Database["public"]["Enums"]["OfferCategory"] | null;
          metadata?: Json;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
          vertical_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          legacy_enum?: Database["public"]["Enums"]["OfferCategory"] | null;
          metadata?: Json;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
          vertical_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offer_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "offer_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offer_categories_vertical_id_fkey";
            columns: ["vertical_id"];
            isOneToOne: false;
            referencedRelation: "offer_verticals";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_coupons: {
        Row: {
          code: string;
          created_at: string;
          discount_type: string;
          discount_value: number;
          id: string;
          is_active: boolean;
          metadata: Json;
          store_id: string | null;
          valid_until: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          discount_type?: string;
          discount_value: number;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          store_id?: string | null;
          valid_until?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          discount_type?: string;
          discount_value?: number;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          store_id?: string | null;
          valid_until?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "offer_coupons_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "regional_stores";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_extension_registry: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json;
          name: string;
          slug: string;
          status: Database["public"]["Enums"]["offer_extension_status"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          name: string;
          slug: string;
          status?: Database["public"]["Enums"]["offer_extension_status"];
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json;
          name?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["offer_extension_status"];
        };
        Relationships: [];
      };
      offer_favorites: {
        Row: {
          created_at: string;
          id: string;
          offer_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          offer_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          offer_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offer_favorites_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "regional_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offer_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_market_catalog: {
        Row: {
          chain: string;
          city: string;
          created_at: string;
          external_partner_id: string | null;
          id: string;
          is_active: boolean;
          latitude: number;
          longitude: number;
          metadata: Json;
          name: string;
          state: string;
          updated_at: string;
        };
        Insert: {
          chain: string;
          city: string;
          created_at?: string;
          external_partner_id?: string | null;
          id?: string;
          is_active?: boolean;
          latitude: number;
          longitude: number;
          metadata?: Json;
          name: string;
          state: string;
          updated_at?: string;
        };
        Update: {
          chain?: string;
          city?: string;
          created_at?: string;
          external_partner_id?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number;
          longitude?: number;
          metadata?: Json;
          name?: string;
          state?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      offer_price_alerts: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          metadata: Json;
          notify_email: boolean;
          notify_push: boolean;
          target_price: number | null;
          updated_at: string;
          user_id: string;
          watchlist_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          notify_email?: boolean;
          notify_push?: boolean;
          target_price?: number | null;
          updated_at?: string;
          user_id: string;
          watchlist_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          notify_email?: boolean;
          notify_push?: boolean;
          target_price?: number | null;
          updated_at?: string;
          user_id?: string;
          watchlist_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "offer_price_alerts_watchlist_id_fkey";
            columns: ["watchlist_id"];
            isOneToOne: false;
            referencedRelation: "offer_product_watchlist";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_product_watchlist: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          last_offer_id: string | null;
          metadata: Json;
          product_key: string;
          updated_at: string;
          user_id: string;
          vertical_slug: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          id?: string;
          last_offer_id?: string | null;
          metadata?: Json;
          product_key: string;
          updated_at?: string;
          user_id: string;
          vertical_slug?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          last_offer_id?: string | null;
          metadata?: Json;
          product_key?: string;
          updated_at?: string;
          user_id?: string;
          vertical_slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offer_product_watchlist_last_offer_id_fkey";
            columns: ["last_offer_id"];
            isOneToOne: false;
            referencedRelation: "regional_offers";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_push_subscriptions: {
        Row: {
          created_at: string;
          device_token: string | null;
          endpoint: string | null;
          id: string;
          is_active: boolean;
          metadata: Json;
          platform: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          device_token?: string | null;
          endpoint?: string | null;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          platform?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          device_token?: string | null;
          endpoint?: string | null;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          platform?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      offer_verticals: {
        Row: {
          created_at: string;
          description: string | null;
          icon_key: string | null;
          id: string;
          is_active: boolean;
          metadata: Json;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon_key?: string | null;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon_key?: string | null;
          id?: string;
          is_active?: boolean;
          metadata?: Json;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      pantry_items: {
        Row: {
          category: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          ingredient_id: string | null;
          item_kind: string;
          name: string;
          notes: string | null;
          quantity: number | null;
          unit: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          ingredient_id?: string | null;
          item_kind?: string;
          name: string;
          notes?: string | null;
          quantity?: number | null;
          unit?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          ingredient_id?: string | null;
          item_kind?: string;
          name?: string;
          notes?: string | null;
          quantity?: number | null;
          unit?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pantry_items_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pantry_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      plan_change_logs: {
        Row: {
          created_at: string;
          id: string;
          metadata: Json | null;
          new_plan: Database["public"]["Enums"]["PlanTier"];
          previous_plan: Database["public"]["Enums"]["PlanTier"] | null;
          source: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          new_plan: Database["public"]["Enums"]["PlanTier"];
          previous_plan?: Database["public"]["Enums"]["PlanTier"] | null;
          source: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          new_plan?: Database["public"]["Enums"]["PlanTier"];
          previous_plan?: Database["public"]["Enums"]["PlanTier"] | null;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plan_change_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          base_unit: string;
          category: string;
          created_at: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          base_unit?: string;
          category?: string;
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          base_unit?: string;
          category?: string;
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          body_height_cm: number | null;
          body_weight_kg: number | null;
          created_at: string;
          email: string;
          fitness_goal: string | null;
          full_name: string | null;
          id: string;
          offer_city: string | null;
          offer_preferences: Json;
          offer_search_radius_km: number;
          offer_state: string | null;
          plan: Database["public"]["Enums"]["PlanTier"];
          senior_mode_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          body_height_cm?: number | null;
          body_weight_kg?: number | null;
          created_at?: string;
          email: string;
          fitness_goal?: string | null;
          full_name?: string | null;
          id: string;
          offer_city?: string | null;
          offer_preferences?: Json;
          offer_search_radius_km?: number;
          offer_state?: string | null;
          plan?: Database["public"]["Enums"]["PlanTier"];
          senior_mode_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          body_height_cm?: number | null;
          body_weight_kg?: number | null;
          created_at?: string;
          email?: string;
          fitness_goal?: string | null;
          full_name?: string | null;
          id?: string;
          offer_city?: string | null;
          offer_preferences?: Json;
          offer_search_radius_km?: number;
          offer_state?: string | null;
          plan?: Database["public"]["Enums"]["PlanTier"];
          senior_mode_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_ingredients: {
        Row: {
          created_at: string;
          id: string;
          ingredient_id: string;
          notes: string | null;
          quantity: number | null;
          recipe_id: string;
          sort_order: number;
          unit: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingredient_id: string;
          notes?: string | null;
          quantity?: number | null;
          recipe_id: string;
          sort_order?: number;
          unit?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          ingredient_id?: string;
          notes?: string | null;
          quantity?: number | null;
          recipe_id?: string;
          sort_order?: number;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_prep_videos: {
        Row: {
          caption: string | null;
          created_at: string;
          duration_seconds: number;
          id: string;
          is_system: boolean;
          recipe_id: string | null;
          sort_order: number;
          step_number: number | null;
          thumbnail_url: string | null;
          title: string;
          user_id: string | null;
          video_url: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          duration_seconds?: number;
          id?: string;
          is_system?: boolean;
          recipe_id?: string | null;
          sort_order?: number;
          step_number?: number | null;
          thumbnail_url?: string | null;
          title: string;
          user_id?: string | null;
          video_url: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          duration_seconds?: number;
          id?: string;
          is_system?: boolean;
          recipe_id?: string | null;
          sort_order?: number;
          step_number?: number | null;
          thumbnail_url?: string | null;
          title?: string;
          user_id?: string | null;
          video_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_prep_videos_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_prep_videos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          ai_prompt_snapshot: string | null;
          cook_time_minutes: number;
          cover_image_url: string | null;
          created_at: string;
          description: string | null;
          dietary_tags: Database["public"]["Enums"]["DietaryPreference"][];
          difficulty: Database["public"]["Enums"]["RecipeDifficulty"];
          id: string;
          ingredients: Json;
          instructions: Json;
          is_ai_generated: boolean;
          prep_time_minutes: number;
          servings: number;
          tags: string[];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_prompt_snapshot?: string | null;
          cook_time_minutes?: number;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          dietary_tags?: Database["public"]["Enums"]["DietaryPreference"][];
          difficulty?: Database["public"]["Enums"]["RecipeDifficulty"];
          id?: string;
          ingredients?: Json;
          instructions?: Json;
          is_ai_generated?: boolean;
          prep_time_minutes?: number;
          servings?: number;
          tags?: string[];
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_prompt_snapshot?: string | null;
          cook_time_minutes?: number;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          dietary_tags?: Database["public"]["Enums"]["DietaryPreference"][];
          difficulty?: Database["public"]["Enums"]["RecipeDifficulty"];
          id?: string;
          ingredients?: Json;
          instructions?: Json;
          is_ai_generated?: boolean;
          prep_time_minutes?: number;
          servings?: number;
          tags?: string[];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      regional_offers: {
        Row: {
          category: Database["public"]["Enums"]["OfferCategory"];
          category_id: string | null;
          created_at: string;
          current_price: number;
          description: string | null;
          id: string;
          image_url: string | null;
          ingredient_keywords: string[];
          is_active: boolean;
          previous_price: number | null;
          product_name: string;
          store_id: string;
          title: string;
          unit: string | null;
          updated_at: string;
          valid_from: string;
          valid_until: string;
        };
        Insert: {
          category?: Database["public"]["Enums"]["OfferCategory"];
          category_id?: string | null;
          created_at?: string;
          current_price: number;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          ingredient_keywords?: string[];
          is_active?: boolean;
          previous_price?: number | null;
          product_name: string;
          store_id: string;
          title: string;
          unit?: string | null;
          updated_at?: string;
          valid_from?: string;
          valid_until: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["OfferCategory"];
          category_id?: string | null;
          created_at?: string;
          current_price?: number;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          ingredient_keywords?: string[];
          is_active?: boolean;
          previous_price?: number | null;
          product_name?: string;
          store_id?: string;
          title?: string;
          unit?: string | null;
          updated_at?: string;
          valid_from?: string;
          valid_until?: string;
        };
        Relationships: [
          {
            foreignKeyName: "regional_offers_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "offer_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "regional_offers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "regional_stores";
            referencedColumns: ["id"];
          },
        ];
      };
      regional_stores: {
        Row: {
          chain: string;
          city: string;
          created_at: string;
          id: string;
          is_active: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          neighborhood: string | null;
          state: string;
          vertical_id: string | null;
        };
        Insert: {
          chain: string;
          city: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          neighborhood?: string | null;
          state?: string;
          vertical_id?: string | null;
        };
        Update: {
          chain?: string;
          city?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          neighborhood?: string | null;
          state?: string;
          vertical_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "regional_stores_vertical_id_fkey";
            columns: ["vertical_id"];
            isOneToOne: false;
            referencedRelation: "offer_verticals";
            referencedColumns: ["id"];
          },
        ];
      };
      revenuecat_webhook_events: {
        Row: {
          event_type: string;
          id: string;
          processed_at: string;
        };
        Insert: {
          event_type: string;
          id: string;
          processed_at?: string;
        };
        Update: {
          event_type?: string;
          id?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      shopping_list_items: {
        Row: {
          category: string;
          created_at: string;
          estimated_savings: number | null;
          id: string;
          ingredient_id: string | null;
          is_checked: boolean;
          name: string;
          offer_id: string | null;
          quantity: number | null;
          recipe_id: string | null;
          shopping_list_id: string;
          sort_order: number;
          source: string;
          unit: string | null;
          unit_price: number | null;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          estimated_savings?: number | null;
          id?: string;
          ingredient_id?: string | null;
          is_checked?: boolean;
          name: string;
          offer_id?: string | null;
          quantity?: number | null;
          recipe_id?: string | null;
          shopping_list_id: string;
          sort_order?: number;
          source?: string;
          unit?: string | null;
          unit_price?: number | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          estimated_savings?: number | null;
          id?: string;
          ingredient_id?: string | null;
          is_checked?: boolean;
          name?: string;
          offer_id?: string | null;
          quantity?: number | null;
          recipe_id?: string | null;
          shopping_list_id?: string;
          sort_order?: number;
          source?: string;
          unit?: string | null;
          unit_price?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_items_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "regional_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_items_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shopping_list_items_shopping_list_id_fkey";
            columns: ["shopping_list_id"];
            isOneToOne: false;
            referencedRelation: "shopping_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      shopping_lists: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_webhook_events: {
        Row: {
          event_type: string;
          id: string;
          processed_at: string;
        };
        Insert: {
          event_type: string;
          id: string;
          processed_at?: string;
        };
        Update: {
          event_type?: string;
          id?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan: Database["public"]["Enums"]["PlanTier"];
          status: Database["public"]["Enums"]["SubscriptionStatus"];
          stripe_customer_id: string;
          stripe_subscription_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: Database["public"]["Enums"]["PlanTier"];
          status?: Database["public"]["Enums"]["SubscriptionStatus"];
          stripe_customer_id: string;
          stripe_subscription_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan?: Database["public"]["Enums"]["PlanTier"];
          status?: Database["public"]["Enums"]["SubscriptionStatus"];
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_logs: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_meal_plans: {
        Row: {
          cheapest_market: string | null;
          created_at: string;
          goal: string;
          id: string;
          plan_json: Json;
          starts_on: string;
          total_cost: number | null;
          user_id: string;
        };
        Insert: {
          cheapest_market?: string | null;
          created_at?: string;
          goal: string;
          id?: string;
          plan_json: Json;
          starts_on?: string;
          total_cost?: number | null;
          user_id: string;
        };
        Update: {
          cheapest_market?: string | null;
          created_at?: string;
          goal?: string;
          id?: string;
          plan_json?: Json;
          starts_on?: string;
          total_cost?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      count_active_offers_by_vertical: {
        Args: Record<PropertyKey, never>;
        Returns: {
          vertical_slug: string;
          offer_count: number;
        }[];
      };
      log_plan_change: {
        Args: {
          p_metadata?: Json;
          p_new: Database["public"]["Enums"]["PlanTier"];
          p_previous: Database["public"]["Enums"]["PlanTier"];
          p_source: string;
          p_user_id: string;
        };
        Returns: undefined;
      };
      mock_upgrade_plan: {
        Args: { p_plan: Database["public"]["Enums"]["PlanTier"] };
        Returns: Database["public"]["Enums"]["PlanTier"];
      };
      record_usage_log: {
        Args: { p_action: string; p_metadata?: Json | null };
        Returns: undefined;
      };
    };
    Enums: {
      AiGenerationStatus: "PENDING" | "COMPLETED" | "FAILED" | "CANCELED";
      BillingStore:
        | "GOOGLE_PLAY"
        | "APP_STORE"
        | "STRIPE"
        | "PROMOTIONAL"
        | "UNKNOWN";
      DietaryPreference:
        | "VEGETARIAN"
        | "VEGAN"
        | "GLUTEN_FREE"
        | "LACTOSE_FREE"
        | "LOW_CARB"
        | "KETO";
      offer_extension_status: "planned" | "beta" | "active";
      OfferCategory:
        | "MEAT"
        | "PRODUCE"
        | "DAIRY"
        | "BAKERY"
        | "BEVERAGES"
        | "FROZEN"
        | "PANTRY"
        | "CLEANING"
        | "OTHER";
      PlanTier: "FREE" | "PRO" | "FAMILY";
      RecipeDifficulty: "EASY" | "MEDIUM" | "HARD";
      SubscriptionStatus:
        | "ACTIVE"
        | "CANCELED"
        | "PAST_DUE"
        | "TRIALING"
        | "INCOMPLETE"
        | "UNPAID";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      AiGenerationStatus: ["PENDING", "COMPLETED", "FAILED", "CANCELED"],
      BillingStore: [
        "GOOGLE_PLAY",
        "APP_STORE",
        "STRIPE",
        "PROMOTIONAL",
        "UNKNOWN",
      ],
      DietaryPreference: [
        "VEGETARIAN",
        "VEGAN",
        "GLUTEN_FREE",
        "LACTOSE_FREE",
        "LOW_CARB",
        "KETO",
      ],
      offer_extension_status: ["planned", "beta", "active"],
      OfferCategory: [
        "MEAT",
        "PRODUCE",
        "DAIRY",
        "BAKERY",
        "BEVERAGES",
        "FROZEN",
        "PANTRY",
        "CLEANING",
        "OTHER",
      ],
      PlanTier: ["FREE", "PRO", "FAMILY"],
      RecipeDifficulty: ["EASY", "MEDIUM", "HARD"],
      SubscriptionStatus: [
        "ACTIVE",
        "CANCELED",
        "PAST_DUE",
        "TRIALING",
        "INCOMPLETE",
        "UNPAID",
      ],
    },
  },
} as const;
export type Profile = Tables<"profiles">;
export type User = Profile;
export type Recipe = Tables<"recipes">;
export type PantryItem = Tables<"pantry_items">;
export type Ingredient = Tables<"ingredients">;
export type RecipeIngredientRow = Tables<"recipe_ingredients">;
export type Favorite = Tables<"favorites">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingListItem = Tables<"shopping_list_items">;
export type Subscription = Tables<"subscriptions">;
export type IngredientScan = Tables<"ingredient_scans">;
export type AiGeneration = Tables<"ai_generations">;
export type UsageLog = Tables<"usage_logs">;
export type RegionalOfferRow = Tables<"regional_offers">;
export type RegionalStoreRow = Tables<"regional_stores">;
export type OfferFavorite = Tables<"offer_favorites">;
export type OfferCategory = Enums<"OfferCategory">;
export type OfferVerticalRow = Tables<"offer_verticals">;
export type OfferCategoryRow = Tables<"offer_categories">;
export type MonthlyPurchaseListRow = Tables<"monthly_purchase_lists">;
export type MonthlyPurchaseItemRow = Tables<"monthly_purchase_items">;
