export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      colleges: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          college_id: string;
          name: string;
          slug: string;
          code: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          name: string;
          slug: string;
          code?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          name?: string;
          slug?: string;
          code?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      exam_types: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      question_papers: {
        Row: {
          id: string;
          college_id: string;
          subject_id: string;
          exam_type_id: string;
          title: string;
          description: string | null;
          additional_details: string | null;
          mbbs_year: string;
          exam_attempt: string;
          exam_year: number;
          academic_year: string | null;
          storage_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_hash: string | null;
          page_count: number | null;
          status: string;
          view_count: number;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          subject_id: string;
          exam_type_id: string;
          title: string;
          description?: string | null;
          additional_details?: string | null;
          mbbs_year: string;
          exam_attempt?: string;
          exam_year: number;
          academic_year?: string | null;
          storage_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_hash?: string | null;
          page_count?: number | null;
          status?: string;
          view_count?: number;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          subject_id?: string;
          exam_type_id?: string;
          title?: string;
          description?: string | null;
          additional_details?: string | null;
          mbbs_year?: string;
          exam_attempt?: string;
          exam_year?: number;
          academic_year?: string | null;
          storage_path?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_hash?: string | null;
          page_count?: number | null;
          status?: string;
          view_count?: number;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          question_paper_id: string;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          question_paper_id: string;
          reason: string;
          details?: string | null;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          question_paper_id?: string;
          reason?: string;
          details?: string | null;
          status?: string;
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      upload_intents: {
        Row: {
          id: string;
          idempotency_key: string;
          college_id: string;
          subject_id: string;
          exam_type_id: string;
          title: string;
          description: string | null;
          mbbs_year: string;
          exam_attempt: string;
          exam_year: number;
          academic_year: string | null;
          storage_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_hash: string;
          page_count: number | null;
          status: string;
          error_message: string | null;
          question_paper_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idempotency_key: string;
          college_id: string;
          subject_id: string;
          exam_type_id: string;
          title: string;
          description?: string | null;
          mbbs_year: string;
          exam_attempt?: string;
          exam_year: number;
          academic_year?: string | null;
          storage_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_hash: string;
          page_count?: number | null;
          status?: string;
          error_message?: string | null;
          question_paper_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          idempotency_key?: string;
          college_id?: string;
          subject_id?: string;
          exam_type_id?: string;
          title?: string;
          description?: string | null;
          mbbs_year?: string;
          exam_attempt?: string;
          exam_year?: number;
          academic_year?: string | null;
          storage_path?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_hash?: string;
          page_count?: number | null;
          status?: string;
          error_message?: string | null;
          question_paper_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
