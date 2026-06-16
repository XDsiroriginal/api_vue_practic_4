<script setup>
import { ref } from 'vue'
import { useApi } from './api.js'

const { data, loading, error, post } = useApi()

const email = ref('')
const password = ref('')
const loginError = ref(null)

const login = async () => {
  loginError.value = null

  if (!email.value || !password.value) {
    loginError.value = 'Заполните все поля'
    return
  }

  try {
    await post('/login', {
      email: email.value,
      password: password.value
    })
    const token = data.value?.data?.user_token
    if (token) {
      localStorage.setItem('user_token', token)
      window.location.href = '/'
    } else {
      loginError.value = 'Токен не получен'
    }
  } catch (err) {
    if (error.value?.response?.status === 401) {
      loginError.value = 'Неверный email или пароль'
    } else {
      loginError.value = error.value?.message || 'Ошибка соединения'
    }
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Вход</h1>

    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email</label>
        <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@admin.ru"
            required
        />
      </div>

      <div class="form-group">
        <label for="password">Пароль</label>
        <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            required
        />
      </div>

      <button type="submit" :disabled="loading">
        <span v-if="loading">Вход...</span>
        <span v-else>Войти</span>
      </button>

      <div v-if="loginError" class="error-message">
        {{ loginError }}
      </div>
      <div v-else-if="error && error.message" class="error-message">
        {{ error.message }}
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
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
  margin-bottom: 1rem;
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
}

button {
  width: 100%;
  padding: 0.7rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #42b983;
}

button:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  color: #dc3545;
  text-align: center;
  font-weight: bold;
}
</style>