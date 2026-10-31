document.addEventListener('DOMContentLoaded', () => {
    loadDefaultConfig();

    const manualRentToggle = document.getElementById('manual-rent-toggle');
    const manualRentContainer = document.getElementById('manual-rent-container');
    manualRentToggle.addEventListener('change', () => {
        manualRentContainer.style.display = manualRentToggle.checked ? 'block' : 'none';
        calculateLiveReport();
    });

    const manualQuotaToggle = document.getElementById('manual-quota-toggle');
    const manualQuotaContainer = document.getElementById('manual-quota-container');
    manualQuotaToggle.addEventListener('change', () => {
        manualQuotaContainer.style.display = manualQuotaToggle.checked ? 'block' : 'none';
        calculateLiveReport();
    });

    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateLiveReport);
    });

    document.getElementById('btn-save').addEventListener('click', saveToHistory);
    document.getElementById('btn-set-default').addEventListener('click', saveAsDefault);
    document.getElementById('btn-reset-default').addEventListener('click', resetToFactoryDefault);
    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.getElementById('btn-clear-history').addEventListener('click', clearHistory);

    document.getElementById('report-date').innerText = new Date().toLocaleDateString('it-IT');
    
    renderHistory();
    calculateLiveReport(); 
});

function saveAsDefault() {
    const currentConfig = {
        incMarco: document.getElementById('income-marco').value,
        incGiuliana: document.getElementById('income-giuliana').value,
        manualRentChecked: document.getElementById('manual-rent-toggle').checked,
        rentPercMarco: document.getElementById('rent-perc-marco').value,
        rent: document.getElementById('exp-rent').value,
        power: document.getElementById('exp-power').value,
        gas: document.getElementById('exp-gas').value,
        internet: document.getElementById('exp-internet').value,
        water: document.getElementById('exp-water').value,
        vouchers: document.getElementById('marco-vouchers').value,
        extraFund: document.getElementById('extra-fund').value,
        manualQuotaChecked: document.getElementById('manual-quota-toggle').checked,
        forcedMarcoQuota: document.getElementById('forced-marco-quota').value,
        adjMarco: document.getElementById('adj-marco').value,
        adjGiuliana: document.getElementById('adj-giuliana').value
    };
    
    localStorage.setItem('budgetDefaultConfig', JSON.stringify(currentConfig));
    alert("Configurazione salvata come Default! Al prossimo accesso verranno caricati questi valori in automatico.");
}

function loadDefaultConfig() {
    const savedDefault = JSON.parse(localStorage.getItem('budgetDefaultConfig'));
    
    if (savedDefault) {
        document.getElementById('income-marco').value = savedDefault.incMarco;
        document.getElementById('income-giuliana').value = savedDefault.incGiuliana;
        
        document.getElementById('manual-rent-toggle').checked = savedDefault.manualRentChecked;
        document.getElementById('manual-rent-container').style.display = savedDefault.manualRentChecked ? 'block' : 'none';
        document.getElementById('rent-perc-marco').value = savedDefault.rentPercMarco;

        document.getElementById('exp-rent').value = savedDefault.rent;
        document.getElementById('exp-power').value = savedDefault.power;
        document.getElementById('exp-gas').value = savedDefault.gas;
        document.getElementById('exp-internet').value = savedDefault.internet;
        document.getElementById('exp-water').value = savedDefault.water;

        document.getElementById('marco-vouchers').value = savedDefault.vouchers;
        document.getElementById('extra-fund').value = savedDefault.extraFund;

        document.getElementById('manual-quota-toggle').checked = savedDefault.manualQuotaChecked;
        document.getElementById('manual-quota-container').style.display = savedDefault.manualQuotaChecked ? 'block' : 'none';
        document.getElementById('forced-marco-quota').value = savedDefault.forcedMarcoQuota;

        document.getElementById('adj-marco').value = savedDefault.adjMarco;
        document.getElementById('adj-giuliana').value = savedDefault.adjGiuliana;
    }
}

function resetToFactoryDefault() {
    if(confirm("Vuoi ripristinare i valori iniziali di base? Il tuo Default personalizzato verrà cancellato.")) {
        localStorage.removeItem('budgetDefaultConfig');
        location.reload(); 
    }
}

function getMonthName(date) {
    return date.toLocaleString('it-IT', { month: 'long' });
}

function getSixMonthsLaterString(baseDateString) {
    let baseDate;
    if (baseDateString) {
        const parts = baseDateString.split('/');
        if (parts.length === 3) {
            baseDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            baseDate = new Date();
        }
    } else {
        baseDate = new Date();
    }

    baseDate.setMonth(baseDate.getMonth() + 6);
    const monthName = baseDate.toLocaleString('it-IT', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    return `${capitalizedMonth} ${baseDate.getFullYear()}`;
}

function calculateLiveReport(referenceDateString = null) {
    const incMarco = parseFloat(document.getElementById('income-marco').value) || 0;
    const incGiuliana = parseFloat(document.getElementById('income-giuliana').value) || 0;
    
    const rent = parseFloat(document.getElementById('exp-rent').value) || 0;
    const power = parseFloat(document.getElementById('exp-power').value) || 0;
    const gasBimonthly = parseFloat(document.getElementById('exp-gas').value) || 0;
    const internet = parseFloat(document.getElementById('exp-internet').value) || 0;
    const waterQuarterly = parseFloat(document.getElementById('exp-water').value) || 0;
    
    const vouchers = parseFloat(document.getElementById('marco-vouchers').value) || 0;
    const extraFund = parseFloat(document.getElementById('extra-fund').value) || 0;

    const gasMonthly = gasBimonthly / 2;
    const waterMonthly = waterQuarterly / 4;
    const totalUtilities = power + gasMonthly + internet + waterMonthly;

    let percMarco, percGiuliana;
    const manualRentChecked = document.getElementById('manual-rent-toggle').checked;
    
    if (manualRentChecked) {
        const manualPerc = parseFloat(document.getElementById('rent-perc-marco').value) || 58;
        percMarco = manualPerc / 100;
        percGiuliana = (100 - manualPerc) / 100;
    } else {
        const totalIncome = incMarco + incGiuliana;
        percMarco = totalIncome ? (incMarco / totalIncome) : 0.58;
        percGiuliana = totalIncome ? (incGiuliana / totalIncome) : 0.42;
    }

    const rentMarco = rent * percMarco;
    const rentGiuliana = rent * percGiuliana;
    const utilHead = totalUtilities / 2;

    const baseMarco = rentMarco + utilHead + extraFund;
    const baseGiuliana = rentGiuliana + utilHead + extraFund;

    let finalMarco, finalGiuliana;
    let noteText = "";

    const manualQuotaChecked = document.getElementById('manual-quota-toggle').checked;
    if (manualQuotaChecked) {
        finalMarco = parseFloat(document.getElementById('forced-marco-quota').value) || 650;
        const totalTargetConto = Math.ceil(baseMarco / 5) * 5 + Math.ceil(baseGiuliana / 5) * 5;
        finalGiuliana = totalTargetConto - finalMarco;
        noteText = `Quota base Marco forzata manualmente a €${finalMarco.toFixed(2)}, quota Giuliana bilanciata.`;
    } else {
        finalMarco = Math.ceil(baseMarco / 5) * 5;
        finalGiuliana = Math.ceil(baseGiuliana / 5) * 5;
        noteText = `Gli importi sono calcolati automaticamente (arrotondati a multipli di 5€ per garantire avanzo).`;
    }

    const adjMarco = parseFloat(document.getElementById('adj-marco').value) || 0;
    const adjGiuliana = parseFloat(document.getElementById('adj-giuliana').value) || 0;
    
    finalMarco += adjMarco;
    finalGiuliana += adjGiuliana;
    
    if (adjMarco !== 0 || adjGiuliana !== 0) {
        noteText += ` Applicato aggiustamento manuale (Marco: ${adjMarco > 0 ? '+'+adjMarco : adjMarco}€, Giuliana: ${adjGiuliana > 0 ? '+'+adjGiuliana : adjGiuliana}€).`;
    }

    const finalTotal = finalMarco + finalGiuliana;
    
    // Calcolo Avanzo e Spesa stimata
    const totalFixedExpenses = rent + totalUtilities;
    const surplus = finalTotal - totalFixedExpenses;
    const totalGroceriesAvailable = surplus + vouchers;

    // DOM Updates - TABELLA E RIEPILOGO
    document.getElementById('perc-marco').innerText = (percMarco * 100).toFixed(1) + '%';
    document.getElementById('perc-giuliana').innerText = (percGiuliana * 100).toFixed(1) + '%';
    
    document.getElementById('tot-rent').innerText = '€' + rent.toFixed(2);
    document.getElementById('tot-utilities').innerText = '€' + totalUtilities.toFixed(2);
    
    document.getElementById('td-rent').innerText = '€' + rent.toFixed(2);
    document.getElementById('td-power').innerText = '€' + power.toFixed(2);
    document.getElementById('td-gas').innerText = '€' + gasMonthly.toFixed(2);
    document.getElementById('td-internet').innerText = '€' + internet.toFixed(2);
    document.getElementById('td-water').innerText = '€' + waterMonthly.toFixed(2);
    document.getElementById('td-utilities').innerText = '€' + totalUtilities.toFixed(2);
    
    document.getElementById('td-groceries').innerText = '€' + vouchers.toFixed(2) + ' (in Buoni) + Resto';

    document.getElementById('final-marco').innerText = '€' + finalMarco.toFixed(2);
    document.getElementById('final-giuliana').innerText = '€' + finalGiuliana.toFixed(2);
    document.getElementById('final-total').innerText = '€' + finalTotal.toFixed(2);
    document.getElementById('custom-quota-note').innerText = "Nota: " + noteText;

    // ==========================================
    // AGGIORNAMENTO DINAMICO LOGICA (Sez. 3)
    // ==========================================
    document.getElementById('logic-rent').innerText = '€' + rent.toFixed(0);
    document.getElementById('logic-perc').innerText = (percMarco * 100).toFixed(0) + '% Marco / ' + (percGiuliana * 100).toFixed(0) + '% Giuliana';
    document.getElementById('logic-extra-fund').innerText = extraFund.toFixed(0) + '€';
    document.getElementById('logic-vouchers').innerText = vouchers.toFixed(0) + '€';
    document.getElementById('logic-total-groceries').innerText = totalGroceriesAvailable.toFixed(0);
    document.getElementById('logic-surplus').innerText = surplus.toFixed(0);

    // ==========================================
    // AGGIORNAMENTO DINAMICO BLOCCHI OPERATIVITÀ (Sez. 4)
    // ==========================================
    document.getElementById('ops-quota-marco').innerText = '€' + finalMarco.toFixed(0);
    document.getElementById('ops-quota-giuliana').innerText = '€' + finalGiuliana.toFixed(0);

    let baseDate = new Date();
    if(referenceDateString) {
        const datePart = referenceDateString.split(' - ')[0];
        const parts = datePart.split('/');
        if(parts.length === 3) {
             baseDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
    }

    const currentMonthName = getMonthName(baseDate);
    const sixMonthsDateString = getSixMonthsLaterString(referenceDateString ? referenceDateString.split(' - ')[0] : null);

    document.getElementById('ops-check-mensile').innerText = "di " + currentMonthName;
    document.getElementById('ops-check-semestrale').innerText = sixMonthsDateString;

    return { finalMarco, finalGiuliana, finalTotal };
}

function saveToHistory() {
    const noteInput = document.getElementById('history-note');
    const note = noteInput.value.trim();
    
    if (!note) {
        alert("Inserisci una nota per salvare lo storico (es. 'Accordo Novembre')");
        return;
    }

    const data = calculateLiveReport();
    const now = new Date();
    const dateTimeString = now.toLocaleDateString('it-IT') + ' - ' + now.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'});

    const historyItem = {
        id: Date.now(),
        date: dateTimeString,
        note: note,
        marco: data.finalMarco,
        giuliana: data.finalGiuliana,
        totale: data.finalTotal,
        inputs: {
            incMarco: document.getElementById('income-marco').value,
            incGiuliana: document.getElementById('income-giuliana').value,
            manualRentChecked: document.getElementById('manual-rent-toggle').checked,
            rentPercMarco: document.getElementById('rent-perc-marco').value,
            rent: document.getElementById('exp-rent').value,
            power: document.getElementById('exp-power').value,
            gas: document.getElementById('exp-gas').value,
            internet: document.getElementById('exp-internet').value,
            water: document.getElementById('exp-water').value,
            vouchers: document.getElementById('marco-vouchers').value,
            extraFund: document.getElementById('extra-fund').value,
            manualQuotaChecked: document.getElementById('manual-quota-toggle').checked,
            forcedMarcoQuota: document.getElementById('forced-marco-quota').value,
            adjMarco: document.getElementById('adj-marco').value,
            adjGiuliana: document.getElementById('adj-giuliana').value
        }
    };

    let history = JSON.parse(localStorage.getItem('budgetHistoryCoppiaPdf')) || [];
    history.unshift(historyItem); 
    localStorage.setItem('budgetHistoryCoppiaPdf', JSON.stringify(history));
    
    noteInput.value = '';
    renderHistory();
}

window.restoreHistoryItem = function(id) {
    let history = JSON.parse(localStorage.getItem('budgetHistoryCoppiaPdf')) || [];
    let item = history.find(i => i.id === id);
    
    if (!item || !item.inputs) {
        alert("Questa configurazione è vecchia e non contiene i dati per il ripristino automatico.");
        return;
    }

    document.getElementById('income-marco').value = item.inputs.incMarco;
    document.getElementById('income-giuliana').value = item.inputs.incGiuliana;
    
    const manualRentToggle = document.getElementById('manual-rent-toggle');
    manualRentToggle.checked = item.inputs.manualRentChecked;
    document.getElementById('manual-rent-container').style.display = manualRentToggle.checked ? 'block' : 'none';
    document.getElementById('rent-perc-marco').value = item.inputs.rentPercMarco;

    document.getElementById('exp-rent').value = item.inputs.rent;
    document.getElementById('exp-power').value = item.inputs.power;
    document.getElementById('exp-gas').value = item.inputs.gas;
    document.getElementById('exp-internet').value = item.inputs.internet;
    document.getElementById('exp-water').value = item.inputs.water;

    document.getElementById('marco-vouchers').value = item.inputs.vouchers;
    document.getElementById('extra-fund').value = item.inputs.extraFund;

    const manualQuotaToggle = document.getElementById('manual-quota-toggle');
    manualQuotaToggle.checked = item.inputs.manualQuotaChecked;
    document.getElementById('manual-quota-container').style.display = manualQuotaToggle.checked ? 'block' : 'none';
    document.getElementById('forced-marco-quota').value = item.inputs.forcedMarcoQuota;

    document.getElementById('adj-marco').value = item.inputs.adjMarco;
    document.getElementById('adj-giuliana').value = item.inputs.adjGiuliana;

    document.getElementById('report-date').innerText = item.date.split(' - ')[0] + " (Ripristinato)";
    calculateLiveReport(item.date); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.deleteHistoryItem = function(id, event) {
    event.stopPropagation();
    if(confirm("Vuoi davvero eliminare questo salvataggio?")) {
        let history = JSON.parse(localStorage.getItem('budgetHistoryCoppiaPdf')) || [];
        history = history.filter(item => item.id !== id);
        localStorage.setItem('budgetHistoryCoppiaPdf', JSON.stringify(history));
        renderHistory();
    }
}

function clearHistory() {
    if(confirm("Sei sicuro di voler svuotare TUTTO lo storico?")) {
        localStorage.removeItem('budgetHistoryCoppiaPdf');
        renderHistory();
    }
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('budgetHistoryCoppiaPdf')) || [];
    const container = document.getElementById('history-list');
    
    if (history.length === 0) {
        container.innerHTML = "<p style='color: #7f8c8d; font-size: 0.95rem; text-align:center;'>Nessun salvataggio presente in storico.</p>";
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-item-content" onclick="restoreHistoryItem(${item.id})" title="Clicca per ripristinare questi dati nella calcolatrice">
                <div class="history-item-info">
                    <strong>🔄 ${item.note}</strong>
                    <small>${item.date}</small>
                </div>
                <div class="history-item-amount">
                    M: €${item.marco} | G: €${item.giuliana}
                    <br><small style="font-weight: normal; color: #7f8c8d;">Tot: €${item.totale}</small>
                </div>
            </div>
            <button type="button" class="btn-delete" onclick="deleteHistoryItem(${item.id}, event)" title="Elimina definitivamente">✖</button>
        </div>
    `).join('');
}
