export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      court_records: {
        Row: {
          business_name: string
          case_date: string | null
          case_name: string | null
          case_number: string | null
          case_summary: string | null
          case_url: string | null
          court_name: string | null
          created_at: string
          id: string
          search_query: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name: string
          case_date?: string | null
          case_name?: string | null
          case_number?: string | null
          case_summary?: string | null
          case_url?: string | null
          court_name?: string | null
          created_at?: string
          id?: string
          search_query: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          case_date?: string | null
          case_name?: string | null
          case_number?: string | null
          case_summary?: string | null
          case_url?: string | null
          court_name?: string | null
          created_at?: string
          id?: string
          search_query?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_call_stats: {
        Row: {
          call_count: number | null
          created_at: string | null
          date: string
          goal: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          call_count?: number | null
          created_at?: string | null
          date?: string
          goal?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          call_count?: number | null
          created_at?: string | null
          date?: string
          goal?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lead_lists: {
        Row: {
          created_at: string | null
          file_name: string
          id: string
          name: string
          total_leads: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          id?: string
          name: string
          total_leads?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          id?: string
          name?: string
          total_leads?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          called_count: number | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          last_called: string | null
          last_called_at: string | null
          lead_list_id: string
          name: string
          phone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          called_count?: number | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_called?: string | null
          last_called_at?: string | null
          lead_list_id: string
          name: string
          phone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          called_count?: number | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_called?: string | null
          last_called_at?: string | null
          lead_list_id?: string
          name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          daily_goal: number | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_goal?: number | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_goal?: number | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          auto_call: boolean | null
          call_delay: number | null
          call_filter: string | null
          created_at: string | null
          current_lead_index: number | null
          current_lead_list_id: string | null
          daily_call_count: number | null
          device_id: string
          id: string
          last_accessed_at: string | null
          last_updated_at: string | null
          leads_data: Json | null
          shuffle_mode: boolean | null
          timezone_filter: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_call?: boolean | null
          call_delay?: number | null
          call_filter?: string | null
          created_at?: string | null
          current_lead_index?: number | null
          current_lead_list_id?: string | null
          daily_call_count?: number | null
          device_id?: string
          id?: string
          last_accessed_at?: string | null
          last_updated_at?: string | null
          leads_data?: Json | null
          shuffle_mode?: boolean | null
          timezone_filter?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_call?: boolean | null
          call_delay?: number | null
          call_filter?: string | null
          created_at?: string | null
          current_lead_index?: number | null
          current_lead_list_id?: string | null
          daily_call_count?: number | null
          device_id?: string
          id?: string
          last_accessed_at?: string | null
          last_updated_at?: string | null
          leads_data?: Json | null
          shuffle_mode?: boolean | null
          timezone_filter?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_current_lead_list_id_fkey"
            columns: ["current_lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_device_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
