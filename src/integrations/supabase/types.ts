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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      auction_bids: {
        Row: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string | null
          id: string
          is_auto_bid: boolean | null
          is_winning: boolean | null
          max_auto_amount: number | null
        }
        Insert: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at?: string | null
          id?: string
          is_auto_bid?: boolean | null
          is_winning?: boolean | null
          max_auto_amount?: number | null
        }
        Update: {
          amount?: number
          auction_id?: string
          bidder_id?: string
          created_at?: string | null
          id?: string
          is_auto_bid?: boolean | null
          is_winning?: boolean | null
          max_auto_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "listing_auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banner_events: {
        Row: {
          banner_id: string
          cost_amount: number | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          banner_id: string
          cost_amount?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          cost_amount?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_events_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget_spent: number
          budget_total: number
          clicks: number | null
          cost_per_click: number | null
          cost_per_mille: number | null
          created_at: string
          deleted_at: string | null
          ends_at: string | null
          id: string
          image_url: string
          impressions: number | null
          position: Database["public"]["Enums"]["banner_position"]
          pricing_model: Database["public"]["Enums"]["banner_pricing_model"]
          priority: number | null
          starts_at: string
          status: Database["public"]["Enums"]["banner_status"]
          target_url: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget_spent?: number
          budget_total?: number
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          image_url: string
          impressions?: number | null
          position?: Database["public"]["Enums"]["banner_position"]
          pricing_model?: Database["public"]["Enums"]["banner_pricing_model"]
          priority?: number | null
          starts_at?: string
          status?: Database["public"]["Enums"]["banner_status"]
          target_url: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget_spent?: number
          budget_total?: number
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string
          impressions?: number | null
          position?: Database["public"]["Enums"]["banner_position"]
          pricing_model?: Database["public"]["Enums"]["banner_pricing_model"]
          priority?: number | null
          starts_at?: string
          status?: Database["public"]["Enums"]["banner_status"]
          target_url?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      boost_types: {
        Row: {
          created_at: string | null
          credits_per_day: number
          description: string | null
          id: string
          is_active: boolean | null
          multiplier: number | null
          name: string
          type: Database["public"]["Enums"]["boost_type"]
        }
        Insert: {
          created_at?: string | null
          credits_per_day: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name: string
          type: Database["public"]["Enums"]["boost_type"]
        }
        Update: {
          created_at?: string | null
          credits_per_day?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name?: string
          type?: Database["public"]["Enums"]["boost_type"]
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string | null
          id: string
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          price: number
          product_id?: string | null
          quantity?: number
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          attributes_schema: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon_url: string | null
          id: string
          image_banner_url: string | null
          is_active: boolean | null
          is_featured: boolean
          keywords: string | null
          listing_count: number
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          umkm_count: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          attributes_schema?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          image_banner_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean
          keywords?: string | null
          listing_count?: number
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          umkm_count?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          attributes_schema?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          image_banner_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean
          keywords?: string | null
          listing_count?: number
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          umkm_count?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_uses: {
        Row: {
          coupon_id: string
          credits_given: number
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          credits_given: number
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          credits_given?: number
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_uses_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          credits_amount: number
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          credits_amount?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          credits_amount?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          bonus_credits: number | null
          created_at: string | null
          credits: number
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          bonus_credits?: number | null
          created_at?: string | null
          credits: number
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          bonus_credits?: number | null
          created_at?: string | null
          credits?: number
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          id: string
          payment_id: string | null
          reference_id: string | null
          reference_type: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: Database["public"]["Enums"]["credit_transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          regency_id: string
          updated_at: string
          village_count: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          regency_id: string
          updated_at?: string
          village_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          regency_id?: string
          updated_at?: string
          village_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "districts_regency_id_fkey"
            columns: ["regency_id"]
            isOneToOne: false
            referencedRelation: "regencies"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          address: string | null
          birth_date: string | null
          birth_place: string | null
          blood_type: string | null
          business_address: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          district_id: string | null
          document_name: string
          document_number: string | null
          document_type: string
          file_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          image_url: string
          kyc_verification_id: string
          marital_status: string | null
          nationality: string | null
          npwp_address: string | null
          npwp_name: string | null
          npwp_number: string | null
          occupation: string | null
          postal_code: string | null
          province_id: string | null
          regency_id: string | null
          rejection_reason: string | null
          religion: string | null
          rt: string | null
          rw: string | null
          status: string
          updated_at: string
          village_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          blood_type?: string | null
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          district_id?: string | null
          document_name: string
          document_number?: string | null
          document_type: string
          file_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          image_url: string
          kyc_verification_id: string
          marital_status?: string | null
          nationality?: string | null
          npwp_address?: string | null
          npwp_name?: string | null
          npwp_number?: string | null
          occupation?: string | null
          postal_code?: string | null
          province_id?: string | null
          regency_id?: string | null
          rejection_reason?: string | null
          religion?: string | null
          rt?: string | null
          rw?: string | null
          status?: string
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          birth_place?: string | null
          blood_type?: string | null
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          district_id?: string | null
          document_name?: string
          document_number?: string | null
          document_type?: string
          file_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          image_url?: string
          kyc_verification_id?: string
          marital_status?: string | null
          nationality?: string | null
          npwp_address?: string | null
          npwp_name?: string | null
          npwp_number?: string | null
          occupation?: string | null
          postal_code?: string | null
          province_id?: string | null
          regency_id?: string | null
          rejection_reason?: string | null
          religion?: string | null
          rt?: string | null
          rw?: string | null
          status?: string
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_kyc_verification_id_fkey"
            columns: ["kyc_verification_id"]
            isOneToOne: false
            referencedRelation: "kyc_verifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_regency_id_fkey"
            columns: ["regency_id"]
            isOneToOne: false
            referencedRelation: "regencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          approved_at: string | null
          city: string | null
          created_at: string | null
          district: string | null
          full_address: string | null
          full_name: string | null
          id: string
          ktp_image_url: string | null
          ktp_number: string | null
          notes: string | null
          province: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_image_url: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string
          village: string | null
        }
        Insert: {
          approved_at?: string | null
          city?: string | null
          created_at?: string | null
          district?: string | null
          full_address?: string | null
          full_name?: string | null
          id?: string
          ktp_image_url?: string | null
          ktp_number?: string | null
          notes?: string | null
          province?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_url?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          village?: string | null
        }
        Update: {
          approved_at?: string | null
          city?: string | null
          created_at?: string | null
          district?: string | null
          full_address?: string | null
          full_name?: string | null
          id?: string
          ktp_image_url?: string | null
          ktp_number?: string | null
          notes?: string | null
          province?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_image_url?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      listing_auctions: {
        Row: {
          buy_now_price: number | null
          created_at: string | null
          current_price: number
          ends_at: string
          id: string
          listing_id: string
          min_increment: number
          platform_fee_amount: number | null
          platform_fee_percent: number | null
          starting_price: number
          status: Database["public"]["Enums"]["auction_status"]
          total_bids: number | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          buy_now_price?: number | null
          created_at?: string | null
          current_price: number
          ends_at: string
          id?: string
          listing_id: string
          min_increment?: number
          platform_fee_amount?: number | null
          platform_fee_percent?: number | null
          starting_price: number
          status?: Database["public"]["Enums"]["auction_status"]
          total_bids?: number | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          buy_now_price?: number | null
          created_at?: string | null
          current_price?: number
          ends_at?: string
          id?: string
          listing_id?: string
          min_increment?: number
          platform_fee_amount?: number | null
          platform_fee_percent?: number | null
          starting_price?: number
          status?: Database["public"]["Enums"]["auction_status"]
          total_bids?: number | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_auctions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_boosts: {
        Row: {
          boost_type: Database["public"]["Enums"]["boost_type"]
          clicks: number | null
          created_at: string | null
          credits_used: number
          ends_at: string
          id: string
          impressions: number | null
          listing_id: string
          starts_at: string
          status: Database["public"]["Enums"]["boost_status"]
          user_id: string
        }
        Insert: {
          boost_type: Database["public"]["Enums"]["boost_type"]
          clicks?: number | null
          created_at?: string | null
          credits_used: number
          ends_at: string
          id?: string
          impressions?: number | null
          listing_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["boost_status"]
          user_id: string
        }
        Update: {
          boost_type?: Database["public"]["Enums"]["boost_type"]
          clicks?: number | null
          created_at?: string | null
          credits_used?: number
          ends_at?: string
          id?: string
          impressions?: number | null
          listing_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["boost_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_boosts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_paid: boolean | null
          is_primary: boolean | null
          listing_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_paid?: boolean | null
          is_primary?: boolean | null
          listing_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_paid?: boolean | null
          is_primary?: boolean | null
          listing_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          listing_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          attributes: Json | null
          category_id: string
          city: string | null
          click_count: number
          condition: Database["public"]["Enums"]["listing_condition"] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_preference: string | null
          contact_whatsapp: string | null
          created_at: string | null
          credits_used: number | null
          deleted_at: string | null
          description: string | null
          district_id: string | null
          expires_at: string | null
          favorite_count: number
          featured_until: string | null
          gallery: Json | null
          group_id: string | null
          id: string
          image_url: string | null
          inquiry_count: number
          is_featured: boolean | null
          is_rented: boolean
          is_sold: boolean
          keywords: string | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location_lat: number | null
          location_lng: number | null
          meta_description: string | null
          meta_title: string | null
          price: number
          price_formatted: string | null
          price_negotiable: boolean
          price_type: Database["public"]["Enums"]["listing_price_type"]
          promo_details: Json | null
          promo_type: string
          province: string | null
          province_id: string | null
          published_at: string | null
          regency_id: string | null
          rejection_reason: string | null
          rental_period: string | null
          rental_price: number | null
          rented_at: string | null
          rented_to: string | null
          share_count: number
          slug: string | null
          sold_at: string | null
          sold_to: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["listing_status"]
          subcategory_id: string | null
          title: string
          umkm_id: string | null
          updated_at: string | null
          user_id: string
          video_url: string | null
          view_count: number | null
          village_id: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attributes?: Json | null
          category_id: string
          city?: string | null
          click_count?: number
          condition?: Database["public"]["Enums"]["listing_condition"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_preference?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          credits_used?: number | null
          deleted_at?: string | null
          description?: string | null
          district_id?: string | null
          expires_at?: string | null
          favorite_count?: number
          featured_until?: string | null
          gallery?: Json | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          inquiry_count?: number
          is_featured?: boolean | null
          is_rented?: boolean
          is_sold?: boolean
          keywords?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location_lat?: number | null
          location_lng?: number | null
          meta_description?: string | null
          meta_title?: string | null
          price?: number
          price_formatted?: string | null
          price_negotiable?: boolean
          price_type?: Database["public"]["Enums"]["listing_price_type"]
          promo_details?: Json | null
          promo_type?: string
          province?: string | null
          province_id?: string | null
          published_at?: string | null
          regency_id?: string | null
          rejection_reason?: string | null
          rental_period?: string | null
          rental_price?: number | null
          rented_at?: string | null
          rented_to?: string | null
          share_count?: number
          slug?: string | null
          sold_at?: string | null
          sold_to?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory_id?: string | null
          title: string
          umkm_id?: string | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
          view_count?: number | null
          village_id?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          attributes?: Json | null
          category_id?: string
          city?: string | null
          click_count?: number
          condition?: Database["public"]["Enums"]["listing_condition"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_preference?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          credits_used?: number | null
          deleted_at?: string | null
          description?: string | null
          district_id?: string | null
          expires_at?: string | null
          favorite_count?: number
          featured_until?: string | null
          gallery?: Json | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          inquiry_count?: number
          is_featured?: boolean | null
          is_rented?: boolean
          is_sold?: boolean
          keywords?: string | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location_lat?: number | null
          location_lng?: number | null
          meta_description?: string | null
          meta_title?: string | null
          price?: number
          price_formatted?: string | null
          price_negotiable?: boolean
          price_type?: Database["public"]["Enums"]["listing_price_type"]
          promo_details?: Json | null
          promo_type?: string
          province?: string | null
          province_id?: string | null
          published_at?: string | null
          regency_id?: string | null
          rejection_reason?: string | null
          rental_period?: string | null
          rental_price?: number | null
          rented_at?: string | null
          rented_to?: string | null
          share_count?: number
          slug?: string | null
          sold_at?: string | null
          sold_to?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["listing_status"]
          subcategory_id?: string | null
          title?: string
          umkm_id?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
          view_count?: number | null
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_regency_id_fkey"
            columns: ["regency_id"]
            isOneToOne: false
            referencedRelation: "regencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_umkm_id_fkey"
            columns: ["umkm_id"]
            isOneToOne: false
            referencedRelation: "umkm_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          auction_id: string | null
          buyer_id: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          delivered_at: string | null
          id: string
          listing_id: string
          notes: string | null
          paid_at: string | null
          payment_status: string | null
          platform_fee: number | null
          seller_id: string
          shipped_at: string | null
          shipping_address: string | null
          shipping_method: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          auction_id?: string | null
          buyer_id: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          listing_id: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          seller_id: string
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_method?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          auction_id?: string | null
          buyer_id?: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          listing_id?: string
          notes?: string | null
          paid_at?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          seller_id?: string
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_method?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "listing_auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          channel: string
          code: string
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          user_id: string
        }
        Insert: {
          channel: string
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          user_id: string
        }
        Update: {
          channel?: string
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          module: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          module: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string | null
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
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
          created_at: string | null
          description: string | null
          id: string
          is_service: boolean | null
          name: string
          price: number | null
          sku: string | null
          slug: string | null
          status: string | null
          stock: number | null
          umkm_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_service?: boolean | null
          name: string
          price?: number | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          umkm_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_service?: boolean | null
          name?: string
          price?: number | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          umkm_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_umkm_id_fkey"
            columns: ["umkm_id"]
            isOneToOne: false
            referencedRelation: "umkm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string | null
          phone_number: string | null
          primary_role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          phone_number?: string | null
          primary_role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          phone_number?: string | null
          primary_role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      provinces: {
        Row: {
          code: string
          created_at: string
          district_count: number
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          name_alt: string | null
          regency_count: number
          updated_at: string
          village_count: number
        }
        Insert: {
          code: string
          created_at?: string
          district_count?: number
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          name_alt?: string | null
          regency_count?: number
          updated_at?: string
          village_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          district_count?: number
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_alt?: string | null
          regency_count?: number
          updated_at?: string
          village_count?: number
        }
        Relationships: []
      }
      regencies: {
        Row: {
          code: string
          created_at: string
          district_count: number
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          province_id: string
          type: string
          updated_at: string
          village_count: number
        }
        Insert: {
          code: string
          created_at?: string
          district_count?: number
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          province_id: string
          type?: string
          updated_at?: string
          village_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          district_count?: number
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          province_id?: string
          type?: string
          updated_at?: string
          village_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "regencies_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_access: boolean
          created_at: string
          id: string
          permission_id: string
          role: string
        }
        Insert: {
          can_access?: boolean
          created_at?: string
          id?: string
          permission_id: string
          role: string
        }
        Update: {
          can_access?: boolean
          created_at?: string
          id?: string
          permission_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_anonymous: boolean | null
          order_id: string | null
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          order_id?: string | null
          rating: number
          reviewer_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          order_id?: string | null
          rating?: number
          reviewer_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          display_name: string
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          category: string | null
          created_at: string | null
          id: string
          message: string | null
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          rating: number | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          total: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          total?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          product_name?: string | null
          quantity?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "umkm_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "umkm_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umkm_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_orders: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_number: string | null
          payment_status: string | null
          shipping_address: string | null
          shipping_fee: number | null
          shipping_method: string | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          umkm_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_fee?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          umkm_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_fee?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          umkm_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "umkm_orders_umkm_id_fkey"
            columns: ["umkm_id"]
            isOneToOne: false
            referencedRelation: "umkm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          method: string | null
          order_id: string | null
          paid_at: string | null
          provider: string | null
          raw_response: Json | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          method?: string | null
          order_id?: string | null
          paid_at?: string | null
          provider?: string | null
          raw_response?: Json | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          method?: string | null
          order_id?: string | null
          paid_at?: string | null
          provider?: string | null
          raw_response?: Json | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "umkm_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "umkm_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_portfolios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          title: string
          umkm_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          title: string
          umkm_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          umkm_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "umkm_portfolios_umkm_id_fkey"
            columns: ["umkm_id"]
            isOneToOne: false
            referencedRelation: "umkm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_profiles: {
        Row: {
          address: string | null
          banner_url: string | null
          brand_name: string | null
          business_scale: string
          business_type: string | null
          category_id: string | null
          city: string | null
          contact_count: number
          created_at: string | null
          current_plan: string
          description: string | null
          district_id: string | null
          email: string | null
          facebook: string | null
          gallery: Json | null
          google_maps_url: string | null
          id: string
          instagram: string | null
          is_verified: boolean | null
          latitude: number | null
          linkedin: string | null
          logo_url: string | null
          longitude: number | null
          operational_hours: Json | null
          owner_id: string
          phone: string | null
          plan_ends_at: string | null
          plan_starts_at: string | null
          postal_code: string | null
          province: string | null
          province_id: string | null
          regency_id: string | null
          slug: string | null
          status: string
          subcategory_id: string | null
          tagline: string | null
          tiktok: string | null
          twitter: string | null
          umkm_name: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          view_count: number
          village_id: string | null
          website: string | null
          whatsapp: string | null
          year_established: number | null
          youtube: string | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          brand_name?: string | null
          business_scale?: string
          business_type?: string | null
          category_id?: string | null
          city?: string | null
          contact_count?: number
          created_at?: string | null
          current_plan?: string
          description?: string | null
          district_id?: string | null
          email?: string | null
          facebook?: string | null
          gallery?: Json | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          linkedin?: string | null
          logo_url?: string | null
          longitude?: number | null
          operational_hours?: Json | null
          owner_id: string
          phone?: string | null
          plan_ends_at?: string | null
          plan_starts_at?: string | null
          postal_code?: string | null
          province?: string | null
          province_id?: string | null
          regency_id?: string | null
          slug?: string | null
          status?: string
          subcategory_id?: string | null
          tagline?: string | null
          tiktok?: string | null
          twitter?: string | null
          umkm_name: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number
          village_id?: string | null
          website?: string | null
          whatsapp?: string | null
          year_established?: number | null
          youtube?: string | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          brand_name?: string | null
          business_scale?: string
          business_type?: string | null
          category_id?: string | null
          city?: string | null
          contact_count?: number
          created_at?: string | null
          current_plan?: string
          description?: string | null
          district_id?: string | null
          email?: string | null
          facebook?: string | null
          gallery?: Json | null
          google_maps_url?: string | null
          id?: string
          instagram?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          linkedin?: string | null
          logo_url?: string | null
          longitude?: number | null
          operational_hours?: Json | null
          owner_id?: string
          phone?: string | null
          plan_ends_at?: string | null
          plan_starts_at?: string | null
          postal_code?: string | null
          province?: string | null
          province_id?: string | null
          regency_id?: string | null
          slug?: string | null
          status?: string
          subcategory_id?: string | null
          tagline?: string | null
          tiktok?: string | null
          twitter?: string | null
          umkm_name?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number
          village_id?: string | null
          website?: string | null
          whatsapp?: string | null
          year_established?: number | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "umkm_profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umkm_profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umkm_profiles_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umkm_profiles_regency_id_fkey"
            columns: ["regency_id"]
            isOneToOne: false
            referencedRelation: "regencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umkm_profiles_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "umkm_profiles_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          is_verified: boolean
          rating: number
          reviewer_id: string
          title: string | null
          umkm_id: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_verified?: boolean
          rating: number
          reviewer_id: string
          title?: string | null
          umkm_id: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_verified?: boolean
          rating?: number
          reviewer_id?: string
          title?: string | null
          umkm_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "umkm_reviews_umkm_id_fkey"
            columns: ["umkm_id"]
            isOneToOne: false
            referencedRelation: "umkm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      umkm_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          plan: string
          start_date: string | null
          status: string | null
          umkm_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan: string
          start_date?: string | null
          status?: string | null
          umkm_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan?: string
          start_date?: string | null
          status?: string | null
          umkm_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "umkm_subscriptions_umkm_id_fkey"
            columns: ["umkm_id"]
            isOneToOne: false
            referencedRelation: "umkm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          lifetime_purchased: number | null
          lifetime_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          lifetime_purchased?: number | null
          lifetime_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          lifetime_purchased?: number | null
          lifetime_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          is_active: boolean
          notes: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      villages: {
        Row: {
          code: string
          created_at: string
          district_id: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          postal_code: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          district_id: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          postal_code?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          district_id?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          postal_code?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "villages_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency_code: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency_code?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency_code?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_holder: string | null
          account_number: string | null
          amount: number
          bank_name: string | null
          created_at: string | null
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          status: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_add_credits: {
        Args: {
          p_admin_id: string
          p_amount: number
          p_description: string
          p_user_id: string
        }
        Returns: Json
      }
      get_platform_stats: {
        Args: never
        Returns: {
          active_auctions: number
          total_categories: number
          total_listings: number
          total_sellers: number
        }[]
      }
      get_seller_rating: {
        Args: { seller_uuid: string }
        Returns: {
          average_rating: number
          rating_1: number
          rating_2: number
          rating_3: number
          rating_4: number
          rating_5: number
          total_reviews: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: {
        Args: { p_listing_id: string }
        Returns: undefined
      }
      redeem_coupon: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "user" | "admin" | "bandar" | "umkm_owner"
      auction_status: "active" | "ended" | "sold" | "cancelled" | "no_winner"
      banner_position: "hero" | "sidebar" | "inline" | "footer"
      banner_pricing_model: "cpc" | "cpm" | "fixed"
      banner_status: "pending" | "active" | "paused" | "expired" | "rejected"
      boost_status: "active" | "expired" | "cancelled"
      boost_type: "highlight" | "top_search" | "premium"
      credit_transaction_type:
        | "purchase"
        | "usage"
        | "refund"
        | "bonus"
        | "expired"
      listing_condition: "new" | "like_new" | "good" | "fair"
      listing_price_type: "fixed" | "negotiable" | "auction"
      listing_status:
        | "draft"
        | "pending_review"
        | "active"
        | "sold"
        | "expired"
        | "rejected"
        | "deleted"
      listing_type: "sale" | "rent" | "service" | "wanted"
      report_reason:
        | "spam"
        | "fraud"
        | "inappropriate"
        | "wrong_category"
        | "duplicate"
        | "other"
      report_status: "pending" | "reviewed" | "action_taken" | "dismissed"
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
      app_role: ["user", "admin", "bandar", "umkm_owner"],
      auction_status: ["active", "ended", "sold", "cancelled", "no_winner"],
      banner_position: ["hero", "sidebar", "inline", "footer"],
      banner_pricing_model: ["cpc", "cpm", "fixed"],
      banner_status: ["pending", "active", "paused", "expired", "rejected"],
      boost_status: ["active", "expired", "cancelled"],
      boost_type: ["highlight", "top_search", "premium"],
      credit_transaction_type: [
        "purchase",
        "usage",
        "refund",
        "bonus",
        "expired",
      ],
      listing_condition: ["new", "like_new", "good", "fair"],
      listing_price_type: ["fixed", "negotiable", "auction"],
      listing_status: [
        "draft",
        "pending_review",
        "active",
        "sold",
        "expired",
        "rejected",
        "deleted",
      ],
      listing_type: ["sale", "rent", "service", "wanted"],
      report_reason: [
        "spam",
        "fraud",
        "inappropriate",
        "wrong_category",
        "duplicate",
        "other",
      ],
      report_status: ["pending", "reviewed", "action_taken", "dismissed"],
    },
  },
} as const
