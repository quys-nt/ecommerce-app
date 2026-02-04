<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/store/cartStore'

const cartStore = useCartStore()
const { items } = storeToRefs(cartStore)

const PLACEHOLDER = '/assets/upload/placeholder.svg'

function updateQty(item: { productId: number; size: string; color: string }, delta: number) {
  const current = items.value.find(
    (i) => i.productId === item.productId && i.size === item.size && i.color === item.color,
  )
  if (current) cartStore.updateQuantity(item.productId, item.size, item.color, current.quantity + delta)
}
</script>

<template>
  <main class="cart-page">
    <div class="cart-inner">
      <h1 class="page-title">Giỏ hàng</h1>
      <template v-if="items.length">
        <ul class="cart-list">
          <li v-for="item in items" :key="`${item.productId}-${item.size}-${item.color}`" class="cart-item">
            <img :src="item.mainImage" :alt="item.name" class="item-img"
              @error="($event.target as HTMLImageElement).src = PLACEHOLDER" />
            <div class="item-info">
              <router-link :to="`/products/${item.slug}`" class="item-name">{{ item.name }}</router-link>
              <p class="item-meta">Size: {{ item.size }} · Màu: {{ item.color }}</p>
              <p class="item-price">{{ (item.price / 1000).toFixed(0) }}k ₫</p>
            </div>
            <div class="item-qty">
              <button type="button" class="qty-btn" @click="updateQty(item, -1)">−</button>
              <span class="qty-num">{{ item.quantity }}</span>
              <button type="button" class="qty-btn" @click="updateQty(item, 1)">+</button>
            </div>
            <p class="item-total">{{ ((item.price * item.quantity) / 1000).toFixed(0) }}k ₫</p>
            <button type="button" class="item-remove" aria-label="Xóa"
              @click="cartStore.removeItem(item.productId, item.size, item.color)">
              ×
            </button>
          </li>
        </ul>
        <div class="cart-footer">
          <p class="total">Tổng: <strong>{{ (cartStore.totalAmount() / 1000).toFixed(0) }}k ₫</strong></p>
          <router-link to="/checkout" class="btn-checkout">Thanh toán</router-link>
        </div>
      </template>
      <div v-else class="empty">
        <p>Giỏ hàng trống.</p>
        <router-link to="/products" class="link">Xem sản phẩm</router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.cart-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.cart-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}

.item-name {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}

.item-name:hover {
  text-decoration: underline;
}

.item-meta {
  font-size: 0.85rem;
  color: #666;
  margin: 0.25rem 0 0;
}

.item-price {
  margin: 0.25rem 0 0;
  font-weight: 600;
}

.item-qty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.qty-num {
  min-width: 1.5rem;
  text-align: center;
}

.item-total {
  font-weight: 700;
}

.item-remove {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0 0.25rem;
}

.item-remove:hover {
  color: #e94560;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
}

.total {
  font-size: 1.1rem;
}

.btn-checkout {
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

.btn-checkout:hover {
  opacity: 0.9;
}

.empty {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.link {
  color: #1a1a2e;
  font-weight: 600;
}
</style>
