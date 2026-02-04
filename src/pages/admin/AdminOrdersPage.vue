<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout.vue'
import { supabase } from '@/lib/supabaseClient'
import type { Order } from '@/types'

const router = useRouter()
const orders = ref<Order[]>([])
const loading = ref(true)

onMounted(async () => {
  if (localStorage.getItem('isAdmin') !== 'true') {
    router.replace('/admin/login')
    return
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) orders.value = data as Order[]
  } catch {
    orders.value = []
  }
  loading.value = false
})

async function updateStatus(orderId: number, status: 'pending' | 'cancelled' | 'paid') {
  await supabase.from('orders').update({ status }).eq('id', orderId)
  const o = orders.value.find((x) => x.id === orderId)
  if (o) o.status = status
}
</script>

<template>
  <AdminDashboardLayout>
    <h1 class="page-title">Đơn hàng</h1>
    <p v-if="!loading" class="hint">Danh sách từ bảng orders (Supabase).</p>
    <p v-if="loading">Đang tải...</p>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
          <th>Ngày</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>#{{ o.id }}</td>
          <td>{{ o.email }}</td>
          <td>{{ (o.total_amount / 1000).toFixed(0) }}k ₫</td>
          <td>{{ o.status }}</td>
          <td>{{ new Date(o.created_at).toLocaleDateString('vi-VN') }}</td>
          <td>
            <select :value="o.status" class="status-select"
              @change="updateStatus(o.id, ($event.target as HTMLSelectElement).value as 'pending' | 'cancelled' | 'paid')">
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="cancelled">cancelled</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="!loading && !orders.length" class="empty">Chưa có đơn hàng.</p>
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

.status-select {
  padding: 0.35rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.empty {
  color: #666;
  padding: 2rem;
}
</style>
