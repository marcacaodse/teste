let allData = [];
let filteredData = [];
let charts = {}; // Objeto para guardar as instâncias dos gráficos
let dataTable;

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
        updateFilters();
        updateDashboard();
        document.getElementById('connectionStatus').className = 'status-indicator status-online';
        document.getElementById('connectionText').textContent = 'Conectado';
        document.getElementById('lastUpdate').textContent = `Última atualização: ${new Date().toLocaleString('pt-BR')}`;
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
}

function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
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
}

function createSummaryTable(containerId, data, columns) {
    const tableBody = document.getElementById(containerId);
    tableBody.innerHTML = data.map(row => `
        <tr class="bg-white border-b">
            ${columns.map(col => `<td class="px-6 py-4 ${col.isNumeric ? 'font-medium text-gray-900' : ''}">${row[col.key]}</td>`).join('')}
        </tr>
    `).join('');
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

    const ctx = document.getElementById('chartUltimaDataUnidade').getContext('2d');
    if (charts.ultimaDataUnidade) charts.ultimaDataUnidade.destroy();
    charts.ultimaDataUnidade = new Chart(ctx, {
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
                datalabels: { color: '#fff', font: { weight: 'bold' }, formatter: (_, context) => sortedData[context.dataIndex].date }
            },
            scales: { x: { display: false } }
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

    const ctx = document.getElementById('chartUltimaDataLaboratorio').getContext('2d');
    if (charts.ultimaDataLaboratorio) charts.ultimaDataLaboratorio.destroy();
    charts.ultimaDataLaboratorio = new Chart(ctx, {
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
                datalabels: { color: '#fff', font: { weight: 'bold' }, formatter: (_, context) => sortedData[context.dataIndex].date }
            },
            scales: { x: { display: false } }
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
    createSummaryTable('tabelaResumoUnidade', data, [
        { key: 'data' }, { key: 'unidade' }, { key: 'count', isNumeric: true }
    ]);
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
    createSummaryTable('tabelaResumoLaboratorio', data, [
        { key: 'data' }, { key: 'laboratorio' }, { key: 'count', isNumeric: true }
    ]);
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
    createSummaryTable('tabelaVagasLivresDia', data, [
        { key: 'data' }, { key: 'unidade' }, { key: 'free', isNumeric: true }
    ]);
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
    createSummaryTable('tabelaVagasLivresMes', data, [
        { key: 'mesAno' }, { key: 'unidade' }, { key: 'free', isNumeric: true }
    ]);
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
    createSummaryTable('tabelaPacientesMesUnidade', data, [
        { key: 'mesAno' }, { key: 'unidade' }, { key: 'count', isNumeric: true }
    ]);
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
    createSummaryTable('tabelaPacientesMesLaboratorio', data, [
        { key: 'mesAno' }, { key: 'laboratorio' }, { key: 'count', isNumeric: true }
    ]);
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

function clearFilters() {
    document.getElementById('dataFilter').value = '';
    ['unidadeSaudeFilter', 'horarioFilter', 'laboratorioColetaFilter'].forEach(id => {
        Array.from(document.getElementById(id).options).forEach(option => option.selected = false);
    });
    applyFilters();
}

function exportToExcel() {
    const sheets = {
        'Todos_Agendamentos': filteredData.map(item => ({
            'UNIDADE DE SAÚDE': item.unidadeSaude || '',
            'DATA': item.dataAgendamento || '',
            'HORÁRIO': item.horarioAgendamento || '',
            'Nº PRONTUÁRIO VIVVER': item.prontuarioVivver || '',
            'OBSERVAÇÃO/ UNIDADE DE SAÚDE': item.observacaoUnidadeSaude || '',
            'PERFIL DO PACIENTE OU TIPO DO EXAME': item.perfilPacienteExame || '',
            'Laboratório de Coleta': item.laboratorioColeta || ''
        }))
    };

    const wb = XLSX.utils.book_new();
    for (const sheetName in sheets) {
        const ws = XLSX.utils.json_to_sheet(sheets[sheetName]);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
    XLSX.writeFile(wb, `agendamentos_eldorado_${new Date().toISOString().split('T')[0]}.xlsx`);
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 300000);
});
