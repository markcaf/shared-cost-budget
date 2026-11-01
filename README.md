# 🏠 Gestione Budget Familiare & Condivisa

Un'applicazione web leggera, moderna e interamente basata su client (Vanilla HTML, CSS, JavaScript) progettata per gestire e suddividere le spese di coppia o di coabitazione in modo equo, trasparente e dinamico. L'app gira interamente nel browser e non richiede alcun database o server backend.

---

## ✨ Funzionalità Principali

* **Nomi Utente Personalizzabili:** I nomi dei partecipanti sono modificabili in tempo reale e si aggiornano automaticamente in tutte le sezioni del report, dei calcoli e dello storico.
* **Redditi & Ripartizione Pro-Quota:** Calcolo automatico della percentuale di carico dell'affitto/mutuo in base ai rispettivi stipendi netti (con opzione per forzare una percentuale manuale).
* **Affitto & Spese Dinamiche con Frequenze:**
  * Gestione dell'affitto principale con scelta della frequenza di pagamento (Mensile, Bimestrale, Trimestrale, Quadrimestrale, Semestrale, Annuale).
  * **Spese Comuni Aggiuntive:** Sezione dinamica in cui è possibile aggiungere o rimuovere infinite voci di spesa (es. utenze, bollette, abbonamenti), indicando per ognuna l'importo e la frequenza di incidenza reale sul mese.
* **Arrotondamenti & Cuscinetto di Risparmio:** Calcolo automatico delle quote arrotondate a multipli di 5€ per garantire un piccolo avanzo (cuscinetto) sul conto cointestato a fine mese.
* **Salvataggio Locale (localStorage):**
  * **Default Personale:** Possibilità di memorizzare la configurazione corrente come predefinita per i prossimi accessi.
  * **Storico Versioni:** Salvataggio delle configurazioni nel tempo con note descrittive ed esportazione/ripristino istantaneo di vecchi accordi.
* **Ottimizzazione Mobile & Stampa PDF:** Design completamente *responsive* ottimizzato per smartphone e tablet, con layout a colonna singola e foglio di stile dedicato per stampare o salvare direttamente il report in PDF.

---

## 📂 Struttura del Progetto

Il progetto è suddiviso in tre file puliti e separati:
1. **`index.html`** — L'interfaccia utente (Dashboard, Sidebar di configurazione, Report, Storico).
2. **`style.css`** — Il foglio di stile con supporto responsive per mobile e regole di stampa.
3. **`app.js`** — La logica di calcolo in tempo reale, la gestione del DOM e la persistenza in `localStorage`.

---

## 🚀 Come Avviare l'App da Smartphone o PC

### 1. In locale
Basta scaricare i tre file (`index.html`, `style.css`, `app.js`) all'interno della stessa cartella e fare doppio click su `index.html` per aprirli con qualsiasi browser web (Chrome, Safari, Firefox).

### 2. Pubblicata online con GitHub Pages (Consigliato per Smartphone)
Per avviare l'app a portata di mano sul cellulare seguire il seguente link web:
1. **[GitHub](https://markcaf.github.io/shared-cost-budget/)**
5. Apri quell'URL dal browser del tuo smartphone (Safari o Chrome o altro) e salvalo tra i preferiti o aggiungilo alla schermata Home come un'app nativa!
