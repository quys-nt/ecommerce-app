import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!user.value);

  async function init() {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user.value = u ?? null;
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
    });
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    user.value = data.user;
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    user.value = data.user;
  }

  async function signOut() {
    await supabase.auth.signOut();
    user.value = null;
  }

  return { user, isLoggedIn, init, signIn, signUp, signOut };
});
