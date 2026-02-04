<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/settingsStore'

const settingsStore = useSettingsStore()
const { siteSettings } = storeToRefs(settingsStore)
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-brand">{{ siteSettings.siteName }}</div>
      <div class="footer-links">
        <a v-if="siteSettings.contactInstagram" :href="siteSettings.contactInstagram" target="_blank"
          rel="noopener">Instagram</a>
        <a v-if="siteSettings.contactTiktok" :href="siteSettings.contactTiktok" target="_blank"
          rel="noopener">TikTok</a>
        <a v-if="siteSettings.contactEmail" :href="`mailto:${siteSettings.contactEmail}`">{{ siteSettings.contactEmail
          }}</a>
      </div>
      <p class="footer-copy">© {{ new Date().getFullYear() }} — Demo shop</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--footer-bg, #16213e);
  color: var(--footer-text, #a0a0a0);
  margin-top: auto;
  padding: 2rem 1.5rem;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: #eee;
  margin-bottom: 0.75rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
}

.footer-links a:hover {
  color: #fff;
}

.footer-copy {
  font-size: 0.85rem;
  opacity: 0.8;
}
</style>
