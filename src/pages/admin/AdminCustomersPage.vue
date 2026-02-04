<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.vue'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const profiles = ref<{ id: string; full_name: string | null; phone: string | null; address: string | null; created_at: string }[]>([])

onMounted(async () => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.replace('/admin/login')
    return
  }
  try {
    const { data, error } = await supabase.from('profiles').select('id, full_name, phone, address, created_at').order('created_at', { ascending: false })
    if (!error && data) profiles.value = data as typeof profiles.value
  } catch {
    profiles.value = []
  }
})
</script>

<template>
  <AdminDashboardLayout>
    <h1 class="page-title">Khách hàng</h1>
    <p class="hint">Danh sách từ bảng profiles (Supabase).</p>
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Họ tên</th>
          <th>SĐT</th>
          <th>Địa chỉ</th>
          <th>Ngày tạo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in profiles" :key="u.id">
          <td class="id-cell">{{ u.id.slice(0, 8) }}…</td>
          <td>{{ u.full_name ?? '—' }}</td>
          <td>{{ u.phone ?? '—' }}</td>
          <td>{{ u.address ?? '—' }}</td>
          <td>{{ new Date(u.created_at).toLocaleDateString('vi-VN') }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="!profiles.length" class="empty">Chưa có khách hàng nào.</p>
  </AdminDashboardLayout>
</template>

<style scoped>
.page-title {
  margin-bottom: 0.5rem;
}

.hint {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
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

.id-cell {
  font-family: monospace;
  font-size: 0.85rem;
}

.empty {
  color: #666;
  padding: 2rem;
}
</style>
