let allData = [];
let filteredData = [];
let charts = {};
let dataTable;

// URL da API do Google Apps Script (deve ser substituída pela URL real após o deploy)
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1Gtan6GhpDO5ViVuNMiT0AGm3F5I5iZSIYhWHVJ3ga6E/export?format=csv&gid=64540129';

// Configurações de atualização automática
const AUTO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutos em milissegundos
let autoUpdateTimer = null;

/**
 * Função principal para carregar dados da API do Google Apps Script
 */
async function loadData() {
    try {
        // Atualiza o status de conexão
        updateConnectionStatus('loading', 'Carregando...');
        
        // Faz a requisição para a API do Google Apps Script
        const response = await fetch(GOOGLE_SHEETS_CSV_URL);
        const csvText = await response.text();
        if (!csvText || csvText.length < 100) throw new Error('Dados CSV vazios ou inválidos');

        const lines = csvText.split('\n');
        let headerLineIndex = lines.findIndex(line => line.includes('UNIDADE DE SAÚDE') && line.includes('DATA'));
        if (headerLineIndex === -1) throw new Error('Cabeçalhos não encontrados na planilha');

        const headers = parseCSVLine(lines[headerLineIndex]).slice(2);
        allData = [];
        for (let i = headerLineIndex + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = parseCSVLine(line).slice(2);
                if (values.length >= headers.length && values.some(val => val.trim() !== '')) {
                    let row = {};
                    headers.forEach((header, index) => {
                        const cleanHeader = header.trim();
                        const value = values[index] ? values[index].trim() : '';
                        switch (cleanHeader) {
                            case 'UNIDADE DE SAÚDE': row.unidadeSaude = value; break;
                            case 'DATA': row.dataAgendamento = value; break;
                            case 'HORÁRIO': row.horarioAgendamento = value; break;
                            case 'NOME DO PACIENTE': row.nomePaciente = value; break;
                            case 'Nº PRONTUÁRIO VIVVER': row.prontuarioVivver = value; break;
                            case 'OBSERVAÇÃO/ UNIDADE DE SAÚDE': row.observacaoUnidadeSaude = value; break;
                            case 'PERFIL DO PACIENTE OU TIPO DO EXAME': row.perfilPacienteExame = value; break;
                            case 'Laboratório de Coleta:': row.laboratorioColeta = value; break;
                        }
                    });
                    if (row.unidadeSaude || row.dataAgendamento) allData.push(row);
                }
            }
        }
        filteredData = [...allData];
        
        // Atualiza a interface
        updateFilters();
        updateDashboard();
        
        // Atualiza o status de conexão
        updateConnectionStatus('online', 'Conectado');
        updateLastUpdateTime();
        
        console.log(`Dados carregados com sucesso: ${allData.length} registros`);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Atualiza o status de conexão para erro
        updateConnectionStatus('offline', 'Erro de conexão');
        
        // Exibe mensagem de erro para o usuário
        showErrorMessage(`Erro ao carregar dados: ${error.message}`);
    }
}

/**
 * Atualiza o status de conexão na interface
 */
function updateConnectionStatus(status, text) {
    const statusElement = document.getElementById('connectionStatus');
    const textElement = document.getElementById('connectionText');
    
    if (statusElement && textElement) {
        // Remove classes anteriores
        statusElement.className = 'status-indicator';
        
        // Adiciona a nova classe baseada no status
        switch (status) {
            case 'online':
                statusElement.classList.add('status-online');
                break;
            case 'offline':
                statusElement.classList.add('status-offline');
                break;
            case 'loading':
                statusElement.classList.add('status-loading');
                break;
        }
        
        textElement.textContent = text;
    }
}

/**
 * Atualiza o horário da última atualização
 */
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        lastUpdateElement.textContent = `Última atualização: ${now.toLocaleString('pt-BR')}`;
    }
}

/**
 * Exibe mensagem de erro para o usuário
 */
function showErrorMessage(message) {
    // Cria ou atualiza um elemento de alerta na página
    let alertElement = document.getElementById('error-alert');
    
    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.id = 'error-alert';
        alertElement.className = 'alert alert-error';
        alertElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #fee2e2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-width: 400px;
        `;
        document.body.appendChild(alertElement);
    }
    
    alertElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="hideErrorMessage()" style="margin-left: auto; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 16px;">×</button>
        </div>
    `;
    
    // Remove automaticamente após 10 segundos
    setTimeout(() => {
        hideErrorMessage();
    }, 10000);
}

/**
 * Oculta a mensagem de erro
 */
function hideErrorMessage() {
    const alertElement = document.getElementById('error-alert');
    if (alertElement) {
        alertElement.remove();
    }
}

/**
 * Inicia a atualização automática
 */
function startAutoUpdate() {
    // Para qualquer timer existente
    stopAutoUpdate();
    
    // Inicia um novo timer
    autoUpdateTimer = setInterval(() => {
        console.log('Executando atualização automática...');
        loadData();
    }, AUTO_UPDATE_INTERVAL);
    
    console.log(`Atualização automática iniciada (intervalo: ${AUTO_UPDATE_INTERVAL / 1000}s)`);
}

/**
 * Para a atualização automática
 */
function stopAutoUpdate() {
    if (autoUpdateTimer) {
        clearInterval(autoUpdateTimer);
        autoUpdateTimer = null;
        console.log('Atualização automática parada');
    }
}

/**
 * Função para atualização manual (chamada pelo botão)
 */
function manualUpdate() {
    console.log('Atualização manual solicitada');
    loadData();
}

// Função parseCSVLine (necessária para processar o CSV)
function parseCSVLine(line) {
    const result = [];
    let current = '', inQuotes = false;
    for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else current += char;
    }
    result.push(current.trim());
    return result;
}

function updateFilters() {
    const unidadeSaudeSet = new Set(), horarioSet = new Set(), laboratorioColetaSet = new Set();
    allData.forEach(item => {
        if (item.unidadeSaude && item.unidadeSaude !== 'Preencher') unidadeSaudeSet.add(item.unidadeSaude);
        if (item.horarioAgendamento) horarioSet.add(item.horarioAgendamento);
        if (item.laboratorioColeta && item.laboratorioColeta !== 'Preencher') laboratorioColetaSet.add(item.laboratorioColeta);
    });
    updateSelectOptions('unidadeSaudeFilter', Array.from(unidadeSaudeSet).sort());
    updateSelectOptions('horarioFilter', Array.from(horarioSet).sort());
    updateSelectOptions('laboratorioColetaFilter', Array.from(laboratorioColetaSet).sort());
}

function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '';
    if (!select.multiple) select.add(new Option('Todos', ''));
    options.forEach(option => select.add(new Option(option, option)));
}

function applyFilters() {
    const unidadeSaudeFilter = Array.from(document.getElementById('unidadeSaudeFilter').selectedOptions).map(o => o.value);
    const horarioFilter = Array.from(document.getElementById('horarioFilter').selectedOptions).map(o => o.value);
    const dataFilter = document.getElementById('dataFilter').value;
    const laboratorioColetaFilter = Array.from(document.getElementById('laboratorioColetaFilter').selectedOptions).map(o => o.value);
    
    filteredData = allData.filter(item => {
        const itemDate = parseDate(item.dataAgendamento);
        const filterDate = dataFilter ? new Date(dataFilter) : null;
        
        if (unidadeSaudeFilter.length && !unidadeSaudeFilter.includes(item.unidadeSaude)) return false;
        if (horarioFilter.length && !horarioFilter.includes(item.horarioAgendamento)) return false;
        if (laboratorioColetaFilter.length && !laboratorioColetaFilter.includes(item.laboratorioColeta)) return false;
        if (filterDate && (!itemDate || itemDate.toDateString() !== filterDate.toDateString())) return false;
        
        return true;
    });
    
    updateDashboard();
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    return parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`) : null;
}

Chart.register(ChartDataLabels);

function updateDashboard() {
    updateChartUltimaDataUnidade();
    updateChartUltimaDataLaboratorio();
    updateTable();
    updateTablePacientesDiaUnidade();
    updateTablePacientesDiaLaboratorio();
    updateTableVagasLivresDia();
    updateTableVagasLivresMes();
    updateTablePacientesMesUnidade();
    updateTablePacientesMesLaboratorio();
    updateTableVagasLivresMesLaboratorio();
}

function createSummaryTableWithTotal(containerId, data, columns, totalColumnKey) {
    const tableBody = document.getElementById(containerId);
    if (!tableBody) return;
    
    let total = 0;
    
    const rowsHtml = data.map(row => {
        total += row[totalColumnKey];
        return `
            <tr class="bg-white border-b">
                ${columns.map(col => `<td class="px-6 py-4 ${col.isNumeric ? 'font-medium text-gray-900' : ''}">${row[col.key]}</td>`).join('')}
            </tr>
        `;
    }).join('');

    const totalRowHtml = `
        <tr class="bg-gray-100 border-t-2 border-gray-300">
            <td class="px-6 py-4 font-bold text-gray-800" colspan="${columns.length - 1}">Total</td>
            <td class="px-6 py-4 font-bold text-gray-900">${total}</td>
        </tr>
    `;

    tableBody.innerHTML = rowsHtml + totalRowHtml;
}

function updateChartUltimaDataUnidade() {
    const lastDateByUnidade = {};
    filteredData.forEach(item => {
        const date = parseDate(item.dataAgendamento);
        if (date && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') {
            if (!lastDateByUnidade[item.unidadeSaude] || date > lastDateByUnidade[item.unidadeSaude]) {
                lastDateByUnidade[item.unidadeSaude] = date;
            }
        }
    });
    const sortedData = Object.entries(lastDateByUnidade)
        .map(([unidade, date]) => ({ unidade, date: date.toLocaleDateString('pt-BR') }))
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    const ctx = document.getElementById('chartUltimaDataUnidade');
    if (!ctx) return;
    
    if (charts.ultimaDataUnidade) charts.ultimaDataUnidade.destroy();
    charts.ultimaDataUnidade = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item.unidade),
            datasets: [{
                label: 'Última Data',
                data: sortedData.map((_, i) => sortedData.length - i),
                backgroundColor: '#ef4444',
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { color: '#fff', font: { weight: 'bold', size: 16 }, formatter: (_, context) => sortedData[context.dataIndex].date }
            },
            scales: { x: { display: false }, y: { ticks: { font: { weight: 'bold' } } } }
        }
    });
}

function updateChartUltimaDataLaboratorio() {
    const lastDateByLab = {};
    filteredData.forEach(item => {
        const date = parseDate(item.dataAgendamento);
        if (date && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') {
            if (!lastDateByLab[item.laboratorioColeta] || date > lastDateByLab[item.laboratorioColeta]) {
                lastDateByLab[item.laboratorioColeta] = date;
            }
        }
    });
    const sortedData = Object.entries(lastDateByLab)
        .map(([lab, date]) => ({ lab, date: date.toLocaleDateString('pt-BR') }))
        .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    const ctx = document.getElementById('chartUltimaDataLaboratorio');
    if (!ctx) return;
    
    if (charts.ultimaDataLaboratorio) charts.ultimaDataLaboratorio.destroy();
    charts.ultimaDataLaboratorio = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item.lab),
            datasets: [{
                label: 'Última Data',
                data: sortedData.map((_, i) => sortedData.length - i),
                backgroundColor: '#ea580c',
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { color: '#fff', font: { weight: 'bold', size: 16 }, formatter: (_, context) => sortedData[context.dataIndex].date }
            },
            scales: { x: { display: false }, y: { ticks: { font: { weight: 'bold' } } } }
        }
    });
}

function updateTablePacientesDiaUnidade() {
    const dayUnidadeCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${item.dataAgendamento} - ${item.unidadeSaude}`;
            dayUnidadeCount[key] = (dayUnidadeCount[key] || 0) + 1;
        }
    });
    const data = Object.entries(dayUnidadeCount).map(([key, count]) => {
        const [data, unidade] = key.split(' - ');
        return { data, unidade, count };
    }).sort((a, b) => (parseDate(b.data) - parseDate(a.data)) || b.count - a.count);
    createSummaryTableWithTotal('tabelaResumoUnidade', data, [{ key: 'data' }, { key: 'unidade' }, { key: 'count', isNumeric: true }], 'count');
}

function updateTablePacientesDiaLaboratorio() {
    const dayLabCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${item.dataAgendamento} - ${item.laboratorioColeta}`;
            dayLabCount[key] = (dayLabCount[key] || 0) + 1;
        }
    });
    const data = Object.entries(dayLabCount).map(([key, count]) => {
        const [data, laboratorio] = key.split(' - ');
        return { data, laboratorio, count };
    }).sort((a, b) => (parseDate(b.data) - parseDate(a.data)) || b.count - a.count);
    createSummaryTableWithTotal('tabelaResumoLaboratorio', data, [{ key: 'data' }, { key: 'laboratorio' }, { key: 'count', isNumeric: true }], 'count');
}

function updateTableVagasLivresDia() {
    const dayUnidadeSlots = {}, dayUnidadeOccupied = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude) {
            const key = `${item.dataAgendamento} - ${item.unidadeSaude}`;
            dayUnidadeSlots[key] = (dayUnidadeSlots[key] || 0) + 1;
            if (item.nomePaciente && item.nomePaciente.trim() !== '') dayUnidadeOccupied[key] = (dayUnidadeOccupied[key] || 0) + 1;
        }
    });
    const data = Object.entries(dayUnidadeSlots).map(([key, total]) => {
        const free = total - (dayUnidadeOccupied[key] || 0);
        const [data, unidade] = key.split(' - ');
        return { data, unidade, free };
    }).filter(item => item.free > 0)
      .sort((a, b) => (parseDate(b.data) - parseDate(a.data)) || b.free - a.free);
    createSummaryTableWithTotal('tabelaVagasLivresDia', data, [{ key: 'data' }, { key: 'unidade' }, { key: 'free', isNumeric: true }], 'free');
}

function updateTableVagasLivresMes() {
    const monthUnidadeSlots = {}, monthUnidadeOccupied = {};
    filteredData.forEach(item => {
        const date = parseDate(item.dataAgendamento);
        if (date && item.unidadeSaude) {
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            const key = `${monthYear} - ${item.unidadeSaude}`;
            monthUnidadeSlots[key] = (monthUnidadeSlots[key] || 0) + 1;
            if (item.nomePaciente && item.nomePaciente.trim() !== '') monthUnidadeOccupied[key] = (monthUnidadeOccupied[key] || 0) + 1;
        }
    });
    const data = Object.entries(monthUnidadeSlots).map(([key, total]) => {
        const free = total - (monthUnidadeOccupied[key] || 0);
        const [mesAno, unidade] = key.split(' - ');
        return { mesAno, unidade, free };
    }).filter(item => item.free > 0)
      .sort((a, b) => b.free - a.free);
    createSummaryTableWithTotal('tabelaVagasLivresMes', data, [{ key: 'mesAno' }, { key: 'unidade' }, { key: 'free', isNumeric: true }], 'free');
}

function updateTablePacientesMesUnidade() {
    const monthUnidadeCount = {};
    filteredData.forEach(item => {
        const date = parseDate(item.dataAgendamento);
        if (date && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${date.getMonth() + 1}/${date.getFullYear()} - ${item.unidadeSaude}`;
            monthUnidadeCount[key] = (monthUnidadeCount[key] || 0) + 1;
        }
    });
    const data = Object.entries(monthUnidadeCount).map(([key, count]) => {
        const [mesAno, unidade] = key.split(' - ');
        return { mesAno, unidade, count };
    }).sort((a, b) => b.count - a.count);
    createSummaryTableWithTotal('tabelaPacientesMesUnidade', data, [{ key: 'mesAno' }, { key: 'unidade' }, { key: 'count', isNumeric: true }], 'count');
}

function updateTablePacientesMesLaboratorio() {
    const monthLabCount = {};
    filteredData.forEach(item => {
        const date = parseDate(item.dataAgendamento);
        if (date && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${date.getMonth() + 1}/${date.getFullYear()} - ${item.laboratorioColeta}`;
            monthLabCount[key] = (monthLabCount[key] || 0) + 1;
        }
    });
    const data = Object.entries(monthLabCount).map(([key, count]) => {
        const [mesAno, laboratorio] = key.split(' - ');
        return { mesAno, laboratorio, count };
    }).sort((a, b) => b.count - a.count);
    createSummaryTableWithTotal('tabelaPacientesMesLaboratorio', data, [{ key: 'mesAno' }, { key: 'laboratorio' }, { key: 'count', isNumeric: true }], 'count');
}

function updateTableVagasLivresMesLaboratorio() {
    const monthLabSlots = {}, monthLabOccupied = {};
    filteredData.forEach(item => {
        const date = parseDate(item.dataAgendamento);
        if (date && item.laboratorioColeta) {
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            const key = `${monthYear} - ${item.laboratorioColeta}`;
            monthLabSlots[key] = (monthLabSlots[key] || 0) + 1;
            if (item.nomePaciente && item.nomePaciente.trim() !== '') {
                monthLabOccupied[key] = (monthLabOccupied[key] || 0) + 1;
            }
        }
    });
    const data = Object.entries(monthLabSlots).map(([key, total]) => {
        const free = total - (monthLabOccupied[key] || 0);
        const [mesAno, laboratorio] = key.split(' - ');
        return { mesAno, laboratorio, free };
    }).filter(item => item.free > 0)
      .sort((a, b) => b.free - a.free);
    createSummaryTableWithTotal('tabelaVagasLivresMesLaboratorio', data, [{ key: 'mesAno' }, { key: 'laboratorio' }, { key: 'free', isNumeric: true }], 'free');
}

function updateTable() {
    if (dataTable) dataTable.destroy();
    
    const tableBody = document.querySelector('#agendamentosTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = filteredData.map(item => `
        <tr>
            <td>${item.unidadeSaude || ''}</td>
            <td>${item.dataAgendamento || ''}</td>
            <td>${item.horarioAgendamento || ''}</td>
            <td>${item.prontuarioVivver || ''}</td>
            <td>${item.observacaoUnidadeSaude || ''}</td>
            <td>${item.perfilPacienteExame || ''}</td>
            <td>${item.laboratorioColeta || ''}</td>
        </tr>
    `).join('');
    
    dataTable = $('#agendamentosTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
        pageLength: 15,
        responsive: true,
        order: [[1, 'desc']]
    });
}

function clearAllFilters() {
    document.getElementById('dataFilter').value = '';
    ['unidadeSaudeFilter', 'horarioFilter', 'laboratorioColetaFilter'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            Array.from(select.options).forEach(option => option.selected = false);
        }
    });
    applyFilters();
}

function exportToExcel() {
    const wb = XLSX.utils.book_new();
    
    const mainData = filteredData.map(item => ({
        'UNIDADE DE SAÚDE': item.unidadeSaude || '',
        'DATA': item.dataAgendamento || '',
        'HORÁRIO': item.horarioAgendamento || '',
        'Nº PRONTUÁRIO VIVVER': item.prontuarioVivver || '',
        'OBSERVAÇÃO': item.observacaoUnidadeSaude || '',
        'PERFIL/EXAME': item.perfilPacienteExame || '',
        'Laboratório': item.laboratorioColeta || ''
    }));
    const wsMain = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(wb, wsMain, 'Todos Agendamentos');
    
    XLSX.writeFile(wb, `agendamentos_eldorado_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando painel...');
    
    // Carrega os dados inicialmente
    loadData();
    
    // Inicia a atualização automática
    startAutoUpdate();
    
    // Adiciona event listeners para os filtros
    ['unidadeSaudeFilter', 'horarioFilter', 'laboratorioColetaFilter', 'dataFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });
    
    // Event listener para o botão de atualização manual
    const updateButton = document.querySelector('button[onclick="loadData()"]');
    if (updateButton) {
        updateButton.setAttribute('onclick', 'manualUpdate()');
    }
});

// Limpa os timers quando a página é fechada
window.addEventListener('beforeunload', () => {
    stopAutoUpdate();
});

// Adiciona estilos CSS para o status de loading
const loadingStyles = `
    .status-loading {
        background-color: #f59e0b;
        animation: pulse 1s infinite;
    }
    
    .alert {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .alert-error {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Adiciona os estilos ao head da página
const styleSheet = document.createElement('style');
styleSheet.textContent = loadingStyles;
document.head.appendChild(styleSheet);
