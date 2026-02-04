<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.vue'
import { useSettingsStore } from '@/store/settingsStore'
import type { Category } from '@/types'

const router = useRouter()
const settingsStore = useSettingsStore()
const { categories } = storeToRefs(settingsStore)

onMounted(() => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.replace('/admin/login')
    return
  }
  settingsStore.loadCategories()
})

const editingId = ref<string | null>(null)
const form = ref<Partial<Category>>({ name: '', slug: '' })

function startAdd() {
  editingId.value = ''
  form.value = { name: '', slug: '' }
}

function startEdit(cat: Category) {
  editingId.value = cat.id
  form.value = { name: cat.name, slug: cat.slug }
}

const saveError = ref('')

async function save() {
  if (!form.value.name?.trim() || !form.value.slug?.trim()) return
  saveError.value = ''
  let ok = false
  if (editingId.value === '') {
    ok = await settingsStore.addCategory({
      name: form.value.name.trim(),
      slug: form.value.slug.trim(),
      image: form.value.image ?? undefined,
    })
  } else if (editingId.value) {
    ok = await settingsStore.updateCategory(editingId.value, {
      name: form.value.name?.trim(),
      slug: form.value.slug?.trim(),
    })
  }
  if (ok) {
    editingId.value = null
  } else {
    saveError.value = 'show'
  }
}

async function remove(id: string) {
  if (!confirm('Xóa danh mục này?')) return
  const ok = await settingsStore.removeCategory(id)
  if (!ok) {
    alert('Không xóa được. Kiểm tra kết nối Supabase và đã chạy supabase-schema.sql chưa.')
  }
}
</script>

<template>
  <AdminDashboardLayout>
    <h1 class="page-title">Quản lý danh mục</h1>
    <div class="toolbar">
      <button type="button" class="btn btn-primary" @click="startAdd">Thêm danh mục</button>
    </div>
    <div v-if="saveError" class="form-error-box">
      <p class="form-error-title">Không ghi được lên Supabase</p>
      <p class="form-error-text">Để thêm/sửa danh mục lưu vào database, làm lần lượt:</p>
      <ol class="form-error-steps">
        <li>Mở <strong>Supabase Dashboard</strong> → project của bạn</li>
        <li>Vào <strong>SQL Editor</strong> → New query</li>
        <li>Copy toàn bộ nội dung file <code>supabase-schema.sql</code> trong project (thư mục gốc) và dán vào Editor
        </li>
        <li>Bấm <strong>Run</strong></li>
        <li>Quay lại trang này và bấm <strong>Lưu</strong> lại</li>
      </ol>
      <button type="button" class="btn btn-dismiss" @click="saveError = ''">Đóng</button>
    </div>
    <div v-if="editingId !== null" class="form-inline">
      <input v-model="form.name" type="text" placeholder="Tên" />
      <input v-model="form.slug" type="text" placeholder="Slug" />
      <button type="button" class="btn" @click="save">Lưu</button>
      <button type="button" class="btn" @click="editingId = null; saveError = ''">Hủy</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Slug</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.id">
          <td>{{ cat.id }}</td>
          <td>{{ cat.name }}</td>
          <td>{{ cat.slug }}</td>
          <td>
            <button type="button" class="btn btn-sm" @click="startEdit(cat)">Sửa</button>
            <button type="button" class="btn btn-sm btn-danger" @click="remove(cat.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
  </AdminDashboardLayout>
</template>

<style scoped>
.page-title {
  margin-bottom: 1rem;
}

.form-error-box {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.form-error-title {
  color: #c53030;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.form-error-text {
  color: #742a2a;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.form-error-steps {
  color: #742a2a;
  font-size: 0.9rem;
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
}

.form-error-steps code {
  background: #fff;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.85em;
}

.btn-dismiss {
  background: #c53030;
  color: #fff;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-dismiss:hover {
  background: #9b2c2c;
}

.toolbar {
  margin-bottom: 1rem;
}

.form-inline {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.form-inline input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f8f8;
  font-weight: 600;
}

.btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-right: 0.25rem;
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
