import productsData from "./products.json";

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  ph: string;
  applications: string[];
  isBestseller: boolean;
  sizes: string[];
  surfaceTypes: string[];
  roomTypes: string[];
  dirtTypes: string[];
  intensityLevels: string[];
  image?: string;
  prices?: Record<string, number>; // size → net price EUR, e.g. {"1 L": 8.50, "5 L": 32.00}
  minOrderQuantity?: number;
  inStock?: boolean;
}

export interface Category {
  slug: string;
  nameKey: string;
  icon: string;
}

export const categories: Category[] = [
  { slug: "floors", nameKey: "categories.floors", icon: "Layers" },
  { slug: "sanitary", nameKey: "categories.sanitary", icon: "Droplets" },
  { slug: "odor", nameKey: "categories.odor", icon: "Wind" },
  { slug: "special", nameKey: "categories.special", icon: "Beaker" },
  { slug: "carpets", nameKey: "categories.carpets", icon: "RectangleHorizontal" },
  { slug: "disinfection", nameKey: "categories.disinfection", icon: "Shield" },
  { slug: "food", nameKey: "categories.food", icon: "UtensilsCrossed" },
  { slug: "industry", nameKey: "categories.industry", icon: "Factory" },
  { slug: "transport", nameKey: "categories.transport", icon: "Truck" },
  { slug: "economy", nameKey: "categories.economy", icon: "Tag" },
  { slug: "green", nameKey: "categories.green", icon: "Leaf" },
  { slug: "dosing", nameKey: "categories.dosing", icon: "Gauge" },
];

export const products: Product[] = productsData as unknown as Product[];

// Helper: find product by slug
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

// Helper: get products by category
export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

// Helper: get bestsellers
export function getBestsellers(): Product[] {
  return products.filter((p) => p.isBestseller);
}

// Product Advisor: match products based on criteria
export function getRecommendedProducts(
  surface?: string,
  room?: string,
  dirt?: string,
  intensity?: string,
): Product[] {
  let scored = products.map((p) => {
    let score = 0;
    if (surface && p.surfaceTypes.includes(surface)) score += 3;
    if (room && p.roomTypes.includes(room)) score += 2;
    if (dirt && p.dirtTypes.includes(dirt)) score += 4;
    if (intensity && p.intensityLevels.includes(intensity)) score += 1;
    return { product: p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.product);
}
