//***********************************************************************************************************//
// Varje objekt är en sida, två sidor visas per uppslag.
// Varje sida har avsnitt med valfri title (h2), subtitle (h3), text och image.
// Använd backticks (``) för formatering eller \n för radbrytning (white-space: pre-line i HandbookPage.vue).
// Sidan har overflow-y: auto;, se över textlängd eller dela upp på flera sidor om scroll är oönskat.
// För bild import först sedan "image: { src: import_namn, alt: 'alt-text' }"
//***********************************************************************************************************//

import icecream from '../assets/images/handbook/icecream.webp';

export const handbookPages = [
  {
    sections: [
      {
        title: `Handbok för överlevare`,
        text: `Om du läser detta lever du fortfarande. Grattis.
        Det är mer än man kan säga om halva Avenyn. 
        Boken är skriven av en som klarade sig. Typ.`,
      },
      {
        title: `Så spelar du`,
        text: `1. Läs scenariot.
        2. Läs frågan.
        3. Välj ett av fyra svar. 
        4. Lås in ditt svar, läs utfallet.
        5. Gå vidare med "NÄSTA FRÅGA".`,
        warning: `Ångra dig inte, tveka inte;
        det är de hjärndöda okapabla till.`,
      },
    ],
  },

  {
    sections: [
      {
        title: `Hjärnkapacitet`,
        text: `* Du börjar med en hel hjärna. 
        * Dummare val kostar dig mer hjärnkapacitet.
        * Når du noll är du inte död,
        bara en i mängden;
        som en fredag på Kungsportsavenyn.`,
      },
      {
        title: `Om du måste vila`,
        text: `Klicka på "Avbryt omgång".
        Din hjärna sparas i en fin liten glasburk badande i neongul vätska tills du kommer tillbaka.
        De hjärndöda väntar. 
        De har tid.`,
      },
    ],
  },

  {
    sections: [
      {
        title: `Känn igen en Brain Dead`,
        text: `Släpande steg, tom blick, stönande. Skilj noga på Brain Deads och folk som väntar på spårvagn 11 i snöoväder.
        Skillnaden är subtil.`,
      },
    ],
  },

  {
    sections: [
      {
        title: `Hitta till IKEA Bäckebol`,
        text: `Följ E6:an norrut. Inga fönster, en planlösning ingen tagit sig ut ur på första försöket. 
        Perfekt mot Brain Deads. Följ pilarna på golvet.`,
        warning: `Gå ALDRIG genom en genväg.`,
      },
    ],
  },

  {
    sections: [
      {
        title: `Göteborgsväder`,
        text: `Det regnar. Det har alltid regnat. Brain Deads bryr sig inte och det ska inte du heller.
        Paraply är förresten ett utmärkt vapen.`,
      },
    ],
  },

  {
    sections: [
      {
        title: `Säkra platser`,
        text: `Fiskekyrkan: Brain Deads gillar inte lukten.
        Ullevi: För stort, du hittar aldrig ut.
        Hisingen: Ingen vet, ingen har vågat åka över bron.`,
      },
    ],
  },

  {
    sections: [
      {
        title: `Sista ordet`,
        text: `* Håll hjärnan hel.
        * Ta inga mjukglassar av främlingar.
        Och om någon frågar om du är från Göteborg:
        Svara med en ordvits. 
        Det skrämmer bort det mesta.`,
        image: { src: icecream, alt: 'deadly ice cream' },
      },
    ],
  },
];
