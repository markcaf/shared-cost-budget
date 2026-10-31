# 💰 Budget Casa - Gestione Spese di Coppia (Marco & Giuliana)

Applicativo web local-first (Vanilla JavaScript, HTML5 e CSS3) progettato per la gestione, il calcolo dinamico e la rendicontazione delle spese domestiche condivise (affitto, utenze, spesa alimentare e fondi di riserva).

## 🚀 Funzionalità Principali

* **Calcolatore Live in Tempo Reale:** Qualsiasi modifica nei campi della barra laterale (stipendi, affitto, bollette, buoni pasto o aggiustamenti) ricalcola istantaneamente il report, le percentuali e le quote finali.
* **Gestione Frequenze Utenze:** Converte automaticamente in importi mensili reali le bollette con cadenza bimestrale (es. Gas) o quadrimestrale (es. Acqua).
* **Affitto Proporzionale o Manuale:** Possibilità di calcolare la divisione dell'affitto in base ai redditi netti oppure forzare una percentuale fissa a carico.
* **Arrotondamenti e Aggiustamenti Finali (+/-):** Permette di arrotondare liberamente le quote finali di ciascuno con un delta positivo o negativo, ricalcolando automaticamente il totale sul conto cointestato.
* **Storico Interattivo con Ripristino:** Salva le configurazioni nel `localStorage` del browser. Cliccando su un elemento dello storico, i dati vengono ricaricati istantaneamente nel form.
* **Persistenza Default Personale:** Puoi salvare la tua configurazione attuale come Default permanente o ripristinare in un click i valori di base originali.
* **Sezioni Dinamiche Operative:** I blocchi di logica di calcolo e operatività condivisa (Passaggi 1-4) ricevono importi e date dinamiche in base alla configurazione attiva o allo storico selezionato.
* **Esportazione PDF / Stampa Ottimizzata:** Foglio di stile CSS dedicato (`@media print`) che nasconde i controlli e stampa un report A4 pulito ed elegante.

---

## 🛠️ Stack Tecnologico
* **Frontend:** HTML5, CSS3 (Flexbox & CSS Grid)
* **Logica:** Vanilla JavaScript (ES6)
* **Persistenza Dati:** `localStorage` del browser (Nessun database o server backend richiesto).

---

## 📦 Struttura delProgetto
Il progetto è diviso in tre file puliti all'interno della stessa cartella:
1. `index.html` — Struttura della dashboard, form di configurazione e layout del report.
2. `style.css` — Regole di stile, design responsive e regole di stampa (@media print).
3. `app.js` — Motore di calcolo, gestione del `localStorage`, eventi live e ripristino storico.

---

## 🚀 Installazione e Avvio Rapido

Trattandosi di un'applicazione basata su file statici (`client-side`), non richiede container Docker, Lando o server PHP per l'esecuzione locale.

1. **Clona la repository privata:**
   ```bash
   git clone git@github.com:TuoUsername/budget-coppia-app.git
   cd budget-coppia-app
   ```
2. **Avvio:**
   * Apri semplicemente il file `index.html` con un doppio click nel tuo browser (Chrome, Firefox, Safari, Edge).
   * Oppure avvialo tramite un server locale (es. estensione *Live Server* di VS Code o un comando rapido PHP in ambiente WSL: `php -S localhost:8000`).

---

## 📖 Guida all'Uso

1. **Configura i Dati:** Inserisci gli stipendi netti, l'affitto e gli importi delle singole utenze nella barra laterale sinistra.
2. **Personalizza le Quote:** Usa i toggle per forzare una percentuale di affitto manuale, una quota fissa o applica un delta (+/-) nella sezione *Aggiustamenti Finali* per ottenere cifre tonde (es. 500€).
3. **Consulta il Report:** La dashboard centrale calcolerà in tempo reale i totali, la scomposizione delle utenze e le istruzioni operative aggiornate.
4. **Salva nello Storico:** Inserisci una nota descrittiva (es. "Configurazione con conguaglio gas") e clicca **Salva nello Storico**. Potrai richiamarla o cancellarla in qualsiasi momento.
5. **Imposta Default:** Clicca su **Imposta come Default** per fare in modo che l'app si apra sempre con i tuoi parametri preferiti.
6. **Esporta in PDF:** Clicca su **Scarica PDF / Stampa** per generare il documento pronto per l'archiviazione.