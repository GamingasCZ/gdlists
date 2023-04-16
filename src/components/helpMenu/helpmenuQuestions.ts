import axios from "axios";

interface question {
  question: string;
  answer: string;
  startSection?: string;
}

export const qa: question[] = [
  {
    startSection: "Seznamy",
    question: "Připínání seznamů",
    answer:
      "Pokud se k nějakému seznamu často vracíš, můžeš si ho připnou a zobrazí se na domovské stránce. Naráz můžeš mít připlých až 5 seznamů.",
  },
  {
    question: "Upravování a mazání seznamů",
    answer:
      "Upravit seznam můžeš na stránce se seznamem, kliknutím na 'Upravit'. V editoru lze seznam smazat. Pro upravování seznamu musíš být přihlášený do účtu, který nahrál seznam.",
  },
  {
    startSection: "Editor",
    question: "Používání editoru",
    answer: `# Záhlaví \n
                 *Ikonka oka zapne náhled seznamu\n
                 *Ikonka hvězdičky ti umožní přidávat levely, které jsi v seznamech přidal do oblíbených\n
                 *Ikonka pluska přídá level. V seznamu můžeš mít max. 50 levelů. \n
                 # Karta levelu
                 *Lupa vedle pole s ID levelu najde level podle zadaného ID levelu
                 *Lupa mezi polem se jménem levelu a tvůrcem najde buďto nejstahovanější level se **zadaným jménem**, nejnovější level od **zadaného tvůrce**, nebo pokud jsou vyplněna obě pole, *level od zadaného tvůrce*.
                 `,
  },
  {
    question: "Soukromé seznamy",
    answer:
      "Soukromé seznamy se nezobrazí veřejně a můžeš se k nim dostat jen speciálním odkazem. Můžeš je kdykoliv upravit a udělat je veřejné.",
  },
  {
    question: "Hádání obtížností",
    answer:
      "Pokud zapneš hádání obtížností, seznam se bude postupně odemykat po tom, co zkusíš hádat obtížnosti a rating levelů. V editoru, tlačítko s obtížností, značí hádání obtížností. Tlačítko s plamínekem značí rating levelu.",
  },
  {
    question: "Průsvitné karty",
    answer:
      "Po zapnutí budou v seznamu karty levelů průsvitné. Průsvitné karty nejlíp fungují s nějakým obrázkem seznamu.",
  },
  {
    question: "Licence",
    answer: "todo",
  },
];
