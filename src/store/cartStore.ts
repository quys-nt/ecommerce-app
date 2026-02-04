import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { CartItem } from "@/types";

const CART_KEY = "ecommerce-cart";

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) items.value = JSON.parse(raw);
    } catch {
      items.value = [];
    }
  }

  function saveToStorage() {
    localStorage.setItem(CART_KEY, JSON.stringify(items.value));
  }

  watch(items, saveToStorage, { deep: true });

  function addItem(item: Omit<CartItem, "quantity">) {
    const existing = items.value.find(
      (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
    );
    if (existing) existing.quantity += 1;
    else items.value.push({ ...item, quantity: 1 });
  }

  function updateQuantity(productId: number, size: string, color: string, quantity: number) {
    const item = items.value.find(
      (i) => i.productId === productId && i.size === size && i.color === color
    );
    if (item) {
      if (quantity <= 0) removeItem(productId, size, color);
      else item.quantity = quantity;
    }
  }

  function removeItem(productId: number, size: string, color: string) {
    items.value = items.value.filter(
      (i) => !(i.productId === productId && i.size === size && i.color === color)
    );
  }

  function clearCart() {
    items.value = [];
  }

  const totalItems = () => items.value.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = () => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    loadFromStorage,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalAmount,
  };
});
