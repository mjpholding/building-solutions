"use client";

import { useState, useEffect } from "react";
import { products as staticProducts, type Product } from "@/data/products";

let cachedProducts: Product[] | null = null;

export function useProducts(): { products: Product[]; loading: boolean } {
  const [products, setProducts] = useState<Product[]>(cachedProducts || staticProducts);
  const [loading, setLoading] = useState(!cachedProducts);

  useEffect(() => {
    if (cachedProducts) return;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (data?.length) {
          cachedProducts = data;
          setProducts(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}

export function useProduct(slug: string): { product: Product | undefined; loading: boolean } {
  const { products, loading } = useProducts();
  return { product: products.find((p) => p.slug === slug), loading };
}
