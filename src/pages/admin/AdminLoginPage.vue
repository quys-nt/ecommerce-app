<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLoginForm from '@/components/admin/AdminLoginForm.vue'

const router = useRouter()

onMounted(() => {
  if (localStorage.getItem('isAdmin') === 'true') {
    router.replace('/admin/dashboard')
  }
})

function onSuccess() {
  router.push('/admin/dashboard')
}
</script>

<template>
  <main class="admin-login-page">
    <div class="admin-login-box">
      <h1 class="title">Đăng nhập Admin</h1>
      <AdminLoginForm @success="onSuccess" />
    </div>
  </main>
</template>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  padding: 2rem;
}

.admin-login-box {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 1.25rem;
  margin: 0 0 1.5rem;
  text-align: center;
}
</style>
