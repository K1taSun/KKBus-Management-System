import os
from fpdf import FPDF

class KKBusRegulationsPDF(FPDF):
    def header(self):
        # Logo or Header Text
        self.set_font("Arial-Bold", "", 10)
        self.set_text_color(15, 52, 96) # Primary color: #0F3460
        self.cell(0, 10, "KKBus Sp. z o.o. | Kraków ↔ Katowice", border=0, ln=1, align="L")
        # Line break
        self.set_draw_color(14, 165, 233) # Action color: #0EA5E9
        self.set_line_width(0.5)
        self.line(10, 18, 200, 18)
        self.ln(5)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        self.set_font("Arial-Italic", "", 8)
        self.set_text_color(128, 128, 128)
        # Page number
        self.cell(0, 10, f"Strona {self.page_no()} / {{nb}}", border=0, ln=0, align="C")
        self.cell(0, 10, "Obowiązuje od 01.01.2026 r.", border=0, ln=0, align="R")

def generate_pdf():
    pdf = KKBusRegulationsPDF()
    pdf.alias_nb_pages()
    
    # Register Arial fonts for Polish characters
    arial_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    arial_bold_path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    arial_italic_path = "/System/Library/Fonts/Supplemental/Arial Italic.ttf"
    
    pdf.add_font("Arial", "", arial_path)
    pdf.add_font("Arial-Bold", "", arial_bold_path)
    pdf.add_font("Arial-Italic", "", arial_italic_path)
    
    # Add first page
    pdf.add_page()
    
    # Document Title
    pdf.set_font("Arial-Bold", "", 20)
    pdf.set_text_color(15, 52, 96) # Primary color: #0F3460
    pdf.cell(0, 15, "REGULAMIN PRZEWOZÓW OSÓB I BAGAŻU", border=0, ln=1, align="C")
    
    pdf.set_font("Arial-Bold", "", 12)
    pdf.cell(0, 8, "KKBus Sp. z o.o.", border=0, ln=1, align="C")
    pdf.ln(5)
    
    # Short description
    pdf.set_font("Arial-Italic", "", 10)
    pdf.set_text_color(74, 85, 104)
    description = (
        "Niniejszy dokument określa szczegółowe warunki świadczenia usług przewozowych osób, "
        "bagażu i zwierząt realizowanych przez KKBus Sp. z o.o. na trasie Kraków ↔ Katowice, "
        "jak również zasady funkcjonowania internetowego systemu rezerwacji biletów."
    )
    pdf.multi_cell(0, 5, description)
    pdf.ln(5)
    
    def add_section(title, content_list):
        pdf.set_font("Arial-Bold", "", 12)
        pdf.set_text_color(15, 52, 96) # Primary color
        pdf.cell(0, 10, title, border=0, ln=1, align="L")
        
        pdf.set_font("Arial", "", 10)
        pdf.set_text_color(45, 55, 72) # text-main
        for paragraph in content_list:
            pdf.multi_cell(0, 5, paragraph)
            pdf.ln(2)
        pdf.ln(3)

    # Section 1
    add_section(
        "§ 1. Postanowienia Ogólne",
        [
            "1. Niniejszy Regulamin określa warunki przewozu osób, bagażu oraz zwierząt realizowanych przez firmę KKBus Sp. z o.o. z siedzibą w Krakowie (zwaną dalej „Przewoźnikiem”) na trasie Kraków ↔ Katowice.",
            "2. Korzystanie z usług Przewoźnika, w szczególności dokonanie rezerwacji online lub wejście na pokład pojazdu, oznacza pełną akceptację postanowień niniejszego Regulaminu.",
            "3. Pasażer zobowiązany jest do przestrzegania zaleceń kierowcy oraz personelu naziemnego w celu zapewnienia bezpieczeństwa i punktualności przejazdów."
        ]
    )

    # Section 2
    add_section(
        "§ 2. Rezerwacje i Zakup Biletów",
        [
            "1. Rezerwacja biletów odbywa się za pośrednictwem zintegrowanego systemu internetowego KKBus, dedykowanej aplikacji mobilnej lub bezpośrednio u kierowcy przed odjazdem (w przypadku dostępności wolnych miejsc).",
            "2. Rezerwacja miejsc online może być dokonana najpóźniej na 2 godziny przed planowanym odjazdem danego kursu. Po tym czasie rezerwacja online zostaje zablokowana.",
            "3. Pasażer dokonujący rezerwacji online otrzymuje bilet elektroniczny z przypisanym numerem miejsca w pojeździe. Rezerwacja gwarantuje dostępność wybranego miejsca.",
            "4. Bezkosztowe anulowanie rezerwacji jest możliwe najpóźniej na 24 godziny przed kursem. Można to wykonać w panelu klienta. Po tym czasie zwrot środków nie jest możliwy.",
            "5. W przypadku niepojawienia się na kursie bez wcześniejszego anulowania (tzw. no-show), rezerwacja przepada, a wniesiona opłata nie podlega zwrotowi. Wielokrotne niestawienie się na kurs może skutkować czasową blokadą konta."
        ]
    )

    # Section 3
    add_section(
        "§ 3. Cennik i Ulgi",
        [
            "1. Podstawowy cennik biletów jednorazowych oraz okresowych jest publikowany na oficjalnej stronie internetowej Przewoźnika. Cena bazowa biletu normalnego w jedną stronę na trasie Kraków ↔ Katowice wynosi 20 PLN.",
            "2. Przewoźnik honoruje zniżki ustawowe oraz oferuje własne ulgi handlowe:\n"
            "   a) Studencka (-51%): Dla studentów do 26. roku życia za okazaniem ważnej legitymacji studenckiej.\n"
            "   b) Szkolna (-37%): Dla dzieci i młodzieży szkolnej do 24. roku życia za okazaniem legitymacji.\n"
            "   c) Dziecięca (-100%): Dla dzieci do lat 4 podróżujących na kolanach opiekuna (wymagane pobranie bezpłatnego biletu zerowego).",
            "3. Brak ważnego dokumentu uprawniającego do zniżki w momencie wejścia do pojazdu skutkuje koniecznością dopłaty do pełnej ceny biletu normalnego u kierowcy."
        ]
    )

    # Section 4
    add_section(
        "§ 4. Program Lojalnościowy",
        [
            "1. Zarejestrowani klienci mogą przystąpić do Programu Lojalnościowego KKBus. Przystąpienie do programu jest całkowicie bezpłatne.",
            "2. Punkty lojalnościowe naliczane są automatycznie po zakończeniu odbytej podróży wg przelicznika: 1 przejechany kilometr = 1 punkt lojalnościowy.",
            "3. Zgromadzone punkty mogą być wymieniane w panelu klienta na darmowe bilety jednorazowe na trasie Kraków ↔ Katowice lub zniżki procentowe na kolejne przejazdy.",
            "4. Punkty są przypisane do konta i nie podlegają wymianie na gotówkę ani przeniesieniu na innego pasażera."
        ]
    )

    # Section 5
    add_section(
        "§ 5. Prawa i Obowiązki Pasażera",
        [
            "1. Pasażer ma prawo do bezpiecznego i komfortowego przejazdu zarezerwowanym pojazdem na wybranej trasie zgodnie z rozkładem jazdy.",
            "2. Pasażer jest zobowiązany do stawienia się na przystanku początkowym co najmniej 10 minut przed planowanym odjazdem pojazdu.",
            "3. Wewnątrz pojazdu obowiązuje całkowity zakaz palenia tytoniu, papierosów elektronicznych, spożywania alkoholu oraz substancji odurzających.",
            "4. Przewoźnik ma prawo odmówić wejścia na pokład pasażerom będącym pod widocznym wpływem alkoholu, zachowującym się agresywnie lub zagrażającym bezpieczeństwu przejazdu."
        ]
    )

    # Section 6
    add_section(
        "§ 6. Reklamacje i Odpowiedzialność",
        [
            "1. Wszelkie reklamacje dotyczące usług przewozowych oraz funkcjonowania systemu rezerwacji można składać pisemnie na adres e-mail: kontakt@kkbus.pl w terminie 14 dni od wystąpienia zdarzenia.",
            "2. Prawidłowo zgłoszona reklamacja powinna zawierać imię, nazwisko, adres e-mail pasażera, numer biletu/rezerwacji oraz szczegółowy opis sytuacji.",
            "3. Przewoźnik rozpatruje reklamacje w terminie 14 dni roboczych od dnia ich wpłynięcia.",
            "4. Odpowiedzialność Przewoźnika za opóźnienia lub odwołanie kursów z przyczyn niezależnych od niego (np. ekstremalne warunki pogodowe, blokady dróg) jest ograniczona do zwrotu kosztu biletu."
        ]
    )

    # Output path
    output_dir = "frontend-next/public"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "regulamin-przewozow-kkbus-2026.pdf")
    pdf.output(output_path)
    print(f"PDF generated successfully at: {output_path}")

if __name__ == "__main__":
    generate_pdf()
