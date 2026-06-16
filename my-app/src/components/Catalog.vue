<script setup>
import { onMounted, computed, ref } from 'vue'
import { useApi } from './api.js'

const { data: products, loading, error, get } = useApi()
const { post: postCart } = useApi()

const fetchProducts = async () => {
  await get('/products')
}

onMounted(() => {
  fetchProducts()
})

const productList = computed(() => {
  const data = products.value
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data.data && Array.isArray(data.data)) return data.data
  if (data.products && Array.isArray(data.products)) return data.products
  const firstArray = Object.values(data).find(v => Array.isArray(v))
  return firstArray || []
})

const cartCounts = ref({})
const cartLoading = ref({})

const addToCart = async (productId) => {
  cartLoading.value[productId] = true
  try {
    await postCart(`/cart/${productId}`, {})
    if (!cartCounts.value[productId]) {
      cartCounts.value[productId] = 0
    }
    cartCounts.value[productId]++
  } catch (err) {
    if (err.response?.status === 401) {
      alert('Сессия истекла, пожалуйста, войдите заново')
      localStorage.removeItem('user_token')
    } else {
      alert('Не удалось добавить товар: ' + (err.message || 'Неизвестная ошибка'))
    }
  } finally {
    cartLoading.value[productId] = false
  }
}

const decrementCart = (productId) => {
  if (cartCounts.value[productId] && cartCounts.value[productId] > 0) {
    cartCounts.value[productId]--
    if (cartCounts.value[productId] === 0) {
      delete cartCounts.value[productId]
    }
  }
}
</script>

<template>
  <div class="catalog">
    <h1>Каталог товаров</h1>

    <div v-if="loading" class="loading">Загрузка товаров...</div>

    <div v-else-if="error" class="error">Ошибка загрузки: {{ error }}</div>

    <div v-else-if="productList.length" class="product-grid">
      <div
          v-for="product in productList"
          :key="product.id"
          class="product-card"
      >
        <img
            :src="'http://lifestealer86.ru/' + product.image"
            :alt="product.name"
            class="product-image"
            @error="(e) => e.target.src = '/placeholder.png'"
        />
        <div class="product-info">
          <h2 class="product-name">{{ product.name }}</h2>
          <p class="product-description">{{ product.description }}</p>
          <p class="product-price">{{ product.price }} ₽</p>

          <div v-if="cartCounts[product.id] > 0" class="cart-control">
            <button class="qty-btn" @click="decrementCart(product.id)">−</button>
            <span class="qty">{{ cartCounts[product.id] }}</span>
            <button
                class="qty-btn"
                @click="addToCart(product.id)"
                :disabled="cartLoading[product.id]"
            >+</button>
          </div>

          <button
              v-else
              class="add-to-cart"
              @click="addToCart(product.id)"
              :disabled="cartLoading[product.id]"
          >
            <span v-if="!cartLoading[product.id]">В корзину</span>
            <span v-else>Добавление...</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty">Товары не найдены</div>
  </div>
</template>

<style scoped>
.catalog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  color: #2c3e50;
}

.loading,
.error,
.empty {
  text-align: center;
  font-size: 1.2rem;
  padding: 40px;
  color: #2c3e50;
}

.error {
  color: #e74c3c;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: #f0f0f0;
}

.product-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.product-description {
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.product-price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #42b983;
  margin: 0 0 12px 0;
}

.add-to-cart {
  background-color: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
  width: 100%;
  text-align: center;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #359b6d;
}

.add-to-cart:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cart-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 4px 0;
}

.qty-btn {
  background-color: #e9ecef;
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
}

.qty-btn:hover:not(:disabled) {
  background-color: #dee2e6;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty {
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
  color: #2c3e50;
}

@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  h1 {
    font-size: 2rem;
  }
}
</style>