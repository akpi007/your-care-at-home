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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      availability: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          professional_id: string
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          professional_id: string
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          professional_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_locations: {
        Row: {
          accuracy: number | null
          booking_id: string
          is_sharing: boolean
          latitude: number
          longitude: number
          professional_id: string
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          booking_id: string
          is_sharing?: boolean
          latitude: number
          longitude: number
          professional_id: string
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          booking_id?: string
          is_sharing?: boolean
          latitude?: number
          longitude?: number
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          booking_date: string
          booking_time: string
          cancellation_fee: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          id: string
          is_late_cancellation: boolean
          latitude: number | null
          longitude: number | null
          no_show_by: string | null
          patient_profile_id: string
          prescription_file: string | null
          professional_id: string
          service_id: string
          status: string
          symptoms_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          booking_date: string
          booking_time: string
          cancellation_fee?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          id?: string
          is_late_cancellation?: boolean
          latitude?: number | null
          longitude?: number | null
          no_show_by?: string | null
          patient_profile_id: string
          prescription_file?: string | null
          professional_id: string
          service_id: string
          status?: string
          symptoms_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          booking_date?: string
          booking_time?: string
          cancellation_fee?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          id?: string
          is_late_cancellation?: boolean
          latitude?: number | null
          longitude?: number | null
          no_show_by?: string | null
          patient_profile_id?: string
          prescription_file?: string | null
          professional_id?: string
          service_id?: string
          status?: string
          symptoms_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: string
          category: string
          created_at: string
          description: string
          evidence_url: string | null
          id: string
          professional_id: string | null
          raised_by: string
          refund_amount: number | null
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          category?: string
          created_at?: string
          description: string
          evidence_url?: string | null
          id?: string
          professional_id?: string | null
          raised_by: string
          refund_amount?: number | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          category?: string
          created_at?: string
          description?: string
          evidence_url?: string | null
          id?: string
          professional_id?: string | null
          raised_by?: string
          refund_amount?: number | null
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          amount: number
          booking_id: string
          commission: number | null
          created_at: string
          id: string
          payout_status: string | null
          professional_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          commission?: number | null
          created_at?: string
          id?: string
          payout_status?: string | null
          professional_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          commission?: number | null
          created_at?: string
          id?: string
          payout_status?: string | null
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          severity: string
          source: string | null
          stack: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          severity?: string
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          severity?: string
          source?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          professional_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          professional_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          professional_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_reports: {
        Row: {
          ai_recommendation: string | null
          ai_summary: string | null
          created_at: string
          file_url: string | null
          id: string
          patient_profile_id: string
          user_id: string
        }
        Insert: {
          ai_recommendation?: string | null
          ai_summary?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          patient_profile_id: string
          user_id: string
        }
        Update: {
          ai_recommendation?: string | null
          ai_summary?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          patient_profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_reports_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          message: string
          message_type: string | null
          sender_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          message: string
          message_type?: string | null
          sender_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          message?: string
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          used: boolean
          verified: boolean | null
        }
        Insert: {
          attempts?: number
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone: string
          used?: boolean
          verified?: boolean | null
        }
        Update: {
          attempts?: number
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          used?: boolean
          verified?: boolean | null
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          age: number | null
          allergies: string | null
          blood_group: string | null
          created_at: string
          emergency_contact: string | null
          gender: string | null
          id: string
          medical_history: string | null
          medications: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          medications?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          medications?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          destination: string | null
          id: string
          method: string | null
          processed_at: string | null
          processed_by: string | null
          professional_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          destination?: string | null
          id?: string
          method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          professional_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          destination?: string | null
          id?: string
          method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          professional_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_certifications: {
        Row: {
          certificate_name: string
          created_at: string
          document_url: string | null
          id: string
          professional_id: string
          verified: boolean | null
        }
        Insert: {
          certificate_name: string
          created_at?: string
          document_url?: string | null
          id?: string
          professional_id: string
          verified?: boolean | null
        }
        Update: {
          certificate_name?: string
          created_at?: string
          document_url?: string | null
          id?: string
          professional_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_certifications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_certifications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          available: boolean | null
          bio: string | null
          city: string | null
          consultation_fee: number | null
          created_at: string
          display_name: string | null
          id: string
          id_proof_url: string | null
          image_url: string | null
          license_number: string | null
          passport_photo_url: string | null
          rating: number | null
          service_id: string | null
          specialization: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          available?: boolean | null
          bio?: string | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          id_proof_url?: string | null
          image_url?: string | null
          license_number?: string | null
          passport_photo_url?: string | null
          rating?: number | null
          service_id?: string | null
          specialization?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          available?: boolean | null
          bio?: string | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          id_proof_url?: string | null
          image_url?: string | null
          license_number?: string | null
          passport_photo_url?: string | null
          rating?: number | null
          service_id?: string | null
          specialization?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          allergies: string | null
          avatar_url: string | null
          chronic_conditions: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact: string | null
          full_name: string | null
          gender: string | null
          id: string
          medical_history: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          avatar_url?: string | null
          chronic_conditions?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          patient_id: string
          professional_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          patient_id: string
          professional_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          professional_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_user_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_user_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_user_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          admin_note: string | null
          booking_id: string | null
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          booking_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          booking_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
      professionals_public: {
        Row: {
          available: boolean | null
          bio: string | null
          city: string | null
          consultation_fee: number | null
          created_at: string | null
          display_name: string | null
          id: string | null
          image_url: string | null
          rating: number | null
          service_id: string | null
          specialization: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          available?: boolean | null
          bio?: string | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          image_url?: string | null
          rating?: number | null
          service_id?: string | null
          specialization?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          available?: boolean | null
          bio?: string | null
          city?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          image_url?: string | null
          rating?: number | null
          service_id?: string | null
          specialization?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews_public: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          id: string | null
          professional_id: string | null
          rating: number | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          professional_id?: string | null
          rating?: number | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          professional_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_expired_otp_codes: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "professional" | "admin"
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
      app_role: ["patient", "professional", "admin"],
    },
  },
} as const
