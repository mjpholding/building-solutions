#!/usr/bin/env python3
"""Rebrand Swish catalog PDFs v6: exact color match, logo instead of text."""

import fitz
import os

CATALOG_DIR = "C:/Users/mbak/swish-deutschland/Katalog"
OUTPUT_DIR = "C:/Users/mbak/swish-deutschland/public/katalog-pdf"
LOGO_PATH = "C:/Users/mbak/swish-deutschland/public/logo-swish-deutschland.png"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Exact red from the catalog: rgb(207, 21, 43)
EXACT_RED = (207/255, 21/255, 43/255)

DE = {
    "address": "Ottostr. 14, 50170 Kerpen, Deutschland",
    "phone": "+49 (0) 2273 951 55 0",
    "email": "info@swish-deutschland.de",
    "web": "www.swish-deutschland.de",
}


def cover(page, rect, color):
    page.draw_rect(rect, color=color, fill=color)


def process_professional():
    src = os.path.join(CATALOG_DIR, "Swish DE small.pdf")
    out = os.path.join(OUTPUT_DIR, "Swish-Deutschland-Katalog-Professional.pdf")
    doc = fitz.open(src)
    pw = 595

    # === PAGE 2 (index 1) ===
    # Red bg starts at ~y=530, text at y=633-714 (white on red)
    page = doc[1]

    # Cover old company text with EXACT red color
    cover(page, fitz.Rect(140, 620, pw - 140, 725), EXACT_RED)

    # Insert logo (white version effect: the PNG has red+black, on red bg it won't look right)
    # Instead: insert logo centered above text area
    logo_w = 160
    logo_h = 55
    logo_x = (pw - logo_w) / 2
    logo_y = 625
    page.insert_image(fitz.Rect(logo_x, logo_y, logo_x + logo_w, logo_y + logo_h),
                      filename=LOGO_PATH, keep_proportion=True)

    # Insert white text below logo
    y = 695
    for text, size in [(DE["address"], 11), (DE["phone"], 11), (DE["email"], 11), (DE["web"], 10)]:
        tw = fitz.get_text_length(text, fontname="helv", fontsize=size)
        x = (pw - tw) / 2
        page.insert_text(fitz.Point(x, y), text, fontsize=size, fontname="helv", color=(1, 1, 1))
        y += size + 5

    print("  Page 2: OK")

    # === PAGE 44 (index 43) ===
    page = doc[43]

    # White background page - cover old text
    terms = ["Swish Polska", "Warszawa", "swishclean", "biuro@", "22 255 96"]
    min_y, max_y, min_x, max_x = 9999, 0, 9999, 0
    for term in terms:
        for r in page.search_for(term):
            min_y = min(min_y, r.y0)
            max_y = max(max_y, r.y1)
            min_x = min(min_x, r.x0)
            max_x = max(max_x, r.x1)

    if min_y < 9999:
        # Check if text is white (red bg) or black (white bg)
        blocks = page.get_text("dict")["blocks"]
        is_white_text = False
        for b in blocks:
            if "lines" in b:
                for line in b["lines"]:
                    for span in line["spans"]:
                        if "Swish Polska" in span["text"] and span["color"] == 16777215:
                            is_white_text = True

        bg = EXACT_RED if is_white_text else (1, 1, 1)
        txt_col = (1, 1, 1) if is_white_text else (0, 0, 0)

        cover(page, fitz.Rect(min_x - 15, min_y - 10, max_x + 15, max_y + 10), bg)

        # Replace DISTRIBUTOR
        for r in page.search_for("DISTRIBUTOR"):
            cover(page, fitz.Rect(r.x0 - 3, r.y0 - 3, r.x1 + 3, r.y1 + 3), bg)
            page.insert_text(fitz.Point(r.x0, r.y1 - 2), "VERTRIEBSPARTNER",
                           fontsize=10, fontname="hebo", color=txt_col)

        # Insert logo
        page.insert_image(fitz.Rect(min_x, min_y - 5, min_x + 130, min_y + 40),
                         filename=LOGO_PATH, keep_proportion=True)

        # Insert data below logo
        y = min_y + 55
        for text, size in [(DE["address"], 10.5), (DE["phone"], 10.5),
                           (DE["email"], 10.5), (DE["web"], 9.5)]:
            page.insert_text(fitz.Point(min_x, y), text,
                           fontsize=size, fontname="helv", color=txt_col)
            y += size + 4

    print("  Page 44: OK")

    doc.save(out)
    doc.close()
    print(f"  -> {out}")


def process_economy():
    src = os.path.join(CATALOG_DIR, "Swish Economy Line DE.pdf")
    out = os.path.join(OUTPUT_DIR, "Swish-Deutschland-Katalog-Economy.pdf")
    doc = fitz.open(src)

    page = doc[3]

    terms = ["Swish Polska", "Warschau", "swishclean", "biuro@", "22 255 96", "PRODUKTVERTEILER"]
    min_y, max_y, min_x, max_x = 9999, 0, 9999, 0
    for term in terms:
        for r in page.search_for(term):
            min_y = min(min_y, r.y0)
            max_y = max(max_y, r.y1)
            min_x = min(min_x, r.x0)
            max_x = max(max_x, r.x1)

    if min_y < 9999:
        blocks = page.get_text("dict")["blocks"]
        is_white_text = False
        for b in blocks:
            if "lines" in b:
                for line in b["lines"]:
                    for span in line["spans"]:
                        if any(t in span["text"] for t in ["Swish", "swish", "biuro"]):
                            if span["color"] == 16777215:
                                is_white_text = True

        bg = EXACT_RED if is_white_text else (1, 1, 1)
        txt_col = (1, 1, 1) if is_white_text else (0, 0, 0)

        cover(page, fitz.Rect(min_x - 20, min_y - 15, max_x + 20, max_y + 15), bg)

        # Logo
        page.insert_image(fitz.Rect(min_x - 10, min_y - 10, min_x + 120, min_y + 35),
                         filename=LOGO_PATH, keep_proportion=True)

        # VERTRIEBSPARTNER
        page.insert_text(fitz.Point(min_x - 10, min_y + 48), "VERTRIEBSPARTNER",
                        fontsize=10, fontname="hebo", color=txt_col)

        # Data
        y = min_y + 65
        for text, size in [(DE["address"], 10.5), (DE["phone"], 10.5),
                           (DE["email"], 10.5), (DE["web"], 9.5)]:
            page.insert_text(fitz.Point(min_x - 10, y), text,
                           fontsize=size, fontname="helv", color=txt_col)
            y += size + 4

    print("  Page 4: OK")

    doc.save(out)
    doc.close()
    print(f"  -> {out}")


def main():
    print("Rebranding catalogs v6 (exact color + logo)...\n")
    print("Professional:")
    process_professional()
    print("\nEconomy:")
    process_economy()
    print("\nDone!")


if __name__ == "__main__":
    main()
