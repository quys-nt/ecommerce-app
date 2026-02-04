<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.email.trim() || !form.password) {
    error.value = 'Vui lòng nhập email và mật khẩu.'
    return
  }
  loading.value = true
  try {
    await userStore.signIn(form.email.trim(), form.password)
    router.push('/account')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Đăng nhập thất bại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-box">
      <h1 class="title">Đăng nhập</h1>
      <form class="auth-form" @submit.prevent="submit">
        <p v-if="error" class="form-error">{{ error }}</p>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required placeholder="email@example.com" />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <input v-model="form.password" type="password" required />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
        </button>
      </form>
      <p class="hint">Chưa có tài khoản? Đăng ký khi thanh toán tại trang Checkout.</p>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-box {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.title {
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
  text-align: center;
}

.auth-form {
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

.form-group input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.btn-submit {
  padding: 0.75rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.25rem;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #666;
  text-align: center;
}
</style>
