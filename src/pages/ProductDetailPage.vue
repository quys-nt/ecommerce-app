<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/store/cartStore'
import { useSettingsStore } from '@/store/settingsStore'
import type { Product } from '@/types'

const route = useRoute()
const cartStore = useCartStore()
const settingsStore = useSettingsStore()

const product = ref<Product | null>(null)
const selectedSize = ref('')
const selectedColor = ref('')
const mainImage = ref('')

onMounted(() => {
  const slug = route.params.slug as string
  const p = settingsStore.productsState.find((pr) => pr.slug === slug)
  if (p) {
    product.value = p
    mainImage.value = p.mainImage
    const first = p.variants[0]
    if (first) {
      selectedSize.value = first.size
      selectedColor.value = first.color
    }
  }
})

const canAddToCart = computed(() => {
  if (!product.value || product.value.status !== 'in_stock') return false
  if (product.value.variants.length && (!selectedSize.value || !selectedColor.value)) return false
  return true
})

function setImage(src: string) {
  mainImage.value = src
}

function addToCart() {
  if (!product.value || !canAddToCart.value) return
  const size = selectedSize.value || 'One'
  const color = selectedColor.value || 'default'
  cartStore.addItem({
    productId: product.value.id,
    slug: product.value.slug,
    name: product.value.name,
    price: product.value.price,
    size,
    color,
    mainImage: product.value.mainImage,
  })
}

const PLACEHOLDER = '/assets/upload/placeholder.svg'
</script>

<template>
  <main class="detail-page">
    <template v-if="product">
      <div class="detail-inner">
        <div class="gallery">
          <img :src="mainImage" :alt="product.name" class="main-img" @error="mainImage = PLACEHOLDER" />
          <div v-if="product.gallery.length" class="thumbnails">
            <button type="button" class="thumb" :class="{ active: mainImage === product.mainImage }"
              @click="setImage(product.mainImage)">
              <img :src="product.mainImage" alt="" @error="($event.target as HTMLImageElement).src = PLACEHOLDER" />
            </button>
            <button v-for="(img, i) in product.gallery" :key="i" type="button" class="thumb"
              :class="{ active: mainImage === img }" @click="setImage(img)">
              <img :src="img" alt="" @error="($event.target as HTMLImageElement).src = PLACEHOLDER" />
            </button>
          </div>
        </div>
        <div class="info">
          <h1 class="title">{{ product.name }}</h1>
          <p class="price">{{ (product.price / 1000).toFixed(0) }}k ₫</p>
          <p class="status" :class="product.status">
            {{ product.status === 'in_stock' ? 'Còn hàng' : 'Hết hàng' }}
          </p>
          <div v-if="product.variants.length" class="variants">
            <div class="variant-group">
              <label>Size</label>
              <select v-model="selectedSize" class="select">
                <option v-for="v in [...new Set(product.variants.map((x) => x.size))]" :key="v" :value="v">
                  {{ v }}
                </option>
              </select>
            </div>
            <div class="variant-group">
              <label>Màu</label>
              <select v-model="selectedColor" class="select">
                <option v-for="v in [...new Set(product.variants.map((x) => x.color))]" :key="v" :value="v">
                  {{ v }}
                </option>
              </select>
            </div>
          </div>
          <button type="button" class="btn-add" :disabled="!canAddToCart" @click="addToCart">
            Thêm vào giỏ
          </button>
          <div v-if="product.descriptionHtml" class="description" v-html="product.descriptionHtml" />
        </div>
      </div>
    </template>
    <p v-else class="not-found">Không tìm thấy sản phẩm.</p>
  </main>
</template>

<style scoped>
.detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.detail-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .detail-inner {
    grid-template-columns: 1fr;
  }
}

.gallery .main-img {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 12px;
  background: #f5f5f5;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.thumb {
  width: 56px;
  height: 56px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #f0f0f0;
}

.thumb.active {
  border-color: #1a1a2e;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e94560;
  margin: 0 0 0.5rem;
}

.status {
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.status.in_stock {
  color: #0f0;
}

.status.out_of_stock {
  color: #e94560;
}

.variants {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.variant-group label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.select {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  min-width: 100px;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.description {
  font-size: 0.95rem;
  line-height: 1.6;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.description :deep(h2) {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.not-found {
  text-align: center;
  padding: 3rem;
  color: #666;
}
</style>
