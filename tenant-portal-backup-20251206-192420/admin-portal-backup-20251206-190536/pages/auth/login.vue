<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <h1 class="text-3xl font-bold text-gray-900">NEO_STACK</h1>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your admin account
        </p>
      </div>

      <UCard class="mt-8">
        <UForm
          :schema="schema"
          :state="form"
          @submit="handleLogin"
        >
          <div class="space-y-6">
            <UFormGroup label="Email address" name="email" required>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="admin@platform.local"
                icon="i-heroicons-envelope"
                size="lg"
              />
            </UFormGroup>

            <UFormGroup label="Password" name="password" required>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed"
                size="lg"
              />
            </UFormGroup>

            <div class="flex items-center justify-between">
              <UCheckbox
                v-model="form.remember"
                label="Remember me"
              />

              <NuxtLink
                to="/auth/forgot-password"
                class="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </NuxtLink>
            </div>

            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              :loading="authStore.loading"
            >
              Sign in
            </UButton>
          </div>
        </UForm>

        <template #footer>
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <NuxtLink
                to="/auth/register"
                class="font-medium text-primary-600 hover:text-primary-500"
              >
                Contact administrator
              </NuxtLink>
            </p>
          </div>
        </template>
      </UCard>

      <!-- Demo credentials -->
      <UCard class="mt-4 bg-blue-50 border-blue-200">
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 mr-2" />
            <span class="text-sm font-medium text-blue-900">Demo Credentials</span>
          </div>
        </template>

        <div class="space-y-2 text-sm">
          <div>
            <span class="font-medium text-blue-900">Email:</span>
            <span class="text-blue-700 ml-2">admin@platform.local</span>
          </div>
          <div>
            <span class="font-medium text-blue-900">Password:</span>
            <span class="text-blue-700 ml-2">admin123</span>
          </div>
          <UButton
            color="blue"
            variant="ghost"
            size="sm"
            class="mt-2"
            @click="fillDemoCredentials"
          >
            Fill demo credentials
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { z } from 'zod'

definePageMeta({
  layout: false,
  middleware: 'guest',
})

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const handleLogin = async () => {
  try {
    await authStore.login(form.email, form.password)

    toast.add({
      title: 'Success',
      description: 'Logged in successfully',
      color: 'green',
    })

    await router.push('/')
  } catch (error: any) {
    toast.add({
      title: 'Login Failed',
      description: error.message || 'Invalid credentials',
      color: 'red',
    })
  }
}

const fillDemoCredentials = () => {
  form.email = 'admin@platform.local'
  form.password = 'admin123'
}
</script>
