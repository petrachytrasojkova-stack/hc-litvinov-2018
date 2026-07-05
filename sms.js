// Produkční SMS modul bude napojený přes serverovou část / Cloud Function.
// GoSMS API klíč nikdy nepatří přímo do veřejného frontendu.

export async function sendTrainingSms({ training, recipients }) {
  console.info('SMS placeholder:', { training, recipients });
  throw new Error('SMS modul zatím není napojený. Další krok je serverová funkce pro GoSMS.');
}
