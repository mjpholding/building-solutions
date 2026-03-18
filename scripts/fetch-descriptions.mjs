/**
 * Fetches detailed product descriptions from swishclean.pl (German version)
 * and saves them to src/data/product-descriptions.json
 */

import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const products = JSON.parse(
  readFileSync("src/data/products.json", "utf-8")
);

const BASE_URL = "https://www.swishclean.pl/de/produkty-swish";
const DELAY = 1500; // ms between requests to be polite

async function fetchDescription(slug) {
  const url = `${BASE_URL}/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "de-DE,de;q=0.9",
      },
    });

    if (!res.ok) {
      console.log(`  ✗ ${slug}: HTTP ${res.status}`);
      return null;
    }

    const html = await res.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // swishclean.pl uses Oxygen Builder — description is inside .ct-text-block within .oxy-tab-content
    // Find all text blocks and pick the one with actual product description content
    let descEl = null;

    // Strategy 1: Find the first oxy-tab-content that has substantial text
    const tabContents = doc.querySelectorAll(".oxy-tab-content");
    for (const tab of tabContents) {
      const textBlock = tab.querySelector(".ct-text-block");
      if (textBlock) {
        const text = textBlock.textContent.trim();
        if (text.length > 100) {
          descEl = textBlock;
          break;
        }
      }
    }

    // Strategy 2: Find any ct-text-block with h2 inside (product descriptions have headings)
    if (!descEl) {
      const textBlocks = doc.querySelectorAll(".ct-text-block");
      for (const block of textBlocks) {
        if (block.querySelector("h2") && block.textContent.trim().length > 100) {
          descEl = block;
          break;
        }
      }
    }

    // Strategy 3: Fallback to any substantial ct-text-block in the product area
    if (!descEl) {
      const textBlocks = doc.querySelectorAll(".ct-text-block");
      for (const block of textBlocks) {
        const text = block.textContent.trim();
        if (text.length > 200) {
          descEl = block;
          break;
        }
      }
    }

    if (!descEl) {
      console.log(`  ✗ ${slug}: no description element found`);
      return null;
    }

    // Get the innerHTML from the inner span (ct-span) if it exists, otherwise the block itself
    const spanEl = descEl.querySelector(".ct-span");
    let html_content = (spanEl || descEl).innerHTML.trim();

    // Clean up: remove scripts, styles, inline attributes, wrapper divs
    html_content = html_content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/\s*class="[^"]*"/gi, "")
      .replace(/\s*style="[^"]*"/gi, "")
      .replace(/\s*id="[^"]*"/gi, "")
      .replace(/\s*data-[a-z-]+="[^"]*"/gi, "")
      .replace(/<div[^>]*>/gi, "")
      .replace(/<\/div>/gi, "")
      .replace(/<span[^>]*>(<\/span>)/gi, "") // empty spans
      .replace(/<span>([^<]*)<\/span>/gi, "$1") // simple spans
      // Remove links but keep text
      .replace(/<a[^>]*>(.*?)<\/a>/gi, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Get plain text for logging
    const text = descEl.textContent
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);

    console.log(`  ✓ ${slug}: ${text.slice(0, 80)}...`);
    return html_content;
  } catch (err) {
    console.log(`  ✗ ${slug}: ${err.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(
    `Fetching descriptions for ${products.length} products from swishclean.pl/de/...\n`
  );

  const descriptions = {};
  let found = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const slug = products[i].slug;
    process.stdout.write(`[${i + 1}/${products.length}] `);

    const desc = await fetchDescription(slug);
    if (desc) {
      descriptions[slug] = desc;
      found++;
    } else {
      failed++;
    }

    if (i < products.length - 1) {
      await sleep(DELAY);
    }
  }

  // Save results
  writeFileSync(
    "src/data/product-descriptions.json",
    JSON.stringify(descriptions, null, 2),
    "utf-8"
  );

  console.log(`\nDone! ${found} descriptions fetched, ${failed} failed.`);
  console.log("Saved to src/data/product-descriptions.json");
}

main();
