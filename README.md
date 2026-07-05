# HC Litvínov – ročník 2018

První ostrý balíček pro GitHub Pages + Firebase Firestore.

## Nahrání na GitHub
1. Otevři repozitář `hc-litvinov-2018`.
2. Klikni na **Add file → Upload files**.
3. Nahraj `index.html` a `README.md`.
4. Klikni na **Commit changes**.
5. V repozitáři otevři **Settings → Pages**.
6. Source: **Deploy from a branch**.
7. Branch: **main**, folder **/root**.
8. Ulož.

Aplikace bude dostupná na adrese podobné:
`https://petrachytrasojkova-stack.github.io/hc-litvinov-2018/`

## Firebase
Aplikace je napojená na projekt `hc-litvinov-2018`.
Při prvním spuštění si založí výchozí trénink `Léto 2026` a základní cvičení.

## GoSMS
SMS je zatím připravená jako placeholder. Pro skutečné odesílání je potřeba doplnit Firebase Cloud Function, aby Client Secret nebyl v HTML.
