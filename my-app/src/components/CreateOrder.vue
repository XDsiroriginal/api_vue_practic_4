<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from './api.js'

const { data: cartData, loading: cartLoading, error: cartError, get } = useApi()
const { data: orderResult, loading: orderLoading, error: orderError, post } = useApi()

const cartItems = ref([])
const orderSuccess = ref(false)
const orderId = ref(null)

const fetchCart = async () => {
  await get('/cart')
  if (cartData.value) {
    const items = cartData.value.data || cartData.value
    if (Array.isArray(items)) {
      cartItems.value = items
    } else {
      cartItems.value = []
    }
  }
}

const createOrder = async () => {
  try {
    await post('/order')
    if (orderResult.value && orderResult.value.data) {
      orderSuccess.value = true
      orderId.value = orderResult.value.data.order_id
    } else if (orderResult.value && orderResult.value.order_id) {
      orderSuccess.value = true
      orderId.value = orderResult.value.order_id
    }
  } catch (e) {}
}

const groupedItems = computed(() => {
  const groups = {}
  cartItems.value.forEach(item => {
    const key = item.product_id || item.id
    if (!groups[key]) {
      groups[key] = {
        product_id: key,
        name: item.name,
        price: item.price,
        image: item.image || null,
        count: 0,
        total: 0
      }
    }
    groups[key].count += 1
    groups[key].total += item.price
  })
  return Object.values(groups)
})

const totalPrice = computed(() => {
  return groupedItems.value.reduce((sum, g) => sum + g.total, 0)
})

onMounted(() => {
  fetchCart()
})
</script>

<template>
  <div class="create-order">
    <h1>Оформление заказа</h1>
    <div v-if="cartLoading">Загрузка корзины...</div>
    <div v-else-if="cartError" class="error">{{ cartError }}</div>
    <div v-else>
      <div v-if="cartItems.length === 0">
        <p>Корзина пуста</p>
      </div>
      <div v-else>
        <div class="cart-list">
          <div v-for="group in groupedItems" :key="group.product_id" class="cart-item">
            <img
                :src="group.image ? 'http://lifestealer86.ru/' + group.image : 'https://via.placeholder.com/80'"
                :alt="group.name"
                class="item-image"
            />
            <div class="item-details">
              <div class="item-name">{{ group.name }}</div>
              <div class="item-price">Цена: {{ group.price }} руб.</div>
              <div class="item-count">Количество: {{ group.count }}</div>
              <div class="item-total">Итого: {{ group.total }} руб.</div>
            </div>
          </div>
        </div>
        <p class="total-order">Общая сумма: {{ totalPrice }} руб.</p>
        <button
            @click="createOrder"
            :disabled="orderLoading || cartItems.length === 0"
        >
          Оформить заказ
        </button>
        <div v-if="orderLoading">Оформление...</div>
        <div v-if="orderError" class="error">{{ orderError }}</div>
        <div v-if="orderSuccess" class="success">
          Заказ №{{ orderId }} успешно оформлен!
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-order {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  color: #2c3e50;
}
h1 {
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
}
.cart-list {
  margin: 20px 0;
}
.cart-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}
.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}
.item-details {
  flex: 1;
}
.item-name {
  font-weight: bold;
  font-size: 18px;
}
.item-price,
.item-count,
.item-total {
  font-size: 14px;
  color: #555;
}
.total-order {
  font-size: 20px;
  font-weight: bold;
  margin-top: 15px;
  color: #2c3e50;
}
button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:hover:not(:disabled) {
  background-color: #3aa876;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #e74c3c;
  margin-top: 10px;
}
.success {
  color: #42b983;
  margin-top: 10px;
}
</style>