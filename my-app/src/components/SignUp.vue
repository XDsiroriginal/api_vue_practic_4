<script setup>
import { ref } from 'vue'
import { useApi } from './api.js'

const { data, loading, error, post } = useApi()

const fio = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const fieldErrors = ref({})
const generalError = ref(null)

const register = async () => {
  generalError.value = null
  fieldErrors.value = {}

  let hasError = false

  if (!fio.value.trim()) {
    fieldErrors.value.fio = 'Введите ФИО'
    hasError = true
  }
  if (!email.value.trim()) {
    fieldErrors.value.email = 'Введите email'
    hasError = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    fieldErrors.value.email = 'Некорректный email'
    hasError = true
  }
  if (!password.value) {
    fieldErrors.value.password = 'Введите пароль'
    hasError = true
  } else if (password.value.length < 6) {
    fieldErrors.value.password = 'Пароль должен быть не менее 6 символов'
    hasError = true
  }
  if (password.value !== confirmPassword.value) {
    fieldErrors.value.confirmPassword = 'Пароли не совпадают'
    hasError = true
  }

  if (hasError) return

  try {
    await post('/signup', {
      fio: fio.value.trim(),
      email: email.value.trim(),
      password: password.value
    })

    const token = data.value?.data?.user_token
    if (token) {
      localStorage.setItem('user_token', token)
      window.location.href = '/'
    } else {
      generalError.value = 'Токен не получен'
    }
  } catch (err) {
    console.error('Ошибка регистрации:', err)
    console.error('error.value:', error.value)
    const errorData = error.value?.response?.data?.error || error.value?.data?.error || {}
    if (errorData.errors) {
      fieldErrors.value = {}
      for (const [field, messages] of Object.entries(errorData.errors)) {
        fieldErrors.value[field] = Array.isArray(messages) ? messages[0] : messages
      }
    } else if (errorData.message) {
      generalError.value = errorData.message
    } else {
      generalError.value = 'Ошибка при регистрации.'
    }
    if (error.value?.response?.status === 409) {
      generalError.value = 'Пользователь с таким email уже существует'
    }
  }
}
</script>

<template>
  <div class="register-container">
    <h1>Регистрация</h1>

    <form @submit.prevent="register">
      <div class="form-group" :class="{ 'has-error': fieldErrors.fio }">
        <label for="fio">ФИО</label>
        <input
            id="fio"
            v-model="fio"
            type="text"
            placeholder="Иванов Иван Иванович"
            required
        />
        <span v-if="fieldErrors.fio" class="field-error">{{ fieldErrors.fio }}</span>
      </div>

      <div class="form-group" :class="{ 'has-error': fieldErrors.email }">
        <label for="email">Email</label>
        <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@admin.ru"
            required
        />
        <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
      </div>

      <div class="form-group" :class="{ 'has-error': fieldErrors.password }">
        <label for="password">Пароль</label>
        <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Минимум 6 символов"
            required
        />
        <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
      </div>

      <div class="form-group" :class="{ 'has-error': fieldErrors.confirmPassword }">
        <label for="confirmPassword">Подтверждение пароля</label>
        <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Повторите пароль"
            required
        />
        <span v-if="fieldErrors.confirmPassword" class="field-error">{{ fieldErrors.confirmPassword }}</span>
      </div>

      <button type="submit" :disabled="loading">
        <span v-if="loading">Регистрация...</span>
        <span v-else>Зарегистрироваться</span>
      </button>

      <div v-if="generalError" class="error-message">
        {{ generalError }}
      </div>
      <div v-else-if="error && error.message && !generalError" class="error-message">
        {{ error.message }}
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-container {
  max-width: 420px;
  margin: 80px auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-family: sans-serif;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group.has-error label {
  color: #dc3545;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group.has-error input {
  border-color: #dc3545;
}

.field-error {
  display: block;
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

button {
  width: 100%;
  padding: 0.7rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

button:hover:not(:disabled) {
  background: #218838;
}

button:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
}
.login-link a:hover {
  text-decoration: underline;
}
</style>