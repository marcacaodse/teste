let allData = [];
let filteredData = [];
let charts = {};
let dataTable;

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Gtan6GhpDO5ViVuNMiT0AGm3F5I5iZSIYhWHVJ3ga6E/export?format=csv&gid=64540129';

// Unidades de Saúde corretas conforme especificado pelo usuário
const UNIDADES_SAUDE = [
    'AGUA BRANCA',
    'JARDIM BANDEIRANTES',
    'CSU ELDORADO',
    'UNIDADE XV',
    'NOVO ELDORADO',
    'SANTA CRUZ',
    'JARDIM ELDORADO',
    'PEROBAS',
    'PARQUE SAO JOAO'
];

// Laboratórios de Coleta corretos conforme especificado pelo usuário
const LABORATORIOS_COLETA = [
    'AGUA BRANCA',
    'ELDORADO',
    'PARQUE SAO JOAO'
];

async function loadData( ) {
    try {
        document.getElementById('connectionStatus').className = 'status-indicator status-online';
        document.getElementById('connectionText').textContent = 'Carregando...';

        const response = await fetch(SHEET_URL);
        const csvText = await response.text();

        if (csvText && csvText.length > 100) {
            const lines = csvText.split('\n');
            
            let headerLineIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('UNIDADE DE SAÚDE') && lines[i].includes('DATA')) {
                    headerLineIndex = i;
                    break;
                }
            }

            if (headerLineIndex === -1) {
                throw new Error('Cabeçalhos não encontrados na planilha');
            }

            const headerLine = lines[headerLineIndex];
            const rawHeaders = parseCSVLine(headerLine);
            const headers = rawHeaders.slice(2);

            allData = [];
            
            for (let i = headerLineIndex + 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const rawValues = parseCSVLine(line);
                    const values = rawValues.slice(2);
                    
                    if (values.length >= headers.length && values.some(val => val.trim() !== '')) {
                        let row = {};
                        
                        headers.forEach((header, index) => {
                            const cleanHeader = header.trim();
                            const value = values[index] ? values[index].trim() : '';
                            
                            switch (cleanHeader) {
                                case 'UNIDADE DE SAÚDE':
                                    row.unidadeSaude = value;
                                    break;
                                case 'DATA':
                                    row.dataAgendamento = value;
                                    break;
                                case 'HORÁRIO':
                                    row.horarioAgendamento = value;
                                    break;
                                case 'NOME DO PACIENTE':
                                    row.nomePaciente = value;
                                    break;
                                case 'TELEFONE':
                                    row.telefone = value;
                                    break;
                                case 'Nº PRONTUÁRIO VIVVER':
                                    row.prontuarioVivver = value;
                                    break;
                                case 'OBSERVAÇÃO/ UNIDADE DE SAÚDE':
                                    row.observacaoUnidadeSaude = value;
                                    break;
                                case 'PERFIL DO PACIENTE OU TIPO DO EXAME':
                                    row.perfilPacienteExame = value;
                                    break;
                                case 'Laboratório de Coleta:':
                                    row.laboratorioColeta = value;
                                    break;
                                default:
                                    const cleanKey = cleanHeader.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                    row[cleanKey] = value;
                                    break;
                            }
                        });
                        
                        if (row.unidadeSaude || row.dataAgendamento) {
                            allData.push(row);
                        }
                    }
                }
            }
            
        } else {
            throw new Error('Dados CSV vazios ou inválidos');
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
        alert('Erro ao carregar dados da planilha. Verifique a conexão com a internet e tente novamente.');
    }
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function updateFilters() {
    const unidadeSaudeSet = new Set();
    const horarioSet = new Set();
    const laboratorioColetaSet = new Set();

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
    while (select.options.length > 0) {
        select.remove(0);
    }
    
    if (!select.multiple) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos';
        select.appendChild(defaultOption);
    }

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

function applyFilters() {
    const unidadeSaudeFilter = Array.from(document.getElementById('unidadeSaudeFilter').selectedOptions).map(o => o.value);
    const horarioFilter = Array.from(document.getElementById('horarioFilter').selectedOptions).map(o => o.value);
    const dataFilter = document.getElementById('dataFilter').value;
    const laboratorioColetaFilter = Array.from(document.getElementById('laboratorioColetaFilter').selectedOptions).map(o => o.value);

    filteredData = allData.filter(item => {
        if (unidadeSaudeFilter.length > 0 && !unidadeSaudeFilter.includes(item.unidadeSaude)) return false;
        if (horarioFilter.length > 0 && !horarioFilter.includes(item.horarioAgendamento)) return false;
        if (laboratorioColetaFilter.length > 0 && !laboratorioColetaFilter.includes(item.laboratorioColeta)) return false;

        if (dataFilter) {
            const itemDate = parseDate(item.dataAgendamento);
            const filterDate = new Date(dataFilter);
            if (itemDate && itemDate.toDateString() !== filterDate.toDateString()) return false;
        }

        return true;
    });

    updateDashboard();
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return null;
}

Chart.register(ChartDataLabels);

function updateDashboard() {
    updateCharts();
    updateTable();
}

function updateCharts() {
    updateChartPacientesDiaUnidade();
    updateChartPacientesMesUnidade();
    updateChartPacientesDiaLaboratorio();
    updateChartPacientesMesLaboratorio();
    updateChartVagasLivresDiaUnidade();
    updateChartVagasLivresMesUnidade();
    updateChartUltimaDataAgendamento();
}

function updateChartPacientesDiaUnidade() {
    const dayUnidadeCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${item.dataAgendamento} - ${item.unidadeSaude}`;
            dayUnidadeCount[key] = (dayUnidadeCount[key] || 0) + 1;
        }
    });

    const sortedData = Object.entries(dayUnidadeCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const ctx = document.getElementById('chartPacientesDiaUnidade').getContext('2d');
    if (charts.pacientesDiaUnidade) charts.pacientesDiaUnidade.destroy();

    charts.pacientesDiaUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#1e3a8a',
                borderColor: '#1e40af',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold', size: 15 }, anchor: 'center', align: 'center' } },
            scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45 } } }
        }
    });
}

function updateChartPacientesMesUnidade() {
    const monthUnidadeCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const date = parseDate(item.dataAgendamento);
            if (date) {
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                const key = `${monthYear} - ${item.unidadeSaude}`;
                monthUnidadeCount[key] = (monthUnidadeCount[key] || 0) + 1;
            }
        }
    });

    const sortedData = Object.entries(monthUnidadeCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const ctx = document.getElementById('chartPacientesMesUnidade').getContext('2d');
    if (charts.pacientesMesUnidade) charts.pacientesMesUnidade.destroy();

    charts.pacientesMesUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#14532d',
                borderColor: '#166534',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold', size: 15 }, anchor: 'center', align: 'center' } },
            scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45 } } }
        }
    });
}

function updateChartPacientesDiaLaboratorio() {
    const dayLabCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${item.dataAgendamento} - ${item.laboratorioColeta}`;
            dayLabCount[key] = (dayLabCount[key] || 0) + 1;
        }
    });

    const sortedData = Object.entries(dayLabCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const ctx = document.getElementById('chartPacientesDiaLaboratorio').getContext('2d');
    if (charts.pacientesDiaLaboratorio) charts.pacientesDiaLaboratorio.destroy();

    charts.pacientesDiaLaboratorio = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#581c87',
                borderColor: '#6b21a8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold', size: 15 }, anchor: 'center', align: 'center' } },
            scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45 } } }
        }
    });
}

function updateChartPacientesMesLaboratorio() {
    const monthLabCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const date = parseDate(item.dataAgendamento);
            if (date) {
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                const key = `${monthYear} - ${item.laboratorioColeta}`;
                monthLabCount[key] = (monthLabCount[key] || 0) + 1;
            }
        }
    });

    const sortedData = Object.entries(monthLabCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const ctx = document.getElementById('chartPacientesMesLaboratorio').getContext('2d');
    if (charts.pacientesMesLaboratorio) charts.pacientesMesLaboratorio.destroy();

    charts.pacientesMesLaboratorio = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#7f1d1d',
                borderColor: '#991b1b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold', size: 15 }, anchor: 'center', align: 'center' } },
            scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45 } } }
        }
    });
}

function updateChartVagasLivresDiaUnidade() {
    const dayUnidadeSlots = {};
    const dayUnidadeOccupied = {};
    
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude) {
            const key = `${item.dataAgendamento} - ${item.unidadeSaude}`;
            dayUnidadeSlots[key] = (dayUnidadeSlots[key] || 0) + 1;
            if (item.nomePaciente && item.nomePaciente.trim() !== '') {
                dayUnidadeOccupied[key] = (dayUnidadeOccupied[key] || 0) + 1;
            }
        }
    });
    
    const freeSlots = {};
    Object.keys(dayUnidadeSlots).forEach(key => {
        freeSlots[key] = dayUnidadeSlots[key] - (dayUnidadeOccupied[key] || 0);
    });

    const sortedData = Object.entries(freeSlots).filter(item => item[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const ctx = document.getElementById('chartVagasLivresDiaUnidade').getContext('2d');
    if (charts.vagasLivresDiaUnidade) charts.vagasLivresDiaUnidade.destroy();

    charts.vagasLivresDiaUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Vagas Livres',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#be185d',
                borderColor: '#db2777',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold', size: 15 }, anchor: 'center', align: 'center' } },
            scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45 } } }
        }
    });
}

// Gráfico 6: Vagas livres por mês e unidade de saúde - **ALTERADO**
function updateChartVagasLivresMesUnidade() {
    const monthUnidadeSlots = {};
    const monthUnidadeOccupied = {};
    
    // 1. Inicializa a contagem para todas as unidades de saúde com zero.
    // Isso garante que todas as 9 unidades apareçam no gráfico, mesmo se não tiverem dados.
    const date = new Date();
    const currentMonthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    UNIDADES_SAUDE.forEach(unidade => {
        const key = `${currentMonthYear} - ${unidade}`;
        monthUnidadeSlots[key] = 0;
        monthUnidadeOccupied[key] = 0;
    });

    // 2. Processa os dados filtrados para contar vagas totais e ocupadas.
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude) {
            const itemDate = parseDate(item.dataAgendamento);
            if (itemDate) {
                const monthYear = `${itemDate.getMonth() + 1}/${itemDate.getFullYear()}`;
                const key = `${monthYear} - ${item.unidadeSaude}`;
                
                // Garante que a chave exista antes de incrementar
                if (monthUnidadeSlots[key] === undefined) {
                    monthUnidadeSlots[key] = 0;
                    monthUnidadeOccupied[key] = 0;
                }

                monthUnidadeSlots[key]++;
                if (item.nomePaciente && item.nomePaciente.trim() !== '') {
                    monthUnidadeOccupied[key]++;
                }
            }
        }
    });
    
    // 3. Calcula as vagas livres.
    const freeSlots = {};
    Object.keys(monthUnidadeSlots).forEach(key => {
        freeSlots[key] = monthUnidadeSlots[key] - (monthUnidadeOccupied[key] || 0);
    });

    // 4. Converte para array e ordena para uma visualização consistente.
    const chartData = Object.entries(freeSlots)
        .sort((a, b) => a[0].localeCompare(b[0])); // Ordena alfabeticamente pela chave (Mês - Unidade)

    const ctx = document.getElementById('chartVagasLivresMesUnidade').getContext('2d');
    if (charts.vagasLivresMesUnidade) charts.vagasLivresMesUnidade.destroy();

    charts.vagasLivresMesUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(item => item[0]),
            datasets: [{
                label: 'Vagas Livres',
                data: chartData.map(item => item[1]),
                backgroundColor: '#374151',
                borderColor: '#4b5563',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 15 },
                    anchor: 'center',
                    align: 'center'
                }
            },
            scales: {
                x: { beginAtZero: true },
                y: { ticks: { autoSkip: false } }
            }
        }
    });
}

function updateChartUltimaDataAgendamento() {
    const lastDateByLab = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const date = parseDate(item.dataAgendamento);
            if (date) {
                if (!lastDateByLab[item.laboratorioColeta] || date > lastDateByLab[item.laboratorioColeta]) {
                    lastDateByLab[item.laboratorioColeta] = date;
                }
            }
        }
    });

    const sortedData = Object.entries(lastDateByLab)
        .map(([lab, date]) => [lab, date.toLocaleDateString('pt-BR')])
        .sort((a, b) => new Date(b[1].split('/').reverse().join('-')) - new Date(a[1].split('/').reverse().join('-')));

    const ctx = document.getElementById('chartUltimaDataAgendamento').getContext('2d');
    if (charts.ultimaDataAgendamento) charts.ultimaDataAgendamento.destroy();

    charts.ultimaDataAgendamento = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Última Data de Agendamento',
                data: sortedData.map((item, index) => index + 1),
                backgroundColor: '#ea580c',
                borderColor: '#f97316',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    color: '#fff', font: { weight: 'bold', size: 12 }, anchor: 'center', align: 'center',
                    formatter: (value, context) => sortedData[context.dataIndex][1]
                }
            },
            scales: { x: { display: false }, y: { beginAtZero: true } }
        }
    });
}

function updateTable() {
    if (dataTable) {
        dataTable.destroy();
    }
    
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
        const select = document.getElementById(id);
        Array.from(select.options).forEach(option => option.selected = false);
    });
    applyFilters();
}

function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
        'UNIDADE DE SAÚDE': item.unidadeSaude || '',
        'DATA': item.dataAgendamento || '',
        'HORÁRIO': item.horarioAgendamento || '',
        'Nº PRONTUÁRIO VIVVER': item.prontuarioVivver || '',
        'OBSERVAÇÃO/ UNIDADE DE SAÚDE': item.observacaoUnidadeSaude || '',
        'PERFIL DO PACIENTE OU TIPO DO EXAME': item.perfilPacienteExame || '',
        'Laboratório de Coleta': item.laboratorioColeta || ''
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos');
    XLSX.writeFile(wb, `agendamentos_eldorado_${new Date().toISOString().split('T')[0]}.xlsx`);
}

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setInterval(loadData, 300000);
});
