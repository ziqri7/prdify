// ═══════════════════════════════════════════════════════════════════
// SUPABASE TYPE DEFINITIONS — BuatPakeAI
// ═══════════════════════════════════════════════════════════════════
// Sync'd with: schema.sql (executed on Supabase project)
// ═══════════════════════════════════════════════════════════════════

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      prd_documents: {
        Row: PRDDocument
        Insert: Omit<PRDDocument, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PRDDocument, 'id'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Payment, 'id'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id'>>
      }
    }
    Views: {
      user_stats: {
        Row: UserStats
      }
    }
    Functions: {
      handle_new_user: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}

// ── Profiles ──
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ── PRD Documents ──
export type PRDDocumentStatus = 'active' | 'archived' | 'deleted'
export type PackageType = 'basic' | 'pro'

export interface PRDDocument {
  id: string
  user_id: string | null
  title: string
  package_type: PackageType
  answers: Json
  markdown_content: string
  status: PRDDocumentStatus
  is_paid: boolean
  payment_id: string | null
  session_id: string | null
  created_at: string
  updated_at: string
}

// ── Payments ──
export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED'

export interface Payment {
  id: string
  external_id: string
  user_id: string | null
  prd_id: string | null
  package_type: PackageType
  plan_id: PackageId
  amount: number
  payment_method: string | null
  status: PaymentStatus
  gateway: string | null
  xendit_invoice_id: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

// ── Subscriptions ──
export type SubscriptionPlanId = 'starter' | 'pro' | 'pro_tahunan'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired'

export interface Subscription {
  id: string
  user_id: string
  plan_id: SubscriptionPlanId
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  documents_used: number
  document_limit: number | null
  payment_id: string | null
  created_at: string
  updated_at: string
}

// ── Views ──
export interface UserStats {
  user_id: string | null
  total_prd: number | null
  total_paid: number | null
  total_spent: number | null
}

// ── Helper types ──
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums = never

export type PackageId = 'pay_per_use' | 'starter' | 'pro' | 'pro_tahunan'
