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
- [Spelflöde i frontend](#spelflöde-i-frontend)
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
| Frontend | Vue 3, Vue Router, Vite  |
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

Kör `backend/db/schema.sql` mot din MySQL-server. Skriptet skapar databasen `BrainDead` och alla tabeller. `backend/db/data.sql` fyller på med frågor och svar.

```sh
mysql -u <användare> -p < backend/db/schema.sql
mysql -u <användare> -p < backend/db/data.sql
```

Kör om båda skripten när `schema.sql` har ändrats, till exempel efter att `is_guest` och `auth_token` lades till i `users`.

### 3. Miljövariabler

Skapa din egen `.env` från mallen och fyll i dina värden. Filen committas aldrig.

```sh
cd backend
cp .env.example .env
```

| Variabel       | Beskrivning                                                   |
| -------------- | ------------------------------------------------------------- |
| `DB_HOST`      | Databasens adress, oftast localhost                           |
| `DB_USER`      | Ditt MySQL-användarnamn                                       |
| `DB_PASSWORD`  | Ditt MySQL-lösenord                                           |
| `DB_NAME`      | Databasens namn, `BrainDead`                                  |
| `Vite_API_URL` | Adress till backend-API:t, oftast `http://localhost:3000/api` |

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

| Tabell             | Beskrivning                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `users`            | Spelare med roll och status. Gäster har bara `is_guest` och `auth_token`, registrerade även användarnamn, e-post och lösenord |
| `game_session`     | En spelomgång med aktuell hälsa och status                                                                                    |
| `question`         | Scenario, frågetext och ordning (`position`)                                                                                  |
| `answer`           | Svarsalternativ med hälsomultiplikator och feedback                                                                           |
| `session_question` | Vilket svar spelaren valde på en fråga i en session                                                                           |

Varje spelare identifieras av en slumpad nyckel som ligger i cookien `braindead_token`. Databasen sparar bara en SHA-256-hash av nyckeln i `auth_token`, så en läckt databas räcker inte för att logga in som någon annan. Gäster och registrerade spelare är vanliga rader i `users`, så resten av backend behöver inte skilja på dem. `role` styr behörighet (`PLAYER` eller `ADMIN`), och `is_guest` visar om spelaren har ett konto.

Notera: finished_at i game_session är tiden när omgången lämnat aktivt läge. Sätts både vid COMPLETED och PAUSED, tolkas tillsammans med status.

<!-- TODO: lägg till ER-diagram -->

## API

<!-- TODO: fylls på i takt med att routes byggs -->

| Metod | Endpoint                            | Beskrivning                                                                                                                                                                         |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST  | `/api/auth/guest`                   | Skapar en gästspelare och sätter cookien `braindead_token`, eller returnerar spelaren som redan finns. Svarar `{ user_id, username, role, is_guest, display_name }`                 |
| GET   | `/api/auth/me`                      | Hämtar spelaren som cookien hör till, i samma form som ovan. `display_name` är användarnamnet, eller `Gäst-<user_id>` för gäster. `401` utan cookie                                 |
| POST  | `/api/sessions`                     | Startar en ny omgång, eller returnerar den pågående om en redan finns. Body `{ "forceNew": true }` pausar den pågående omgången och startar en ny.                                  |
| GET   | `/api/sessions/active`              | Hämtar användarens pågående omgång, 404 om ingen finns. Skapar aldrig något.                                                                                                        |
| GET   | `/api/sessions/:sessionId`          | Hämtar en pågående eller avslutad omgång                                                                                                                                            |
| GET   | `/api/sessions/:sessionId/question` | Hämtar nästa fråga med svarsalternativ, `total_questions` och `answered_count`, eller `{ "finished": true }` när inga återstår                                                      |
| POST  | `/api/sessions/:sessionId/answer`   | Sparar ett svar. Body: `{ "answerId": 1 }`                                                                                                                                          |
| GET   | `/api/highscores`                   | Hämtar topp 10: varje spelares bästa avslutade omgång med hälsa över 0, som `{ username, score }`. Gäster visas som `Gäst-<user_id>`. Vid lika poäng vinner den som blev klar först |
| GET   | `/admin/questions`                  | Hämtar alla frågor                                                                                                                                                                  |

Alla `/api/sessions`-endpoints kräver cookien `braindead_token`. Middlewaren `requireUser` slår upp spelaren och sätter `req.user`, och utan giltig cookie svarar de `401`. Endpoints med `:sessionId` kontrollerar dessutom att omgången tillhör spelaren. En annans omgång ger `404`, samma svar som en omgång som inte finns, så det avslöjas inte att den finns. `/api/highscores` och `/api/auth/guest` är öppna, och `/api/auth/me` kräver också cookien.

### Felsvar

Fel från `/api/sessions`-endpoints returneras som `{ "error": "..." }`.

| Status | När                                                   |
| ------ | ----------------------------------------------------- |
| 400    | Svaret hör inte till den aktuella frågan              |
| 401    | Ingen eller ogiltig spelare, cookien saknas           |
| 404    | Omgången finns inte, eller tillhör en annan spelare   |
| 409    | Omgången är redan avslutad (gäller `POST .../answer`) |
| 500    | Serverfel                                             |

## Spelflöde i frontend

All spellogik ligger i composablen `frontend/src/composables/useGame.js`. Komponenterna visar bara state och skickar vidare spelarens val, och ingen komponent anropar API:t direkt.

`phase` styr vad som visas:

```
idle → loading → question ⇄ feedback → finished
```

| Funktion               | Vad den gör                                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start(forceNew)`      | Gör spelaren till gäst om den inte redan är spelare (`ensurePlayer()`), startar en omgång och hämtar första frågan. `forceNew = true` pausar en pågående omgång först |
| `select(answerId)`     | Markerar ett svar utan att skicka det. Går att byta tills svaret är låst                                                                                              |
| `answer()`             | Låser och skickar det valda svaret och sätter `feedback`, `health` och `previousHealth`. Nästa fråga sparas från svaret                                               |
| `next()`               | Visar nästa fråga, eller går till `finished` om det inte finns fler eller hälsan är slut                                                                              |
| `resume()`             | Körs när spelaren klickar "Återuppta omgång" och fortsätter omgången som sparats i `localStorage`                                                                     |
| `checkActiveSession()` | Körs när startsidan visas och sätter `hasActiveSession` så att menyn vet om "Återuppta" går att klicka på. `401` (ny besökare) och `404` betyder ingen omgång         |
| `quit()`               | Avbryter och sätter `phase` till `idle`, så att spelaren skickas till startsidan. Omgången ligger kvar så den kan återupptas                                          |

`totalQuestions` och `answeredCount` kommer från den aktuella frågan och styr `ProgressDots`. De uppdateras när nästa fråga visas och stämmer även efter omladdning.

Spelaren ligger i composablen `useAuth` (`frontend/src/composables/useAuth.js`), som också har delat state. `loadPlayer()` hämtar spelaren via `/api/auth/me` när startsidan visas, och `ensurePlayer()` gör besökaren till gäst. `start()` i `useGame` anropar `ensurePlayer()`, så ID-kortet uppdateras direkt när en ny besökare startar sin första omgång.

State i `useGame` ligger utanför själva funktionen, så alla vyer som anropar `useGame()` delar samma spel. Startsidan kan starta en omgång som spelskärmen sedan visar, och spelet finns kvar när man byter sida.

### Sidor och navigering

Routern ligger i `frontend/src/router/router.js` och vyerna i `frontend/src/views/`. `App.vue` visar loggan och `<RouterView />`.

| Route   | Vy         | Innehåll                                                                                                    |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `/`     | `HomeView` | Startsidan. "Starta spelet" öppnar `SessionMenu` i en overlay (`<dialog>`) där man startar eller återupptar |
| `/game` | `GameView` | Spelskärmen, se nedan                                                                                       |

`GameView` skickar själv tillbaka spelaren till `/` när `phase` blir `idle`, alltså när omgången avbryts eller en start misslyckas. Laddas `/game` om försöker den återuppta omgången, och finns ingen omgång skickas spelaren till `/`.

Startsidan är ett rutnät med ytorna `area-handbook`, `area-prolog`, `area-id` och `area-start`. `area-prolog` visar prologen och `area-id` ID-kortet, de andra innehåller än så länge platshållare. Ersätt en platshållare med komponenten och behåll klassen, så hamnar komponenten på rätt plats. Komponenten ska fylla sin cell med `width: 100%`, det är rutnätet som bestämmer storleken.

Kolumnerna är `minmax(0, 1fr)` i stället för `1fr`. Med bara `1fr` får en kolumn aldrig bli smalare än sitt innehåll, och ID-kortets `aspect-ratio` blåste upp den högra kolumnen så att de andra trycktes ihop.

### Spelskärmen

Under `question` och `feedback` visas spelet i `QuizLayout`. Den är bara ett rutnät med namngivna slots, och `GameView` bestämmer vad som läggs i varje slot. Den mörka panelen runt omkring är `.content-wrapper` i `main.css`.

```
+--------------+-----------------------------+---------------+
|              |  #story     ScenarioBox     |               |
|              +-----------------------------+               |
|  #progress   |  #question  QuestionBox     |  #health      |
|              +--------------+--------------+               |
|  Progress-   |  #answers    |              |  HealthMeter  |
|  Dots        |  AnswerBox   |  AnswerBox   |               |
|              +--------------+--------------+               |
|              |  AnswerBox   |  AnswerBox   |               |
|              +--------------+--------------+               |
|              |  #submit    LockAnswerButton|               |
+--------------+-----------------------------+---------------+
```

Samma komponenter används i båda faserna, `phase` styr vad de visar:

| Slot        | Komponent          | `question`                    | `feedback`                                                            |
| ----------- | ------------------ | ----------------------------- | --------------------------------------------------------------------- |
| `#progress` | `ProgressDots`     | Besvarade frågor av totalt    | Samma                                                                 |
| `#story`    | `ScenarioBox`      | Scenariot                     | Feedbacken under rubriken "Vad hände?" på grå bakgrund (`isFeedback`) |
| `#question` | `QuestionBox`      | Frågan                        | Samma fråga                                                           |
| `#answers`  | `AnswerBox` × 4    | Klickbara, valt svar markeras | Spärrade, valt svar syns kvar                                         |
| `#submit`   | `LockAnswerButton` | "Lås svar"                    | "Nästa fråga >" / "Se resultat"                                       |
| `#health`   | `HealthMeter`      | Nuvarande hälsa               | Hälsan efter svaret, pluppar tonas ut                                 |

`AnswerBox` läggs med `v-for` direkt i `#answers`, så att varje knapp blir en egen cell i 2×2-rutnätet. `QuitButton` ligger under panelen och tar spelaren tillbaka till startsidan.

När `phase` blir `finished` visas `EndCard` i stället för rutnätet. Den visar en levande eller död hjärna beroende på `isAlive`, hur mycket hjärnkapacitet som finns kvar och knappen "Spela igen". Knappen skickar `play-again`, och `GameView` startar då en ny omgång.

### Handboken

`HandbookOpen` visar den uppslagna handboken som en modal ovanpå sidan. Varje sida renderas av `HandbookPage`. Innehållet ligger i `frontend/src/data/handbook.js` som en lista med sidor, så texten kan ändras utan att röra komponenterna.

- Föräldern styr när boken visas med `v-if` och stänger den när komponenten skickar `close`
- Stängs med X, Esc eller klick utanför boken
- Bläddras med pilarna eller ← → på tangentbordet
- Visar två sidor per uppslag, och en sida i taget på skärmar smalare än 768px
- Föregående, stäng och nästa ligger samlade i en rad längst ner, med stäng i mitten

#### Sidformat

Varje sida är ett objekt med en lista `sections`. Varje avsnitt kan ha följande fält, och alla är valfria:

| Fält       | Visas som                                         |
| ---------- | ------------------------------------------------- |
| `title`    | Rubrik (`<h2>`, versaler)                         |
| `subtitle` | Underrubrik (`<h3>`)                              |
| `text`     | Brödtext (`<p>`)                                  |
| `warning`  | Varningstext i röd färg, visas efter `text`       |
| `image`    | Bild, `{ src, alt }`. Fyller höjden som blir kvar |

```js
import bildnamn from '../assets/images/handbook/bild.webp';

export const handbookPages = [
  {
    sections: [
      // Radbrytning med \n i en vanlig sträng
      {
        title: 'Rubrik',
        text: 'Första raden.\nAndra raden.\n\nNytt stycke efter tom rad',
        // Röd text
        warning: 'Varning.',
      },
      {
        subtitle: 'Underrubrik',
        // Radbrytning med backticks, raderna skrivs som de ska visas
        text: `Första raden.
        Andra raden.

        Nytt stycke efter en tom rad.`,
      },
    ],
  },
  {
    sections: [{ image: { src: bildnamn, alt: 'Beskrivning' } }],
  },
];
```

- Radbrytningar: skriv `\n` i en vanlig sträng, eller använd backticks och skriv raderna som de ska visas. `white-space: pre-line` gör att de syns, och indrag i början av rader i backticks tas bort i visningen.
- Bilder måste importeras överst i `handbook.js` och skickas in som variabel, inte som sträng
- Mellan avsnitt läggs ett litet mellanrum. `warning` avslutar ett avsnitt, så text efter en varning blir ett nytt avsnitt
- En sida scrollar (`overflow-y: auto`) om innehållet blir för högt. Korta ner texten eller dela upp på flera sidor om det inte är önskat

Just nu öppnas den med en tillfällig knapp i ytan `area-handbook` i `HomeView`. Knappen ersätts av den stängda handboken.

### Prologen

`PrologueNotebook` visar prologen som ett anteckningsblock i ytan `area-prolog` på startsidan. Texten ligger i `frontend/src/data/prologue.js` som en lista med strängar, en per sida, så texten kan ändras utan att röra komponenten.

- Tar emot sidorna via propen `pages`
- Bläddras med pilarna. Uppåtpilen visas inte på första sidan och nedåtpilen inte på sista
- Sidnumret visas med romerska siffror, till exempel II/VII
- Radbrytningar i texten (`\n`) syns som nya stycken

### ID-kortet

`LoginCard` visar spelarens ID-kort på startsidan och förbereder inloggningen. Komponenten visar bara det den får och skickar events uppåt, så den behöver inte ändras när inloggningen byggs.

| Prop / event  | Gör                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `player`      | Spelaren från `useAuth`. Visar `display_name`, samma namn som i topplistan. `null` visar "OIDENTIFIERAD" |
| `authEnabled` | Visar knapparna "Identifiera" och "Ny identitet". `false` tills inloggningen finns                       |
| `@identify`   | Skickas när spelaren klickar "Identifiera". Ska öppna inloggningen                                       |
| `@signup`     | Skickas när spelaren klickar "Ny identitet". Ska öppna registreringen                                    |
| `@logout`     | Skickas när en registrerad spelare klickar "Stämpla ut". Gäster har ingen sådan knapp                    |

Bakgrunden är bilden `logincard.webp` med papperet och fotot, och texten ligger som HTML ovanpå. Kortet är en container (`container-type: inline-size`) och textstorlekarna anges i `cqw`, procent av kortets bredd. Därför behåller texten sina proportioner när kortet ändrar storlek.

Det finns ingen inloggning än, så `authEnabled` är `false` och knapparna döljs. `@identify`, `@signup` och `@logout` har ingen mottagare i `HomeView`.

### Gemensamma stilar

Färger och typsnitt ligger som CSS-variabler i `frontend/src/assets/base.css`, till exempel `--color-text`, `--color-bg-purple`, `--font-main` och `--font-handwritten`. Där finns också klasser som alla komponenter kan använda:

| Klass           | Används till                                      |
| --------------- | ------------------------------------------------- |
| `.content-card` | Ram och bakgrund för kort, till exempel `EndCard` |
| `.btn`          | Grundstil för alla knappar                        |
| `.btn-purple`   | Lila knapp med inre kant                          |
| `.btn-gray`     | Grå knapp                                         |
| `.btn-large`    | Stor knapp                                        |

Bilder går inte att markera eller dra iväg, det styrs av `img`-regeln längst ner i `base.css`.

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
