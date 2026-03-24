#!/usr/bin/env python3
"""
Generate individual product PDF cards from Swish catalog data.
Uses Swish Deutschland branding (German company data, logo).
"""

import fitz
import re
import os
import json
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Paths
CATALOG_DIR = "C:/Users/mbak/Desktop/ORGANIZER/Projekty/Swish/Katalog"
OUTPUT_DIR = "C:/Users/mbak/swish-deutschland/public/katalog"
LOGO_PATH = "C:/Users/mbak/swish-deutschland/public/logo-swish-deutschland.png"

# Company data
COMPANY = "Swish Deutschland"
COMPANY_SUB = "eine Marke der Building Solutions GmbH"
ADDRESS = "Ottostr. 14, 50170 Kerpen, Deutschland"
PHONE = "+49 (0) 2273 951 55 77"
EMAIL = "info@swish-deutschland.de"
WEBSITE = "www.swish-deutschland.de"

# Colors
RED = HexColor("#dc2626")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")
LIGHT_GRAY = HexColor("#f3f4f6")
LIGHT_RED = HexColor("#fef2f2")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def parse_products_from_catalog():
    """Parse individual products from catalog PDFs."""
    products = []

    # Professional catalog
    doc = fitz.open(os.path.join(CATALOG_DIR, "Swish DE small.pdf"))
    for i in range(len(doc)):
        text = doc[i].get_text()
        if len(text.strip()) < 100:
            continue
        # Skip TOC, intro pages, dosing tables, distributor pages
        if any(kw in text[:50] for kw in ["Inhaltsverzeichnis", "Produktkatalog", "DISTRIBUTOR", "Dosierung"]):
            continue
        if text.strip().startswith("0") and len(text.strip()) < 500:
            continue

        # Extract products from page
        page_products = extract_products_from_text(text, "professional")
        products.extend(page_products)

    # Economy catalog
    doc2 = fitz.open(os.path.join(CATALOG_DIR, "Swish Economy Line DE.pdf"))
    for i in range(len(doc2)):
        text = doc2[i].get_text()
        if len(text.strip()) < 100:
            continue
        if "PRODUKTVERTEILER" in text or "DISTRIBUTOR" in text:
            continue
        page_products = extract_products_from_text(text, "economy")
        products.extend(page_products)

    return products


def extract_products_from_text(text, line):
    """Extract individual product entries from a catalog page text."""
    products = []
    lines = text.split("\n")

    # Known product names pattern - typically UPPERCASE or specific names
    # We'll look for patterns: product name (uppercase) followed by subtitle (uppercase)
    current = None

    i = 0
    while i < len(lines):
        l = lines[i].strip()

        # Skip page numbers, category headers, empty lines
        if not l or l.isdigit() or len(l) < 3:
            i += 1
            continue

        # Skip category headers like "Fußböden", "Sanitäranlagen" etc at page start
        if i < 3 and l in ["Fußböden", "Sanitäranlagen", "Geruchsneutralisierung und Erfrischung",
                           "Produkte für Sonderanwendungen", "Teppiche", "Desinfektion",
                           "Lebensmittelindustrie und Gastronomie", "Industrie"]:
            i += 1
            continue

        # Detect product name: typically a known name or mixed case name
        # followed by an UPPERCASE subtitle description
        if is_product_name(l, lines, i):
            if current and current.get("description"):
                products.append(current)

            name = l
            subtitle = ""
            desc_lines = []

            # Next line(s) might be subtitle (ALL CAPS description)
            j = i + 1
            while j < len(lines) and lines[j].strip().isupper() and len(lines[j].strip()) > 5:
                subtitle += " " + lines[j].strip()
                j += 1
            subtitle = subtitle.strip()

            # Collect description lines until next product or end
            while j < len(lines):
                dl = lines[j].strip()
                if not dl:
                    j += 1
                    continue
                if is_product_name(dl, lines, j):
                    break
                desc_lines.append(dl)
                j += 1

            description = " ".join(desc_lines)

            # Extract pH if present
            ph_match = re.search(r'pH[:\s]*([\d.,]+\s*[-–]\s*[\d.,]+|[\d.,]+)', description)
            ph = ph_match.group(1) if ph_match else ""

            # Extract dosage if present
            dos_match = re.search(r'Dosierung[:\s]*([\d.,]+\s*%?\s*[-–]\s*[\d.,]+\s*%?|[\d.,]+\s*%?)', description, re.IGNORECASE)
            dosage = dos_match.group(1) if dos_match else ""

            current = {
                "name": clean_name(name),
                "subtitle": subtitle,
                "description": description[:600],
                "ph": ph,
                "dosage": dosage,
                "line": line,
            }
            i = j
        else:
            if current:
                current["description"] = current.get("description", "") + " " + l
            i += 1

    if current and current.get("description"):
        products.append(current)

    return products


KNOWN_PRODUCTS = [
    "Extreme", "Swish Strip", "Liberty", "Duration", "Tried'n'True", "Tried\u2019n\u2019True",
    "ES89", "ES99", "Sun Up", "Poly Lock Ultra", "Poly Lock",
    "SP-100 Floral", "SP-100 Citro", "SP-105 Nano Clean & Shine", "SP-110 Wood Floor Cleaner",
    "Sunbeam", "Winterinse", "Wash & Shine", "Jet", "SP-120 Floor Active", "SP-120",
    "SP-150 Gres Cleaner", "SP-150", "SP-350 Acid Cleaner", "SP-350",
    "SP-300 Washroom Cleaner", "SP-300", "Sani Clean", "Sani Foam", "Tuby",
    "Scale Remover", "SP-360 Action", "SP-360", "Kling", "Descaler",
    "Aromx 35", "Aromx 60", "Aromx 80", "Aromx 81",
    "Swish Essence", "Fresh Air",
    "Sparkle", "Nano Glass", "Glass Clean",
    "Powershine", "Office Clean", "Citro Gleam",
    "Super Clean", "De-Grease", "Swish De-Grease", "Stone & Tile",
    "Stainless Steel Cleaner", "Stainless Steel Polish",
    "Plush", "Stain Remover",
    "Quato 78", "Quato 44", "Food Service",
    "Grill & Oven", "Food Service 5000",
    "Hardwater Detergent", "Hardwater Rinse",
    "Swish Dish Detergent", "Clean & Green",
    "Facto PM20", "Facto HD40", "Facto HD41", "Facto HD43", "Facto AT31",
    "Powerhouse", "Eternity",
    "E10 Neutral", "E10", "E11 Orange", "E11", "E20 Alkali", "E20",
    "E30 Acid", "E30", "E35 Gel", "E35", "E40 Glass", "E40",
    "E50 Strong Cleaner", "E50", "E50 Strong",
]


def is_product_name(line, all_lines, idx):
    """Check if a line looks like a product name."""
    line = line.strip()
    if not line or len(line) > 60:
        return False
    for name in KNOWN_PRODUCTS:
        if line.startswith(name) or name.startswith(line):
            return True
    # Check if it starts with known pattern
    if re.match(r'^(SP-\d|E\d|ES\d|Facto|Aromx|Quato)', line):
        return True
    return False


def clean_name(name):
    """Clean product name."""
    name = name.strip()
    # Remove trailing numbers that are page numbers
    name = re.sub(r'\s+\d+$', '', name)
    return name


def slugify(name):
    """Convert name to filename-safe slug."""
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s


def generate_product_pdf(product, output_path):
    """Generate a single product PDF card."""
    c = canvas.Canvas(output_path, pagesize=A4)
    w, h = A4  # 210x297mm

    # --- Header bar (red) ---
    c.setFillColor(RED)
    c.rect(0, h - 45*mm, w, 45*mm, fill=True, stroke=False)

    # Logo
    try:
        logo = ImageReader(LOGO_PATH)
        c.drawImage(logo, 15*mm, h - 35*mm, width=40*mm, height=25*mm, preserveAspectRatio=True, mask='auto')
    except:
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(15*mm, h - 28*mm, "Swish Deutschland")

    # Header text (right side)
    c.setFillColor(white)
    c.setFont("Helvetica", 8)
    c.drawRightString(w - 15*mm, h - 15*mm, WEBSITE)
    c.drawRightString(w - 15*mm, h - 22*mm, EMAIL)
    c.drawRightString(w - 15*mm, h - 29*mm, PHONE)

    # "Produktdatenblatt" label
    c.setFont("Helvetica", 9)
    c.drawRightString(w - 15*mm, h - 38*mm, "Produktdatenblatt")

    y = h - 60*mm

    # --- Product name ---
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 22)
    name = product["name"]
    c.drawString(15*mm, y, name)
    y -= 8*mm

    # Line badge
    line_label = "PROFESSIONAL LINE" if product["line"] == "professional" else "ECONOMY LINE"
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 8)
    badge_w = c.stringWidth(line_label, "Helvetica-Bold", 8) + 8*mm
    c.roundRect(15*mm, y - 1*mm, badge_w, 6*mm, 2*mm, fill=True, stroke=False)
    c.setFillColor(white)
    c.drawString(15*mm + 4*mm, y + 0.5*mm, line_label)
    y -= 12*mm

    # --- Subtitle ---
    if product.get("subtitle"):
        c.setFillColor(GRAY)
        c.setFont("Helvetica-Bold", 11)
        # Word wrap subtitle
        subtitle = product["subtitle"]
        sub_lines = wrap_text(subtitle, 85)
        for sl in sub_lines:
            c.drawString(15*mm, y, sl)
            y -= 5*mm
        y -= 3*mm

    # --- Separator line ---
    c.setStrokeColor(HexColor("#e5e7eb"))
    c.setLineWidth(0.5)
    c.line(15*mm, y, w - 15*mm, y)
    y -= 8*mm

    # --- Description ---
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(15*mm, y, "Beschreibung")
    y -= 6*mm

    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#374151"))
    desc = product.get("description", "")
    # Clean up description
    desc = re.sub(r'\s+', ' ', desc).strip()
    desc_lines = wrap_text(desc, 95)
    for dl in desc_lines[:15]:
        c.drawString(15*mm, y, dl)
        y -= 4.5*mm
    y -= 5*mm

    # --- Info boxes ---
    # pH value
    if product.get("ph"):
        y = draw_info_box(c, 15*mm, y, "pH-Wert", product["ph"], w)
        y -= 3*mm

    # Dosage
    if product.get("dosage"):
        y = draw_info_box(c, 15*mm, y, "Dosierung", product["dosage"], w)
        y -= 3*mm

    # --- Footer ---
    c.setFillColor(LIGHT_GRAY)
    c.rect(0, 0, w, 22*mm, fill=True, stroke=False)

    c.setFillColor(GRAY)
    c.setFont("Helvetica", 7)
    c.drawString(15*mm, 14*mm, f"{COMPANY} — {COMPANY_SUB}")
    c.drawString(15*mm, 10*mm, f"{ADDRESS} | Tel: {PHONE}")
    c.drawString(15*mm, 6*mm, f"E-Mail: {EMAIL} | Web: {WEBSITE}")

    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 7)
    c.drawRightString(w - 15*mm, 10*mm, COMPANY)

    c.save()


def draw_info_box(c, x, y, label, value, page_w):
    """Draw a labeled info box."""
    box_w = page_w - 30*mm
    c.setFillColor(LIGHT_RED)
    c.roundRect(x, y - 8*mm, box_w, 12*mm, 2*mm, fill=True, stroke=False)
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(x + 4*mm, y - 2*mm, label)
    c.setFillColor(DARK)
    c.setFont("Helvetica", 10)
    c.drawString(x + 40*mm, y - 2*mm, value)
    return y - 12*mm


def wrap_text(text, max_chars):
    """Simple word wrap."""
    words = text.split()
    lines = []
    current = ""
    for w in words:
        if len(current) + len(w) + 1 > max_chars:
            lines.append(current)
            current = w
        else:
            current = current + " " + w if current else w
    if current:
        lines.append(current)
    return lines


def main():
    print("Parsing catalog PDFs...")
    products = parse_products_from_catalog()

    # Deduplicate by name
    seen = set()
    unique = []
    for p in products:
        key = p["name"].lower()
        if key not in seen and len(p.get("description", "")) > 20:
            seen.add(key)
            unique.append(p)

    print(f"Found {len(unique)} unique products")

    # Generate PDFs
    generated = []
    for p in unique:
        slug = slugify(p["name"])
        filename = f"{slug}.pdf"
        output_path = os.path.join(OUTPUT_DIR, filename)
        print(f"  Generating: {filename} ({p['name']})")
        generate_product_pdf(p, output_path)
        generated.append({"name": p["name"], "slug": slug, "file": filename, "line": p["line"]})

    # Save index
    index_path = os.path.join(OUTPUT_DIR, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(generated, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Generated {len(generated)} product PDFs in {OUTPUT_DIR}")
    print(f"Index saved to {index_path}")


if __name__ == "__main__":
    main()
