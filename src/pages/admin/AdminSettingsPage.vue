<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.vue'
import { useSettingsStore } from '@/store/settingsStore'

const router = useRouter()
const settingsStore = useSettingsStore()
const { siteSettings } = storeToRefs(settingsStore)

onMounted(async () => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.replace('/admin/login')
    return
  }
  await settingsStore.loadSettings()
})

async function saveAllSettings() {
  await settingsStore.updateSiteSettings({})
}

async function addVisual() {
  const list = [...siteSettings.value.mainVisuals]
  list.push({
    id: String(Date.now()),
    image: '/assets/upload/placeholder.svg',
    title: `Banner ${list.length + 1}`,
  })
  await settingsStore.updateSiteSettings({ mainVisuals: list })
}

async function removeVisual(id: string) {
  const list = siteSettings.value.mainVisuals.filter((v) => v.id !== id)
  await settingsStore.updateSiteSettings({ mainVisuals: list })
}
</script>

<template>
  <AdminDashboardLayout>
    <h1 class="page-title">Cài đặt</h1>
    <div class="form-block">
      <div class="form-group">
        <label>Tên website</label>
        <input v-model="siteSettings.siteName" type="text" />
      </div>
      <div class="form-group">
        <label>Đường dẫn logo (để trống = hiển thị tên)</label>
        <input v-model="siteSettings.logoPath" type="text" placeholder="/path/to/logo.png" />
      </div>
      <div class="form-group">
        <label><input v-model="siteSettings.showMainVisual" type="checkbox" /> Hiển thị Main Visual</label>
      </div>
      <div class="form-group">
        <label><input v-model="siteSettings.showCategories" type="checkbox" /> Hiển thị danh mục</label>
      </div>
      <div class="form-group">
        <label><input v-model="siteSettings.showFeaturedProducts" type="checkbox" /> Hiển thị sản phẩm nổi bật</label>
      </div>
      <div class="form-group">
        <label>Email liên hệ</label>
        <input v-model="siteSettings.contactEmail" type="text" />
      </div>
      <div class="form-group">
        <label>Instagram</label>
        <input v-model="siteSettings.contactInstagram" type="url" />
      </div>
      <div class="form-group">
        <label>TikTok</label>
        <input v-model="siteSettings.contactTiktok" type="url" />
      </div>
      <button type="button" class="btn btn-primary" @click="saveAllSettings">Lưu cài đặt</button>
    </div>
    <h2 class="subtitle">Main Visuals (banner)</h2>
    <button type="button" class="btn btn-primary" @click="addVisual">Thêm banner</button>
    <div class="visual-list">
      <div v-for="v in siteSettings.mainVisuals" :key="v.id" class="visual-item">
        <input v-model="v.title" type="text" placeholder="Tiêu đề" />
        <input v-model="v.image" type="text" placeholder="URL ảnh" />
        <button type="button" class="btn btn-sm btn-danger" @click="removeVisual(v.id)">Xóa</button>
      </div>
    </div>
  </AdminDashboardLayout>
</template>

<style scoped>
.page-title {
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.1rem;
  margin: 1.5rem 0 0.5rem;
}

.form-block {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 480px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="url"] {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.visual-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.visual-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.visual-item input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 120px;
}

.btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-primary {
  background: #1a1a2e;
  color: #fff;
  border-color: #1a1a2e;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-danger {
  color: #e94560;
  border-color: #e94560;
}
</style>
