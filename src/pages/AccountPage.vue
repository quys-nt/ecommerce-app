<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/userStore'
import { useSettingsStore } from '@/store/settingsStore'
import { supabase } from '@/lib/supabaseClient'
import type { Order } from '@/types'
import type { Profile } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const { siteSettings } = storeToRefs(settingsStore)

const profile = ref<Profile | null>(null)
const orders = ref<Order[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.replace('/auth/login')
    return
  }
  settingsStore.loadSettings()
  try {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userStore.user!.id)
      .single()
    profile.value = p

    const { data: o } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userStore.user!.id)
      .order('created_at', { ascending: false })
    orders.value = (o ?? []) as Order[]
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="account-page">
    <div class="account-inner">
      <h1 class="page-title">Tài khoản</h1>
      <p v-if="loading">Đang tải...</p>
      <template v-else>
        <section class="profile-section">
          <h2>Thông tin cá nhân</h2>
          <p><strong>Email:</strong> {{ userStore.user?.email }}</p>
          <p><strong>Họ tên:</strong> {{ profile?.full_name ?? '—' }}</p>
          <p><strong>SĐT:</strong> {{ profile?.phone ?? '—' }}</p>
          <p><strong>Địa chỉ:</strong> {{ profile?.address ?? '—' }}</p>
        </section>
        <section class="notice">
          <p>
            Vui lòng liên hệ về {{ siteSettings.siteName }} qua IG hoặc TIKTOK để Thanh toán trong 12h, nếu không đơn
            hàng sẽ tự động huỷ và sản phẩm sẽ được bán cho người khác.
          </p>
        </section>
        <section class="orders-section">
          <h2>Đơn hàng của tôi</h2>
          <ul v-if="orders.length" class="order-list">
            <li v-for="ord in orders" :key="ord.id" class="order-item">
              <div class="order-meta">
                <span>#{{ ord.id }}</span>
                <span>{{ new Date(ord.created_at).toLocaleDateString('vi-VN') }}</span>
                <span :class="ord.status">{{ ord.status }}</span>
              </div>
              <p class="order-total">{{ (ord.total_amount / 1000).toFixed(0) }}k ₫</p>
              <p class="order-items">{{ ord.raw_cart?.length ?? 0 }} sản phẩm</p>
            </li>
          </ul>
          <p v-else class="empty">Chưa có đơn hàng nào.</p>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.account-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.profile-section,
.orders-section {
  margin-bottom: 1.5rem;
}

.profile-section h2,
.orders-section h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.notice {
  background: #fff8e6;
  border: 1px solid #f0e0a0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.order-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.order-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.order-meta .pending {
  color: #f90;
}

.order-meta .paid {
  color: #0a0;
}

.order-meta .cancelled {
  color: #e94560;
}

.order-total {
  font-weight: 700;
  margin: 0.25rem 0 0;
}

.order-items {
  font-size: 0.85rem;
  color: #666;
  margin: 0.25rem 0 0;
}

.empty {
  color: #666;
}
</style>
