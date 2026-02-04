<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useUserStore } from '@/store/userStore'
import { useSettingsStore } from '@/store/settingsStore'

const userStore = useUserStore()
const settingsStore = useSettingsStore()
const ready = ref(false)

onMounted(async () => {
  userStore.init()
  await Promise.all([
    settingsStore.loadSettings(),
    settingsStore.loadCategories(),
    settingsStore.loadProducts(),
  ])
  ready.value = true
})
</script>

<template>
  <div class="client-layout">
    <AppHeader />
    <div class="content">
      <div v-if="!ready" class="loading-wrap">
        <p>Đang tải...</p>
      </div>
      <template v-else>
        <router-view />
      </template>
    </div>
    <AppFooter />
  </div>
</template>

<style scoped>
.client-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  color: #666;
}
</style>
