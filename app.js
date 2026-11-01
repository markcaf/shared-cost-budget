document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-add-utility').addEventListener('click', () => addUtilityField());
    document.getElementById('name1').addEventListener('input', updateNames);
    document.getElementById('name2').addEventListener('input', updateNames);

    // Setup listener su elementi statici
    setupInputListeners();
    
    // Check localStorage
    const savedDefault = localStorage.getItem('budgetDefaultConfigV2');
    if (savedDefault) {
        loadConfig(JSON.parse(savedDefault));
    } else {
        addUtilityField(); // Ne aggiunge almeno uno vuoto
        updateNames();
        calculateLiveReport();
    }

    document.getElementById('manual-rent-toggle').addEventListener('change', (e) => {
        document.getElementById('manual-rent-container').style.display = e.target.checked ? 'block' : 'none';
        calculateLiveReport();
    });

    document.getElementById('manual-quota-toggle').addEventListener('change', (e) => {
        document.getElementById('manual-quota-container').style.display = e.target.checked ? 'block' : 'none';
        calculateLiveReport();
    });

    document.getElementById('btn-save').addEventListener('click', saveToHistory);
    document.getElementById('btn-set-default').addEventListener('click', saveAsDefault);
    document.getElementById('btn-reset-default').addEventListener('click', () => {
        if(confirm("Vuoi azzerare tutto e cancellare il default?")) {
            localStorage.removeItem('budgetDefaultConfigV2');
            location.reload();
        }
    });
    document.getElementById('btn-print').addEventListener('click', () => window.print());
    document.getElementById('btn-clear-history').addEventListener('click', () => {
        if(confirm("Svuotare tutto lo storico?")) {
            localStorage.removeItem('budgetHistoryV2');
            renderHistory();
        }
    });

    document.getElementById('report-date').innerText = new Date().toLocaleDateString('it-IT');
    renderHistory();
});

function setupInputListeners() {
    document.querySelectorAll('.sidebar input, .sidebar select').forEach(input => {
        // Evita duplicazioni di event listener
        input.removeEventListener('input', calculateLiveReport);
        input.addEventListener('input', calculateLiveReport);
    });
}

function updateNames() {
    const n1 = document.getElementById('name1').value || 'Utente 1';
    const n2 = document.getElementById('name2').value || 'Utente 2';
    
    document.querySelectorAll('.name1-display').forEach(el => el.innerText = n1);
    document.querySelectorAll('.name2-display').forEach(el => el.innerText = n2);
}

// ================================
// GESTIONE SPESE DINAMICHE
// ================================
function getFreqLabel(freq) {
    const labels = { 1: "Mensile", 2: "Bimestrale", 3: "Trimestrale", 4: "Quadrimestrale", 6: "Semestrale", 12: "Annuale" };
    return labels[freq] || "Mensile";
}

function addUtilityField(name = "", amount = 0, freq = 1) {
    const container = document.getElementById('utilities-container');
    const div = document.createElement('div');
    div.className = 'dynamic-row utility-row';
    
    div.innerHTML = `
        <input type="text" class="ut-name" placeholder="Nome Spesa" value="${name}">
        <input type="number" class="ut-amount" placeholder="€" value="${amount}" step="0.01">
        <select class="ut-freq">
            <option value="1" ${freq == 1 ? 'selected' : ''}>Mensile</option>
            <option value="2" ${freq == 2 ? 'selected' : ''}>Bimestrale</option>
            <option value="3" ${freq == 3 ? 'selected' : ''}>Trimestrale</option>
            <option value="4" ${freq == 4 ? 'selected' : ''}>Quadrim.</option>
            <option value="6" ${freq == 6 ? 'selected' : ''}>Semestrale</option>
            <option value="12" ${freq == 12 ? 'selected' : ''}>Annuale</option>
        </select>
        <button type="button" class="btn-remove-row" title="Rimuovi" onclick="this.parentElement.remove(); calculateLiveReport();">✖</button>
    `;
    container.appendChild(div);
    setupInputListeners(); // Riapplica i listener ai nuovi campi
}

// ================================
// MOTORE DI CALCOLO
// ================================
function calculateLiveReport(referenceDateString = null) {
    updateNames();
    
    const inc1 = parseFloat(document.getElementById('income1').value) || 0;
    const inc2 = parseFloat(document.getElementById('income2').value) || 0;
    
    // Affitto principale
    const rentName = document.getElementById('exp-rent-name').value || 'Affitto / Mutuo';
    const rentRaw = parseFloat(document.getElementById('exp-rent-amount').value) || 0;
    const rentFreq = parseInt(document.getElementById('exp-rent-freq').value) || 1;
    const rentMonthly = rentRaw / rentFreq;

    // Spese 50/50 dinamiche
    let totalUtilitiesMonthly = 0;
    const utilitiesData = [];
    document.querySelectorAll('.utility-row').forEach(row => {
        const name = row.querySelector('.ut-name').value || 'Spesa Comune';
        const amount = parseFloat(row.querySelector('.ut-amount').value) || 0;
        const freq = parseInt(row.querySelector('.ut-freq').value) || 1;
        const monthly = amount / freq;
        totalUtilitiesMonthly += monthly;
        utilitiesData.push({ name, amount, freq, monthly });
    });

    const vouchers = parseFloat(document.getElementById('vouchers').value) || 0;
    const extraFund = parseFloat(document.getElementById('extra-fund').value) || 0;

    // Percentuali
    let perc1, perc2;
    if (document.getElementById('manual-rent-toggle').checked) {
        perc1 = (parseFloat(document.getElementById('rent-perc-1').value) || 50) / 100;
        perc2 = 1 - perc1;
    } else {
        const totalIncome = inc1 + inc2;
        perc1 = totalIncome ? (inc1 / totalIncome) : 0.5;
        perc2 = totalIncome ? (inc2 / totalIncome) : 0.5;
    }

    const rent1 = rentMonthly * perc1;
    const rent2 = rentMonthly * perc2;
    const utilHead = totalUtilitiesMonthly / 2;

    const base1 = rent1 + utilHead + extraFund;
    const base2 = rent2 + utilHead + extraFund;

    let final1, final2;
    let noteText = "";

    if (document.getElementById('manual-quota-toggle').checked) {
        final1 = parseFloat(document.getElementById('forced-quota-1').value) || 0;
        const totalTargetConto = Math.ceil(base1 / 5) * 5 + Math.ceil(base2 / 5) * 5;
        final2 = totalTargetConto - final1;
        noteText = `Quota base Utente 1 forzata manualmente, Utente 2 bilanciato.`;
    } else {
        final1 = Math.ceil(base1 / 5) * 5;
        final2 = Math.ceil(base2 / 5) * 5;
        noteText = `Gli importi sono arrotondati a multipli di 5€ per garantire avanzo.`;
    }

    const adj1 = parseFloat(document.getElementById('adj-1').value) || 0;
    const adj2 = parseFloat(document.getElementById('adj-2').value) || 0;
    final1 += adj1;
    final2 += adj2;

    const finalTotal = final1 + final2;
    const surplus = finalTotal - (rentMonthly + totalUtilitiesMonthly);
    const totalGroceriesAvailable = surplus + vouchers;

    // ================================
    // AGGIORNAMENTO DOM (REPORT)
    // ================================
    document.getElementById('perc-1').innerText = (perc1 * 100).toFixed(1) + '%';
    document.getElementById('perc-2').innerText = (perc2 * 100).toFixed(1) + '%';
    document.getElementById('tot-rent').innerText = '€' + rentMonthly.toFixed(2);
    document.getElementById('tot-utilities').innerText = '€' + totalUtilitiesMonthly.toFixed(2);

    // Costruzione Tabella Dinamica
    let tableHtml = `
        <tr>
            <td>${rentName} <small>(${getFreqLabel(rentFreq)})</small></td>
            <td>€${rentMonthly.toFixed(2)}</td>
            <td>Pro-quota sui redditi</td>
        </tr>
    `;
    
    utilitiesData.forEach(ut => {
        tableHtml += `
            <tr>
                <td>${ut.name} <small>(${getFreqLabel(ut.freq)})</small></td>
                <td>€${ut.monthly.toFixed(2)}</td>
                <td>Diviso 50/50</td>
            </tr>
        `;
    });

    tableHtml += `
        <tr class="row-subtotal">
            <td style="text-align: right;">Totale Altre Spese:</td>
            <td>€${totalUtilitiesMonthly.toFixed(2)}</td>
            <td></td>
        </tr>
        <tr>
            <td>Spesa Supermercato / Casa</td>
            <td>€${vouchers.toFixed(2)} (in Buoni) + Resto</td>
            <td>Buoni + Conto Cointestato</td>
        </tr>
    `;
    document.getElementById('report-table-body').innerHTML = tableHtml;

    document.getElementById('final-1').innerText = '€' + final1.toFixed(2);
    document.getElementById('final-2').innerText = '€' + final2.toFixed(2);
    document.getElementById('final-total').innerText = '€' + finalTotal.toFixed(2);
    document.getElementById('custom-quota-note').innerText = "Nota: " + noteText;

    // Logica & Criteri
    document.getElementById('logic-rent').innerText = '€' + rentMonthly.toFixed(0);
    document.getElementById('logic-perc').innerText = `${(perc1 * 100).toFixed(0)}% / ${(perc2 * 100).toFixed(0)}%`;
    document.getElementById('logic-extra-fund').innerText = extraFund.toFixed(0) + '€';
    document.getElementById('logic-vouchers').innerText = vouchers.toFixed(0) + '€';
    document.getElementById('logic-total-groceries').innerText = totalGroceriesAvailable.toFixed(0);
    document.getElementById('logic-surplus').innerText = surplus.toFixed(0);

    // Operatività
    document.getElementById('ops-quota-1').innerText = '€' + final1.toFixed(0);
    document.getElementById('ops-quota-2').innerText = '€' + final2.toFixed(0);

    let baseDate = new Date();
    if(referenceDateString) {
        const parts = referenceDateString.split(' - ')[0].split('/');
        if(parts.length === 3) baseDate = new Date(parts[2], parts[1] - 1, parts[0]);
    }

    document.getElementById('ops-check-mensile').innerText = "di " + baseDate.toLocaleString('it-IT', { month: 'long' });
    baseDate.setMonth(baseDate.getMonth() + 6);
    let nextMonth = baseDate.toLocaleString('it-IT', { month: 'long' });
    document.getElementById('ops-check-semestrale').innerText = nextMonth.charAt(0).toUpperCase() + nextMonth.slice(1) + ' ' + baseDate.getFullYear();

    return { final1, final2, finalTotal, utilitiesData };
}

// ================================
// SALVATAGGIO, DEFAULT & STORICO
// ================================
function getConfigObject() {
    const data = calculateLiveReport();
    return {
        name1: document.getElementById('name1').value,
        name2: document.getElementById('name2').value,
        inc1: document.getElementById('income1').value,
        inc2: document.getElementById('income2').value,
        manualRentChecked: document.getElementById('manual-rent-toggle').checked,
        rentPerc1: document.getElementById('rent-perc-1').value,
        rentName: document.getElementById('exp-rent-name').value,
        rentAmount: document.getElementById('exp-rent-amount').value,
        rentFreq: document.getElementById('exp-rent-freq').value,
        utilities: data.utilitiesData,
        vouchers: document.getElementById('vouchers').value,
        extraFund: document.getElementById('extra-fund').value,
        manualQuotaChecked: document.getElementById('manual-quota-toggle').checked,
        forcedQuota1: document.getElementById('forced-quota-1').value,
        adj1: document.getElementById('adj-1').value,
        adj2: document.getElementById('adj-2').value,
        final1: data.final1,
        final2: data.final2,
        finalTotal: data.finalTotal
    };
}

function loadConfig(config) {
    document.getElementById('name1').value = config.name1 || 'Utente 1';
    document.getElementById('name2').value = config.name2 || 'Utente 2';
    document.getElementById('income1').value = config.inc1 || 0;
    document.getElementById('income2').value = config.inc2 || 0;
    
    document.getElementById('manual-rent-toggle').checked = config.manualRentChecked || false;
    document.getElementById('manual-rent-container').style.display = config.manualRentChecked ? 'block' : 'none';
    document.getElementById('rent-perc-1').value = config.rentPerc1 || 50;

    document.getElementById('exp-rent-name').value = config.rentName || 'Affitto / Mutuo';
    document.getElementById('exp-rent-amount').value = config.rentAmount || 0;
    document.getElementById('exp-rent-freq').value = config.rentFreq || 1;

    // Ricostruisce le utenze dinamiche
    document.getElementById('utilities-container').innerHTML = '';
    if (config.utilities && config.utilities.length > 0) {
        config.utilities.forEach(ut => addUtilityField(ut.name, ut.amount, ut.freq));
    } else {
        addUtilityField();
    }

    document.getElementById('vouchers').value = config.vouchers || 0;
    document.getElementById('extra-fund').value = config.extraFund || 0;
    
    document.getElementById('manual-quota-toggle').checked = config.manualQuotaChecked || false;
    document.getElementById('manual-quota-container').style.display = config.manualQuotaChecked ? 'block' : 'none';
    document.getElementById('forced-quota-1').value = config.forcedQuota1 || 0;

    document.getElementById('adj-1').value = config.adj1 || 0;
    document.getElementById('adj-2').value = config.adj2 || 0;

    calculateLiveReport();
}

function saveAsDefault() {
    localStorage.setItem('budgetDefaultConfigV2', JSON.stringify(getConfigObject()));
    alert("Configurazione salvata come Default!");
}

function saveToHistory() {
    const note = document.getElementById('history-note').value.trim();
    if (!note) return alert("Inserisci una nota per salvare lo storico.");

    const now = new Date();
    const config = getConfigObject();
    
    const historyItem = {
        id: Date.now(),
        date: now.toLocaleDateString('it-IT') + ' - ' + now.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'}),
        note: note,
        config: config
    };

    let history = JSON.parse(localStorage.getItem('budgetHistoryV2')) || [];
    history.unshift(historyItem); 
    localStorage.setItem('budgetHistoryV2', JSON.stringify(history));
    
    document.getElementById('history-note').value = '';
    renderHistory();
}

window.restoreHistoryItem = function(id) {
    let history = JSON.parse(localStorage.getItem('budgetHistoryV2')) || [];
    let item = history.find(i => i.id === id);
    if (!item) return;

    loadConfig(item.config);
    document.getElementById('report-date').innerText = item.date.split(' - ')[0] + " (Ripristinato)";
    calculateLiveReport(item.date); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('budgetHistoryV2')) || [];
    const container = document.getElementById('history-list');
    
    if (history.length === 0) {
        container.innerHTML = "<p style='color: #7f8c8d; font-size: 0.95rem; text-align:center;'>Nessun salvataggio presente.</p>";
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="history-item" onclick="restoreHistoryItem(${item.id})">
            <div class="history-item-content">
                <div>
                    <strong style="color:var(--text-main)">🔄 ${item.note}</strong>
                    <small style="color:#7f8c8d; display:block">${item.date}</small>
                </div>
                <div style="text-align: right;">
                    <span style="font-weight:bold; color:var(--primary)">${item.config.name1[0]}: €${item.config.final1} | ${item.config.name2[0]}: €${item.config.final2}</span>
                    <br><small style="color:#7f8c8d">Tot: €${item.config.finalTotal}</small>
                </div>
            </div>
            <button type="button" class="btn-delete" onclick="event.stopPropagation(); if(confirm('Eliminare?')){ let h = JSON.parse(localStorage.getItem('budgetHistoryV2')); h = h.filter(i => i.id !== ${item.id}); localStorage.setItem('budgetHistoryV2', JSON.stringify(h)); renderHistory(); }">✖</button>
        </div>
    `).join('');
}