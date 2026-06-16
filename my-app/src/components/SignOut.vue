<script setup>
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    const response = await fetch('/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const result = await response.json()
      console.log(result.data?.message)
    }
  } catch (error) {
    console.error('Ошибка при выходе:', error)
  } finally {
    localStorage.removeItem('user_token')
    window.location.href = '/'
  }
})
</script>

<template>
  <h1>Выход...</h1>
</template>

<style scoped>
</style>