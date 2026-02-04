<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cartStore'
import { useUserStore } from '@/store/userStore'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const form = reactive({
  fullName: '',
  phone: '',
  address: '',
  email: '',
  password: '',
  note: '',
})
const loading = ref(false)
const error = ref('')

const defaultPassword = 'xincamon123'

onMounted(async () => {
  if (userStore.user) {
    form.email = userStore.user.email ?? ''
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone, address')
      .eq('id', userStore.user.id)
      .single()
    if (profile) {
      form.fullName = profile.full_name ?? ''
      form.phone = profile.phone ?? ''
      form.address = profile.address ?? ''
    }
  }
})

const canSubmit = computed(() => {
  return form.fullName.trim() && form.phone.trim() && form.address.trim() && form.email.trim()
})

async function submit() {
  if (!canSubmit.value || !cartStore.items.length) return
  error.value = ''
  loading.value = true
  try {
    let userId: string | null = userStore.user?.id ?? null

    if (!userStore.user) {
      const pwd = form.password.trim() || defaultPassword
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: pwd,
      })
      if (signUpError) throw signUpError
      userId = signUpData.user?.id ?? null
      if (signUpData.user) {
        await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        })
      }
    } else {
      await supabase
        .from('profiles')
        .upsert({
          id: userStore.user.id,
          full_name: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        })
    }

    const { error: orderError } = await supabase.from('orders').insert({
      user_id: userId,
      email: form.email.trim(),
      total_amount: cartStore.totalAmount(),
      status: 'pending',
      raw_cart: cartStore.items,
    })
    if (orderError) throw orderError

    cartStore.clearCart()
    if (!userStore.user) await userStore.init()
    router.push('/account')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Có lỗi xảy ra.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="checkout-page">
    <div class="checkout-inner">
      <h1 class="page-title">Thanh toán</h1>
      <p v-if="!cartStore.items.length" class="empty">
        Giỏ hàng trống. <router-link to="/cart">Xem giỏ hàng</router-link>
      </p>
      <form v-else class="checkout-form" @submit.prevent="submit">
        <p v-if="error" class="form-error">{{ error }}</p>
        <div class="form-group">
          <label>Họ tên *</label>
          <input v-model="form.fullName" type="text" required placeholder="Nguyễn Văn A" />
        </div>
        <div class="form-group">
          <label>Số điện thoại *</label>
          <input v-model="form.phone" type="tel" required placeholder="0901234567" />
        </div>
        <div class="form-group">
          <label>Địa chỉ *</label>
          <input v-model="form.address" type="text" required placeholder="Số nhà, đường, quận, TP" />
        </div>
        <div class="form-group">
          <label>Email *</label>
          <input v-model="form.email" type="email" required placeholder="email@example.com" />
        </div>
        <div v-if="!userStore.isLoggedIn" class="form-group">
          <label>Mật khẩu (để tạo tài khoản, mặc định: xincamon123)</label>
          <input v-model="form.password" type="password" placeholder="Để trống dùng mật khẩu mặc định" />
        </div>
        <div class="form-group">
          <label>Ghi chú</label>
          <textarea v-model="form.note" rows="2" placeholder="Ghi chú đơn hàng"></textarea>
        </div>
        <p class="total-line">Tổng tiền: <strong>{{ (cartStore.totalAmount() / 1000).toFixed(0) }}k ₫</strong></p>
        <button type="submit" class="btn-submit" :disabled="loading || !canSubmit">
          {{ loading ? 'Đang xử lý...' : 'Đặt hàng' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.checkout-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty {
  color: #666;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-error {
  color: #e94560;
  font-size: 0.9rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.total-line {
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
