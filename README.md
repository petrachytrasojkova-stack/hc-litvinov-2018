# Tréninky HC Litvínov

Produkční základ aplikace pro správu hráčů, tréninků, docházky a SMS.

## Co je hotové

- základní struktura moderní webové aplikace přes Vite,
- modul Hráči,
- modul Tréninky,
- připravený modul Docházka,
- připravený modul SMS,
- připravené napojení na Firebase Firestore.

## Po nahrání do GitHubu

1. Otevři soubor `src/firebase.js`.
2. Nahraď hodnoty `DOPLNIT` konfigurací z Firebase Console.
3. V terminálu spusť:

```bash
npm install
npm run dev
```

## Důležité

GoSMS API klíč se nesmí ukládat do veřejného GitHub repozitáře ani přímo do JavaScriptu v prohlížeči. SMS modul bude později napojen přes bezpečnou serverovou část.
