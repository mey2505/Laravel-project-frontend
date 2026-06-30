import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/menu",
    name: "Menu",
    component: () => import("../views/Menu.vue"),
  },
  {
    path: "/wishlist",
    name: "Wishlist",
    component: () => import("../views/Wishlist.vue"),
  },
  {
    path: "/product/:slug",
    name: "ProductDetails",
    component: () => import("../views/ProductDetails.vue"),
    props: true,
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../views/Cart.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Register.vue"),
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: () => import("../views/Checkout.vue"),
  },
  {
    path: "/orders",
    name: "Orders",
    component: () => import("../views/Orders.vue"),
  },

  // ── Admin ───────────────────────────────────────────────────────────────
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("../views/admin/AdminLogin.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/admin",
    component: () => import("../views/admin/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("../views/admin/Dashboard.vue"),
      },
      {
        path: "categories",
        name: "AdminCategories",
        component: () => import("../views/admin/Categories.vue"),
      },
      {
        path: "products",
        name: "AdminProducts",
        component: () => import("../views/admin/Products.vue"),
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("../views/admin/Settings.vue"),
      },
      {
        path: "orders",
        name: "AdminOrders",
        component: () => import("../views/admin/Orders.vue"),
      },
      {
        path: "orders/:id",
        name: "AdminOrderDetails",
        component: () => import("../views/admin/OrderDetails.vue"),
        props: true,
      },
      {
        path: "customers",
        name: "AdminCustomers",
        component: () => import("../views/admin/Customers.vue"),
      },
      {
        path: "customers/:id",
        name: "AdminCustomerDetails",
        component: () => import("../views/admin/CustomerDetails.vue"),
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ── Navigation guard ─────────────────────────────────────────────────────
// Ensures the current user is loaded before evaluating admin-only routes,
// and keeps admins out of the storefront login page (and vice versa).
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Make sure we know who's logged in (covers hard page reloads).
  if (authStore.user === null && localStorage.getItem("auth_token")) {
    await authStore.fetchUser();
  }

  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      return { name: "AdminLogin", query: { redirect: to.fullPath } };
    }
    if (!authStore.isAdmin) {
      return { name: "Home" };
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated && authStore.isAdmin) {
    return { name: "AdminDashboard" };
  }

  return true;
});

export default router;
