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
            
            // Encontrar a linha com os cabeçalhos (linha 6 no CSV)
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

            // Processar cabeçalhos removendo as duas primeiras colunas vazias
            const headerLine = lines[headerLineIndex];
            const rawHeaders = parseCSVLine(headerLine);
            const headers = rawHeaders.slice(2); // Remove as duas primeiras colunas vazias

            console.log('Cabeçalhos encontrados:', headers);

            allData = [];
            
            // Processar dados a partir da linha seguinte aos cabeçalhos
            for (let i = headerLineIndex + 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const rawValues = parseCSVLine(line);
                    const values = rawValues.slice(2); // Remove as duas primeiras colunas vazias
                    
                    // Verificar se a linha tem dados válidos
                    if (values.length >= headers.length && values.some(val => val.trim() !== '')) {
                        let row = {};
                        
                        // Mapear os cabeçalhos para as propriedades do objeto
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
                                    // Para cabeçalhos não reconhecidos, usar uma versão limpa do nome
                                    const cleanKey = cleanHeader.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                                    row[cleanKey] = value;
                                    break;
                            }
                        });
                        
                        // Só adicionar se tiver pelo menos unidade de saúde ou data
                        if (row.unidadeSaude || row.dataAgendamento) {
                            allData.push(row);
                        }
                    }
                }
            }
            
            console.log(`Carregados ${allData.length} registros da planilha`);
            
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
        
        // Em caso de erro, mostrar mensagem para o usuário
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
        if (item.unidadeSaude && item.unidadeSaude !== 'Preencher') {
            unidadeSaudeSet.add(item.unidadeSaude);
        }
        if (item.horarioAgendamento) {
            horarioSet.add(item.horarioAgendamento);
        }
        if (item.laboratorioColeta && item.laboratorioColeta !== 'Preencher') {
            laboratorioColetaSet.add(item.laboratorioColeta);
        }
    });

    updateSelectOptions('unidadeSaudeFilter', Array.from(unidadeSaudeSet).sort());
    updateSelectOptions('horarioFilter', Array.from(horarioSet).sort());
    updateSelectOptions('laboratorioColetaFilter', Array.from(laboratorioColetaSet).sort());
}

function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    // Clear existing options, but keep the first 'Todos' option if it exists
    while (select.options.length > 0) {
        select.remove(0);
    }
    
    // Add a default 'Todos' option for single-select filters, or none for multi-select
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
    const unidadeSaudeFilter = Array.from(document.getElementById('unidadeSaudeFilter').selectedOptions).map(option => option.value);
    const horarioFilter = Array.from(document.getElementById('horarioFilter').selectedOptions).map(option => option.value);
    const dataFilter = document.getElementById('dataFilter').value;
    const laboratorioColetaFilter = Array.from(document.getElementById('laboratorioColetaFilter').selectedOptions).map(option => option.value);

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
        // Date format is DD/MM/YYYY, convert to YYYY-MM-DD for Date object
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return null;
}

// Register Chart.js DataLabels plugin
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

// Gráfico 1: Pacientes agendados por dia e unidade de saúde (azul escuro)
function updateChartPacientesDiaUnidade() {
    const dayUnidadeCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${item.dataAgendamento} - ${item.unidadeSaude}`;
            dayUnidadeCount[key] = (dayUnidadeCount[key] || 0) + 1;
        }
    });

    const sortedData = Object.entries(dayUnidadeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const ctx = document.getElementById('chartPacientesDiaUnidade').getContext('2d');
    if (charts.pacientesDiaUnidade) charts.pacientesDiaUnidade.destroy();

    charts.pacientesDiaUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#1e3a8a', // azul escuro
                borderColor: '#1e40af',
                borderWidth: 1
            }]
        },
        options: {
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
                y: { beginAtZero: true },
                x: { ticks: { maxRotation: 45 } }
            }
        }
    });
}

// Gráfico 2: Pacientes agendados por mês e unidade de saúde (verde escuro)
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

    const sortedData = Object.entries(monthUnidadeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const ctx = document.getElementById('chartPacientesMesUnidade').getContext('2d');
    if (charts.pacientesMesUnidade) charts.pacientesMesUnidade.destroy();

    charts.pacientesMesUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#14532d', // verde escuro
                borderColor: '#166534',
                borderWidth: 1
            }]
        },
        options: {
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
                y: { beginAtZero: true },
                x: { ticks: { maxRotation: 45 } }
            }
        }
    });
}

// Gráfico 3: Pacientes agendados por dia e laboratório de coleta (roxo escuro)
function updateChartPacientesDiaLaboratorio() {
    const dayLabCount = {};
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.laboratorioColeta && item.nomePaciente && item.nomePaciente.trim() !== '') {
            const key = `${item.dataAgendamento} - ${item.laboratorioColeta}`;
            dayLabCount[key] = (dayLabCount[key] || 0) + 1;
        }
    });

    const sortedData = Object.entries(dayLabCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const ctx = document.getElementById('chartPacientesDiaLaboratorio').getContext('2d');
    if (charts.pacientesDiaLaboratorio) charts.pacientesDiaLaboratorio.destroy();

    charts.pacientesDiaLaboratorio = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#581c87', // roxo escuro
                borderColor: '#6b21a8',
                borderWidth: 1
            }]
        },
        options: {
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
                y: { beginAtZero: true },
                x: { ticks: { maxRotation: 45 } }
            }
        }
    });
}

// Gráfico 4: Pacientes agendados por mês e laboratório de coleta (vermelho escuro)
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

    const sortedData = Object.entries(monthLabCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const ctx = document.getElementById('chartPacientesMesLaboratorio').getContext('2d');
    if (charts.pacientesMesLaboratorio) charts.pacientesMesLaboratorio.destroy();

    charts.pacientesMesLaboratorio = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Pacientes Agendados',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#7f1d1d', // vermelho escuro
                borderColor: '#991b1b',
                borderWidth: 1
            }]
        },
        options: {
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
                y: { beginAtZero: true },
                x: { ticks: { maxRotation: 45 } }
            }
        }
    });
}

// Gráfico 5: Vagas livres por dia e unidade de saúde (rosa escuro)
function updateChartVagasLivresDiaUnidade() {
    // Calcular vagas livres baseado nos slots disponíveis vs ocupados
    const dayUnidadeSlots = {};
    const dayUnidadeOccupied = {};
    
    // Primeiro, contar slots ocupados (com pacientes)
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude) {
            const key = `${item.dataAgendamento} - ${item.unidadeSaude}`;
            dayUnidadeSlots[key] = (dayUnidadeSlots[key] || 0) + 1;
            
            if (item.nomePaciente && item.nomePaciente.trim() !== '') {
                dayUnidadeOccupied[key] = (dayUnidadeOccupied[key] || 0) + 1;
            }
        }
    });
    
    // Calcular vagas livres
    const freeSlots = {};
    Object.keys(dayUnidadeSlots).forEach(key => {
        const total = dayUnidadeSlots[key];
        const occupied = dayUnidadeOccupied[key] || 0;
        freeSlots[key] = total - occupied;
    });

    const sortedData = Object.entries(freeSlots)
        .filter(item => item[1] > 0) // Só mostrar onde há vagas livres
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const ctx = document.getElementById('chartVagasLivresDiaUnidade').getContext('2d');
    if (charts.vagasLivresDiaUnidade) charts.vagasLivresDiaUnidade.destroy();

    charts.vagasLivresDiaUnidade = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [{
                label: 'Vagas Livres',
                data: sortedData.map(item => item[1]),
                backgroundColor: '#be185d', // rosa escuro
                borderColor: '#db2777',
                borderWidth: 1
            }]
        },
        options: {
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
                y: { beginAtZero: true },
                x: { ticks: { maxRotation: 45 } }
            }
        }
    });
}

// Gráfico 6: Vagas livres por mês e unidade de saúde (cinza escuro)
function updateChartVagasLivresMesUnidade() {
    // Calcular vagas livres por mês
    const monthUnidadeSlots = {};
    const monthUnidadeOccupied = {};
    
    filteredData.forEach(item => {
        if (item.dataAgendamento && item.unidadeSaude) {
            const date = parseDate(item.dataAgendamento);
            if (date) {
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                const key = `${monthYear} - ${item.unidadeSaude}`;
                monthUnidadeSlots[key] = (monthUnidadeSlots[key] || 0) + 1;
                
                if (item.nomePaciente && item.nomePaciente.trim() !== '') {
                    monthUnidadeOccupied[key] = (monthUnidadeOccupied[key] || 0) + 1;
                }
            }
        }
    });
    
    // Calcular vagas livres
    const freeSlots = {};
    Object.keys(monthUnidadeSlots).forEach(key => {
        const total = monthUnidadeSlots[key];
        const occupied = monthUnidadeOccupied[key] || 0;
        freeSlots[key] = total - occupied;
    });

    const sortedData = Object.entries(freeSlots)
