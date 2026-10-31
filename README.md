# 💰 Budget Casa - Marco & Giuliana

Un applicativo web leggerissimo (Vanilla SPA) per gestire, calcolare e salvare le quote del budget familiare mensile (Affitto, Utenze e Spesa).

## 🚀 Funzionalità
* **Live Calcolatore:** Gli importi si aggiornano dinamicamente nel report alla digitazione di qualsiasi input. Nessun bisogno di premere "Calcola".
* **Gestione Avanzata Utenze:** Permette l'inserimento di bollette non mensili (Gas bimestrale, Acqua quadrimestrale) che il motore JS converte in automatico in quota mensile.
* **Smart Rounding:** Arrotonda automaticamente le quote finali per eccesso (multiplo di 5€) per generare un fondo cassa automatico sul conto cointestato.
* **Persistenza Locale (Backoffice Base):** Salva lo storico delle modifiche nel `localStorage` del browser, mantenendo traccia di quando cambiano gli stipendi o i costi fissi.
* **Esportazione Nativa PDF:** Il CSS è dotato di media queries (`@media print`) per generare un perfetto report in formato A4 pulito (nascondendo la barra di configurazione e lo storico).

## 🛠️ Stack Tecnologico
* **Frontend:** HTML5, CSS3 (CSS Grid/Flexbox)
* **Logica:** Vanilla JavaScript (ES6)
* **Database/Persistenza:** LocalStorage (Nessun server backend richiesto)

## 📦 Installazione e Avvio Rapido
Poiché l'applicativo è completamente *client-side*, non necessita di container Docker, server PHP o Node.js per funzionare.

1. **Clona la repository:**
   ```bash
   git clone git@github.com:TuoUsername/budget-casa-app.git
   cd budget-casa-app