/**
 * TypeScript types for Certification Module
 */

export interface Certification {
  id: string
  name: string
  description: string
  level: 'fundamental' | 'professional' | 'expert' | 'master'
  duration_minutes: number
  passing_score: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ExamAttempt {
  id: string
  certification_id: string
  user_id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  started_at: string
  completed_at?: string
  score?: number
  duration_minutes?: number
  certification?: Certification
}

export interface Question {
  id: string
  certification_id: string
  question_text: string
  question_type: 'multiple_choice' | 'practical' | 'case_study'
  options?: QuestionOption[]
  points: number
  difficulty_level: number
  question_data?: Record<string, any>
  created_at?: string
}

export interface QuestionOption {
  id: string
  option_text: string
  is_correct: boolean
}

export interface UserProgress {
  id: string
  certification_id: string
  module_id?: string
  material_id?: string
  user_id: string
  progress_percentage: number
  completed_at?: string
  created_at?: string
  updated_at?: string
}

export interface Certificate {
  id: string
  certification_id: string
  user_id: string
  issued_at: string
  verification_code: string
  metadata?: Record<string, any>
}

export interface StudyMaterial {
  id: string
  certification_id: string
  module_id?: string
  title: string
  content: string
  type: 'video' | 'document' | 'link' | 'quiz'
  order: number
  created_at?: string
}
