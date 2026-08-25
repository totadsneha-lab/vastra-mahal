// app/api/products/route.js
// -----------------------------------------------------------------------
// GET /api/products
// Fetches products from Supabase with optional category filtering and
// pagination. Designed to be called from the storefront's product grid.
//
// Query params:
//   category  - optional, e.g. "Banarasi" (matches products.category)
//   search    - optional, matches against product name (partial/contains)
//   page      - optional, 1-based page number (default: 1)
//   pageSize  - optional, items per page (default: 12, max: 50)
// -----------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Server-side Supabase client. Uses the anon key because this route only
// ever reads public, "is_active = true" rows — Row Level Security in the
// database (see schema.sql) enforces that boundary, so no service-role
// key is needed here.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category"); // e.g. "Banarasi"
    const search = searchParams.get("search"); // e.g. "silk"

    // Parse + sanitize pagination params so a malformed query string
    // can't request an absurd page size or a negative page.
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
    );

    // Supabase's .range() is inclusive on both ends, so page 1 with
    // pageSize 12 becomes rows 0-11, page 2 becomes rows 12-23, etc.
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Base query: only active, in-stock-or-not products (stock filtering
    // can be added separately if "show out of stock" should be hidden).
    // `{ count: "exact" }` asks Supabase to also return the total row
    // count matching the filters, so the frontend can render page numbers.
    let query = supabase
      .from("products")
      .select(
        "id, name, description, category, price, discount_price, image_urls, stock_quantity, fabric, product_variants(id, color_name, color_hex, image_urls, stock_quantity)",
        { count: "exact" }
      )
      .eq("is_active", true);

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      // ilike = case-insensitive "contains" match, backed by the
      // pg_trgm index created in schema.sql for reasonable speed.
      query = query.ilike("name", `%${search}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase products fetch error:", error.message);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    return NextResponse.json({
      products: data,
      pagination: {
        page,
        pageSize,
        totalItems: count ?? 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      },
    });
  } catch (err) {
    console.error("Unexpected error in /api/products:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/*
 * -----------------------------------------------------------------------
 * EXAMPLE REQUESTS
 * -----------------------------------------------------------------------
 * GET /api/products
 * GET /api/products?category=Banarasi
 * GET /api/products?search=silk&page=2&pageSize=12
 * -----------------------------------------------------------------------
 */
