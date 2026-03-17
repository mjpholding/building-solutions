import type { Product } from "../products";

// Static imports for all locale translation files
import en from "./en.json";
import pl from "./pl.json";
import tr from "./tr.json";
import ru from "./ru.json";
import uk from "./uk.json";
import sk from "./sk.json";
import sq from "./sq.json";
import hr from "./hr.json";

type ProductTranslation = { description: string; applications: string[] };
type TranslationMap = Record<string, ProductTranslation>;

const translations: Record<string, TranslationMap> = {
  en, pl, tr, ru, uk, sk, sq, hr,
};

/**
 * Returns a translated product. For "de" locale, returns the original product unchanged.
 * For other locales, overlays translated description and applications.
 */
export function getTranslatedProduct(product: Product, locale: string): Product {
  if (locale === "de") return product;
  const localeMap = translations[locale];
  if (!localeMap) return product;
  const t = localeMap[product.slug];
  if (!t) return product;
  return {
    ...product,
    description: t.description || product.description,
    applications: t.applications?.length ? t.applications : product.applications,
  };
}

/**
 * Translates an array of products for the given locale.
 */
export function getTranslatedProducts(products: Product[], locale: string): Product[] {
  if (locale === "de") return products;
  return products.map((p) => getTranslatedProduct(p, locale));
}
