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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      driver_positions: {
        Row: {
          created_at: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          operator_id: string
          order_id: string
          speed: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          operator_id: string
          order_id: string
          speed?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          operator_id?: string
          order_id?: string
          speed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_positions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          order_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          order_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          order_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      operator_stock: {
        Row: {
          created_at: string
          id: string
          operator_id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          operator_id: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          operator_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      operators: {
        Row: {
          created_at: string
          deliveries_completed: number
          id: string
          is_active: boolean
          store_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deliveries_completed?: number
          id?: string
          is_active?: boolean
          store_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deliveries_completed?: number
          id?: string
          is_active?: boolean
          store_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operators_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          min_quantity: number
          order_id: string
          product_brand: string
          product_id: string
          product_name: string
          product_price: number
          product_volume: string
          quantity: number
          unit_label: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_quantity?: number
          order_id: string
          product_brand: string
          product_id: string
          product_name: string
          product_price: number
          product_volume: string
          quantity?: number
          unit_label: string
        }
        Update: {
          created_at?: string
          id?: string
          min_quantity?: number
          order_id?: string
          product_brand?: string
          product_id?: string
          product_name?: string
          product_price?: number
          product_volume?: string
          quantity?: number
          unit_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_latitude: number | null
          customer_longitude: number | null
          customer_name: string | null
          customer_nuit: string | null
          customer_phone: string | null
          estimated_delivery: string | null
          id: string
          operator_id: string | null
          order_number: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          status: Database["public"]["Enums"]["order_status"]
          store_id: string | null
          total: number
          transaction_id_external: string | null
          updated_at: string
          user_id: string | null
          validation_code: string | null
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_latitude?: number | null
          customer_longitude?: number | null
          customer_name?: string | null
          customer_nuit?: string | null
          customer_phone?: string | null
          estimated_delivery?: string | null
          id?: string
          operator_id?: string | null
          order_number?: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          total?: number
          transaction_id_external?: string | null
          updated_at?: string
          user_id?: string | null
          validation_code?: string | null
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_latitude?: number | null
          customer_longitude?: number | null
          customer_name?: string | null
          customer_nuit?: string | null
          customer_phone?: string | null
          estimated_delivery?: string | null
          id?: string
          operator_id?: string | null
          order_number?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          total?: number
          transaction_id_external?: string | null
          updated_at?: string
          user_id?: string | null
          validation_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          is_promo: boolean
          min_quantity: number
          name: string
          price: number
          promo_price: number | null
          sku: string | null
          unit_label: string
          updated_at: string
          volume: string
        }
        Insert: {
          brand: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          is_promo?: boolean
          min_quantity?: number
          name: string
          price: number
          promo_price?: number | null
          sku?: string | null
          unit_label: string
          updated_at?: string
          volume: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          is_promo?: boolean
          min_quantity?: number
          name?: string
          price?: number
          promo_price?: number | null
          sku?: string | null
          unit_label?: string
          updated_at?: string
          volume?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string | null
          nuit: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id: string
          name?: string | null
          nuit?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string | null
          nuit?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          description: string | null
          discount_percent: number
          end_date: string
          id: string
          is_active: boolean
          name: string
          product_ids: string[] | null
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percent?: number
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          product_ids?: string[] | null
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percent?: number
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          product_ids?: string[] | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string
          created_at: string
          delivery_zone: Json | null
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          max_delivery_radius_km: number
          name: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          delivery_zone?: Json | null
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          max_delivery_radius_km?: number
          name: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          delivery_zone?: Json | null
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          max_delivery_radius_km?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          latitude: number | null
          longitude: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          language: string
          notifications_delivery: boolean
          notifications_orders: boolean
          notifications_promotions: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          notifications_delivery?: boolean
          notifications_orders?: boolean
          notifications_promotions?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          notifications_delivery?: boolean
          notifications_orders?: boolean
          notifications_promotions?: boolean
          theme?: string
          updated_at?: string
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
    }
    Enums: {
      app_role: "admin" | "operator" | "customer"
      order_status:
        | "received"
        | "preparing"
        | "on_the_way"
        | "almost_there"
        | "delivered"
      payment_method: "mpesa" | "emola" | "pos" | "cash"
      payment_status: "pending" | "paid"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "operator", "customer"],
      order_status: [
        "received",
        "preparing",
        "on_the_way",
        "almost_there",
        "delivered",
      ],
      payment_method: ["mpesa", "emola", "pos", "cash"],
      payment_status: ["pending", "paid"],
    },
  },
} as const
