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
          id: string;
          user_id: string;
          event_type: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          metadata?: Json | null;
          created_at?: string;
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
      regional_offers: {
        Row: {
          category: Database["public"]["Enums"]["OfferCategory"];
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
            foreignKeyName: "regional_offers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "regional_stores";
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
        };
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "monthly_purchase_lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
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
      OfferCategory:
        | "PRODUCE"
        | "MEAT"
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
export type MobileSubscription = Tables<"mobile_subscriptions">;
export type IngredientScan = Tables<"ingredient_scans">;
export type AiGeneration = Tables<"ai_generations">;
export type UsageLog = Tables<"usage_logs">;
export type RegionalOfferRow = Tables<"regional_offers">;
export type RegionalStoreRow = Tables<"regional_stores">;
export type OfferFavorite = Tables<"offer_favorites">;
export type OfferCategory = Enums<"OfferCategory">;
export type Product = Tables<"products">;
export type MarketPrice = Tables<"market_prices">;
export type IngredientSubstitutionRule = Tables<"ingredient_substitutions">;
export type WeeklyMealPlan = Tables<"weekly_meal_plans">;
export type MonthlyPurchaseListRow = Tables<"monthly_purchase_lists">;
export type MonthlyPurchaseItemRow = Tables<"monthly_purchase_items">;
