import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const dummyUsers = [
  { name: "Budi Santoso", email: "budi.santoso@example.com", address: "Jl. Sudirman No. 123, Jakarta Pusat", phone: "081234567890" },
  { name: "Siti Rahayu", email: "siti.rahayu@example.com", address: "Jl. Gatot Subroto No. 45, Bandung", phone: "082345678901" },
  { name: "Ahmad Hidayat", email: "ahmad.hidayat@example.com", address: "Jl. Diponegoro No. 78, Surabaya", phone: "083456789012" },
  { name: "Dewi Lestari", email: "dewi.lestari@example.com", address: "Jl. Malioboro No. 12, Yogyakarta", phone: "084567890123" },
  { name: "Rizki Pratama", email: "rizki.pratama@example.com", address: "Jl. Asia Afrika No. 56, Bandung", phone: "085678901234" },
  { name: "Nur Aisyah", email: "nur.aisyah@example.com", address: "Jl. Pemuda No. 89, Semarang", phone: "086789012345" },
  { name: "Fajar Nugroho", email: "fajar.nugroho@example.com", address: "Jl. Thamrin No. 34, Jakarta Selatan", phone: "087890123456" },
  { name: "Mega Putri", email: "mega.putri@example.com", address: "Jl. Veteran No. 67, Malang", phone: "088901234567" },
  { name: "Dimas Saputra", email: "dimas.saputra@example.com", address: "Jl. Ahmad Yani No. 90, Surabaya", phone: "089012345678" },
  { name: "Anisa Wulandari", email: "anisa.wulandari@example.com", address: "Jl. Pahlawan No. 23, Medan", phone: "081123456789" },
];

const dummyProducts = [
  {
    title: "iPhone 14 Pro Max 256GB - Deep Purple",
    description: "iPhone 14 Pro Max dalam kondisi mulus seperti baru. Lengkap dengan box, charger, dan case original Apple. Garansi resmi iBox masih aktif hingga Maret 2025. Layar Super Retina XDR, chip A16 Bionic, kamera 48MP. Cocok untuk profesional dan content creator.",
    price: 18500000,
    condition: "like_new",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800",
    status: "active",
  },
  {
    title: "MacBook Pro M2 14 inch - Space Gray",
    description: "MacBook Pro M2 Pro chip dengan RAM 16GB dan SSD 512GB. Layar Liquid Retina XDR yang memukau. Battery health 98%, cycle count rendah. Ideal untuk editing video, programming, dan design. Bonus sleeve premium dan USB hub.",
    price: 28000000,
    condition: "good",
    city: "Bandung",
    province: "Jawa Barat",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    status: "active",
  },
  {
    title: "Honda Beat Street 2023 - Hitam Doff",
    description: "Motor Honda Beat Street keluaran 2023, tangan pertama dari baru. Kilometer baru 3.500 km, servis rutin di AHASS. Pajak panjang sampai 2025. Modifikasi ringan: spion bar end, jok custom, dan ban Michelin. Surat-surat lengkap.",
    price: 17500000,
    condition: "like_new",
    city: "Surabaya",
    province: "Jawa Timur",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    status: "active",
  },
  {
    title: "Kamera Sony A7 III + Lensa 24-70mm f/2.8",
    description: "Paket kamera mirrorless Sony A7 III dengan lensa GM 24-70mm f/2.8. Shutter count masih rendah sekitar 15.000. Kondisi mulus tanpa jamur atau gores. Bonus tas kamera Lowepro, memory card 128GB, dan extra battery. Perfect untuk wedding photographer.",
    price: 32000000,
    condition: "good",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    status: "active",
  },
  {
    title: "Sepatu Nike Air Jordan 1 Retro High - Chicago",
    description: "Nike Air Jordan 1 Retro High OG 'Chicago' original 100% dengan receipt. Size 42 EU / 8.5 US. Kondisi BNIB (Brand New In Box), belum pernah dipakai. Colorway klasik merah-putih-hitam yang timeless. Investasi sneaker yang tidak lekang oleh waktu.",
    price: 4500000,
    condition: "new",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    status: "active",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const createdUsers: string[] = [];
    const password = "DummyPassword123!";

    // Create users
    for (const user of dummyUsers) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .eq('email', user.email)
          .single();

        if (existingUser) {
          createdUsers.push(existingUser.user_id);
          continue;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: password,
          email_confirm: true,
        });

        if (authError) {
          console.log(`Error creating ${user.email}:`, authError.message);
          continue;
        }

        if (authData.user) {
          // Create profile
          await supabaseAdmin.from('profiles').insert({
            user_id: authData.user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone_number: user.phone,
          });

          createdUsers.push(authData.user.id);
        }
      } catch (err) {
        console.log(`Error processing ${user.email}:`, err);
      }
    }

    // Get categories
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('is_active', true)
      .limit(5);

    const categoryIds = categories?.map(c => c.id) || [];

    // Create products
    const createdListings: string[] = [];
    
    for (let i = 0; i < dummyProducts.length; i++) {
      const product = dummyProducts[i];
      const userId = createdUsers[i % createdUsers.length];
      const categoryId = categoryIds[i % categoryIds.length];

      if (!userId || !categoryId) continue;

      // Check if listing already exists
      const { data: existingListing } = await supabaseAdmin
        .from('listings')
        .select('id')
        .eq('title', product.title)
        .single();

      if (existingListing) {
        createdListings.push(existingListing.id);
        continue;
      }

      // Create listing
      const { data: listing, error: listingError } = await supabaseAdmin
        .from('listings')
        .insert({
          user_id: userId,
          category_id: categoryId,
          title: product.title,
          description: product.description,
          price: product.price,
          condition: product.condition,
          city: product.city,
          province: product.province,
          status: 'active',
          published_at: new Date().toISOString(),
          listing_type: 'sale',
          price_type: 'fixed',
        })
        .select('id')
        .single();

      if (listingError) {
        console.log(`Error creating listing:`, listingError.message);
        continue;
      }

      if (listing) {
        // Add image
        await supabaseAdmin.from('listing_images').insert({
          listing_id: listing.id,
          image_url: product.image,
          is_primary: true,
          sort_order: 0,
        });

        createdListings.push(listing.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdUsers.length} users and ${createdListings.length} listings`,
        users: createdUsers.length,
        listings: createdListings.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
