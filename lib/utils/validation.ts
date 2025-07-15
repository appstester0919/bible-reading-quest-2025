// 輸入驗證工具
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class Validator {
  private errors: string[] = []

  // 重置錯誤
  reset(): Validator {
    this.errors = []
    return this
  }

  // 檢查是否為空
  required(value: any, fieldName: string): Validator {
    if (value === null || value === undefined || value === '') {
      this.errors.push(`${fieldName}為必填項目`)
    }
    return this
  }

  // 檢查字符串長度
  minLength(value: string, min: number, fieldName: string): Validator {
    if (typeof value === 'string' && value.length < min) {
      this.errors.push(`${fieldName}至少需要${min}個字符`)
    }
    return this
  }

  maxLength(value: string, max: number, fieldName: string): Validator {
    if (typeof value === 'string' && value.length > max) {
      this.errors.push(`${fieldName}不能超過${max}個字符`)
    }
    return this
  }

  // 檢查電子郵件格式
  email(value: string, fieldName: string = '電子郵件'): Validator {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof value === 'string' && value && !emailRegex.test(value)) {
      this.errors.push(`${fieldName}格式不正確`)
    }
    return this
  }

  // 檢查密碼強度
  password(value: string, fieldName: string = '密碼'): Validator {
    if (typeof value === 'string') {
      if (value.length < 8) {
        this.errors.push(`${fieldName}至少需要8個字符`)
      }
      if (!/[A-Z]/.test(value)) {
        this.errors.push(`${fieldName}需要包含至少一個大寫字母`)
      }
      if (!/[a-z]/.test(value)) {
        this.errors.push(`${fieldName}需要包含至少一個小寫字母`)
      }
      if (!/\d/.test(value)) {
        this.errors.push(`${fieldName}需要包含至少一個數字`)
      }
    }
    return this
  }

  // 檢查日期格式
  date(value: string, fieldName: string): Validator {
    if (typeof value === 'string' && value) {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        this.errors.push(`${fieldName}日期格式不正確`)
      }
    }
    return this
  }

  // 檢查數字範圍
  numberRange(value: number, min: number, max: number, fieldName: string): Validator {
    if (typeof value === 'number') {
      if (value < min || value > max) {
        this.errors.push(`${fieldName}必須在${min}到${max}之間`)
      }
    }
    return this
  }

  // 自定義驗證
  custom(condition: boolean, message: string): Validator {
    if (!condition) {
      this.errors.push(message)
    }
    return this
  }

  // 獲取驗證結果
  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors]
    }
  }
}

// 便捷函數
export function createValidator(): Validator {
  return new Validator()
}

// 常用驗證模式
export const ValidationPatterns = {
  // 用戶名：3-20個字符，只能包含字母、數字、下劃線
  username: (value: string): ValidationResult => {
    return createValidator()
      .required(value, '用戶名')
      .minLength(value, 3, '用戶名')
      .maxLength(value, 20, '用戶名')
      .custom(/^[a-zA-Z0-9_]+$/.test(value), '用戶名只能包含字母、數字和下劃線')
      .getResult()
  },

  // 電子郵件
  email: (value: string): ValidationResult => {
    return createValidator()
      .required(value, '電子郵件')
      .email(value)
      .getResult()
  },

  // 密碼
  password: (value: string): ValidationResult => {
    return createValidator()
      .required(value, '密碼')
      .password(value)
      .getResult()
  },

  // 讀經計劃名稱
  planName: (value: string): ValidationResult => {
    return createValidator()
      .required(value, '計劃名稱')
      .minLength(value, 2, '計劃名稱')
      .maxLength(value, 50, '計劃名稱')
      .getResult()
  },

  // 讀經日期
  readingDate: (value: string): ValidationResult => {
    const result = createValidator()
      .required(value, '讀經日期')
      .date(value, '讀經日期')
      .getResult()

    if (result.isValid) {
      const date = new Date(value)
      const today = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(today.getFullYear() - 1)
      const oneYearLater = new Date()
      oneYearLater.setFullYear(today.getFullYear() + 1)

      if (date < oneYearAgo || date > oneYearLater) {
        result.isValid = false
        result.errors.push('讀經日期必須在過去一年到未來一年之間')
      }
    }

    return result
  }
}

// React Hook 用於表單驗證
export function useFormValidation() {
  const validateField = (value: any, validationFn: (value: any) => ValidationResult) => {
    return validationFn(value)
  }

  const validateForm = (formData: Record<string, any>, validationRules: Record<string, (value: any) => ValidationResult>) => {
    const results: Record<string, ValidationResult> = {}
    let isFormValid = true

    for (const [field, value] of Object.entries(formData)) {
      if (validationRules[field]) {
        results[field] = validationRules[field](value)
        if (!results[field].isValid) {
          isFormValid = false
        }
      }
    }

    return {
      isValid: isFormValid,
      fieldResults: results,
      getAllErrors: () => {
        const allErrors: string[] = []
        Object.values(results).forEach(result => {
          allErrors.push(...result.errors)
        })
        return allErrors
      }
    }
  }

  return {
    validateField,
    validateForm
  }
}