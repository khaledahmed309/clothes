export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          min_order: number
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          id: string
          image_url: string | null
          name_ar: string
          order_id: string
          product_id: string | null
          quantity: number
          size: string | null
          unit_price: number
        }
        Insert: {
          color?: string | null
          id?: string
          image_url?: string | null
          name_ar: string
          order_id: string
          product_id?: string | null
          quantity: number
          size?: string | null
          unit_price: number
        }
        Update: {
          color?: string | null
          id?: string
          image_url?: string | null
          name_ar?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          size?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          city: string
          coupon_code: string | null
          created_at: string
          customer_name: string
          discount: number
          email: string | null
          governorate: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_reference: string | null
          payment_status: string
          phone: string
          shipping_fee: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          coupon_code?: string | null
          created_at?: string
          customer_name: string
          discount?: number
          email?: string | null
          governorate: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method: string
          payment_reference?: string | null
          payment_status?: string
          phone: string
          shipping_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          discount?: number
          email?: string | null
          governorate?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          shipping_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color: string
          id: string
          product_id: string
          quantity: number
          size: string
          sku: string | null
        }
        Insert: {
          color: string
          id?: string
          product_id: string
          quantity?: number
          size: string
          sku?: string | null
        }
        Update: {
          color?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          collection: string | null
          colors: string[]
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          images: string[]
          is_active: boolean
          is_best_seller: boolean
          is_featured: boolean
          is_new: boolean
          name_ar: string
          name_en: string
          price: number
          rating: number
          sale_price: number | null
          sizes: string[]
          sku: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          collection?: string | null
          colors?: string[]
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new?: boolean
          name_ar: string
          name_en: string
          price: number
          rating?: number
          sale_price?: number | null
          sizes?: string[]
          sku?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          collection?: string | null
          colors?: string[]
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new?: boolean
          name_ar?: string
          name_en?: string
          price?: number
          rating?: number
          sale_price?: number | null
          sizes?: string[]
          sku?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_name: string
          id: string
          is_approved: boolean
          product_id: string | null
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_name: string
          id?: string
          is_approved?: boolean
          product_id?: string | null
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          is_approved?: boolean
          product_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rates: {
        Row: {
          days: string
          fee: number
          governorate: string
          governorate_en: string
          id: string
        }
        Insert: {
          days?: string
          fee?: number
          governorate: string
          governorate_en: string
          id?: string
        }
        Update: {
          days?: string
          fee?: number
          governorate?: string
          governorate_en?: string
          id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          banner_text_ar: string
          card_enabled: boolean
          cod_enabled: boolean
          cod_fee: number
          free_shipping_threshold: number
          hero_headline_ar: string
          hero_subline_ar: string
          id: number
          store_name: string
          support_phone: string
          updated_at: string
          vodafone_cash_enabled: boolean
          vodafone_cash_number: string
        }
        Insert: {
          banner_text_ar?: string
          card_enabled?: boolean
          cod_enabled?: boolean
          cod_fee?: number
          free_shipping_threshold?: number
          hero_headline_ar?: string
          hero_subline_ar?: string
          id?: number
          store_name?: string
          support_phone?: string
          updated_at?: string
          vodafone_cash_enabled?: boolean
          vodafone_cash_number?: string
        }
        Update: {
          banner_text_ar?: string
          card_enabled?: boolean
          cod_enabled?: boolean
          cod_fee?: number
          free_shipping_threshold?: number
          hero_headline_ar?: string
          hero_subline_ar?: string
          id?: number
          store_name?: string
          support_phone?: string
          updated_at?: string
          vodafone_cash_enabled?: boolean
          vodafone_cash_number?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: {
        Args: {
          p_coupon?: string
          p_customer: Json
          p_items: Json
          p_payment_method: string
          p_payment_reference?: string
        }
        Returns: Json
      }
      track_order: {
        Args: { p_order_number: string; p_phone: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "customer"],
    },
  },
} as const
