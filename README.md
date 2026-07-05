# Tréninky HC Litvínov – produkční základ

Webová aplikace pro správu hráčů, tréninků a později docházky a SMS potvrzení.

## Struktura

```text
hc-litvinov-training/
├─ index.html
├─ src/
│  ├─ app.js
│  ├─ firebase.js
│  ├─ players.js
│  ├─ trainings.js
│  ├─ attendance.js
│  └─ sms.js
├─ styles/
│  └─ main.css
└─ README.md
```

## První spuštění

1. V `src/firebase.js` doplň konfiguraci z Firebase Console.
2. Nahraj soubory do GitHub repozitáře.
3. Zapni GitHub Pages.
4. Ve Firestore vytvoř kolekce automaticky prvním uložením hráče/tréninku.

## Firestore kolekce

### players
- firstName
- lastName
- birthYear
- team
- parentName
- parentPhone
- parentEmail
- active
- createdAt

### trainings
- title
- date
- time
- place
- team
- note
- createdAt

### attendance
- trainingId
- playerId
- status: yes / no / unknown
- confirmedAt

## Důležité

GoSMS API klíč nesmí být ve veřejném JavaScriptu. SMS se budou řešit přes serverovou část nebo Firebase Cloud Function.
