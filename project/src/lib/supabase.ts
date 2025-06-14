import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string | null;
          address: string | null;
          emergency_contact: string | null;
          insurance_info: string | null;
          medical_history: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          insurance_info?: string | null;
          medical_history?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          insurance_info?: string | null;
          medical_history?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          appointment_date: string;
          appointment_type: string;
          status: string;
          notes: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          appointment_date: string;
          appointment_type?: string;
          status?: string;
          notes?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          appointment_date?: string;
          appointment_type?: string;
          status?: string;
          notes?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medical_records: {
        Row: {
          id: string;
          patient_id: string;
          visit_date: string;
          diagnosis: string;
          treatment: string;
          prescription: string;
          notes: string;
          doctor_name: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          visit_date?: string;
          diagnosis?: string;
          treatment?: string;
          prescription?: string;
          notes?: string;
          doctor_name?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          visit_date?: string;
          diagnosis?: string;
          treatment?: string;
          prescription?: string;
          notes?: string;
          doctor_name?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      staff_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          phone?: string | null;
          created_at?: string;
        };
      };
    };
  };
};