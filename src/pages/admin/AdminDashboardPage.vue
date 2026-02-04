<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.vue'
import { useSettingsStore } from '@/store/settingsStore'

const router = useRouter()
const settingsStore = useSettingsStore()

onMounted(() => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.replace('/admin/login')
    return
  }
  settingsStore.loadSettings()
  settingsStore.loadCategories()
  settingsStore.loadProducts()
})
</script>

<template>
  <AdminDashboardLayout>
    <h1 class="dashboard-title">Tổng quan</h1>
    <p>Chọn menu bên trái để quản lý danh mục, sản phẩm, đơn hàng và cài đặt.</p>
  </AdminDashboardLayout>
</template>

<style scoped>
.dashboard-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
</style>
