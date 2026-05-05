import type { Metadata } from "next";
import { getProductById } from "@/lib/data/products-repo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let product;
  try {
    product = await getProductById(id);
  } catch {
    product = null;
  }

  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} — ${product.tagline}`;
  const description = `${product.name} resmi · ${product.tagline}. Mulai Rp${product.priceIDR.toLocaleString(
    "id-ID"
  )}. Garansi penuh selama masa aktif.`;
  const path = `/products/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      images: product.imageUrl
        ? [{ url: product.imageUrl, width: 1200, height: 630, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
