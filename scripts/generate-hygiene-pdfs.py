#!/usr/bin/env python3
"""Generate German hygiene plan PDFs by replacing Polish text in original PDFs."""

import fitz
import os

OUT_DIR = "C:/Users/mbak/swish-deutschland/public/hygieneplaene"
os.makedirs(OUT_DIR, exist_ok=True)

# Simple word/phrase replacements (order matters - longer phrases first)
REPLACEMENTS = [
    # Headers
    ("PLAN HIGIENY", "HYGIENEPLAN"),
    ("SANITARIATY", "SANITÄRANLAGEN"),
    ("RESTAURACJE - KUCHNIA", "RESTAURANT – KÜCHE"),
    ("RESTAURACJE - SALA RESTAURACYJNA", "RESTAURANT – GASTRAUM"),
    ("CZĘSTOTLIWOŚĆ", "HÄUFIGKEIT"),
    ("DOZOWANIE", "DOSIERUNG"),
    ("SPOSÓB UŻYCIA", "ANWENDUNG"),
    ("STREFA CZYSZCZENIA", "REINIGUNGSBEREICH"),
    ("PREPARAT", "PRODUKT"),

    # Section headers
    ("POSADZKI ORAZ POWIERZCHNIE PONADPODŁOGOWE", "BÖDEN UND OBERFLÄCHEN"),
    ("BLATY, URZĄDZENIA KUCHENNE I INNE POWIERZCHNIE ZMYWALNE", "ARBEITSFLÄCHEN, KÜCHENGERÄTE UND ABWASCHBARE FLÄCHEN"),
    ("STOŁY, BLATY I INNE POWIERZCHNIE ZMYWALNE", "TISCHE, ARBEITSFLÄCHEN UND ABWASCHBARE FLÄCHEN"),
    ("PIELĘGNACJA STALI NIERDZEWNEJ", "EDELSTAHLPFLEGE"),
    ("MYCIE NACZYŃ W ZMYWARKACH GASTRONOMICZNYCH", "GESCHIRRREINIGUNG IN GEWERBLICHEN SPÜLMASCHINEN"),
    ("DEZYNFEKCJA POWIERZCHNI", "FLÄCHENDESINFEKTION"),
    ("OKNA I INNE POWIERZCHNIE SZKLANE", "FENSTER UND GLASFLÄCHEN"),
    ("USUWANIE PRZYKRYCH ZAPACHÓW", "GERUCHSBESEITIGUNG"),
    ("PREPARATY SPECJALNE", "SPEZIALPRODUKTE"),
    ("DEZYNFEKCJA", "DESINFEKTION"),

    # Frequency
    ("Codziennie", "Täglich"),
    ("Okresowo", "Periodisch"),
    ("Bieżace mycie", "Laufende Reinigung"),
    ("Bieżące mycie", "Laufende Reinigung"),
    ("Doczyszczanie w", "Grundreinigung"),
    ("zależności od", "nach"),
    ("potrzeb", "Bedarf"),
    ("Doczyszczanie", "Grundreinigung"),
    ("W zależności od", "Nach Bedarf"),

    # Descriptions
    ("Muszle klozetowe,", "Toiletten, Urinale,"),
    ("pisuary, urządzenia", "Sanitäranlagen,"),
    ("sanitarne, posadzki,", "Böden,"),
    ("glazura ścienna", "Wandfliesen"),
    ("sanitarne - gruntowne", "Sanitäranlagen –"),
    ("doczyszczanie", "Grundreinigung"),
    ("urządzenia sanitrane", "Sanitäranlagen"),
    ("Odkamieniacz - Muszle", "Entkalker – Toiletten,"),
    ("klozetowe, pisuary,", "Urinale,"),
    ("Szyby, lustra,", "Scheiben, Spiegel,"),
    ("powierzchnie szklane oraz", "Glasflächen und"),
    ("stal nierdzewna", "Edelstahl"),
    ("Dezynfekcja - Mycie i", "Desinfektion – Reinigung"),
    ("dezynfekcja powierzchni,", "und Desinfektion von"),
    ("urządzeń i wyposażenia", "Flächen und Geräten"),
    ("dezynfekcja powierzchni", "und Desinfektion von"),
    ("mających bezpośredni", "Flächen mit direktem"),
    ("kontakt z żywnościa", "Lebensmittelkontakt"),
    ("Posadzki, oraz", "Böden und"),
    ("powierzchnie", "Oberflächen"),
    ("ponadpodłogowe", ""),
    ("Usuwanie uporczywych", "Entfernung hartnäckiger"),
    ("tłustych zabrudzeń i", "Fett- und"),
    ("zapieczeń", "Einbrennverschmutzungen"),
    ("Usuwanie tłustych", "Entfernung von"),
    ("zabrudzeń", "Fettverschmutzungen"),
    ("Odkamieniacz - Usuwanie", "Entkalker – Entfernung"),
    ("nalotów wapiennych", "von Kalkablagerungen"),
    ("Mycie naczyń w", "Geschirrreinigung in"),
    ("zmywarkach", "gewerblichen"),
    ("gastronomicznych", "Spülmaschinen"),
    ("Nabłyszczanie naczyń w", "Klarspülen in"),
    ("Odkamienianie urządzeń", "Entkalken von Geräten"),
    ("Pielęgnacja stali", "Edelstahlpflege"),
    ("nierdzewnej", ""),
    ("Bieżące mycie mebli,", "Tägliche Reinigung von"),
    ("powierzchni z tworzyw", "Möbeln, Kunststoff-"),
    ("sztucznych, wyposażenia", "flächen, Einrichtung"),
    ("Mycie powierzchni", "Reinigung von"),
    ("szklanych, okien, framug", "Glasflächen, Fenstern,"),
    ("okiennych, przeszkleń", "Rahmen, Verglasungen"),
    ("Odświeżanie powietrza", "Lufterfrischung"),

    # Dosages
    ("Od 25 do 250 ml", "25 bis 250 ml"),
    ("Od 70 do 170 ml", "70 bis 170 ml"),
    ("Od 50 do 400 ml", "50 bis 400 ml"),
    ("Od 10 do 50 ml", "10 bis 50 ml"),
    ("Od 1 do 3 ml preparatu", "1 bis 3 ml Präparat"),
    ("Od 1000 do 3000 ml", "1000 bis 3000 ml"),
    ("1000 ml preparatu do", "1000 ml Präparat"),
    ("preparatu do 10L wody", "Präparat auf 10L Wasser"),
    ("do 10L wody", "auf 10L Wasser"),
    ("lub Gotowy do użytku", "oder gebrauchsfertig"),
    ("Gotowy do użytku", "Gebrauchsfertig"),
    ("Użyć koncentratu", "Konzentrat verwenden"),

    # Instructions
    ("Przygotować roztwór roboczy zgodnie z", "Arbeitslösung gemäß"),
    ("zaleceniami", "Empfehlungen vorbereiten"),
    ("Umyć posadzkę przy pomocy mopa, a inne", "Boden mit Mopp reinigen, andere"),
    ("powierzchnie przy pomocy ściereczki lub gąbki", "Flächen mit Tuch oder Schwamm"),
    ("Zwilżyć powierzchnię wodą", "Fläche mit Wasser befeuchten"),
    ("Bezpośrednio z butelki nanieść środek na", "Mittel direkt aus der Flasche auf"),
    ("powierzchnię, po chwili (nie krócej niż 5 min.)", "die Fläche auftragen, nach mind. 5 Min."),
    ("dokładnie wyszorować powierzchnię", "gründlich schrubben"),
    ("Obficie spłukać wodą", "Gründlich mit Wasser abspülen"),
    ("Przy pomocy butelki rozprowadzić preparat pod", "Präparat mit der Flasche unter"),
    ("powierzchnią pisuaru", "der Urinaloberfläche verteilen"),
    ("Za pomocą szczotki umyć powierzchnię", "Fläche mit Bürste reinigen"),
    ("Po 5 minutach spłukać wodą", "Nach 5 Min. mit Wasser abspülen"),
    ("Umyć powierzchnię przy pomocy ściereczki", "Fläche mit Tuch reinigen"),
    ("Do oznakowanej butelki ze spryskiwaczem wlać 100 ml płynu", "In eine Sprühflasche 100 ml Flüssigkeit"),
    ("i uzupełnić wodą", "einfüllen und mit Wasser auffüllen"),
    ("Spryskać powierzchnię preparatem", "Fläche mit Präparat besprühen"),
    ("Przetrzeć powierzchnię ściereczką", "Fläche mit Tuch abwischen"),
    ("Przetrzeć ściereczką", "Mit Tuch abwischen"),
    ("Przy pomocy butelki ze spryskiwaczem spryskać preparatem", "Fläche mit Sprühflasche"),
    ("Sanityzacja 60 sekund, pełna dezynfekcja - odczekać 15", "Sanitisierung 60 Sek., volle Desinfektion –"),
    ("Sanityzacja 60 sekund, pełna dezynfekcja - odczekać 10", "Sanitisierung 60 Sek., volle Desinfektion –"),
    ("minut", "Min. einwirken lassen"),
    ("Nanieść preparat na zmywaną powierzchnię,", "Präparat auf die Fläche auftragen,"),
    ("odczekać 5 minut", "5 Min. einwirken lassen"),
    ("Szorować szczotką", "Mit Bürste schrubben"),
    ("Spłukać wodą", "Mit Wasser abspülen"),
    ("Używać przy pomocy automatycznych pomp dozujących lub", "Mit automatischen Dosierpumpen"),
    ("ręcznie w zależności od potrzeb.", "oder manuell nach Bedarf."),
    ("Używać przy pomocy automatycznych pomp dozujących", "Mit automatischen Dosierpumpen verwenden"),
    ("Nanieść preparat na ściereczkę", "Präparat auf Tuch auftragen"),
    ("Nanosić na powierzchnię przy użyciu ściereczki, przecierać", "Mit Tuch auf Fläche auftragen und"),
    ("do uzyskania porządanego efektu", "bis zum gewünschten Ergebnis polieren"),
    ("Dla optymalnego efektu, podgrzać powierzchnię", "Für optimales Ergebnis Fläche"),
    ("do temperatury max 60 oC", "auf max. 60°C erwärmen"),
    ("Spryskać preparatem okolice źródła przykrego zapachu", "Geruchsquelle mit Präparat besprühen"),

    # Swish Polska -> Swish Deutschland
    ("Swish Polska", "Swish Deutschland"),
    ("swishclean.pl", "swish-deutschland.de"),
    ("swishclean.com", "swish-deutschland.de"),
]

FILES = [
    ("Plan-Higieny-Sanitariaty.pdf", "Hygieneplan-Sanitaeranlagen.pdf"),
    ("Plan-Higieny-HoReCa-Kuchnia.pdf", "Hygieneplan-Restaurant-Kueche.pdf"),
    ("Plan-Higieny-HoReCa-Sala-Restauracyjna.pdf", "Hygieneplan-Restaurant-Gastraum.pdf"),
]


def replace_text_in_page(page, old_text, new_text):
    """Find and replace text in a PDF page using redaction."""
    hits = page.search_for(old_text)
    if not hits:
        return 0

    for rect in hits:
        # Add redaction annotation (white out old text)
        page.add_redact_annot(rect, text=new_text, fontsize=0, align=fitz.TEXT_ALIGN_LEFT)

    return len(hits)


def process_pdf(src_path, out_path):
    """Process a single PDF: replace Polish text with German."""
    doc = fitz.open(src_path)
    page = doc[0]

    total_replacements = 0

    for pl_text, de_text in REPLACEMENTS:
        # Search for Polish text
        hits = page.search_for(pl_text)
        for rect in hits:
            # Slightly expand rect to cover full text
            expanded = fitz.Rect(rect.x0 - 1, rect.y0 - 1, rect.x1 + 1, rect.y1 + 1)
            page.add_redact_annot(expanded)
            total_replacements += 1

    # Apply all redactions (white out Polish text)
    page.apply_redactions()

    # Now insert German text at the same positions
    for pl_text, de_text in REPLACEMENTS:
        if not de_text:
            continue
        # We need original positions - search in a fresh copy
        doc2 = fitz.open(src_path)
        page2 = doc2[0]
        hits = page2.search_for(pl_text)
        doc2.close()

        for rect in hits:
            # Determine font size based on rect height
            font_size = min(rect.height * 0.8, 10)
            if pl_text.isupper():
                font_size = min(rect.height * 0.8, 9)

            # Insert German text
            page.insert_text(
                fitz.Point(rect.x0, rect.y0 + rect.height * 0.75),
                de_text,
                fontsize=font_size,
                fontname="helv",
                color=(0, 0, 0)
            )

    doc.save(out_path)
    doc.close()
    print(f"  Saved: {out_path} ({total_replacements} replacements)")


def main():
    print("Generating German hygiene plan PDFs...")

    for src_name, out_name in FILES:
        src_path = f"C:/Users/mbak/Downloads/{src_name}"
        out_path = f"{OUT_DIR}/{out_name}"
        print(f"\nProcessing: {src_name}")
        process_pdf(src_path, out_path)

    print("\nDone! German hygiene plans saved to:", OUT_DIR)


if __name__ == "__main__":
    main()
