<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/settingsStore'
import ProductGrid from '@/components/products/ProductGrid.vue'

const settingsStore = useSettingsStore()
const { siteSettings, productsState, categories } = storeToRefs(settingsStore)

const featuredProducts = () => productsState.value.slice(0, 8)
const PLACEHOLDER = '/assets/upload/placeholder.svg'
</script>

<template>
  <main class="home-page">
    <section v-if="siteSettings.showMainVisual && siteSettings.mainVisuals.length" class="main-visual">
      <div class="visual-track">
        <a v-for="v in siteSettings.mainVisuals" :key="v.id" :href="v.link || '#'" class="visual-slide">
          <img :src="v.image" :alt="v.title || 'Banner'"
            @error="($event.target as HTMLImageElement).src = PLACEHOLDER" />
        </a>
      </div>
    </section>

    <section v-if="siteSettings.showCategories && categories.length" class="section categories">
      <h2 class="section-title">Danh mục</h2>
      <div class="category-grid">
        <router-link v-for="cat in categories" :key="cat.id" :to="`/products?category=${cat.slug}`"
          class="category-card">
          <img v-if="cat.image" :src="cat.image" :alt="cat.name"
            @error="($event.target as HTMLImageElement).src = PLACEHOLDER" />
          <span v-else class="cat-placeholder">📁</span>
          <span class="cat-name">{{ cat.name }}</span>
        </router-link>
      </div>
    </section>

    <section v-if="siteSettings.showFeaturedProducts" class="section products">
      <h2 class="section-title">Sản phẩm nổi bật</h2>
      <ProductGrid :products="featuredProducts()" />
    </section>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 60vh;
}

.main-visual {
  margin: 0 -1rem 2rem;
  max-height: 400px;
  overflow: hidden;
}

.visual-track {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.visual-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  display: block;
}

.visual-slide img {
  width: 100%;
  height: 320px;
  object-fit: cover;
}

.section {
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
  font-weight: 700;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
}

.category-card:hover {
  background: #eee;
}

.category-card img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.cat-placeholder {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.cat-name {
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
