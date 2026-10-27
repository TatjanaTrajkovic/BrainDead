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
- **Hälsa:** ett heltal som startar på 100. Varje svar drar av sin `health_change` (0 för det bästa valet). Omgången tar slut när hälsan når 0, och hälsan som är kvar blir poängen i topplistan
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

Första admin skapas för hand: registrera ett konto i appen och kör sedan

```sql
UPDATE users SET role = 'ADMIN' WHERE username = '<namn>';
```

Lägg aldrig in en admin i `data.sql`. Ett känt lösenord i repot blir en bakdörr.

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
| `PORT`         | Backendens port, `3000` om den inte anges                     |
| `CORS_ORIGIN`  | Frontendens adress, `http://localhost:5173` om den inte anges |
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

| Tabell             | Beskrivning                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `users`            | Spelare med roll och status. Gäster har bara `is_guest` och `auth_token`, registrerade även användarnamn och lösenord |
| `game_session`     | En spelomgång med aktuell hälsa (0–100) och status                                                                    |
| `question`         | Scenario, frågetext, ordning (`position`) och `created_at`. En omgång visar bara frågor som fanns när den startade    |
| `answer`           | Svarsalternativ med feedback och `health_change`, hur mycket hälsa svaret drar av (positivt tal)                      |
| `session_question` | Vilket svar spelaren valde på en fråga i en session                                                                   |

Varje spelare identifieras av en slumpad nyckel som ligger i cookien `braindead_token`. Databasen sparar bara en SHA-256-hash av nyckeln i `auth_token`, så en läckt databas räcker inte för att logga in som någon annan. Gäster och registrerade spelare är vanliga rader i `users`, så resten av backend behöver inte skilja på dem. `role` styr behörighet (`PLAYER` eller `ADMIN`), och `is_guest` visar om spelaren har ett konto.

Varje inloggning skapar en ny nyckel som ersätter den gamla, och utloggning sätter `auth_token` till `NULL`. Eftersom varje spelare bara har en nyckel går det att vara inloggad på en enhet åt gången: loggar man in på en ny enhet blir den gamla utloggad, och utloggning gäller alla enheter. Cookien gäller i ett år, men databasen har ingen egen utgångstid för nyckeln.

Lösenord hashas med Nodes inbyggda `crypto.scrypt` och ett slumpat salt per lösenord, och sparas som `salt:hash` i `password_hash`. Nyckeln i cookien kan hashas med snabba SHA-256 eftersom den är slumpad, men lösenord väljs av människor och går att gissa, så de behöver en långsam hash.

Notera: finished_at i game_session är tiden när omgången lämnat aktivt läge. Sätts både vid COMPLETED och PAUSED, tolkas tillsammans med status.

<!-- TODO: lägg till ER-diagram -->

## API

<!-- TODO: fylls på i takt med att routes byggs -->

| Metod | Endpoint                            | Beskrivning                                                                                                                                                                                                                                                                                             |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST  | `/api/auth/guest`                   | Skapar en gästspelare och sätter cookien `braindead_token`, eller returnerar spelaren som redan finns. Svarar `{ user_id, username, role, is_guest, display_name }`                                                                                                                                     |
| GET   | `/api/auth/me`                      | Hämtar spelaren som cookien hör till, i samma form som ovan. `display_name` är användarnamnet, eller `Gäst-<user_id>` för gäster. `401` utan cookie                                                                                                                                                     |
| POST  | `/api/auth/signup`                  | Registrerar ett konto. Body `{ "username", "password" }`. En gäst uppgraderas och behåller sina poäng, utan cookie skapas ett nytt konto. Svarar `201` i samma form som ovan                                                                                                                            |
| POST  | `/api/auth/login`                   | Loggar in ett registrerat konto. Body `{ "username", "password" }`. Sätter en ny cookie och svarar `200` i samma form som ovan. Fel namn och fel lösenord ger samma `401`. En gäst som loggar in får sina omgångar flyttade till kontot. Har båda en pågående omgång pausas kontots                     |
| POST  | `/api/auth/logout`                  | Loggar ut spelaren: nyckeln slutar gälla och cookien tas bort. Svarar `200`. Gäster får `400`, eftersom de inte kan logga in igen                                                                                                                                                                       |
| POST  | `/api/sessions`                     | Startar en ny omgång, eller returnerar den pågående om en redan finns. Body `{ "forceNew": true }` pausar den pågående omgången och startar en ny.                                                                                                                                                      |
| GET   | `/api/sessions/active`              | Hämtar användarens pågående omgång, 404 om ingen finns. Skapar aldrig något.                                                                                                                                                                                                                            |
| GET   | `/api/sessions/:sessionId`          | Hämtar en pågående eller avslutad omgång                                                                                                                                                                                                                                                                |
| GET   | `/api/sessions/:sessionId/question` | Hämtar nästa fråga med svarsalternativ, `total_questions` och `answered_count`, eller `{ "finished": true }` när inga återstår                                                                                                                                                                          |
| POST  | `/api/sessions/:sessionId/answer`   | Sparar ett svar. Body: `{ "answerId": 1 }`                                                                                                                                                                                                                                                              |
| GET   | `/api/highscores`                   | Hämtar topp 10: varje spelares bästa avslutade omgång med hälsa över 0, som `{ username, score }`. Bara aktiva spelare med rollen `PLAYER` är med, så bannade, inaktiva och admins syns inte. Gäster visas som `Gäst-<user_id>`. Vid lika poäng vinner den som blev klar först                          |
| GET   | `/api/admin/questions`              | Hämtar alla frågor, även inaktiva, med svar sorterade på `position`. Kräver admin                                                                                                                                                                                                                       |
| POST  | `/api/admin/questions`              | Skapar en fråga med exakt 4 svar. Body `{ "scenario", "text", "answers": [{ "text", "health_change", "feedback" }] }`. Frågan läggs sist (`position` = högsta + 1) och visas i nya omgångar, inte i pågående. Fråga och svar sparas i en transaktion. Svarar `201` i samma form som `GET`. Kräver admin |
| PUT   | `/api/admin/questions/:questionId`  | Uppdaterar en fråga och dess 4 svar. Body: `{ scenario, text, answers: [{ answer_id, text, health_change, feedback }] }`. Kräver admin                                                                                                                                                                  |

Middlewaren `loadUser` slår upp spelaren från cookien `braindead_token` och sätter `req.user`. `loadUser()` svarar `401` utan giltig cookie, och används av alla `/api/sessions`-endpoints, `/api/auth/me` och `/api/auth/logout`. `loadUser({ required: false })` släpper igenom anropet även utan spelare. Det används av `/api/auth/signup` och `/api/auth/login`, som ska fungera både för gäster och för nya besökare. Endpoints med `:sessionId` kontrollerar dessutom att omgången tillhör spelaren. En annans omgång ger `404`, samma svar som en omgång som inte finns, så det avslöjas inte att den finns. `/api/highscores` och `/api/auth/guest` är öppna. Alla endpoints under `/api/admin` går genom `loadUser()` och `requireAdmin`, som svarar `403` om spelaren inte har rollen `ADMIN`.

### Felsvar

Fel returneras som `{ "error": "..." }`.

| Status | När                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 400    | Svaret hör inte till den aktuella frågan, signup eller login saknar värden, spelaren är redan registrerad, en gäst försöker logga ut, eller en ny fråga är ogiltig |
| 401    | Ingen eller ogiltig spelare, cookien saknas, eller fel användarnamn eller lösenord vid login                                                                       |
| 403    | Inloggad men inte admin (`/api/admin`)                                                                                                                             |
| 404    | Omgången finns inte, eller tillhör en annan spelare                                                                                                                |
| 409    | Omgången är redan avslutad (`POST .../answer`), eller användarnamnet är upptaget (signup)                                                                          |
| 429    | För många misslyckade inloggningar från samma IP. Lyckade inloggningar räknas inte                                                                                 |
| 500    | Serverfel                                                                                                                                                          |

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

Spelaren ligger i composablen `useAuth` (`frontend/src/composables/useAuth.js`), som också har delat state. `loadPlayer()` hämtar spelaren via `/api/auth/me` när startsidan visas, och `ensurePlayer()` gör besökaren till gäst. `start()` i `useGame` anropar `ensurePlayer()`, så ID-kortet uppdateras direkt när en ny besökare startar sin första omgång. `signup(username, password)` registrerar ett konto via `/api/auth/signup` och lägger svaret i `player`. En gäst uppgraderas och behåller sina poäng, och en ny besökare får ett konto direkt, så ingen gäst behöver skapas först. `login(username, password)` loggar in via `/api/auth/login` och `logout()` loggar ut via `/api/auth/logout`. `logout()` sätter `player` till `null` även om anropet misslyckas. Fel från backend kastas vidare med meddelandet i `err.message`. Formulären finns på ID-kortets baksida, se [ID-kortet](#id-kortet).

State i `useGame` ligger utanför själva funktionen, så alla vyer som anropar `useGame()` delar samma spel. Startsidan kan starta en omgång som spelskärmen sedan visar, och spelet finns kvar när man byter sida.

### Sidor och navigering

Routern ligger i `frontend/src/router/router.js` och vyerna i `frontend/src/views/`.
`App.vue visar loggan (som länkar till /) och <RouterView />`.

| Route   | Vy         | Innehåll                                                                                                    |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `/`     | `HomeView` | Startsidan. "Starta spelet" öppnar `SessionMenu` i en overlay (`<dialog>`) där man startar eller återupptar |
| `/game` | `GameView` | Spelskärmen, se nedan                                                                                       |

`GameView` skickar själv tillbaka spelaren till `/` när `phase` blir `idle`, alltså när omgången avbryts eller en start misslyckas. Laddas `/game` om försöker den återuppta omgången, och finns ingen omgång skickas spelaren till `/`.

Startsidan har tre layouter. Vilken som gäller styrs av media queries, och de måste vara **exakt likadana** i `main.css`, `HomeView.vue` och `isDesktop` i `HomeView.vue`. Annars blandas layouterna ihop vid vissa skärmstorlekar.

- **Stående:** allt som inte är liggande. Två kolumner (`.col`), loggan ovanför.
- **Desktop:** `min-width: 768px`, `min-height: 501px`, liggande och `pointer: fine`. Grid med tre lika breda kolumner. Topplistan ingår i handboksbilden.
- **Liggande telefon/surfplatta:** liggande OCH `max-width: 767px` eller `pointer: coarse` eller `max-height: 500px`. Loggan och ID-kortet överst. topplista, handbok, prolog och startknapp på raden under.

Ytorna heter `area-handbook`, `area-highscore`, `area-prolog`, `area-id` och `area-start`. Komponenterna ska fylla sin yta, och det är griden som bestämmer storleken. `area-highscore` renderas bara när `isDesktop` är `false`, eftersom topplistan på desktop är en del av handboksbilden (`HandbookHighscore part="both"`).

Kolumnerna är `minmax(0, 1fr)` i stället för `1fr`. Med bara `1fr` får en kolumn aldrig bli smalare än sitt innehåll, och ID-kortets `aspect-ratio` blåste upp den högra kolumnen så att de andra trycktes ihop.

`SessionMenu` visar knapparna bredvid varandra i alla liggande lägen och under varandra i stående.

#### Storlek i liggande kompaktläge

All storlek härleds från en enda variabel, `--bild-h` (höjden på de fyra bilderna), som sätts i `main.css`. Den är det minsta av vad bredden och höjden räcker till, så allt skalar ihop. `--topp` centrerar kompositionen lodrätt. Loggan är `position: absolute` och placeras utifrån samma variabel. Varje bild får bredd `min(100cqw, 100cqh × proportion)` i sin yta, så boxen blir exakt lika stor som bilden. Byter du en bild, uppdatera proportionen (`aspect-ratio`) i `HomeView.vue`.

På desktop styrs bredden av `--content-w` i `base.css`, och loggans höjd av `--header-h`.

#### Testa layouterna

Kontrollera alltid stående mobil, liggande mobil, en surfplatta och PC. I Chrome/Edge DevTools får du `pointer: coarse` genom att välja en enhetsprofil (till exempel iPad). Vald "Responsive" utan enhet räknas som mus. Testa också ett lågt PC-fönster (höjd under 500 px), som ska ge kompaktläget.

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
- Visar två sidor per uppslag i alla liggande lägen (även liggande telefon), och en sida i taget i stående läge
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

`LoginCard` visar spelarens ID-kort på startsidan. Kortet går att vända: på baksidan ligger formuläret för inloggning och registrering (`IdForm`).

| Knapp på framsidan | Visas för            | Gör                                                                    |
| ------------------ | -------------------- | ---------------------------------------------------------------------- |
| IDENTIFIERA        | Ny besökare och gäst | Vänder kortet och visar inloggningen (`IdForm` med `mode="login"`)     |
| NY IDENTITET       | Ny besökare och gäst | Vänder kortet och visar registreringen (`IdForm` med `mode="signup"`)  |
| STÄMPLA UT         | Registrerad spelare  | Loggar ut med `logout()`. Misslyckas det visas "Kunde inte stämpla ut" |

| Prop / event      | Gör                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `player`          | Spelaren från `useAuth`. Visar `display_name`, samma namn som i topplistan. `null` visar "OIDENTIFIERAD" |
| `@player-changed` | Skickas efter inloggning, registrering och utloggning. `HomeView` anropar då `checkActiveSession()`      |

`IdForm` har två fält, Namn och Lösen, och anropar `signup()` eller `login()` i `useAuth`. Vid registrering kontrolleras namn och lösenord direkt när spelaren skriver, med samma regler som backend (`frontend/src/utils/validateUsername.js` och `validatePassword.js`). Ändras reglerna i backend måste de filerna ändras också. Vid inloggning räcker det att fälten är ifyllda. Fel från backend, till exempel "Användarnamnet är upptaget", visas under fälten. TILLBAKA eller Esc vänder tillbaka kortet utan att något skickas.

Sidan som är vänd bort är `inert`, så den går inte att klicka eller tabba till. Med "minska rörelse" påslaget byts sidorna utan animation.

Bakgrunden är bilden `logincard.webp` med papperet och fotot, och texten ligger som HTML ovanpå. Baksidan använder `idPlaceholderClean.webp`, samma kort utan fotot. Kortet är en container (`container-type: inline-size`) och textstorlekarna anges i `cqw`, procent av kortets bredd. Därför behåller texten sina proportioner när kortet ändrar storlek.

### Gemensamma stilar

Färger och typsnitt ligger som CSS-variabler i `frontend/src/assets/base.css`, till exempel `--color-text`, `--color-bg-purple`, `--font-main` och `--font-handwritten`. Där finns också klasser som alla komponenter kan använda:

| Klass           | Används till                                      |
| --------------- | ------------------------------------------------- |
| `.content-card` | Ram och bakgrund för kort, till exempel `EndCard` |
| `.btn`          | Grundstil för alla knappar                        |
| `.btn-purple`   | Lila knapp med inre kant                          |
| `.btn-gray`     | Grå knapp                                         |
| `.btn-large`    | Stor knapp som skalar med sin bredd, se nedan     |

#### Användning av `.btn-large`

```html
<button class="btn-large"><span>Text</span></button>
```

- Texten **måste** ligga i en `<span>`. Knappen är en container, och textstorleken (`18cqi`) mäts mot knappens bredd.
- Knappens bredd måste bestämmas utifrån (`width: 100%` ligger redan i klassen, eller sätt en fast bredd). Ligger knappen i en förälder som själv saknar bredd kollapsar den.
- Höjden följer texten. Smalare knapp ger mindre text som bryts på flera rader, och knappen växer nedåt i stället för att ändra bredd.
- Bordern skalar med knappen. Det gör föräldern till en container automatiskt (`:has(> .btn-large)` i `base.css`), så du behöver inte göra något.
- Sätt inga egna `font-size` på `span` i komponenten, de skriver över klassens värde.

Bilder och knappar går inte att markera, och bilder går inte att dra iväg. Det styrs av reglerna längst ner i `base.css`.

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
