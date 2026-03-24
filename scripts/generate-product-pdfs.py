#!/usr/bin/env python3
"""
Generate professional product PDF data sheets from Swish catalog data.
Swish Deutschland branding, German company data, product images.
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

# Paths
CATALOG_DIR = "C:/Users/mbak/Desktop/ORGANIZER/Projekty/Swish/Katalog"
OUTPUT_DIR = "C:/Users/mbak/swish-deutschland/public/katalog"
LOGO_PATH = "C:/Users/mbak/swish-deutschland/public/logo-swish-deutschland.png"
PRODUCTS_IMG_DIR = "C:/Users/mbak/swish-deutschland/public/products"

# Company data
COMPANY = "Swish Deutschland"
COMPANY_SUB = "eine Marke der Building Solutions GmbH"
ADDRESS = "Ottostr. 14 | 50170 Kerpen | Deutschland"
PHONE = "+49 (0) 2273 951 55 0"
EMAIL = "info@swish-deutschland.de"
WEBSITE = "www.swish-deutschland.de"

# Colors
RED = HexColor("#dc2626")
DARK_RED = HexColor("#b91c1c")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")
LIGHT_GRAY = HexColor("#f9fafb")
BORDER = HexColor("#e5e7eb")
WHITE = white

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Slug-to-image mapping
def find_product_image(slug):
    """Find product image by slug."""
    for ext in ['.png', '.jpg', '.jpeg', '.webp']:
        path = os.path.join(PRODUCTS_IMG_DIR, slug + ext)
        if os.path.exists(path):
            return path
    return None


KNOWN_PRODUCTS = [
    "Extreme", "Swish Strip", "Liberty", "Duration", "Tried'n'True",
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
    "E10 Neutral", "E11 Orange", "E20 Alkali",
    "E30 Acid", "E35 Gel", "E40 Glass",
    "E50 Strong Cleaner", "E50 Strong",
]


def is_product_name(line, all_lines=None, idx=0):
    line = line.strip()
    if not line or len(line) > 60:
        return False
    for name in KNOWN_PRODUCTS:
        if line.startswith(name) or name.startswith(line):
            return True
    if re.match(r'^(SP-\d|E\d|ES\d|Facto|Aromx|Quato)', line):
        return True
    return False


def parse_products_from_catalog():
    products = []
    doc = fitz.open(os.path.join(CATALOG_DIR, "Swish DE small.pdf"))
    for i in range(len(doc)):
        text = doc[i].get_text()
        if len(text.strip()) < 100:
            continue
        if any(kw in text[:50] for kw in ["Inhaltsverzeichnis", "Produktkatalog", "DISTRIBUTOR", "Dosierung"]):
            continue
        if text.strip().startswith("0") and len(text.strip()) < 500:
            continue
        page_products = extract_products_from_text(text, "professional")
        products.extend(page_products)

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
    products = []
    lines = text.split("\n")
    current = None
    i = 0
    while i < len(lines):
        l = lines[i].strip()
        if not l or l.isdigit() or len(l) < 3:
            i += 1
            continue
        if i < 3 and l in ["Fußböden", "Sanitäranlagen", "Geruchsneutralisierung und Erfrischung",
                           "Produkte für Sonderanwendungen", "Teppiche", "Desinfektion",
                           "Lebensmittelindustrie und Gastronomie", "Industrie"]:
            i += 1
            continue

        if is_product_name(l):
            if current and current.get("description"):
                products.append(current)
            name = l
            subtitle = ""
            desc_lines = []
            j = i + 1
            while j < len(lines) and lines[j].strip().isupper() and len(lines[j].strip()) > 5:
                subtitle += " " + lines[j].strip()
                j += 1
            subtitle = subtitle.strip()
            while j < len(lines):
                dl = lines[j].strip()
                if not dl:
                    j += 1
                    continue
                if is_product_name(dl):
                    break
                desc_lines.append(dl)
                j += 1
            description = " ".join(desc_lines)
            ph_match = re.search(r'pH[:\s]*([\d.,]+\s*[-–]\s*[\d.,]+|[\d.,]+)', description)
            ph = ph_match.group(1) if ph_match else ""
            dos_match = re.search(r'Dosierung[:\s]*([\d.,]+\s*%?\s*[-–]\s*[\d.,]+\s*%?|[\d.,]+\s*%?)', description, re.IGNORECASE)
            dosage = dos_match.group(1) if dos_match else ""

            current = {
                "name": re.sub(r'\s+\d+$', '', name.strip()),
                "subtitle": subtitle,
                "description": description[:800],
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


def slugify(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def wrap_text(text, font, size, max_width, c):
    """Word wrap using actual font metrics."""
    words = text.split()
    lines = []
    current = ""
    for w in words:
        test = current + " " + w if current else w
        if c.stringWidth(test, font, size) > max_width:
            if current:
                lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)
    return lines


def generate_product_pdf(product, output_path):
    c = canvas.Canvas(output_path, pagesize=A4)
    w, h = A4
    margin = 18 * mm
    content_w = w - 2 * margin

    # =========================================
    # HEADER — Red bar with white logo
    # =========================================
    header_h = 38 * mm
    c.setFillColor(RED)
    c.rect(0, h - header_h, w, header_h, fill=True, stroke=False)

    # Dark red accent line at bottom of header
    c.setFillColor(DARK_RED)
    c.rect(0, h - header_h, w, 1.5, fill=True, stroke=False)

    # White logo (draw as white text since PNG has red logo)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin, h - 16 * mm, "Swish")
    c.setFont("Helvetica", 13)
    c.drawString(margin, h - 22 * mm, "Deutschland")

    # Right side: company info
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 8)
    right_x = w - margin
    c.drawRightString(right_x, h - 12 * mm, WEBSITE)
    c.drawRightString(right_x, h - 17 * mm, f"Tel: {PHONE}")
    c.drawRightString(right_x, h - 22 * mm, EMAIL)

    # "Produktdatenblatt" label
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(HexColor("#fecaca"))
    c.drawRightString(right_x, h - 30 * mm, "PRODUKTDATENBLATT")

    y = h - header_h - 12 * mm

    # =========================================
    # PRODUCT NAME + IMAGE ROW
    # =========================================
    slug = slugify(product["name"])
    img_path = find_product_image(slug)

    # Product name
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 24)
    name_lines = wrap_text(product["name"], "Helvetica-Bold", 24, content_w - 55 * mm, c)
    for nl in name_lines[:2]:
        c.drawString(margin, y, nl)
        y -= 9 * mm

    # Line badge
    line_label = "PROFESSIONAL LINE" if product["line"] == "professional" else "ECONOMY LINE"
    badge_color = RED if product["line"] == "professional" else HexColor("#2563eb")
    c.setFillColor(badge_color)
    badge_w = c.stringWidth(line_label, "Helvetica-Bold", 7) + 6 * mm
    c.roundRect(margin, y - 1 * mm, badge_w, 5.5 * mm, 2 * mm, fill=True, stroke=False)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(margin + 3 * mm, y + 0.3 * mm, line_label)
    y -= 10 * mm

    # Product image (right side)
    if img_path:
        try:
            img = ImageReader(img_path)
            img_x = w - margin - 45 * mm
            img_y = y + 5 * mm
            c.drawImage(img, img_x, img_y, width=45 * mm, height=55 * mm,
                       preserveAspectRatio=True, mask='auto')
        except Exception as e:
            print(f"    Warning: Could not load image for {slug}: {e}")

    # =========================================
    # SUBTITLE
    # =========================================
    if product.get("subtitle"):
        c.setFillColor(GRAY)
        c.setFont("Helvetica-Bold", 10)
        sub_lines = wrap_text(product["subtitle"], "Helvetica-Bold", 10, content_w - 55 * mm, c)
        for sl in sub_lines[:3]:
            c.drawString(margin, y, sl)
            y -= 5 * mm
        y -= 4 * mm

    # =========================================
    # SEPARATOR
    # =========================================
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(margin, y, w - margin, y)
    y -= 10 * mm

    # =========================================
    # DESCRIPTION
    # =========================================
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Beschreibung")
    y -= 7 * mm

    desc = re.sub(r'\s+', ' ', product.get("description", "")).strip()
    c.setFont("Helvetica", 9.5)
    c.setFillColor(HexColor("#374151"))
    desc_lines = wrap_text(desc, "Helvetica", 9.5, content_w, c)
    for dl in desc_lines[:20]:
        c.drawString(margin, y, dl)
        y -= 4.5 * mm
    y -= 8 * mm

    # =========================================
    # INFO CARDS (pH, Dosierung)
    # =========================================
    if product.get("ph") or product.get("dosage"):
        # Background card
        card_h = 0
        if product.get("ph"):
            card_h += 14 * mm
        if product.get("dosage"):
            card_h += 14 * mm
        card_h += 4 * mm

        c.setFillColor(LIGHT_GRAY)
        c.roundRect(margin, y - card_h + 6 * mm, content_w, card_h, 3 * mm, fill=True, stroke=False)
        c.setStrokeColor(BORDER)
        c.roundRect(margin, y - card_h + 6 * mm, content_w, card_h, 3 * mm, fill=False, stroke=True)

        info_y = y

        if product.get("ph"):
            c.setFillColor(RED)
            c.setFont("Helvetica-Bold", 10)
            c.drawString(margin + 5 * mm, info_y, "pH-Wert")
            c.setFillColor(DARK)
            c.setFont("Helvetica", 11)
            c.drawString(margin + 35 * mm, info_y, product["ph"])
            info_y -= 12 * mm

        if product.get("dosage"):
            c.setFillColor(RED)
            c.setFont("Helvetica-Bold", 10)
            c.drawString(margin + 5 * mm, info_y, "Dosierung")
            c.setFillColor(DARK)
            c.setFont("Helvetica", 11)
            c.drawString(margin + 35 * mm, info_y, product["dosage"])
            info_y -= 12 * mm

        y = info_y - 5 * mm

    # =========================================
    # FOOTER
    # =========================================
    footer_h = 18 * mm

    # Red accent line above footer
    c.setFillColor(RED)
    c.rect(0, footer_h, w, 1.5, fill=True, stroke=False)

    # Footer background
    c.setFillColor(HexColor("#1f2937"))
    c.rect(0, 0, w, footer_h, fill=True, stroke=False)

    c.setFillColor(HexColor("#9ca3af"))
    c.setFont("Helvetica", 7)
    c.drawString(margin, 10 * mm, f"{COMPANY}  —  {COMPANY_SUB}")
    c.drawString(margin, 6 * mm, ADDRESS)

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 7)
    c.drawRightString(w - margin, 10 * mm, f"Tel: {PHONE}")
    c.drawRightString(w - margin, 6 * mm, f"{EMAIL}  |  {WEBSITE}")

    c.save()


def main():
    print("Parsing catalog PDFs...")
    products = parse_products_from_catalog()

    seen = set()
    unique = []
    for p in products:
        key = p["name"].lower()
        if key not in seen and len(p.get("description", "")) > 20:
            seen.add(key)
            unique.append(p)

    print(f"Found {len(unique)} unique products")

    generated = []
    for p in unique:
        slug = slugify(p["name"])
        filename = f"{slug}.pdf"
        output_path = os.path.join(OUTPUT_DIR, filename)
        print(f"  Generating: {filename} ({p['name']})")
        generate_product_pdf(p, output_path)
        generated.append({"name": p["name"], "slug": slug, "file": filename, "line": p["line"]})

    index_path = os.path.join(OUTPUT_DIR, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(generated, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Generated {len(generated)} product PDFs in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
