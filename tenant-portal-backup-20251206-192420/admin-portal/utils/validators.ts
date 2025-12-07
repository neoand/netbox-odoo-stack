/**
 * Validators for Neo Stack
 * Form and data validation utilities
 */

export interface ValidationRule {
  validator: (value: any) => boolean
  message: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Check if value is email
 */
export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Check if value is required (not empty)
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

/**
 * Check minimum length
 */
export const minLength = (value: string | any[], min: number): boolean => {
  if (!value) return false
  return value.length >= min
}

/**
 * Check maximum length
 */
export const maxLength = (value: string | any[], max: number): boolean => {
  if (!value) return true
  return value.length <= max
}

/**
 * Check minimum value (for numbers)
 */
export const minValue = (value: number, min: number): boolean => {
  if (value === null || value === undefined) return false
  return value >= min
}

/**
 * Check maximum value (for numbers)
 */
export const maxValue = (value: number, max: number): boolean => {
  if (value === null || value === undefined) return true
  return value <= max
}

/**
 * Check if value is a valid URL
 */
export const isUrl = (value: string): boolean => {
  try {
    new URL(value)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Check if value is a valid phone number (Brazilian format)
 */
export const isPhoneBR = (value: string): boolean => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
  return phoneRegex.test(value)
}

/**
 * Check if value is a valid CPF
 */
export const isCpf = (value: string): boolean => {
  const cpf = value.replace(/[^\d]/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cpf.charAt(10))
}

/**
 * Check if value is a valid CNPJ
 */
export const isCnpj = (value: string): boolean => {
  const cnpj = value.replace(/[^\d]/g, '')
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  if (digit1 !== parseInt(cnpj.charAt(12))) return false

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  return digit2 === parseInt(cnpj.charAt(13))
}

/**
 * Check if value is a valid credit card number (Luhn algorithm)
 */
export const isCreditCard = (value: string): boolean => {
  const card = value.replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(card)) return false

  let sum = 0
  let shouldDouble = false
  for (let i = card.length - 1; i >= 0; i--) {
    let digit = parseInt(card.charAt(i))
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

/**
 * Check if value matches pattern
 */
export const matches = (value: string, pattern: RegExp): boolean => {
  if (!value) return false
  return pattern.test(value)
}

/**
 * Check if value is a strong password
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const isStrongPassword = (value: string): boolean => {
  const minLength = value.length >= 8
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)

  return minLength && hasUpper && hasLower && hasNumber && hasSpecial
}

/**
 * Check if value is a valid date
 */
export const isDate = (value: string): boolean => {
  if (!value) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Check if value is a valid date range
 */
export const isDateRange = (start: string, end: string): boolean => {
  if (!isDate(start) || !isDate(end)) return false
  return new Date(start) <= new Date(end)
}

/**
 * Check if value is a valid Brazilian CEP
 */
export const isCep = (value: string): boolean => {
  const cep = value.replace(/[^\d]/g, '')
  return /^\d{8}$/.test(cep)
}

/**
 * Create validation rule
 */
export const createRule = (
  validator: (value: any) => boolean,
  message: string
): ValidationRule => ({
  validator,
  message,
})

/**
 * Validate single field
 */
export const validateField = (value: any, rules: ValidationRule[]): string[] => {
  const errors: string[] = []

  for (const rule of rules) {
    if (!rule.validator(value)) {
      errors.push(rule.message)
    }
  }

  return errors
}

/**
 * Validate form
 */
export const validateForm = (
  data: Record<string, any>,
  schema: Record<string, ValidationRule[]>
): ValidationResult => {
  const errors: ValidationError[] = []

  for (const field in schema) {
    const value = data[field]
    const rules = schema[field]
    const fieldErrors = validateField(value, rules)

    for (const message of fieldErrors) {
      errors.push({
        field,
        message,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: [
    createRule(isRequired, 'Email é obrigatório'),
    createRule(isEmail, 'Email deve ter um formato válido'),
  ],

  password: [
    createRule(isRequired, 'Senha é obrigatória'),
    createRule(
      (value) => minLength(value, 8),
      'Senha deve ter pelo menos 8 caracteres'
    ),
  ],

  strongPassword: [
    createRule(isRequired, 'Senha é obrigatória'),
    createRule(
      isStrongPassword,
      'Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 símbolo'
    ),
  ],

  name: [
    createRule(isRequired, 'Nome é obrigatório'),
    createRule(
      (value) => minLength(value.trim(), 2),
      'Nome deve ter pelo menos 2 caracteres'
    ),
  ],

  phone: [
    createRule(isPhoneBR, 'Telefone deve ter o formato (00) 00000-0000'),
  ],

  cpf: [
    createRule(isRequired, 'CPF é obrigatório'),
    createRule(isCpf, 'CPF inválido'),
  ],

  cnpj: [
    createRule(isRequired, 'CNPJ é obrigatório'),
    createRule(isCnpj, 'CNPJ inválido'),
  ],

  cep: [
    createRule(isRequired, 'CEP é obrigatório'),
    createRule(isCep, 'CEP deve ter o formato 00000-000'),
  ],

  url: [
    createRule(isUrl, 'URL deve ter um formato válido'),
  ],

  dateRange: (startField: string, endField: string) => [
    createRule(
      (data) => isDateRange(data[startField], data[endField]),
      'Data de início deve ser anterior à data de fim'
    ),
  ],
}

/**
 * Async validator for unique values (e.g., checking if email already exists)
 */
export const createAsyncValidator = (
  validator: (value: any) => Promise<boolean>,
  message: string
) => {
  return async (value: any): Promise<boolean> => {
    try {
      return await validator(value)
    } catch (error) {
      console.error('Async validation error:', error)
      return false
    }
  }
}

/**
 * Validate and normalize CPF
 */
export const formatCpf = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '')
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Validate and normalize CNPJ
 */
export const formatCnpj = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '')
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Validate and normalize CEP
 */
export const formatCep = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '')
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Validate and format phone number
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return value
}
