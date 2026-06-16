<script setup>
import { onMounted, computed, ref } from 'vue'
import { useApi } from './api.js'

const { data: carts, loading, error, get, del } = useApi()

const fetchCarts = async () => {
  await get('/cart')
}

onMounted(() => {
  fetchCarts()
})

const deletingIds = ref(new Set())
const deleteError = ref(null)

const rawItems = computed(() => {
  const raw = carts.value
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (raw.data && Array.isArray(raw.data)) return raw.data
  return []
})

const items = computed(() => {
  const list = rawItems.value
  const map = new Map()
  for (const item of list) {
    const key = item.product_id || item.id
    if (!map.has(key)) {
      map.set(key, { ...item, quantity: 1 })
    } else {
      const existing = map.get(key)
      existing.quantity += 1
    }
  }
  return Array.from(map.values())
})

const itemCount = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
})

const removeItem = async (id) => {
  if (deletingIds.value.has(id)) return
  deleteError.value = null

  deletingIds.value.add(id)

  try {
    await del(`/cart/${id}`)
    await fetchCarts()
  } catch (err) {
    deleteError.value = err.response?.data?.error?.message || err.message || 'Не удалось удалить товар'
    console.error('Ошибка удаления:', err)
  } finally {
    deletingIds.value.delete(id)
  }
}

const clearCart = async () => {
  if (!confirm('Очистить корзину?')) return
  deleteError.value = null

  const itemsToDelete = rawItems.value
  for (const item of itemsToDelete) {
    await removeItem(item.id)
  }
}
</script>

<template>
  <div class="cart-page">
    <div class="cart-header">
      <h1>Корзина</h1>
      <button v-if="itemCount > 0" class="clear-btn" @click="clearCart">
        Очистить корзину
      </button>
    </div>

    <div v-if="loading" class="status-message loading">
      Загрузка корзины...
    </div>

    <div v-else-if="error" class="status-message error">
      Ошибка: {{ error.message || 'Неизвестная ошибка' }}
    </div>

    <div v-else-if="deleteError" class="status-message error">
      Ошибка удаления: {{ deleteError }}
    </div>

    <div v-else-if="itemCount === 0" class="empty-cart">
      <h2>Корзина пуста</h2>
      <p>Добавьте товары в корзину, чтобы оформить заказ</p>
      <router-link to="/products" class="continue-btn">
        Перейти к товарам
      </router-link>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div
            v-for="item in items"
            :key="item.product_id || item.id"
            class="cart-item"
            :class="{ 'deleting': deletingIds.has(item.id) }"
        >
          <div class="item-image">
            <img
                :src="'http://lifestealer86.ru/' + (item.image || 'img/default.jpg')"
                :alt="item.name"
                @error="(e) => e.target.src = 'http://lifestealer86.ru/img/default.jpg'"
            >
          </div>

          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-meta">
              <span class="item-id">Артикул: {{ item.product_id || item.id }}</span>
              <span class="item-quantity">Количество: {{ item.quantity }}</span>
            </div>
          </div>

          <div class="item-actions">
            <span class="item-price">{{ (item.price || 0) * item.quantity }} ₽</span>
            <button
                class="remove-btn"
                @click="removeItem(item.id)"
                :disabled="deletingIds.has(item.id)"
                title="Удалить товар"
            >
              <span v-if="deletingIds.has(item.id)" class="spinner"></span>
              <span v-else>✕</span>
            </button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-content">
          <div class="summary-row">
            <span>Товары ({{ itemCount }})</span>
            <span>{{ totalPrice }} ₽</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Итого</span>
            <span>{{ totalPrice }} ₽</span>
          </div>
        </div>
        <button class="checkout-btn">Оформить заказ</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
}

.cart-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
}

.clear-btn {
  padding: 10px 20px;
  background: #fff;
  color: #dc3545;
  border: 2px solid #dc3545;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #dc3545;
  color: #fff;
}

.status-message {
  padding: 30px;
  text-align: center;
  font-size: 18px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.status-message.loading {
  color: #42b983;
  background: #e8f5e9;
}

.status-message.error {
  color: #dc3545;
  background: #f8d7da;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.empty-cart h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-cart p {
  color: #6c757d;
  margin-bottom: 25px;
}

.continue-btn {
  display: inline-block;
  padding: 12px 32px;
  background: #42b983;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
}

.continue-btn:hover {
  background: #359f6e;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;
  position: relative;
}

.cart-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.cart-item.deleting {
  opacity: 0.5;
  pointer-events: none;
}

.item-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  margin-right: 20px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f3f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  margin-right: 20px;
}

.item-name {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.item-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #94a3b8;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.item-price {
  font-size: 20px;
  font-weight: 700;
  color: #42b983;
  white-space: nowrap;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f1f3f5;
  color: #6c757d;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: #f8d7da;
  color: #dc3545;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cart-summary {
  position: sticky;
  top: 30px;
  align-self: start;
}

.summary-content {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 16px;
  color: #2c3e50;
}

.summary-row:first-child {
  padding-top: 0;
}

.summary-divider {
  height: 1px;
  background: #e9ecef;
  margin: 8px 0;
}

.summary-row.total {
  padding-top: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #42b983;
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.checkout-btn:hover {
  background: #359f6e;
  box-shadow: 0 4px 16px rgba(66, 185, 131, 0.4);
}

@media (max-width: 992px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-item {
    flex-direction: column;
    align-items: stretch;
  }

  .item-image {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 16px;
  }

  .item-info {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .item-actions {
    justify-content: space-between;
  }

  .cart-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .clear-btn {
    width: 100%;
  }
}
</style>