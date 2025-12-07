import { defineStore } from 'pinia'
import type { Certification, ExamAttempt, Question, UserProgress } from '~/types/certification'

interface CertificationStats {
  activeCertificates: number
  totalStudyHours: number
  completionRate: number
  currentStreak: number
}

interface RecentActivity {
  id: string
  title: string
  description: string
  icon: string
  iconBackground: string
  timestamp: Date
}

interface UpcomingExam {
  id: string
  name: string
  scheduledDate: Date
}

export const useCertificationStore = defineStore('certification', {
  state: () => ({
    certifications: [] as Certification[],
    availableCertifications: [] as Certification[],
    currentExamAttempt: null as ExamAttempt | null,
    examQuestions: [] as Question[],
    userStats: {} as CertificationStats,
    recentActivities: [] as RecentActivity[],
    upcomingExams: [] as UpcomingExam[],
    userProgress: [] as UserProgress[],
    savedAnswers: {} as Record<string, any>
  }),

  getters: {
    getCertificationById: (state) => (id: string) => {
      return state.certifications.find(cert => cert.id === id)
    },

    getExamProgress: (state) => (examId: string) => {
      const answered = Object.keys(state.savedAnswers[examId] || {}).length
      return state.examQuestions.length > 0
        ? (answered / state.examQuestions.length) * 100
        : 0
    },

    getCertificationsByLevel: (state) => (level: string) => {
      return state.certifications.filter(cert => cert.level === level)
    }
  },

  actions: {
    async loadCertifications() {
      try {
        const { data } = await useFetch('/api/v1/certifications')
        if (data.value) {
          this.certifications = data.value as Certification[]
          this.availableCertifications = this.certifications.filter(c => c.is_active)
        }
      } catch (error) {
        console.error('Failed to load certifications:', error)
      }
    },

    async loadCertificationDetails(certId: string) {
      try {
        const { data } = await useFetch(`/api/v1/certifications/${certId}`)
        if (data.value) {
          return data.value as Certification
        }
      } catch (error) {
        console.error('Failed to load certification details:', error)
        return null
      }
    },

    async loadUserStats() {
      try {
        // Mock data - replace with actual API call
        this.userStats = {
          activeCertificates: 2,
          totalStudyHours: 45,
          completionRate: 68,
          currentStreak: 7
        }
      } catch (error) {
        console.error('Failed to load user stats:', error)
      }
    },

    async loadRecentActivity() {
      try {
        // Mock data - replace with actual API call
        this.recentActivities = [
          {
            id: '1',
            title: 'Completed exam',
            description: 'NEO_STACK Certified Professional',
            icon: 'heroicons:trophy',
            iconBackground: 'bg-yellow-500',
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            id: '2',
            title: 'Started study module',
            description: 'Security Advanced Concepts',
            icon: 'heroicons:book-open',
            iconBackground: 'bg-blue-500',
            timestamp: new Date(Date.now() - 7200000)
          },
          {
            id: '3',
            title: 'Earned certificate',
            description: 'NEO_STACK Certified Fundamental',
            icon: 'heroicons:academic-cap',
            iconBackground: 'bg-green-500',
            timestamp: new Date(Date.now() - 86400000)
          }
        ]
      } catch (error) {
        console.error('Failed to load recent activity:', error)
      }
    },

    async loadUpcomingExams() {
      try {
        // Mock data - replace with actual API call
        this.upcomingExams = []
      } catch (error) {
        console.error('Failed to load upcoming exams:', error)
      }
    },

    async startExamAttempt(certificationId: string) {
      try {
        const { data, error } = await useFetch('/api/v1/exams/attempts', {
          method: 'POST',
          body: { certification_id: certificationId }
        })

        if (error.value) {
          throw error.value
        }

        if (data.value) {
          this.currentExamAttempt = data.value as ExamAttempt
          return this.currentExamAttempt
        }
      } catch (error) {
        console.error('Failed to start exam:', error)
        throw error
      }
    },

    async loadExamAttempt(examId: string) {
      try {
        const { data } = await useFetch(`/api/v1/exams/attempts/${examId}`)
        if (data.value) {
          this.currentExamAttempt = data.value as ExamAttempt
        }
      } catch (error) {
        console.error('Failed to load exam attempt:', error)
      }
    },

    async loadExamQuestions(certificationId: string) {
      try {
        const { data } = await useFetch(`/api/v1/certifications/${certificationId}/questions`)
        if (data.value) {
          this.examQuestions = data.value as Question[]
        }
      } catch (error) {
        console.error('Failed to load exam questions:', error)
      }
    },

    saveAnswer(examId: string, questionId: string, answer: any) {
      if (!this.savedAnswers[examId]) {
        this.savedAnswers[examId] = {}
      }
      this.savedAnswers[examId][questionId] = answer
    },

    getAnswer(examId: string, questionId: string) {
      return this.savedAnswers[examId]?.[questionId]
    },

    async saveExamProgress(examId: string) {
      try {
        const answers = Object.entries(this.savedAnswers[examId] || {}).map(
          ([questionId, answer]) => ({
            question_id: questionId,
            ...answer
          })
        )

        await useFetch(`/api/v1/exams/attempts/${examId}/answers`, {
          method: 'POST',
          body: { answers }
        })
      } catch (error) {
        console.error('Failed to save exam progress:', error)
        throw error
      }
    },

    async submitExam(examId: string) {
      try {
        // Save any pending answers
        await this.saveExamProgress(examId)

        // Submit the exam
        const { data } = await useFetch(`/api/v1/exams/attempts/${examId}/complete`, {
          method: 'POST'
        })

        return data.value
      } catch (error) {
        console.error('Failed to submit exam:', error)
        throw error
      }
    },

    async loadUserProgress(certificationId?: string) {
      try {
        const params = certificationId ? { certification_id: certificationId } : {}
        const { data } = await useFetch('/api/v1/progress', { params })

        if (data.value) {
          this.userProgress = data.value as UserProgress[]
        }
      } catch (error) {
        console.error('Failed to load user progress:', error)
      }
    },

    async updateProgress(progress: Partial<UserProgress>) {
      try {
        const { data } = await useFetch('/api/v1/progress', {
          method: 'POST',
          body: progress
        })

        if (data.value) {
          const index = this.userProgress.findIndex(
            p => p.certification_id === progress.certification_id &&
                 p.module_id === progress.module_id &&
                 p.material_id === progress.material_id
          )

          if (index >= 0) {
            this.userProgress[index] = data.value as UserProgress
          } else {
            this.userProgress.push(data.value as UserProgress)
          }
        }
      } catch (error) {
        console.error('Failed to update progress:', error)
        throw error
      }
    },

    async loadCertificates() {
      try {
        const { data } = await useFetch('/api/v1/certificates')

        if (data.value) {
          return data.value
        }
      } catch (error) {
        console.error('Failed to load certificates:', error)
        return []
      }
    },

    async verifyCertificate(certificateId: string) {
      try {
        const { data } = await useFetch(`/api/v1/certificates/${certificateId}/verify`)

        if (data.value) {
          return data.value
        }
      } catch (error) {
        console.error('Failed to verify certificate:', error)
        return null
      }
    },

    async loadStudyMaterials(certificationId: string, moduleId?: string) {
      try {
        const params: any = {}
        if (moduleId) params.module_id = moduleId

        const { data } = await useFetch(
          `/api/v1/certifications/${certificationId}/materials`,
          { params }
        )

        if (data.value) {
          return data.value
        }
      } catch (error) {
        console.error('Failed to load study materials:', error)
        return []
      }
    },

    get stats() {
      return this.userStats
    }
  }
})
