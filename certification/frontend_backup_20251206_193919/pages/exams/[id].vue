<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Exam Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <UButton
              color="gray"
              variant="ghost"
              icon="heroicons:arrow-left"
              @click="goBack"
            >
              Back
            </UButton>
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ examAttempt?.certification?.name || 'Exam' }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-6">
            <!-- Timer -->
            <div class="flex items-center space-x-2">
              <Icon
                name="heroicons:clock"
                class="h-5 w-5 text-gray-400"
              />
              <span
                :class="[
                  'text-lg font-semibold',
                  timeRemaining < 300 ? 'text-red-600' : 'text-gray-900 dark:text-white'
                ]"
              >
                {{ formatTime(timeRemaining) }}
              </span>
            </div>

            <!-- Progress -->
            <div class="w-48">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-500">Progress</span>
                <span class="text-xs text-gray-500">
                  {{ Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Question Navigator -->
        <div class="lg:col-span-1">
          <UCard>
            <template #header>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                Questions
              </h3>
            </template>

            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="(question, index) in questions"
                :key="question.id"
                :class="[
                  'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                  index === currentQuestionIndex
                    ? 'bg-primary-600 text-white'
                    : answeredQuestions.has(question.id)
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                ]"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </button>
            </div>

            <div class="mt-4 space-y-2">
              <div class="flex items-center space-x-2 text-xs">
                <div class="w-4 h-4 bg-primary-600 rounded" />
                <span class="text-gray-600 dark:text-gray-400">Current</span>
              </div>
              <div class="flex items-center space-x-2 text-xs">
                <div class="w-4 h-4 bg-green-100 rounded dark:bg-green-900" />
                <span class="text-gray-600 dark:text-gray-400">Answered</span>
              </div>
              <div class="flex items-center space-x-2 text-xs">
                <div class="w-4 h-4 bg-gray-100 rounded dark:bg-gray-700" />
                <span class="text-gray-600 dark:text-gray-400">Not answered</span>
              </div>
            </div>
          </UCard>

          <!-- Exam Actions -->
          <UCard class="mt-4">
            <div class="space-y-3">
              <UButton
                block
                color="gray"
                variant="ghost"
                @click="saveForLater"
                :loading="saving"
              >
                Save Progress
              </UButton>
              <UButton
                block
                color="primary"
                @click="submitExam"
                :disabled="hasUnansweredQuestions"
              >
                Submit Exam
              </UButton>
            </div>
          </UCard>
        </div>

        <!-- Question Content -->
        <div class="lg:col-span-3">
          <UCard v-if="currentQuestion">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <UBadge
                    :label="currentQuestion.question_type"
                    color="primary"
                    size="xs"
                  />
                  <span class="text-sm text-gray-500">
                    {{ currentQuestion.points }} point{{ currentQuestion.points !== 1 ? 's' : '' }}
                  </span>
                </div>
                <UBadge
                  :label="`Difficulty: ${currentQuestion.difficulty_level}/5`"
                  :color="getDifficultyColor(currentQuestion.difficulty_level)"
                  size="xs"
                />
              </div>
            </template>

            <div class="prose dark:prose-invert max-w-none">
              <h3 class="text-lg font-semibold mb-4">
                {{ currentQuestion.question_text }}
              </h3>

              <!-- Multiple Choice -->
              <div
                v-if="currentQuestion.question_type === 'multiple_choice'"
                class="space-y-3"
              >
                <URadioGroup
                  v-model="selectedAnswer"
                  :options="questionOptions"
                  name="answer"
                />
              </div>

              <!-- Practical/Lab -->
              <div
                v-else-if="currentQuestion.question_type === 'practical'"
                class="space-y-4"
              >
                <div
                  v-if="currentQuestion.question_data?.scenario"
                  class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                >
                  <h4 class="font-medium mb-2">Scenario</h4>
                  <p class="text-sm">{{ currentQuestion.question_data.scenario }}</p>
                </div>

                <UTextarea
                  v-model="answerText"
                  placeholder="Provide your detailed answer..."
                  :rows="8"
                />
              </div>

              <!-- Case Study -->
              <div
                v-else-if="currentQuestion.question_type === 'case_study'"
                class="space-y-4"
              >
                <div
                  v-if="currentQuestion.question_data?.case"
                  class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                >
                  <h4 class="font-medium mb-2">Case Study</h4>
                  <p class="text-sm whitespace-pre-wrap">
                    {{ currentQuestion.question_data.case }}
                  </p>
                </div>

                <div class="space-y-3">
                  <div
                    v-for="(subquestion, idx) in currentQuestion.question_data?.subquestions || []"
                    :key="idx"
                  >
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {{ idx + 1 }}. {{ subquestion }}
                    </label>
                    <UTextarea
                      v-model="caseStudyAnswers[idx]"
                      :placeholder="`Answer question ${idx + 1}...`"
                      :rows="4"
                    />
                  </div>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="flex items-center justify-between">
                <UButton
                  color="gray"
                  variant="ghost"
                  @click="previousQuestion"
                  :disabled="currentQuestionIndex === 0"
                >
                  <Icon name="heroicons:arrow-left" class="mr-2 h-4 w-4" />
                  Previous
                </UButton>

                <UButton
                  color="primary"
                  @click="nextQuestion"
                  :disabled="currentQuestionIndex === totalQuestions - 1"
                >
                  Next
                  <Icon name="heroicons:arrow-right" class="ml-2 h-4 w-4" />
                </UButton>
              </div>
            </template>
          </UCard>

          <!-- Empty State -->
          <UCard v-else>
            <div class="text-center py-12">
              <Icon
                name="heroicons:document-text"
                class="mx-auto h-12 w-12 text-gray-400"
              />
              <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No questions available
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                There are no questions for this exam yet.
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <UModal v-model="showSubmitModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Submit Exam
          </h3>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to submit your exam? This action cannot be undone.
          </p>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div class="flex">
              <Icon
                name="heroicons:exclamation-triangle"
                class="h-5 w-5 text-yellow-600 dark:text-yellow-400"
              />
              <div class="ml-3">
                <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Unanswered Questions
                </h4>
                <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  You have {{ unansweredCount }} unanswered questions.
                  These will be marked as incorrect.
                </p>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end space-x-3">
            <UButton
              color="gray"
              variant="ghost"
              @click="showSubmitModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              @click="confirmSubmit"
              :loading="submitting"
            >
              Submit Exam
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCertificationStore } from '~/stores/certification'

const route = useRoute()
const router = useRouter()
const certificationStore = useCertificationStore()

const examId = route.params.id as string

const examAttempt = ref(null)
const questions = ref([])
const currentQuestionIndex = ref(0)
const timeRemaining = ref(0)
const timerInterval = ref<NodeJS.Timeout | null>(null)
const saving = ref(false)
const submitting = ref(false)
const showSubmitModal = ref(false)

const selectedAnswer = ref('')
const answerText = ref('')
const caseStudyAnswers = ref<Record<number, string>>({})
const answeredQuestions = ref(new Set())

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const totalQuestions = computed(() => questions.value.length)
const hasUnansweredQuestions = computed(() => answeredQuestions.value.size < totalQuestions.value)
const unansweredCount = computed(() => totalQuestions.value - answeredQuestions.value.size)

const questionOptions = computed(() => {
  if (!currentQuestion.value?.options) return []
  return currentQuestion.value.options.map((opt: any) => ({
    value: opt.id,
    label: opt.option_text
  }))
})

const getDifficultyColor = (level: number) => {
  if (level <= 2) return 'green'
  if (level <= 3) return 'yellow'
  return 'red'
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const goBack = () => {
  router.push('/')
}

const goToQuestion = (index: number) => {
  saveCurrentAnswer()
  currentQuestionIndex.value = index
  loadAnswer()
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    saveCurrentAnswer()
    currentQuestionIndex.value++
    loadAnswer()
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    saveCurrentAnswer()
    currentQuestionIndex.value--
    loadAnswer()
  }
}

const saveCurrentAnswer = () => {
  if (!currentQuestion.value) return

  let answerData: any = null

  if (currentQuestion.value.question_type === 'multiple_choice') {
    answerData = { selected_options: [selectedAnswer.value] }
  } else if (currentQuestion.value.question_type === 'practical') {
    answerData = { answer_text: answerText.value }
  } else if (currentQuestion.value.question_type === 'case_study') {
    answerData = { answer_text: JSON.stringify(caseStudyAnswers.value) }
  }

  if (answerData) {
    certificationStore.saveAnswer(examId, currentQuestion.value.id, answerData)
    answeredQuestions.value.add(currentQuestion.value.id)
  }
}

const loadAnswer = () => {
  if (!currentQuestion.value) return

  selectedAnswer.value = ''
  answerText.value = ''
  caseStudyAnswers.value = {}

  const existingAnswer = certificationStore.getAnswer(examId, currentQuestion.value.id)
  if (existingAnswer) {
    if (currentQuestion.value.question_type === 'multiple_choice') {
      selectedAnswer.value = existingAnswer.selected_options?.[0] || ''
    } else if (currentQuestion.value.question_type === 'practical') {
      answerText.value = existingAnswer.answer_text || ''
    } else if (currentQuestion.value.question_type === 'case_study') {
      caseStudyAnswers.value = existingAnswer.answer_text
        ? JSON.parse(existingAnswer.answer_text)
        : {}
    }
    answeredQuestions.value.add(currentQuestion.value.id)
  }
}

const saveForLater = async () => {
  saving.value = true
  try {
    saveCurrentAnswer()
    await certificationStore.saveExamProgress(examId)
  } finally {
    saving.value = false
  }
}

const submitExam = () => {
  showSubmitModal.value = true
}

const confirmSubmit = async () => {
  submitting.value = true
  try {
    await certificationStore.submitExam(examId)
    router.push(`/exams/${examId}/results`)
  } finally {
    submitting.value = false
    showSubmitModal.value = false
  }
}

const startTimer = () => {
  if (examAttempt.value?.duration_minutes) {
    timeRemaining.value = examAttempt.value.duration_minutes * 60

    timerInterval.value = setInterval(() => {
      timeRemaining.value--

      if (timeRemaining.value <= 0) {
        clearInterval(timerInterval.value!)
        confirmSubmit()
      }
    }, 1000)
  }
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

onMounted(async () => {
  await certificationStore.loadExamAttempt(examId)
  examAttempt.value = certificationStore.currentExamAttempt

  await certificationStore.loadExamQuestions(examId)
  questions.value = certificationStore.examQuestions

  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

definePageMeta({
  layout: 'exam',
  middleware: 'auth'
})
</script>
