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
      activities: {
        Row: {
          activity_type: string
          candidate_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          candidate_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          candidate_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_comments: {
        Row: {
          candidate_id: string | null
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_comments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          experience: Json | null
          github: string | null
          id: string
          last_contacted: string | null
          linkedin: string | null
          location: string | null
          match_score: number | null
          name: string
          notes: string | null
          skills: Json | null
          source: string | null
          stage: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github?: string | null
          id?: string
          last_contacted?: string | null
          linkedin?: string | null
          location?: string | null
          match_score?: number | null
          name: string
          notes?: string | null
          skills?: Json | null
          source?: string | null
          stage?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          experience?: Json | null
          github?: string | null
          id?: string
          last_contacted?: string | null
          linkedin?: string | null
          location?: string | null
          match_score?: number | null
          name?: string
          notes?: string | null
          skills?: Json | null
          source?: string | null
          stage?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
          user_id: string | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exa_search_candidates: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          exa_result_id: string | null
          id: string
          match_score: number | null
          position: number | null
          search_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          exa_result_id?: string | null
          id?: string
          match_score?: number | null
          position?: number | null
          search_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          exa_result_id?: string | null
          id?: string
          match_score?: number | null
          position?: number | null
          search_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exa_search_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exa_search_candidates_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "exa_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      exa_searches: {
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
          name: string
          query: string
          results: Json | null
          results_count: number | null
          share_id: string | null
          started_at: string | null
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
          name: string
          query: string
          results?: Json | null
          results_count?: number | null
          share_id?: string | null
          started_at?: string | null
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
          name?: string
          query?: string
          results?: Json | null
          results_count?: number | null
          share_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exa_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      list_members: {
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
            foreignKeyName: "list_members_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_members_list_id_fkey"
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
          is_smart: boolean | null
          name: string
          share_id: string | null
          smart_filters: Json | null
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
          is_smart?: boolean | null
          name: string
          share_id?: string | null
          smart_filters?: Json | null
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
          is_smart?: boolean | null
          name?: string
          share_id?: string | null
          smart_filters?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          stage_order: number
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          stage_order: number
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          stage_order?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          last_run: string | null
          name: string
          query: string
          results_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          last_run?: string | null
          name: string
          query: string
          results_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          last_run?: string | null
          name?: string
          query?: string
          results_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "search_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_enrollments: {
        Row: {
          candidate_id: string | null
          completed_at: string | null
          current_step: number | null
          enrolled_at: string | null
          id: string
          last_action_at: string | null
          sequence_id: string | null
          status: string | null
        }
        Insert: {
          candidate_id?: string | null
          completed_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          last_action_at?: string | null
          sequence_id?: string | null
          status?: string | null
        }
        Update: {
          candidate_id?: string | null
          completed_at?: string | null
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          last_action_at?: string | null
          sequence_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          condition_type: string | null
          condition_value: string | null
          content: string | null
          created_at: string | null
          delay_days: number | null
          delay_hours: number | null
          id: string
          sequence_id: string | null
          step_order: number
          step_type: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          condition_type?: string | null
          condition_value?: string | null
          content?: string | null
          created_at?: string | null
          delay_days?: number | null
          delay_hours?: number | null
          id?: string
          sequence_id?: string | null
          step_order: number
          step_type: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          condition_type?: string | null
          condition_value?: string | null
          content?: string | null
          created_at?: string | null
          delay_days?: number | null
          delay_hours?: number | null
          id?: string
          sequence_id?: string | null
          step_order?: number
          step_type?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_id: { Args: Record<PropertyKey, never>; Returns: string }
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
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types for common tables
export type Profile = Tables<'profiles'>
export type Candidate = Tables<'candidates'>
export type List = Tables<'lists'>
export type ListMember = Tables<'list_members'>
export type ExaSearch = Tables<'exa_searches'>
export type ExaSearchCandidate = Tables<'exa_search_candidates'>
export type SearchTemplate = Tables<'search_templates'>
export type CandidateComment = Tables<'candidate_comments'>
export type Activity = Tables<'activities'>
