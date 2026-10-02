# BrainDead 🧟

BrainDead är ett webbaserat zombiespel där spelaren ställs inför vägval och väljer mellan olika alternativ för att ta sig vidare och överleva.

## Storyline: 
Du kommer aldrig minnas exakt när det vände. Bara att du stod i kö till Balder på Lisebergs säsongsavslutning, telefonen i handen, och tänkte att kvällen inte kunde bli sämre.
Den kunde det. Vid glasskiosken bredvid körde en sommarvikarie den sista satsen mjukglass för säsongen på en maskin som stått på för länge. 
Han brydde sig inte – skiftet slutade om tjugo minuter. Det tog en kvart innan folk omkring dig bara stirrade, tomma, som om någon stängt av dem.
Du sprang. Ut genom grindarna, förbi en spårvagn som stod övergiven med dörrarna öppna på Örgrytevägen – föraren borta, en sko kvar på trappsteget. 
Mot Avenyn hördes släpande steg och ett lågt, hest stönande som inte kom från en enda strupe utan från dussintals, allt närmare. Nu, timmar senare, är hela stan nere – Hisingen, Majorna, Haga, allt – och ingen hann fatta vad som hände förrän det redan var för sent.

Ett rykte sprider sig ändå, från röst till röst: IKEA i Bäckebol står fortfarande. Inga fönster, en planlösning ingen någonsin lyckats ta sig ut ur på första försöket, och köttbullar så långt ögat når. Dit är du på väg.
Det enda som står mellan dig och dem är det som finns kvar i ditt huvud. Varje beslut du tar härifrån kostar dig något – eller räddar dig. Håll hjärnan hel. Spelet börjar nu.

## Innehåll

- [Om spelet](#om-spelet)
- [Tech stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Kom igång](#kom-igång)
- [Databasmodell](#databasmodell)
- [API](#api)
- [Arbetssätt](#arbetssätt)
- [Team](#team)

## Om spelet

- **Så fungerar det:** scenario → fråga → svarsalternativ → feedback
- **Hälsa:** startar på 1.00 och påverkas av varje val (`health_multiplier`)
- **Roller:** `PLAYER` och `ADMIN`

<!-- TODO: lägg till skärmdump eller GIF när UI:t finns -->

## Tech stack

| Del      | Teknik                   |
| -------- | ------------------------ |
| Frontend | Vue 3, Vite              |
| Backend  | Node.js, Express 5, CORS |
| Databas  | MySQL (mysql2)           |

## Projektstruktur

```
BrainDead/
├── backend/                   # Express-API + schema.sql
├── frontend/                  # Vue 3 + Vite
└── pull_request_template.md   # PR-mall med Definition of Done
```

## Kom igång

### Förutsättningar

- Node.js
- MySQL

### 1. Klona repot

```sh
git clone https://github.com/TatjanaTrajkovic/BrainDead.git
cd BrainDead
```

### 2. Databas

Kör `backend/schema.sql` mot din MySQL-server. Skriptet skapar databasen `BrainDead` och alla tabeller.

```sh
mysql -u <användare> -p < backend/schema.sql
```

### 3. Miljövariabler

<!-- TODO: fyll i när .env-hantering är på plats -->

| Variabel | Beskrivning |
| -------- | ----------- |
|          |             |

### 4. Backend

```sh
cd backend
npm install
node app.js
```

Servern startar på http://localhost:3000.

### 5. Frontend

```sh
cd frontend
npm install
npm run dev
```

Appen körs på http://localhost:5173.

## Databasmodell

| Tabell             | Beskrivning                                         |
| ------------------ | --------------------------------------------------- |
| `users`            | Konto med användarnamn, e-post, roll och status     |
| `game_session`     | En spelomgång med aktuell hälsa och status          |
| `question`         | Scenario, frågetext och ordning (`position`)        |
| `answer`           | Svarsalternativ med hälsomultiplikator och feedback |
| `session_question` | Vilket svar spelaren valde på en fråga i en session |

<!-- TODO: lägg till ER-diagram -->

## API

<!-- TODO: fylls på i takt med att routes byggs -->

| Metod | Endpoint | Beskrivning |
| ----- | -------- | ----------- |
|       |          |             |

## Arbetssätt

- **Brancher:** Ny branch för varje feature (feat/) och (fix/).
- **Pull requests:** följ [PR-mallen](pull_request_template.md) och dess Definition of Done. Minst en annan gruppmedlem ska granska och godkänna.
- **Kodstil:** koden formateras med Prettier.

## Team
<!-- TODO: länka till github -->
- **Mattias Hagström** -
- **Dennis Seldén** -
- **Tatjana Trajkovic** -
- **Annika Holmqvist** -

