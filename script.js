// =================================================================================
// CONFIGURAÇÃO E VARIÁVEIS GLOBAIS
// =================================================================================

const SHEET_ID = '1Gtan6GhpDO5ViVuNMiT0AGm3F5I5iZSIYhWHVJ3ga6E';
const SHEET_GID = '64540129';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

let allData = [];
let filteredData = [];
let dataTable;
let charts = {};

// =================================================================================
// FUNÇÃO PRINCIPAL DE CARREGAMENTO DE DADOS
// =================================================================================

async function loadData( ) {
    updateConnectionStatus('loading', 'A carregar dados...');
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.statusText}`);
        }
        const csvText = await response.text();
        
        // REVERTIDO PARA A SUA FUNÇÃO ORIGINAL DE PARSE, QUE JÁ FUNCIONAVA
        allData = parseCSV(csvText);
        
        if (allData.length === 0) {
            throw new Error("Nenhum dado encontrado na planilha. Verifique o formato.");
        }

        populateFilterOptions();
        applyFilters();
        
        updateConnectionStatus('online', 'Dados carregados com sucesso!');
        document.getElementById('lastUpdate').textContent = `Última atualização: ${new Date().toLocaleString('pt-BR')}`;

    } catch (error) {
        console.error('Falha ao carregar ou processar dados:', error);
        updateConnectionStatus('offline', `Erro: ${error.message}`);
    }
}

// =================================================================================
// FUNÇÕES DE PROCESSAMENTO E FILTRAGEM
// =================================================================================

/**
 * Converte o texto CSV bruto num array de objetos.
 * ESTA É A SUA FUNÇÃO ORIGINAL, MANTIDA CONFORME SOLICITADO.
 * @param {string} text - O conteúdo do ficheiro CSV.
 * @returns {Array<Object>}
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headerIndex = lines.findIndex(line => line.includes('UNIDADE DE SAÚDE'));
    if (headerIndex === -1) return [];

    const headers = lines[headerIndex].split(',').map(h => h.trim());
    const data = [];

    const columnMapping = {
        'UNIDADE DE SAÚDE': 'unidadeSaude',
        'DATA': 'data',
        'HORÁRIO': 'horario',
        'NOME DO PACIENTE': 'nomePaciente',
        'TELEFONE': 'telefone',
        'Nº PRONTUÁRIO VIVVER': 'prontuario',
        'OBSERVAÇÃO/ UNIDADE DE SAÚDE': 'observacao',
        'PERFIL DO PACIENTE OU TIPO DO EXAME': 'perfilExame',
        'Laboratório de Coleta': 'laboratorioColeta'
    };

    for (let i = headerIndex + 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;

        let row = {};
        let hasValue = false;
        headers.forEach((header, index) => {
            const propName = columnMapping[header];
            if (propName) {
                const value = values[index] ? values[index].trim() : '';
                row[propName] = value;
                if (value) hasValue = true;
            }
        });

        if (hasValue) {
            data.push(row);
        }
    }
    return data;
}


/**
 * Filtra os dados com base nas seleções do utilizador e atualiza o painel.
 * LÓGICA ATUALIZADA PARA OS NOVOS FILTROS.
 */
function applyFilters() {
    const unidadeFilter = getMultiSelectValues('unidadeFilter');
    const laboratorioFilter = getMultiSelectValues('laboratorioFilter');
    const horarioFilter = getMultiSelectValues('horarioFilter');

    filteredData = allData.filter(item => {
        if (unidadeFilter.length > 0 && !unidadeFilter.includes(item.unidadeSaude)) return false;
        if (laboratorioFilter.length > 0 && !laboratorioFilter.includes(item.laboratorioColeta)) return false;
        if (horarioFilter.length > 0 && !horarioFilter.includes(item.horario)) return false;

        return true;
    });

    updateDashboard();
}

/**
 * Limpa todos os filtros e recarrega o painel com todos os dados.
 * LÓGICA ATUALIZADA PARA OS NOVOS FILTROS.
 */
function clearFilters() {
    ['unidadeFilter', 'laboratorioFilter', 'horarioFilter'].forEach(id => {
        const select = document.getElementById(id);
        Array.from(select.options).forEach(option => option.selected = false);
    });
    applyFilters();
}

// =================================================================================
// FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE (UI)
// =================================================================================

function updateDashboard() {
    updateKPIs(); // Mantido para mostrar os totais
    updateCharts(); // ATUALIZADO PARA OS NOVOS GRÁFICOS
    updateTable(); // ATUALIZADO PARA A NOVA COLUNA
}

/**
 * Popula os menus de seleção de filtros com opções únicas da base de dados.
 * LÓGICA ATUALIZADA PARA OS NOVOS FILTROS.
 */
function populateFilterOptions() {
    const unidades = [...new Set(allData.map(item => item.unidadeSaude).filter(Boolean))].sort();
    const laboratorios = [...new Set(allData.map(item => item.laboratorioColeta).filter(Boolean))].sort();
    const horarios = [...new Set(allData.map(item => item.horario).filter(Boolean))].sort();

    document.getElementById('unidadeFilter').innerHTML = unidades.map(u => `<option value="${u}">${u}</option>`).join('');
    document.getElementById('laboratorioFilter').innerHTML = laboratorios.map(l => `<option value="${l}">${l}</option>`).join('');
    document.getElementById('horarioFilter').innerHTML = horarios.map(h => `<option value="${h}">${h}</option>`).join('');
}

function updateKPIs() {
    const totalVagas = filteredData.length;
    const vagasOcupadas = filteredData.filter(item => item.nomePaciente && item.nomePaciente.trim() !== '').length;
    const vagasLivres = totalVagas - vagasOcupadas;
    const taxaOcupacao = totalVagas > 0 ? ((vagasOcupadas / totalVagas) * 100).toFixed(1) : 0;

    const kpis = [
        { title: 'Total de Vagas', value: totalVagas, icon: 'fa-calendar-check', color: 'blue' },
        { title: 'Vagas Ocupadas', value: vagasOcupadas, icon: 'fa-user-check', color: 'green' },
        { title: 'Vagas Livres', value: vagasLivres, icon: 'fa-calendar-plus', color: 'orange' },
        { title: 'Taxa de Ocupação', value: `${taxaOcupacao}%`, icon: 'fa-chart-pie', color: 'purple' }
    ];

    const kpiContainer = document.getElementById('kpiContainer');
    kpiContainer.innerHTML = kpis.map(kpi => `
        <div class="card p-4">
            <div class="flex items-center">
                <div class="bg-${kpi.color}-100 p-3 rounded-lg mr-4">
                    <i class="fas ${kpi.icon} text-${kpi.color}-500 text-2xl"></i>
                </div>
                <div>
                    <p class="text-sm font-semibold text-gray-600">${kpi.title}</p>
                    <p class="text-3xl font-bold text-gray-800">${kpi.value}</p>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Atualiza os gráficos com os dados filtrados.
 * LÓGICA ATUALIZADA PARA OS NOVOS GRÁFICOS.
 */
function updateCharts() {
    Chart.register(ChartDataLabels);
    
    const ultimaDataUnidade = getUltimaDataPorGrupo(filteredData, 'unidadeSaude');
    const ultimaDataLaboratorio = getUltimaDataPorGrupo(filteredData, 'laboratorioColeta');

    createOrUpdateChart('chartUltimaDataUnidade', 'bar', {
        labels: ultimaDataUnidade.map(item => item.grupo),
        datasets: [{
            label: 'Última Data',
            data: ultimaDataUnidade.map(item => item.ultimaData),
            backgroundColor: '#e53e3e',
        }]
    }, {
        indexAxis: 'y',
        scales: { x: { display: false }, y: { ticks: { font: { size: 10 } } } },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end', align: 'end', color: '#333', font: { weight: 'bold' },
                formatter: (value) => value ? new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''
            }
        }
    });

    createOrUpdateChart('chartUltimaDataLaboratorio', 'bar', {
        labels: ultimaDataLaboratorio.map(item => item.grupo),
        datasets: [{
            label: 'Última Data',
            data: ultimaDataLaboratorio.map(item => item.ultimaData),
            backgroundColor: '#dd6b20',
        }]
    }, {
        indexAxis: 'y',
        scales: { x: { display: false }, y: { ticks: { font: { size: 12 } } } },
        plugins: {
            legend: { display: false },
            datalabels: {
                anchor: 'end', align: 'end', color: '#333', font: { weight: 'bold' },
                formatter: (value) => value ? new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''
            }
        }
    });
}

/**
 * Atualiza a tabela de dados detalhados.
 * LÓGICA ATUALIZADA PARA INCLUIR A COLUNA 'TELEFONE'.
 */
function updateTable() {
    if (dataTable) {
        dataTable.destroy();
    }
    const tableBody = document.querySelector('#agendamentosTable tbody');
    tableBody.innerHTML = filteredData.map(item => `
        <tr>
            <td>${item.unidadeSaude || ''}</td>
            <td>${item.data || ''}</td>
            <td>${item.horario || ''}</td>
            <td>${item.nomePaciente || ''}</td>
            <td>${item.telefone || ''}</td>
            <td>${item.prontuario || ''}</td>
            <td>${item.observacao || ''}</td>
            <td>${item.perfilExame || ''}</td>
            <td>${item.laboratorioColeta || ''}</td>
        </tr>
    `).join('');

    dataTable = $('#agendamentosTable').DataTable({
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/pt-BR.json' },
        pageLength: 25,
        responsive: true,
        order: [[1, 'desc']]
    });
}

function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agendamentos');
    XLSX.writeFile(workbook, `Consolidado_Eldorado_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// =================================================================================
// FUNÇÕES AUXILIARES
// =================================================================================

function updateConnectionStatus(status, text) {
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');
    statusIndicator.className = `status-indicator status-${status}`;
    statusText.textContent = text;
}

function parseDate(dateStr) {
    if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
}

function getMultiSelectValues(elementId) {
    const select = document.getElementById(elementId);
    return Array.from(select.selectedOptions).map(option => option.value);
}

/**
 * NOVA FUNÇÃO: Encontra a data mais recente para cada grupo (unidade, laboratório, etc.).
 */
function getUltimaDataPorGrupo(data, key) {
    const grupos = {};
    data.forEach(item => {
        const grupo = item[key];
        const dataAgendamento = parseDate(item.data);
        if (grupo && dataAgendamento) {
            if (!grupos[grupo] || dataAgendamento > grupos[grupo]) {
                grupos[grupo] = dataAgendamento;
            }
        }
    });

    return Object.entries(grupos)
        .map(([grupo, ultimaData]) => ({ grupo, ultimaData }))
        .sort((a, b) => b.ultimaData - a.ultimaData);
}

function createOrUpdateChart(canvasId, type, data, customOptions = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            datalabels: {
                color: '#fff',
                font: { weight: 'bold' },
                formatter: (value) => (value > 0 ? value : '')
            }
        }
    };

    charts[canvasId] = new Chart(ctx, {
        type: type,
        data: data,
        options: { ...defaultOptions, ...customOptions }
    });
}

// =================================================================================
// INICIALIZAÇÃO
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
