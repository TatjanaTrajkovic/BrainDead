INSERT INTO question (scenario, text, position, status) VALUES
('Du sprang ut genom Lisebergs grindar och hann knappt vända dig om innan du stod vid spårvagnshållplatsen. Spårvagn 4 står kvar med dörrarna öppna, precis som ryktet sa. Västtrafik-appen visar fortfarande Försenad 2 min - som om det spelade någon roll längre.', 'Vad gör du?', 1, 'ACTIVE'),
('Du har tagit dig genom halva stan utan att stanna, och till slut blir det grönska runt dig istället för asfalt. Du är framme vid Slottsskogen. Djurparkens hägn gapar tomma -sälarna är ute. Inte simmande, inte dykande. Stapplande, över gräsmattan, med ögon som inte borde glimma så där. En säl tuggar lugnt på något som en gång var en joggingsko. Med foten fortfarande i.', 'Vad gör du?', 2, 'ACTIVE'),
('Du tar dig över älven mot Hisingen och står till slut framför Karlatornet, som reser sig 246 meter rakt upp, Nordens högsta byggnad -och enligt ryktet fortfarande halvtomt, för ingen vanlig göteborgare har råd att bo här. Hissen tar sin sötaste tid, som om den inte fattat att världen går under.', 'Hissen fastnar mellan våning 12 och 13, ljuset blinkar, och i trapphuset ekar steg som inte är dina. Vad gör du?', 3, 'ACTIVE'),
('Du lämnar tornet bakom dig och följer trafiken norrut, rakt in i Backaplans kaos - apokalyps eller inte. Bilköer står still i rondellen vid Mio, och skyltarna pekar vidare mot IKEA i Bäckebol -men där är du inte än. Från parkeringen rullar en övergiven shoppingvagn rakt mot dig, fullt lastad, ingen som skjuter den.', 'Hur tar du dig igenom trafikplatsen?', 4, 'ACTIVE'),
('Du tar dig in i Nordstan och möts av en ovanligt tom galleria. Rulltrapporna står stilla, butikerna är övergivna och det hörs ett släpande ljud. Plötsligt ser du en grupp zombier komma runt hörnet. Du behöver ta dig ut innan de upptäcker dig.', 'Vad gör du?', 5, 'ACTIVE'),
('Du når Ullevi och upptäcker att grindarna står öppna. Inne på arenan är det kusligt tyst och på planen ligger väskor, vattenflaskor och annat kvar efter evakueringen. Du behöver fylla på med något användbart innan du fortsätter, men från spelartunneln hörs ett dovt stönande.', 'Vad tar du med dig?', 6, 'ACTIVE'),
('Du lyckas ta dig in på IT-högskolan. Klassrummen är tomma, men några skärmar lyser fortfarande. På en dator står VS Code öppet och i terminalen blinkar ett felmeddelande. Någon verkar ha försökt bygga ett system för att låsa skolans dörrar innan de försvann. Problemet är att koden inte fungerar och du hör zombier i trapphuset.', 'Vad gör du?', 7, 'ACTIVE'),
('Du har med nöd och näppe tagit dig upp till Skansen Lejonet. Nu när du kommit innanför portarna kan inte zombierna nå dig. Än. Skrapande ljud, frenetiskt bankande och desperata vrål hörs från alla dörrar. Du inser att du måste vidare, snabbt. Det finns en gammal stege upp till taket där du klättrar upp och ser att det kommer rök ur Slakthusets skorsten. Kanske finns hjälp att få där?', 'Hur tar du dig dit?', 8, 'ACTIVE'),
('Med sin 30 meter höga skorsten är Slakthuset den perfekta utkiksplatsen för att spana efter en väg till säkerhet. Till obegränsat med köttbullar. Till IKEA Bäckebol. Men först måste du ladda batterierna. Här finns gott om proviant, men det gäller att välja något som ger gott om energi till den sista sträckan mot säkerhet.', 'Vad väljer du?', 9, 'ACTIVE'),
('Du har tagit dig hela vägen till IKEA. Otroligt bra jobbat, nu förtjänar du en lugn stund och ett varmt mål mat. Du går upp till restaurangen och finner där precis som ryktet sa köttbullar i kopiösa mängder. Men det är inga andra överlevare där? Bara en ensam kock som steker köttbullar i en rasande fart. Tankarna snurrar nu i ditt huvud, vem är han? Varför lagar han så mycket mat om ingen annan är här? Plötsligt hör du bankande ljud från kylrummet bakom köket.', 'Vad gör du?', 10, 'ACTIVE');


-- 1. Lisebergstationen
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(1, 'Kollar att vagnen är tom innan du kliver in.', 1.00, 'Smart. Tom vagn, ingen fara. Du andas ut och sätter dig längst bak.'),
(1, 'Springer rakt in och hoppas på det bästa.', 0.80, 'Det gick... hyfsat. En hjärnätare fick tag i en arm i dörren. Inte din arm. Ännu.'),
(1, 'Ropar ''hallå, är det någon här?'' in i vagnen.', 0.50, 'Det var faktiskt någon där. Nu vet den var du är.'),
(1, 'Stannar för att ta en bild till Instagram.', 0.10, 'Fint ljus, usel idé. Storyn blev aldrig postad.');

-- 2. Slottsskogen
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(2, 'Smyger runt hägnen i en vid båge - sälar är trots allt inga sprinters.', 1.00, 'Rätt tänkt. Zombie-säl eller inte, den tar sig fram i fem km/h. Du går i sju.'),
(2, 'Stannar för att göra en video med zombiesälen till TikTok.', 0.10, '7 visningar. Noll retakes. Sälen fick sista ordet - i form av ett bett.'),
(2, 'Försöker rädda skon ur sälens mun.', 0.40, 'Du fick skon. Sälen fick ett nytt intresse: dig.'),
(2, 'Kastar din energidryck på sälen som avledning.', 0.80, 'Den åt burken också. Nu är det en koffeinpeppad zombiesäl. Snabbare än du trodde.');

-- 3. Karlatornet
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(3, 'Ropar igenom dörren om någon kan hjälpa dig ut.', 0.50, 'Du fick svar. Inte från någon du ville prata med.'),
(3, 'Trycker om och om på alla knappar in hissen.', 0.80, 'Ingen effekt på hissen. Stor effekt på ljudet i trapphuset, som nu vet exakt var du är.'),
(3, 'Tar dig ut och fortsätter till fots uppåt via nödtrappan.', 1.00, '61 trappsteg känns som mycket. Mindre mycket än att sitta fast i en glaslåda 150 meter upp.'),
(3, 'Sitter kvar och väntar, det är ju trots allt en lyxfastighet med service dygnet runt.', 0.10, 'Lyxfastighet, ja. Service dygnet runt, nej. Inte den kvällen, och inte för dig.');

-- 4. Backaplan
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(4, 'Kör en skottkärra rakt genom en bilhandlares visningsfönster som genväg.', 0.40, 'Fungerade. Larmet kallade på uppmärksamhet du inte bad om, från håll du inte ville se.'),
(4, 'Försöker köra en gaffeltruck du aldrig kört förr.', 0.20, 'Du körde rakt in i en lagerhylla. Hyllan vann.'),
(4, 'Hoppar upp på en lastpall och åker den som skateboard förbi köerna.', 1.00, 'Absurt, fungerande och förvånansvärt stabilt. Lastpallar är underskattade.'),
(4, 'Kapar en övergiven elsparkcykel och kör för glatta livet.', 0.80, 'Fem procent batteri. Du kom tjugo meter längre än du trodde. Resten sprang du.');

-- 5. Nordstan
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(5, 'Smyger genom en butik och tar personalutgången på baksidan.', 1.00, 'Smart. Du tar dig ut snabbt utan att bli upptäckt.'),
(5, 'Gömmer dig bland skyltdockorna och försöker stå helt still.', 0.80, 'Väldigt effektivt. Zombierna är dåliga på att skilja människor från skyltdockor.'),
(5, 'Börjar springa genom Nordstan mot närmaste utgång.', 0.50, 'Du kommer undan, men ljudet från dina steg får zombierna att följa efter dig.'),
(5, 'Tar rulltrappan upp för att få bättre utsikt över läget.', 0.10, 'Bra utsikt över läget, men en dålig överlevnadsstrategi. Då rulltrappan står still, zombierna hör dina fotsteg och är direkt efter dig.');

-- 6. Ullevi
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(6, 'En ryggsäck med vattenflaskor och ett första hjälpen-kit.', 1.00, 'Perfekt. Vatten och första hjälpen är mycket mer användbart än en souvenir från Ullevi. Du är bättre rustad för resten av vägen.'),
(6, 'En funktionärsjacka och en visselpipa.', 0.40, 'Jackan är snygg men visselpipan mindre smart. Ett enda blås och det börjar röra sig i spelartuneln.'),
(6, 'Några energibars och en flaska sportdryck.', 0.80, 'Bra val. Du får snabb energi och kan fortsätta.'),
(6, 'En fotboll. Man vet aldrig när det blir dags för straffar.', 0.10, 'Snygg boll. Tyvärr verkar zombierna inte vara intresserade av en vänskapsmatch.');

-- 7. IT-Högskolan
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(7, 'Läser felmeddelandet i terminalen och försöker lösa problemet.', 1.00, 'Lyckades! Ett litet kodfel fixas och dörrarna låses. För en gångs skull räddade debugging faktiskt ditt liv.'),
(7, 'Frågar AI om felmeddelandet och hoppas att den vet hur man överlever det här.', 0.80, 'AI levererar! Den förstår felmeddelandet och föreslår en lösning som fungerar. Du löser problemet och hinner vidare innan zombierna kommer ikapp.'),
(7, 'Skriver npm install och hoppas att det löser allt.', 0.50, '247 paket installerades. Tre nya varningar dök upp. Dörren är fortfarande öppen. Zombierna är fortfarande på väg.'),
(7, 'Stänger terminalen. Finns inget felmeddelandet finns inget fel.', 0.10, 'Terminalen är stängd. Felet är inte synlig längre men zombierna är däremot väldigt verkliga.');

-- 8. Skansen Lejonet
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(8, 'Du springer och hoppas på det bästa.', 0.40, 'Du får nog träna lite mer löpning.'),
(8, 'Avfyrar en av Skansen Lejonets kanoner för att skrämma iväg hjärnätarna.', 0.00, 'Vilken smäll!! Sprängde ett stort hål i väggen och släppte in alla zombies.'),
(8, 'Kastar en död råtta du hittar åt IT-Högskolans håll och smyger ut.', 1.00, 'Smart, zombierna kände doften av råttan och du hinner iväg.'),
(8, 'Ropar på hjälp från Slakthuset för att de ska höra dig.', 0.60, 'Kanske hörde de dig, men det gjorde även zombierna.');

-- 9. Slakthuset
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(9, 'Ingen tid att äta, snabbt vidare mot IKEA. Mat finns ju där.', 0.00, 'Du underskattade avståndet och kollapsar halvvägs.'),
(9, 'Du slår upp en eld och tänker att i ett slakthus bör det väl finnas iallafall EN oxfilé? Protein är viktigt.', 0.00, 'God idé, om det inte vore för zombiernas ljuskänslighet. De ser elden direkt.'),
(9, 'Någon har lämnat en oöppnad RedBull, koffein och socker är ju bra energi?', 0.70, 'Du får en himla fart och springer tills du dippar på parkeringen till IKEA. Du tar dig trots allt in med några små bettmärken.'),
(9, 'Du hittar en påse med bananbröd från det gamla konditoriet intill. Kolhydrater FTW!', 1.20, 'Mycket bra val, du får snabb och hållbar energi som hjälper dig hela vägen fram!');

-- 10. Bäckebol Ikea slutstationen
INSERT INTO answer (question_id, text, health_multiplier, feedback) VALUES
(10, 'Sätter dig ner och äter köttbullar i lugn och ro. Frågor får man ta senare.', 0.00, 'Du blir mätt och glad, men känner efter en stund hur du börjar bli sugen på hjärna till efterrätt. Du har blivit infekterad!'),
(10, 'Du tycker något känns fel och bestämmer dig för att prata med kocken.', 0.00, 'Kocken vänder sig långsamt om. Hans ögon är grumliga och han mumlar "ät... ät...". Innan du hinner backa rycker han åt sig din arm.'),
(10, 'Du springer till kylrummet för att se vad som finns där inne.', 1.00, 'Du slänger upp kylrumsdörren och ett tjugotal överlevare vräker ut. Kocken hade låst in dem för att göra dem till nästa omgång köttbullar. Tillsammans övermannar ni den smittade kocken och barrikaderar köket. Ni har klarat er, men köttbullarna lämnar ni orörda. Grattis, du har överlevt apokalypsen!'),
(10, 'Du vänder och går raskt mot utgången, kanske finns det överlevare på BAUHAUS?', 0.00, 'Du lämnar IKEA och styr mot BAUHAUS. Där finns inga överlevare, bara zombies beväpnade med verktyg till vettiga priser.');
