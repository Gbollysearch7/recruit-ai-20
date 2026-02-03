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
      candidate_comments: {
        Row: {
          id: string
          candidate_id: string | null
          user_id: string | null
          content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          candidate_id?: string | null
          user_id?: string | null
          content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          candidate_id?: string | null
          user_id?: string | null
          content?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_comments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          }
        ]
      }
      activity: {
        Row: {
          action: string
          activity_type: string | null
          candidate_id: string | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          list_id: string | null
          metadata: Json | null
          search_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          activity_type?: string | null
          candidate_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          list_id?: string | null
          metadata?: Json | null
          search_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          activity_type?: string | null
          candidate_id?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          list_id?: string | null
          metadata?: Json | null
          search_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          avatar: string | null
          company: string | null
          created_at: string | null
          education: Json | null
          email: string | null
          exa_item_id: string | null
          experience: Json | null
          github: string | null
          id: string
          linkedin: string | null
          location: string | null
          match_score: number | null
          name: string
          notes: string | null
          phone: string | null
          raw_data: Json | null
          search_id: string | null
          skills: string[] | null
          source: string | null
          stage: string | null
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          avatar?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          exa_item_id?: string | null
          experience?: Json | null
          github?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          match_score?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          raw_data?: Json | null
          search_id?: string | null
          skills?: string[] | null
          source?: string | null
          stage?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          avatar?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          exa_item_id?: string | null
          experience?: Json | null
          github?: string | null
          id?: string
          linkedin?: string | null
          location?: string | null
          match_score?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          raw_data?: Json | null
          search_id?: string | null
          skills?: string[] | null
          source?: string | null
          stage?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      list_candidates: {
        Row: {
          added_at: string | null
          candidate_id: string | null
          id: string
          list_id: string | null
        }
        Insert: {
          added_at?: string | null
          candidate_id?: string | null
          id?: string
          list_id?: string | null
        }
        Update: {
          added_at?: string | null
          candidate_id?: string | null
          id?: string
          list_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_candidates_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_public: boolean | null
          name: string
          share_id: string | null
          share_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          share_id?: string | null
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          share_id?: string | null
          share_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      search_templates: {
        Row: {
          count: number | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          enrichments: Json | null
          id: string
          is_public: boolean | null
          name: string
          query: string
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          enrichments?: Json | null
          id?: string
          is_public?: boolean | null
          name: string
          query: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          enrichments?: Json | null
          id?: string
          is_public?: boolean | null
          name?: string
          query?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      searches: {
        Row: {
          completed_at: string | null
          count: number | null
          created_at: string | null
          criteria: Json | null
          enrichments: Json | null
          error_message: string | null
          exa_webset_id: string | null
          id: string
          is_public: boolean | null
          name: string | null
          query: string
          results: Json | null
          results_count: number | null
          share_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          count?: number | null
          created_at?: string | null
          criteria?: Json | null
          enrichments?: Json | null
          error_message?: string | null
          exa_webset_id?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          query: string
          results?: Json | null
          results_count?: number | null
          share_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          count?: number | null
          created_at?: string | null
          criteria?: Json | null
          enrichments?: Json | null
          error_message?: string | null
          exa_webset_id?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          query?: string
          results?: Json | null
          results_count?: number | null
          share_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_id: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']

// Convenience types for common tables
export type Profile = Tables<'profiles'>
export type Candidate = Tables<'candidates'>
export type List = Tables<'lists'>
export type ListCandidate = Tables<'list_candidates'>
export type Search = Tables<'searches'>
export type SearchTemplate = Tables<'search_templates'>
export type Activity = Tables<'activity'>

// Type for candidate comments
export type CandidateComment = Tables<'candidate_comments'>

// Legacy type aliases for backward compatibility
export type ListMember = ListCandidate
