<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.vue'

interface ImageItem {
  path: string
  url: string
  name: string
  folder: string
}

const router = useRouter()
const images = ref<ImageItem[]>([])
const loading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const editingPath = ref<string | null>(null)
const editingName = ref('')

onMounted(async () => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.replace('/admin/login')
    return
  }
  await loadImages()
})

async function loadImages() {
  loading.value = true
  try {
    const res = await fetch('/api/images')
    const data = await res.json()
    if (data.images) images.value = data.images
    else images.value = []
  } catch {
    images.value = []
  } finally {
    loading.value = false
  }
}

const allowedTypes = '.png,.jpg,.jpeg,.gif,.webp,.svg,.ico,.bmp'

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadError.value = ''
  uploadSuccess.value = false
  const ext = file.name.split('.').pop()?.toLowerCase()
  const allowed = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp']
  if (!ext || !allowed.includes(ext)) {
    uploadError.value = 'Chỉ chấp nhận: ' + allowed.join(', ')
    input.value = ''
    return
  }
  uploadFile(file).then(() => {
    input.value = ''
  })
}

async function uploadFile(file: File) {
  uploadError.value = ''
  const form = new FormData()
  form.append('file', file)
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    if (!res.ok) {
      uploadError.value = data.error || 'Upload thất bại'
      return
    }
    uploadSuccess.value = true
    await loadImages()
  } catch {
    uploadError.value = 'Lỗi kết nối. Bạn đã chạy `npm run server` chưa?'
  }
}

function startRename(item: ImageItem) {
  editingPath.value = item.path
  editingName.value = item.name
}

function cancelRename() {
  editingPath.value = null
}

async function saveRename() {
  if (!editingPath.value || !editingName.value.trim()) return
  const newName = editingName.value.trim()
  const pathEnc = encodeURIComponent(editingPath.value)
  try {
    const res = await fetch(`/api/images/${pathEnc}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Đổi tên thất bại')
      return
    }
    editingPath.value = null
    await loadImages()
  } catch {
    alert('Lỗi kết nối')
  }
}

async function remove(item: ImageItem) {
  if (!confirm(`Xóa ảnh "${item.name}"?`)) return
  const pathEnc = encodeURIComponent(item.path)
  try {
    const res = await fetch(`/api/images/${pathEnc}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Xóa thất bại')
      return
    }
    await loadImages()
  } catch {
    alert('Lỗi kết nối')
  }
}

function copyUrl(url: string) {
  const full = `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`
  navigator.clipboard.writeText(full).then(() => alert('Đã copy URL'))
}
</script>

<template>
  <AdminDashboardLayout>
    <h1 class="page-title">Quản lý hình ảnh</h1>
    <p class="page-desc">
      Ảnh upload được lưu theo tháng tại <code>/public/assets/upload/MM/</code> (MM = 01–12). Định dạng: .png, .jpg, .svg, .gif, .webp, .ico, .bmp.
    </p>

    <div class="upload-section">
      <label class="upload-label">
        <span class="btn btn-primary">Chọn file để upload</span>
        <input
          type="file"
          :accept="allowedTypes"
          class="upload-input"
          @change="onFileChange"
        />
      </label>
      <span v-if="uploadSuccess" class="msg success">Đã upload thành công.</span>
      <p v-if="uploadError" class="msg error">{{ uploadError }}</p>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else class="images-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Xem trước</th>
            <th>Thư mục</th>
            <th>Tên file</th>
            <th>URL</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in images" :key="item.path" class="image-row">
            <td>
              <div class="thumb">
                <img
                  v-if="item.url"
                  :src="item.url"
                  :alt="item.name"
                  class="thumb-img"
                  loading="lazy"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
                <span v-else class="thumb-placeholder">—</span>
              </div>
            </td>
            <td>
              <span class="folder-badge">{{ item.folder || '—' }}</span>
            </td>
            <td>
              <template v-if="editingPath === item.path">
                <input
                  v-model="editingName"
                  type="text"
                  class="edit-input"
                  @keydown.enter="saveRename"
                  @keydown.escape="cancelRename"
                />
                <button type="button" class="btn btn-sm" @click="saveRename">Lưu</button>
                <button type="button" class="btn btn-sm" @click="cancelRename">Hủy</button>
              </template>
              <template v-else>
                {{ item.name }}
                <button type="button" class="btn btn-sm" aria-label="Đổi tên" @click="startRename(item)">Sửa tên</button>
              </template>
            </td>
            <td>
              <code class="url-code">{{ item.url }}</code>
              <button type="button" class="btn btn-sm btn-copy" @click="copyUrl(item.url)">Copy</button>
            </td>
            <td>
              <button type="button" class="btn btn-sm btn-danger" @click="remove(item)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="images.length === 0" class="empty-msg">Chưa có ảnh nào. Hãy upload file ở trên.</p>
    </div>
  </AdminDashboardLayout>
</template>

<style scoped>
.page-title {
  margin-bottom: 0.5rem;
}

.page-desc {
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.page-desc code {
  background: #eee;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
}

.upload-section {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.upload-label {
  cursor: pointer;
  display: inline-block;
}

.upload-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.msg {
  font-size: 0.9rem;
}

.msg.success {
  color: #2d8a3e;
}

.msg.error {
  color: #c53030;
}

.loading {
  color: #666;
  padding: 1rem;
}

.images-wrap {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.data-table th {
  background: #f8f8f8;
  font-weight: 600;
  font-size: 0.85rem;
}

.thumb {
  width: 56px;
  height: 56px;
  border: 1px solid #eee;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fafafa;
}

.thumb-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumb-placeholder {
  color: #999;
  font-size: 0.8rem;
}

.folder-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #e8e8e8;
  border-radius: 4px;
  font-size: 0.85rem;
}

.edit-input {
  width: 12rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-right: 0.35rem;
  font-size: 0.9rem;
}

.url-code {
  font-size: 0.8rem;
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  word-break: break-all;
  display: inline-block;
  max-width: 200px;
}

.btn-copy {
  margin-left: 0.35rem;
}

.btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 0.25rem;
  margin-bottom: 0.2rem;
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

.empty-msg {
  padding: 2rem;
  text-align: center;
  color: #666;
}
</style>
