<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/store/settingsStore'
import ProductGrid from '@/components/products/ProductGrid.vue'
import ProductFilter from '@/components/products/ProductFilter.vue'

const route = useRoute()
const settingsStore = useSettingsStore()

const selectedCategory = ref<string | null>(null)

onMounted(() => {
  const cat = route.query.category
  if (typeof cat === 'string') selectedCategory.value = cat
})

const categories = computed(() => settingsStore.categories)
const filteredProducts = computed(() => {
  const list = settingsStore.productsState
  if (!selectedCategory.value) return list
  return list.filter((p) => p.category === selectedCategory.value)
})
</script>

<template>
  <main class="products-page">
    <div class="page-inner">
      <h1 class="page-title">Sản phẩm</h1>
      <ProductFilter :categories="categories" :selected-category="selectedCategory"
        @select="selectedCategory = $event" />
      <ProductGrid :products="filteredProducts" />
      <p v-if="!filteredProducts.length" class="empty">Chưa có sản phẩm nào.</p>
    </div>
  </main>
</template>

<style scoped>
.products-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
}

.empty {
  color: #666;
  text-align: center;
  padding: 2rem;
}
</style>
