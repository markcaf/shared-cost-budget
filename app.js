// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    calculateAndRender();
});

function calculateAndRender() {
    // 1. Lettura Input
    const incMarco = parseFloat(document.getElementById('income-marco').value) || 0;
    const incGiuliana = parseFloat(document.getElementById('income-giuliana').value) || 0;
    const rent = parseFloat(document.getElementById('expense-rent').value) || 0;
    const utilities = parseFloat(document.getElementById('expense-utilities').value) || 0;
    const vouchers = parseFloat(document.getElementById('marco-vouchers').value) || 0;
    const extraFund = parseFloat(document.getElementById('extra-fund').value) || 0;

    // 2. Calcoli Base
    const totalIncome = incMarco + incGiuliana;
    const percMarco = incMarco / totalIncome;
    const percGiuliana = incGiuliana / totalIncome;

    // Divisione Affitto (Proporzionale)
    const rentMarco = rent * percMarco;
    const rentGiuliana = rent * percGiuliana;

    // Divisione Utenze (50/50)
    const utilitiesMarco = utilities / 2;
    const utilitiesGiuliana = utilities / 2;

    // Totali da versare sul conto (Affitto + Utenze + Fondo Extra)
    let totalMarco = rentMarco + utilitiesMarco + extraFund;
    let totalGiuliana = rentGiuliana + utilitiesGiuliana + extraFund;

    // Arrotondamento per comodità (come avevi richiesto: es 650 e 500)
    totalMarco = Math.ceil(totalMarco / 5) * 5; 
    totalGiuliana = Math.ceil(totalGiuliana / 5) * 5;
    const totalConto = totalMarco + totalGiuliana;

    // 3. Generazione HTML del Report per la Stampa
    const reportHtml = `
        <div class="report-header">
            <h1>Report Budget & Gestione Spese</h1>
            <p>Data Aggiornamento: ${new Date().toLocaleDateString('it-IT')}</p>
        </div>
        
        <table class="report-table">
            <thead>
                <tr>
                    <th>Categoria Spesa</th>
                    <th>Importo Mensile</th>
                    <th>Metodo di Copertura</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Affitto</td><td>€${rent.toFixed(2)}</td><td>Conto Cointestato (Pro-quota)</td></tr>
                <tr><td>Utenze Fisse (Luce, Gas, Acqua, Int.)</td><td>€${utilities.toFixed(2)}</td><td>Conto Cointestato (50/50)</td></tr>
                <tr><td>Spesa Supermercato</td><td>€${vouchers.toFixed(2)} (Buoni) + Resto</td><td>Buoni Marco + Conto Cointestato</td></tr>
            </tbody>
        </table>

        <div class="summary-box">
            <h3>Riepilogo Bonifici Mensili Automatici (1° del Mese)</h3>
            <p><strong>Quota Marco:</strong> €${totalMarco.toFixed(2)}</p>
            <p><strong>Quota Giuliana:</strong> €${totalGiuliana.toFixed(2)}</p>
            <hr>
            <p><strong>Totale Versato sul Conto:</strong> €${totalConto.toFixed(2)}</p>
            <p><em>Nota: Questo importo copre tutte le spese fisse e lascia un margine mensile per la spesa al supermercato e imprevisti, supportato dai buoni pasto di Marco (€${vouchers.toFixed(2)}).</em></p>
        </div>
    `;

    document.getElementById('report-print-area').innerHTML = reportHtml;
    return { totalMarco, totalGiuliana, totalConto }; // Ritorna dati per lo storico
}

function saveToHistory() {
    const note = document.getElementById('history-note').value;
    if (!note) {
        alert("Inserisci una nota per lo storico (es. 'Nuovo stipendio ottobre')");
        return;
    }

    const data = calculateAndRender();
    const historyItem = {
        date: new Date().toLocaleDateString('it-IT'),
        note: note,
        quotaMarco: data.totalMarco,
        quotaGiuliana: data.totalGiuliana
    };

    let history = JSON.parse(localStorage.getItem('budgetHistory')) || [];
    history.unshift(historyItem); // Aggiunge in cima
    localStorage.setItem('budgetHistory', JSON.stringify(history));
    
    document.getElementById('history-note').value = ''; // Reset input
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('budgetHistory')) || [];
    const historyContainer = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyContainer.innerHTML = "<p>Nessuno storico salvato.</p>";
        return;
    }

    historyContainer.innerHTML = history.map(item => `
        <div class="history-item">
            <small>${item.date}</small>
            <strong>${item.note}</strong>
            <p>Marco: €${item.quotaMarco.toFixed(2)} | Giuliana: €${item.quotaGiuliana.toFixed(2)}</p>
        </div>
    `).join('');
}