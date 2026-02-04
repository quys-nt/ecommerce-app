import { createRouter, createWebHistory } from "vue-router";
import ClientLayout from "@/components/layout/ClientLayout.vue";
import HomePage from "@/pages/HomePage.vue";
import ProductsListPage from "@/pages/ProductsListPage.vue";
import ProductDetailPage from "@/pages/ProductDetailPage.vue";
import CartPage from "@/pages/CartPage.vue";
import CheckoutPage from "@/pages/CheckoutPage.vue";
import AccountPage from "@/pages/AccountPage.vue";
import LoginPage from "@/pages/auth/LoginPage.vue";
import AdminLoginPage from "@/pages/admin/AdminLoginPage.vue";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage.vue";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage.vue";
import AdminProductsPage from "@/pages/admin/AdminProductsPage.vue";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage.vue";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage.vue";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage.vue";
import AdminImagesPage from "@/pages/admin/AdminImagesPage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: ClientLayout,
      children: [
        { path: "", name: "Home", component: HomePage },
        { path: "products", name: "Products", component: ProductsListPage },
        { path: "products/:slug", name: "ProductDetail", component: ProductDetailPage },
        { path: "cart", name: "Cart", component: CartPage },
        { path: "checkout", name: "Checkout", component: CheckoutPage },
        { path: "account", name: "Account", component: AccountPage },
        { path: "auth/login", name: "Login", component: LoginPage },
      ],
    },
    { path: "/admin/login", name: "AdminLogin", component: AdminLoginPage },
    { path: "/admin/dashboard", name: "AdminDashboard", component: AdminDashboardPage },
    {
      path: "/admin/dashboard/categories",
      name: "AdminCategories",
      component: AdminCategoriesPage,
    },
    { path: "/admin/dashboard/products", name: "AdminProducts", component: AdminProductsPage },
    { path: "/admin/dashboard/customers", name: "AdminCustomers", component: AdminCustomersPage },
    { path: "/admin/dashboard/orders", name: "AdminOrders", component: AdminOrdersPage },
    { path: "/admin/dashboard/settings", name: "AdminSettings", component: AdminSettingsPage },
    { path: "/admin/dashboard/images", name: "AdminImages", component: AdminImagesPage },
  ],
});

export default router;
