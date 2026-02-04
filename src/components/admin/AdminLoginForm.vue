<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({ user: '', password: '' })
const error = ref('')

const emit = defineEmits<{
  success: []
}>()

function submit() {
  error.value = ''
  if (form.user === 'admin' && form.password === 'Quanlyad') {
    localStorage.setItem('isAdmin', 'true')
    emit('success')
  } else {
    error.value = 'Sai tên đăng nhập hoặc mật khẩu.'
  }
}
</script>

<template>
  <form class="admin-login-form" @submit.prevent="submit">
    <p v-if="error" class="form-error">{{ error }}</p>
    <div class="form-group">
      <label>Tên đăng nhập</label>
      <input v-model="form.user" type="text" required autocomplete="username" />
    </div>
    <div class="form-group">
      <label>Mật khẩu</label>
      <input v-model="form.password" type="password" required autocomplete="current-password" />
    </div>
    <button type="submit" class="btn-submit">Đăng nhập Admin</button>
  </form>
</template>

<style scoped>
.admin-login-form {
  max-width: 320px;
  margin: 0 auto;
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
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.btn-submit {
  padding: 0.75rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
