<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/store/cartStore'
import { useUserStore } from '@/store/userStore'
import { useSettingsStore } from '@/store/settingsStore'
import { onMounted } from 'vue'

const cartStore = useCartStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const { siteSettings } = storeToRefs(settingsStore)

onMounted(() => {
  cartStore.loadFromStorage()
})

const cartCount = () => cartStore.totalItems()
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <img v-if="siteSettings.logoPath" :src="siteSettings.logoPath" alt="Logo" class="logo-img" />
        <span v-else class="logo-text">{{ siteSettings.siteName }}</span>
      </router-link>
      <nav class="nav">
        <router-link to="/products" class="nav-link">Sản phẩm</router-link>
        <router-link to="/cart" class="nav-link nav-cart">
          <span class="cart-icon">🛒</span>
          <span v-if="cartCount() > 0" class="cart-badge">{{ cartCount() }}</span>
        </router-link>
        <router-link v-if="!userStore.isLoggedIn" to="/auth/login" class="nav-link">Đăng nhập</router-link>
        <router-link v-else to="/account" class="nav-link">Tài khoản</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--header-bg, #1a1a2e);
  color: var(--header-text, #eee);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  color: inherit;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-img {
  height: 36px;
  width: auto;
}

.logo-text {
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-link {
  color: inherit;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.nav-link:hover {
  opacity: 1;
}

.nav-cart {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.cart-badge {
  background: #e94560;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
}
</style>
