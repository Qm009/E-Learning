export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'teacher' | 'student'
                    full_name: string | null
                    email: string
                    avatar_url: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    role?: 'admin' | 'teacher' | 'student'
                    full_name?: string | null
                    email: string
                    avatar_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'teacher' | 'student'
                    full_name?: string | null
                    email?: string
                    avatar_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            courses: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    image_url: string | null
                    teacher_id: string | null
                    status: 'draft' | 'published'
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    image_url?: string | null
                    teacher_id?: string | null
                    status?: 'draft' | 'published'
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    image_url?: string | null
                    teacher_id?: string | null
                    status?: 'draft' | 'published'
                    created_at?: string | null
                }
            }
            quizzes: {
                Row: {
                    id: string
                    course_id: string | null
                    title: string
                    questions: Json
                    passing_score_percentage: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    course_id?: string | null
                    title: string
                    questions: Json
                    passing_score_percentage?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    course_id?: string | null
                    title?: string
                    questions?: Json
                    passing_score_percentage?: number | null
                    created_at?: string | null
                }
            }
            scores: {
                Row: {
                    id: string
                    student_id: string | null
                    quiz_id: string | null
                    score_percentage: number
                    passed: boolean
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    student_id?: string | null
                    quiz_id?: string | null
                    score_percentage: number
                    passed: boolean
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    student_id?: string | null
                    quiz_id?: string | null
                    score_percentage?: number
                    passed?: boolean
                    created_at?: string | null
                }
            }
            enrollments: {
                Row: {
                    id: string
                    student_id: string | null
                    course_id: string | null
                    progress: number | null
                    status: 'in_progress' | 'completed' | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    student_id?: string | null
                    course_id?: string | null
                    progress?: number | null
                    status?: 'in_progress' | 'completed' | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    student_id?: string | null
                    course_id?: string | null
                    progress?: number | null
                    status?: 'in_progress' | 'completed' | null
                    created_at?: string | null
                }
            }
            course_questions: {
                Row: {
                    id: string
                    course_id: string | null
                    student_id: string | null
                    question: string
                    answer: string | null
                    answered_at: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    course_id?: string | null
                    student_id?: string | null
                    question: string
                    answer?: string | null
                    answered_at?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    course_id?: string | null
                    student_id?: string | null
                    question?: string
                    answer?: string | null
                    answered_at?: string | null
                    created_at?: string | null
                }
            }
        }
    }
}