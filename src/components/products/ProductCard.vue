<script setup lang="ts">
import type { Product } from '@/types'

const PLACEHOLDER = '/assets/upload/placeholder.svg'

defineProps<{
  product: Product
}>()
</script>

<template>
  <router-link :to="`/products/${product.slug}`" class="product-card">
    <div class="card-image-wrap">
      <img :src="product.mainImage" :alt="product.name" class="card-image"
        @error="($event.target as HTMLImageElement).src = PLACEHOLDER" />
      <span v-if="product.status === 'out_of_stock'" class="badge out">Hết hàng</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ product.name }}</h3>
      <p class="card-price">{{ (product.price / 1000).toFixed(0) }}k ₫</p>
    </div>
  </router-link>
</template>

<style scoped>
.product-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-image-wrap {
  position: relative;
  aspect-ratio: 3/4;
  background: #f5f5f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.out {
  background: #e94560;
  color: #fff;
}

.card-body {
  padding: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-price {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #e94560;
}
</style>
