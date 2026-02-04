-- ============================================================
-- Chạy SAU khi đã chạy supabase-schema.sql
-- Thêm dữ liệu mẫu: categories, products, cập nhật site_settings
-- ============================================================

-- Xóa dữ liệu cũ (tùy chọn, bỏ comment nếu muốn reset)
-- truncate public.products restart identity cascade;
-- delete from public.categories;

-- ---------- CATEGORIES ----------
insert into public.categories (id, name, slug, image) values
  ('00000000-0000-0000-0000-000000000001', 'Áo', 'ao', '/assets/upload/cat-ao.svg'),
  ('00000000-0000-0000-0000-000000000002', 'Quần', 'quan', '/assets/upload/cat-quan.svg'),
  ('00000000-0000-0000-0000-000000000003', 'Phụ kiện', 'phu-kien', '/assets/upload/cat-phukien.svg')
on conflict (slug) do nothing;

-- ---------- PRODUCTS ----------
insert into public.products (slug, name, category, price, status, quantity, variants, main_image, gallery, description_html, external_links) values
  ('ao-thun-basic-trang', 'Áo thun basic trắng', 'ao', 199000, 'in_stock', 10,
   '[{"size":"S","color":"white"},{"size":"M","color":"white"},{"size":"L","color":"white"}]',
   '/assets/upload/12/main-image.svg', '["/assets/upload/12/gallery-1.svg","/assets/upload/12/gallery-2.svg"]',
   '<h2>Mô tả</h2><p>Áo thun form rộng, chất liệu cotton thoáng mát.</p>',
   '{"youtube":"https://youtube.com/","tiktok":"https://www.tiktok.com/"}'),
  ('ao-khoac-jean', 'Áo khoác jean', 'ao', 450000, 'in_stock', 5,
   '[{"size":"M","color":"blue"},{"size":"L","color":"blue"}]',
   '/assets/upload/13/main-image.svg', '["/assets/upload/13/gallery-1.svg"]',
   '<h2>Mô tả</h2><p>Áo khoác jean nam tính, dễ phối đồ.</p>', '{}'),
  ('quan-jean-slim', 'Quần jean slim fit', 'quan', 380000, 'in_stock', 8,
   '[{"size":"28","color":"denim"},{"size":"30","color":"denim"},{"size":"32","color":"denim"}]',
   '/assets/upload/14/main-image.svg', '["/assets/upload/14/gallery-1.svg","/assets/upload/14/gallery-2.svg"]',
   '<h2>Mô tả</h2><p>Quần jean slim fit ôm vừa, chất vải bền đẹp.</p>', '{}'),
  ('quan-short-nam', 'Quần short nam', 'quan', 220000, 'in_stock', 15,
   '[{"size":"M","color":"black"},{"size":"L","color":"black"},{"size":"M","color":"navy"}]',
   '/assets/upload/15/main-image.svg', '["/assets/upload/15/gallery-1.svg"]',
   '<h2>Mô tả</h2><p>Quần short thoáng mát cho mùa hè.</p>', '{}'),
  ('tui-deo-cheo', 'Túi đeo chéo', 'phu-kien', 280000, 'in_stock', 12,
   '[{"size":"One","color":"black"},{"size":"One","color":"brown"}]',
   '/assets/upload/16/main-image.svg', '["/assets/upload/16/gallery-1.svg"]',
   '<h2>Mô tả</h2><p>Túi đeo chéo da PU, nhiều ngăn tiện dụng.</p>', '{}'),
  ('that-lung-da', 'Thắt lưng da', 'phu-kien', 150000, 'in_stock', 20,
   '[{"size":"M","color":"black"},{"size":"L","color":"brown"}]',
   '/assets/upload/17/main-image.svg', '[]',
   '<h2>Mô tả</h2><p>Thắt lưng da thật, bền đẹp.</p>', '{}')
on conflict (slug) do nothing;

-- ---------- CẬP NHẬT SITE_SETTINGS (tùy chọn) ----------
update public.site_settings set
  site_name = 'Shop Demo',
  logo_path = '',
  contact_email = 'contact@shop.demo',
  contact_instagram = 'https://instagram.com',
  contact_tiktok = 'https://tiktok.com',
  updated_at = now()
where id = 1;
