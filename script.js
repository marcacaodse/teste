let allData = [];
let filteredData = [];
let charts = {};
let dataTable;
let choicesInstances = {}; // Para guardar as instâncias dos filtros

// --- FUNÇÃO PARA INICIALIZAR OS FILTROS MODERNOS ---
function initializeChoices() {
    const filterElements = ['unidadeSaudeFilter', 'horarioFilter', 'laboratorioColetaFilter'];
    filterElements.forEach(id => {
        if (choicesInstances[id]) {
            choicesInstances[id].destroy();
        }
        choicesInstances[id] = new Choices(`#${id}`, {
            removeItemButton: true,
            placeholder: true,
            placeholderValue: 'Selecione uma ou mais opções',
            allowHTML: false,
        });
        // Adiciona o listener para aplicar os filtros quando uma opção é alterada
        document.getElementById(id).addEventListener('change', applyFilters);
    });
    // Adiciona o listener para o filtro de data
    document.getElementById('dataFilter').addEventListener('change', applyFilters);
}

async function loadData() {
    try {
        document.getElementById('connectionStatus').className = 'status-indicator status-online';
        document.getElementById('connectionText').textContent = 'Carregando...';
        const response = await fetch('https://docs.google.com/spreadsheets/d/1Gtan6GhpDO5ViVuNMiT0AGm3F5I5iZSIYhWHVJ3ga6E/export?format=csv&gid=64540129' );
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
                            // CORREÇÃO APLICADA AQUI: Mudado de 'HORÁRIO' para 'HORA'
                            case 'HORA': row.horarioAgendamento = value; break;
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
        updateFilters(); // Isso agora também inicializa o Choices.js
        updateDashboard();
        document.getElementById('connectionStatus').className = 'status-indicator status-online';
        document.getElementById('connectionText').textContent = 'Conectado';
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.getElementById('connectionStatus').className = 'status-indicator status-offline';
        document.getElementById('connectionText').textContent = 'Erro de conexão';
        alert('Erro ao carregar dados da planilha. Verifique a conexão e tente novamente.');
    }
}

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
    
    initializeChoices(); // Inicializa os filtros após popular as opções
}

function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    const currentValues = choicesInstances[selectId] ? choicesInstances[selectId].getValue(true) : [];
    select.innerHTML = '';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        if (currentValues.includes(option)) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });
}

function applyFilters() {
    const unidadeSaudeFilter = choicesInstances.unidadeSaudeFilter ? choicesInstances.unidadeSaudeFilter.getValue(true) : [];
    const horarioFilter = choicesInstances.horarioFilter ? choicesInstances.horarioFilter.getValue(true) : [];
    const laboratorioColetaFilter = choicesInstances.laboratorioColetaFilter ? choicesInstances.laboratorioColetaFilter.getValue(true) : [];
    const dataFilter = document.getElementById('dataFilter').value;

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

function clearAllFilters() {
    document.getElementById('dataFilter').value = '';
    // Itera sobre as instâncias do Choices e limpa a seleção de cada uma
    Object.values(choicesInstances).forEach(choiceInstance => {
        if (choiceInstance) {
            choiceInstance.clearStore();
        }
    });
    // A função applyFilters() já é chamada pelo evento 'change' do Choices.js,
    // mas chamamos aqui para garantir que o filtro de data seja aplicado.
    applyFilters();
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
    let total = 0;
    const rowsHtml = data.map(row => {
        total += row[totalColumnKey];
        return `<tr class="bg-white border-b"><td class="px-6 py-4">${row[columns[0].key]}</td><td class="px-6 py-4">${row[columns[1].key]}</td><td class="px-6 py-4 font-medium text-gray-900">${row[columns[2].key]}</td></tr>`;
    }).join('');
    const totalRowHtml = `<tr class="bg-gray-100 border-t-2 border-gray-300"><td class="px-6 py-4 font-bold text-gray-800" colspan="2">Total</td><td class="px-6 py-4 font-bold text-gray-900">${total}</td></tr>`;
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
    const sortedData = Object.entries(lastDateByUnidade).map(([unidade, date]) => ({ unidade, date: date.toLocaleDateString('pt-BR') })).sort((a, b) => parseDate(b.date) - parseDate(a.date));
    const ctx = document.getElementById('chartUltimaDataUnidade').getContext('2d');
    if (charts.ultimaDataUnidade) charts.ultimaDataUnidade.destroy();
    charts.ultimaDataUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item.unidade),
            datasets: [{ label: 'Última Data', data: sortedData.map((_, i) => sortedData.length - i), backgroundColor: '#ef4444', barThickness: 25 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold', size: 16 }, formatter: (_, context) => sortedData[context.dataIndex].date } },
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
    const sortedData = Object.entries(lastDateByLab).map(([lab, date]) => ({ lab, date: date.toLocaleDateString('pt-BR') })).sort((a, b) => parseDate(b.date) - parseDate(a.date));
    const ctx = document.getElementById('chartUltimaDataLaboratorio').getContext('2d');
    if (charts.ultimaDataLaboratorio) charts.ultimaDataLaboratorio.destroy();
    charts.ultimaDataLaboratorio = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item.lab),
            datasets: [{ label: 'Última Data', data: sortedData.map((_, i) => sortedData.length - i), backgroundColor: '#ea580c', barThickness: 25 }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold', size: 16 }, formatter: (_, context) => sortedData[context.dataIndex].date } },
            scales: { x: { display: false }, y: { ticks: { font: { weight: 'bold' } } } }
        }
    });
}

function updateTablePacientesDiaUnidade() {
    const dayUnidadeCount = {};
    filteredData.forEach(item => { if (item.dataAgendamento && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') { const key = `${item.dataAgendamento} - ${item.unidadeSaude}`; dayUnidadeCount[key] = (dayUnidadeCount[key] || 0) + 1; } });
    const data = Object.entries(dayUnidadeCount).map(([key, count]) => { const [data, unidade] = key.split(' - '); return { data, unidade, count }; }).sort((a, b) => (parseDate(b.data) - parseDate(a.data)) || b.count - a.count);
    createSummaryTableWithTotal('tabelaResumoUnidade', data, [{ key: 'data' }, { key: 'unidade' }, { key: 'count' }], 'count');
}

function updateTablePacientesDiaLaboratorio() {
    const dayLabCount = {};
    filteredData.forEach(item => { if (item.dataAgendamento && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') { const key = `${item.dataAgendamento} - ${item.laboratorioColeta}`; dayLabCount[key] = (dayLabCount[key] || 0) + 1; } });
    const data = Object.entries(dayLabCount).map(([key, count]) => { const [data, laboratorio] = key.split(' - '); return { data, laboratorio, count }; }).sort((a, b) => (parseDate(b.data) - parseDate(a.data)) || b.count - a.count);
    createSummaryTableWithTotal('tabelaResumoLaboratorio', data, [{ key: 'data' }, { key: 'laboratorio' }, { key: 'count' }], 'count');
}

function updateTableVagasLivresDia() {
    const dayUnidadeSlots = {}, dayUnidadeOccupied = {};
    filteredData.forEach(item => { if (item.dataAgendamento && item.unidadeSaude) { const key = `${item.dataAgendamento} - ${item.unidadeSaude}`; dayUnidadeSlots[key] = (dayUnidadeSlots[key] || 0) + 1; if (item.nomePaciente && item.nomePaciente.trim() !== '') dayUnidadeOccupied[key] = (dayUnidadeOccupied[key] || 0) + 1; } });
    const data = Object.entries(dayUnidadeSlots).map(([key, total]) => { const free = total - (dayUnidadeOccupied[key] || 0); const [data, unidade] = key.split(' - '); return { data, unidade, free }; }).filter(item => item.free > 0).sort((a, b) => (parseDate(b.data) - parseDate(a.data)) || b.free - a.free);
    createSummaryTableWithTotal('tabelaVagasLivresDia', data, [{ key: 'data' }, { key: 'unidade' }, { key: 'free' }], 'free');
}

function updateTableVagasLivresMes() {
    const monthUnidadeSlots = {}, monthUnidadeOccupied = {};
    filteredData.forEach(item => { const date = parseDate(item.dataAgendamento); if (date && item.unidadeSaude) { const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`; const key = `${monthYear} - ${item.unidadeSaude}`; monthUnidadeSlots[key] = (monthUnidadeSlots[key] || 0) + 1; if (item.nomePaciente && item.nomePaciente.trim() !== '') monthUnidadeOccupied[key] = (monthUnidadeOccupied[key] || 0) + 1; } });
    const data = Object.entries(monthUnidadeSlots).map(([key, total]) => { const free = total - (monthUnidadeOccupied[key] || 0); const [mesAno, unidade] = key.split(' - '); return { mesAno, unidade, free }; }).filter(item => item.free > 0).sort((a, b) => b.free - a.free);
    createSummaryTableWithTotal('tabelaVagasLivresMes', data, [{ key: 'mesAno' }, { key: 'unidade' }, { key: 'free' }], 'free');
}

function updateTablePacientesMesUnidade() {
    const monthUnidadeCount = {};
    filteredData.forEach(item => { const date = parseDate(item.dataAgendamento); if (date && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') { const key = `${date.getMonth() + 1}/${date.getFullYear()} - ${item.unidadeSaude}`; monthUnidadeCount[key] = (monthUnidadeCount[key] || 0) + 1; } });
    const data = Object.entries(monthUnidadeCount).map(([key, count]) => { const [mesAno, unidade] = key.split(' - '); return { mesAno, unidade, count }; }).sort((a, b) => b.count - a.count);
    createSummaryTableWithTotal('tabelaPacientesMesUnidade', data, [{ key: 'mesAno' }, { key: 'unidade' }, { key: 'count' }], 'count');
}

function updateTablePacientesMesLaboratorio() {
    const monthLabCount = {};
    filteredData.forEach(item => { const date = parseDate(item.dataAgendamento); if (date && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') { const key = `${date.getMonth() + 1}/${date.getFullYear()} - ${item.laboratorioColeta}`; monthLabCount[key] = (monthLabCount[key] || 0) + 1; } });
    const data = Object.entries(monthLabCount).map(([key, count]) => { const [mesAno, laboratorio] = key.split(' - '); return { mesAno, laboratorio, count }; }).sort((a, b) => b.count - a.count);
    createSummaryTableWithTotal('tabelaPacientesMesLaboratorio', data, [{ key: 'mesAno' }, { key: 'laboratorio' }, { key: 'count' }], 'count');
}

function updateTableVagasLivresMesLaboratorio() {
    const monthLabSlots = {}, monthLabOccupied = {};
    filteredData.forEach(item => { const date = parseDate(item.dataAgendamento); if (date && item.laboratorioColeta) { const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`; const key = `${monthYear} - ${item.laboratorioColeta}`; monthLabSlots[key] = (monthLabSlots[key] || 0) + 1; if (item.nomePaciente && item.nomePaciente.trim() !== '') monthLabOccupied[key] = (monthLabOccupied[key] || 0) + 1; } });
    const data = Object.entries(monthLabSlots).map(([key, total]) => { const free = total - (monthLabOccupied[key] || 0); const [mesAno, laboratorio] = key.split(' - '); return { mesAno, laboratorio, free }; }).filter(item => item.free > 0).sort((a, b) => b.free - a.free);
    createSummaryTableWithTotal('tabelaVagasLivresMesLaboratorio', data, [{ key: 'mesAno' }, { key: 'laboratorio' }, { key: 'free' }], 'free');
}

function updateTable() {
    if (dataTable) dataTable.destroy();
    const tableBody = document.querySelector('#agendamentosTable tbody');
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

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
