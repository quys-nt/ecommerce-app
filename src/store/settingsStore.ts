import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabaseClient";
import type { Category } from "@/types";
import type { Product } from "@/types";
import type { MainVisual, SiteSettings } from "@/types";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  status: string;
  quantity: number;
  variants: unknown;
  main_image: string;
  gallery: unknown;
  description_html: string | null;
  external_links: unknown;
}

interface SiteSettingsRow {
  site_name: string;
  logo_path: string;
  main_visuals: unknown;
  show_main_visual: boolean;
  show_categories: boolean;
  show_featured_products: boolean;
  contact_email: string;
  contact_instagram: string;
  contact_tiktok: string;
}

const defaultSettings: SiteSettings = {
  siteName: "Shop Demo",
  logoPath: "",
  mainVisuals: [{ id: "1", image: "/assets/upload/placeholder.svg", title: "Banner 1" }],
  showMainVisual: true,
  showCategories: true,
  showFeaturedProducts: true,
  contactEmail: "",
  contactInstagram: "",
  contactTiktok: "",
};

function rowToCategory(r: CategoryRow): Category {
  return { id: r.id, name: r.name, slug: r.slug, image: r.image ?? undefined };
}

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    price: Number(r.price),
    status: r.status as "in_stock" | "out_of_stock",
    quantity: r.quantity,
    variants: Array.isArray(r.variants) ? (r.variants as Product["variants"]) : [],
    mainImage: r.main_image,
    gallery: Array.isArray(r.gallery) ? (r.gallery as string[]) : [],
    descriptionHtml: r.description_html ?? "",
    externalLinks: (r.external_links as Product["externalLinks"]) ?? undefined,
  };
}

function rowToSiteSettings(r: SiteSettingsRow): SiteSettings {
  return {
    siteName: r.site_name ?? defaultSettings.siteName,
    logoPath: r.logo_path ?? "",
    mainVisuals: Array.isArray(r.main_visuals)
      ? (r.main_visuals as MainVisual[])
      : defaultSettings.mainVisuals,
    showMainVisual: r.show_main_visual ?? true,
    showCategories: r.show_categories ?? true,
    showFeaturedProducts: r.show_featured_products ?? true,
    contactEmail: r.contact_email ?? "",
    contactInstagram: r.contact_instagram ?? "",
    contactTiktok: r.contact_tiktok ?? "",
  };
}

export const useSettingsStore = defineStore("settings", () => {
  const siteSettings = ref<SiteSettings>({ ...defaultSettings });
  const categories = ref<Category[]>([]);
  const productsState = ref<Product[]>([]);

  async function loadSettings() {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (!error && data) siteSettings.value = rowToSiteSettings(data as SiteSettingsRow);
    } catch {
      /* keep default */
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) {
        categories.value = (data as CategoryRow[]).map(rowToCategory);
        return;
      }
    } catch {
      /* bảng chưa tạo hoặc lỗi mạng */
    }
    categories.value = [];
  }

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });
      if (!error && data) {
        productsState.value = (data as ProductRow[]).map(rowToProduct);
        return;
      }
    } catch {
      /* bảng chưa tạo hoặc lỗi mạng */
    }
    productsState.value = [];
  }

  async function updateSiteSettings(partial: Partial<SiteSettings>) {
    Object.assign(siteSettings.value, partial);
    const row = {
      site_name: siteSettings.value.siteName,
      logo_path: siteSettings.value.logoPath,
      main_visuals: siteSettings.value.mainVisuals,
      show_main_visual: siteSettings.value.showMainVisual,
      show_categories: siteSettings.value.showCategories,
      show_featured_products: siteSettings.value.showFeaturedProducts,
      contact_email: siteSettings.value.contactEmail,
      contact_instagram: siteSettings.value.contactInstagram,
      contact_tiktok: siteSettings.value.contactTiktok,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("site_settings").update(row).eq("id", 1);
  }

  async function addCategory(
    cat: Category | { name: string; slug: string; image?: string }
  ): Promise<boolean> {
    try {
      const isUuid = "id" in cat && typeof cat.id === "string" && /^[0-9a-f-]{36}$/i.test(cat.id);
      const row: { name: string; slug: string; image?: string | null; id?: string } = {
        name: cat.name,
        slug: cat.slug,
        image: cat.image ?? null,
      };
      if (isUuid && "id" in cat) row.id = cat.id;
      const { data, error } = await supabase.from("categories").insert(row).select().single();
      if (error) return false;
      if (data) categories.value.push(rowToCategory(data as CategoryRow));
      return true;
    } catch {
      return false;
    }
  }

  async function updateCategory(id: string, partial: Partial<Category>): Promise<boolean> {
    try {
      const row: Partial<CategoryRow> = {};
      if (partial.name != null) row.name = partial.name;
      if (partial.slug != null) row.slug = partial.slug;
      if (partial.image != null) row.image = partial.image;
      const { error } = await supabase.from("categories").update(row).eq("id", id);
      if (error) return false;
      const item = categories.value.find((c) => c.id === id);
      if (item) Object.assign(item, partial);
      return true;
    } catch {
      return false;
    }
  }

  async function removeCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) return false;
      categories.value = categories.value.filter((c) => c.id !== id);
      return true;
    } catch {
      return false;
    }
  }

  async function addProduct(p: Omit<Product, "id"> | Product) {
    const row = {
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      status: p.status,
      quantity: p.quantity,
      variants: p.variants,
      main_image: p.mainImage,
      gallery: p.gallery,
      description_html: p.descriptionHtml ?? "",
      external_links: p.externalLinks ?? {},
    };
    const { data, error } = await supabase.from("products").insert(row).select().single();
    if (!error && data) productsState.value.push(rowToProduct(data as ProductRow));
  }

  async function updateProduct(id: number, partial: Partial<Product>) {
    const row: Record<string, unknown> = {};
    if (partial.slug != null) row.slug = partial.slug;
    if (partial.name != null) row.name = partial.name;
    if (partial.category != null) row.category = partial.category;
    if (partial.price != null) row.price = partial.price;
    if (partial.status != null) row.status = partial.status;
    if (partial.quantity != null) row.quantity = partial.quantity;
    if (partial.variants != null) row.variants = partial.variants;
    if (partial.mainImage != null) row.main_image = partial.mainImage;
    if (partial.gallery != null) row.gallery = partial.gallery;
    if (partial.descriptionHtml != null) row.description_html = partial.descriptionHtml;
    if (partial.externalLinks != null) row.external_links = partial.externalLinks;
    await supabase.from("products").update(row).eq("id", id);
    const item = productsState.value.find((pr) => pr.id === id);
    if (item) Object.assign(item, partial);
  }

  async function removeProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    productsState.value = productsState.value.filter((pr) => pr.id !== id);
  }

  return {
    siteSettings,
    categories,
    productsState,
    loadSettings,
    loadCategories,
    loadProducts,
    updateSiteSettings,
    addCategory,
    updateCategory,
    removeCategory,
    addProduct,
    updateProduct,
    removeProduct,
  };
});
