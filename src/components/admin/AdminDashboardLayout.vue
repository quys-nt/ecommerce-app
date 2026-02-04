<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('isAdmin')
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h2 class="sidebar-title">Admin</h2>
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item" active-class="active">Tổng quan</router-link>
        <router-link to="/admin/dashboard/categories" class="nav-item" active-class="active">Danh mục</router-link>
        <router-link to="/admin/dashboard/products" class="nav-item" active-class="active">Sản phẩm</router-link>
        <router-link to="/admin/dashboard/customers" class="nav-item" active-class="active">Khách hàng</router-link>
        <router-link to="/admin/dashboard/orders" class="nav-item" active-class="active">Đơn hàng</router-link>
        <router-link to="/admin/dashboard/settings" class="nav-item" active-class="active">Cài đặt</router-link>
        <router-link to="/admin/dashboard/images" class="nav-item" active-class="active">Hình ảnh</router-link>
      </nav>
      <button type="button" class="btn-logout" @click="logout">Đăng xuất</button>
    </aside>
    <main class="main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #1a1a2e;
  color: #eee;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 1.1rem;
  margin: 0 1rem 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  color: #ccc;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-item.active {
  color: #fff;
  background: rgba(233, 69, 96, 0.3);
}

.btn-logout {
  margin: 1rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #eee;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.1);
}

.main {
  flex: 1;
  padding: 1.5rem;
  background: #f5f5f5;
  overflow: auto;
}
</style>
