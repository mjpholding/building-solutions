/**
 * Fetches product descriptions in EN and PL from swishclean.pl
 * and saves them to src/data/product-descriptions-{locale}.json
 *
 * DE descriptions are already in src/data/product-descriptions.json
 * For languages without native versions (TR, RU, UK, SK, SQ, HR),
 * the EN version is used as fallback.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { JSDOM } from "jsdom";

const products = JSON.parse(
  readFileSync("src/data/products.json", "utf-8")
);

const DELAY = 1500;

const LOCALES = [
  { code: "en", urlPrefix: "https://www.swishclean.pl/en/produkty-swish" },
  { code: "pl", urlPrefix: "https://www.swishclean.pl/produkty-swish" },
];

function cleanHtml(rawHtml) {
  return rawHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\s*class="[^"]*"/gi, "")
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*id="[^"]*"/gi, "")
    .replace(/\s*data-[a-z-]+="[^"]*"/gi, "")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "")
    .replace(/<span[^>]*>(<\/span>)/gi, "")
    .replace(/<span>([^<]*)<\/span>/gi, "$1")
    .replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchDescription(baseUrl, slug) {
  const url = `${baseUrl}/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    let descEl = null;

    const tabContents = doc.querySelectorAll(".oxy-tab-content");
    for (const tab of tabContents) {
      const textBlock = tab.querySelector(".ct-text-block");
      if (textBlock && textBlock.textContent.trim().length > 100) {
        descEl = textBlock;
        break;
      }
    }

    if (!descEl) {
      const textBlocks = doc.querySelectorAll(".ct-text-block");
      for (const block of textBlocks) {
        if (block.querySelector("h2") && block.textContent.trim().length > 100) {
          descEl = block;
          break;
        }
      }
    }

    if (!descEl) {
      const textBlocks = doc.querySelectorAll(".ct-text-block");
      for (const block of textBlocks) {
        if (block.textContent.trim().length > 200) {
          descEl = block;
          break;
        }
      }
    }

    if (!descEl) return null;

    const spanEl = descEl.querySelector(".ct-span");
    const html_content = cleanHtml((spanEl || descEl).innerHTML.trim());

    const preview = descEl.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
    return { html: html_content, preview };
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (const locale of LOCALES) {
    const outFile = `src/data/product-descriptions-${locale.code}.json`;
    console.log(`\n=== Fetching ${locale.code.toUpperCase()} descriptions ===\n`);

    const descriptions = {};
    let found = 0;

    for (let i = 0; i < products.length; i++) {
      const slug = products[i].slug;
      process.stdout.write(`[${i + 1}/${products.length}] ${slug}... `);

      const result = await fetchDescription(locale.urlPrefix, slug);
      if (result) {
        descriptions[slug] = result.html;
        found++;
        console.log(`✓ ${result.preview}...`);
      } else {
        console.log(`✗`);
      }

      if (i < products.length - 1) await sleep(DELAY);
    }

    writeFileSync(outFile, JSON.stringify(descriptions, null, 2), "utf-8");
    console.log(`\n${locale.code.toUpperCase()}: ${found}/${products.length} saved to ${outFile}`);
  }

  // Create fallback copies for languages without native versions
  const enDescriptions = JSON.parse(
    readFileSync("src/data/product-descriptions-en.json", "utf-8")
  );
  const fallbackLocales = ["tr", "ru", "uk", "sk", "sq", "hr"];
  for (const code of fallbackLocales) {
    const outFile = `src/data/product-descriptions-${code}.json`;
    writeFileSync(outFile, JSON.stringify(enDescriptions, null, 2), "utf-8");
    console.log(`${code.toUpperCase()}: copied EN as fallback → ${outFile}`);
  }

  console.log("\nDone!");
}

main();
