<script setup lang="ts">
import type { Category } from '@/types'

defineProps<{
  categories: Category[]
  selectedCategory: string | null
}>()

const emit = defineEmits<{
  select: [slug: string | null]
}>()
</script>

<template>
  <div class="product-filter">
    <button type="button" class="filter-btn" :class="{ active: selectedCategory === null }"
      @click="emit('select', null)">
      Tất cả
    </button>
    <button v-for="cat in categories" :key="cat.id" type="button" class="filter-btn"
      :class="{ active: selectedCategory === cat.slug }" @click="emit('select', cat.slug)">
      {{ cat.name }}
    </button>
  </div>
</template>

<style scoped>
.product-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-btn:hover,
.filter-btn.active {
  background: #1a1a2e;
  color: #fff;
  border-color: #1a1a2e;
}
</style>
