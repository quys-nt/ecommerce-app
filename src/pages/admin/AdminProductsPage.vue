<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.vue'
import { useSettingsStore } from '@/store/settingsStore'
import type { Product } from '@/types'

const router = useRouter()
const settingsStore = useSettingsStore()
const { productsState } = storeToRefs(settingsStore)

onMounted(() => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.replace('/admin/login')
    return
  }
  settingsStore.loadProducts()
})

const editingProduct = ref<Product | null>(null)
const form = ref<Partial<Product>>({})

function startAdd() {
  editingProduct.value = {
    id: Date.now(),
    slug: '',
    name: '',
    category: 'ao',
    price: 0,
    status: 'in_stock',
    quantity: 0,
    variants: [],
    mainImage: '/assets/upload/placeholder.svg',
    gallery: [],
    descriptionHtml: '',
  }
  form.value = { ...editingProduct.value }
}

function startEdit(p: Product) {
  editingProduct.value = p
  form.value = { ...p, gallery: [...(p.gallery || [])] }
}

function addGalleryItem() {
  if (!form.value.gallery) form.value.gallery = []
  form.value.gallery = [...form.value.gallery, '']
}

function removeGalleryItem(i: number) {
  if (!form.value.gallery) return
  form.value.gallery = form.value.gallery.filter((_, idx) => idx !== i)
}

async function save() {
  if (!editingProduct.value || !form.value.name?.trim() || !form.value.slug?.trim()) return
  const existing = productsState.value.find((x) => x.id === editingProduct.value!.id)
  if (!existing) {
    await settingsStore.addProduct({
      slug: form.value.slug!,
      name: form.value.name!,
      category: form.value.category ?? 'ao',
      price: form.value.price ?? 0,
      status: (form.value.status as Product['status']) ?? 'in_stock',
      quantity: form.value.quantity ?? 0,
      variants: form.value.variants ?? [],
      mainImage: form.value.mainImage ?? '',
      gallery: form.value.gallery ?? [],
      descriptionHtml: form.value.descriptionHtml ?? '',
      externalLinks: form.value.externalLinks,
    })
  } else {
    await settingsStore.updateProduct(editingProduct.value.id, form.value)
  }
  editingProduct.value = null
}

async function remove(id: number) {
  if (!confirm('Xóa sản phẩm này?')) return
  await settingsStore.removeProduct(id)
}
</script>

<template>
  <AdminDashboardLayout>
    <h1 class="page-title">Quản lý sản phẩm</h1>
    <div class="toolbar">
      <button type="button" class="btn btn-primary" @click="startAdd">Thêm sản phẩm</button>
    </div>
    <div v-if="editingProduct" class="form-block">
      <div class="form-row">
        <input v-model="form.name" type="text" placeholder="Tên sản phẩm" />
        <input v-model="form.slug" type="text" placeholder="slug-san-pham" />
      </div>
      <div class="form-row">
        <input v-model.number="form.price" type="number" placeholder="Giá" />
        <input v-model="form.category" type="text" placeholder="Danh mục (slug)" />
        <select v-model="form.status">
          <option value="in_stock">Còn hàng</option>
          <option value="out_of_stock">Hết hàng</option>
        </select>
      </div>
      <div class="form-row">
        <label class="form-label">Ảnh chính</label>
        <input v-model="form.mainImage" type="text" placeholder="/assets/upload/..." class="form-input-full" />
      </div>
      <div class="form-group">
        <label class="form-label">Gallery (ảnh phụ)</label>
        <div v-for="(url, i) in (form.gallery || [])" :key="i" class="gallery-row">
          <input v-model="form.gallery![i]" type="text" placeholder="/assets/upload/.../gallery-1.svg"
            class="gallery-input" />
          <button type="button" class="btn btn-sm btn-danger" aria-label="Xóa ảnh"
            @click="removeGalleryItem(i)">×</button>
        </div>
        <button type="button" class="btn btn-outline" @click="addGalleryItem">+ Thêm ảnh gallery</button>
      </div>
      <button type="button" class="btn btn-primary" @click="save">Lưu</button>
      <button type="button" class="btn" @click="editingProduct = null">Hủy</button>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Giá</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productsState" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.name }}</td>
          <td>{{ (p.price / 1000).toFixed(0) }}k</td>
          <td>{{ p.status }}</td>
          <td>
            <button type="button" class="btn btn-sm" @click="startEdit(p)">Sửa</button>
            <button type="button" class="btn btn-sm btn-danger" @click="remove(p.id)">Xóa</button>
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

.toolbar {
  margin-bottom: 1rem;
}

.form-block {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.form-row input,
.form-row select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 120px;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.35rem;
}

.form-input-full {
  flex: 1;
  min-width: 200px;
}

.form-group {
  margin-bottom: 1rem;
}

.gallery-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.gallery-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-width: 0;
}

.btn-outline {
  margin-top: 0.25rem;
  border-style: dashed;
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
