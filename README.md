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
- [Kodstil och linting](#kodstil-och-linting)
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

Skapa din egen `.env` från mallen och fyll i dina värden. Filen committas aldrig.

```sh
cd backend
cp .env.example .env
```

| Variabel      | Beskrivning                         |
| ------------- | ----------------------------------- |
| `DB_HOST`     | Databasens adress, oftast localhost |
| `DB_USER`     | Ditt MySQL-användarnamn             |
| `DB_PASSWORD` | Ditt MySQL-lösenord                 |
| `DB_NAME`     | Databasens namn, `BrainDead`        |

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

## Kodstil och linting

Prettier och ESLint har tydligt uppdelade ansvarsområden:

- **Prettier formaterar.** All formatering styrs av `.prettierrc.json` i projektroten – en gemensam konfiguration för både backend och frontend.
- **ESLint hittar fel.** ESLint letar efter buggar och felaktig Vue-kod, t.ex. `vue/no-mutating-props` och `vue/require-v-for-key`. Den har inga åsikter om formatering.

Uppdelningen görs av `eslint-config-prettier`, som ligger **sist** i både `backend/eslint.config.js` och `frontend/eslint.config.js` och stänger av alla ESLint-regler som överlappar Prettier. Lägg därför aldrig till regler efter den – då börjar ESLint och Prettier skriva över varandra.

### Kommandon

Kör i `backend/` eller `frontend/`:

```sh
npm run prettier         # formatera om alla filer
npm run prettier:check   # kontrollera formatering utan att ändra något
npm run lint             # kör ESLint
```

### VS Code

Installera de rekommenderade tilläggen när VS Code frågar (Prettier, ESLint och Volar – se `.vscode/extensions.json`). `.vscode/settings.json` är redan inställd så att Prettier formaterar vid varje sparning och ESLint autofixar samtidigt, så i praktiken behöver du inte köra kommandona ovan manuellt.

### CI

Vid push och pull request mot `main` kör [CI-flödet](.github/workflows/ci.yaml) `npm run lint` och `npm run prettier:check` i båda paketen, plus `npm run build` för frontend. Kör `npm run prettier` innan du pushar om formateringskontrollen klagar.

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
- **Kodstil:** Prettier formaterar, ESLint hittar fel – se [Kodstil och linting](#kodstil-och-linting).

## Team
<!-- TODO: länka till github -->
- **Mattias Hagström** -
- **Dennis Seldén** -
- **Tatjana Trajkovic** -
- **Annika Holmqvist** -

