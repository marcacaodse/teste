// =================================================================================
// CONFIGURAÇÃO E VARIÁVEIS GLOBAIS
// =================================================================================

// URL da planilha publicada na web em formato CSV.
// Esta URL é construída a partir do ID da sua planilha e do GID da aba.
const SHEET_ID = '1Gtan6GhpDO5ViVuNMiT0AGm3F5I5iZSIYhWHVJ3ga6E';
const SHEET_GID = '64540129';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

let allData = []; // Armazena todos os dados brutos da planilha
let filteredData = []; // Armazena os dados após a aplicação dos filtros
let dataTable; // Objeto da tabela (DataTables )
let charts = {}; // Objeto para armazenar as instâncias dos gráficos

// =================================================================================
// FUNÇÃO PRINCIPAL DE CARREGAMENTO DE DADOS
// =================================================================================

async function loadData() {
    updateConnectionStatus('loading', 'A carregar dados...');
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.statusText}`);
        }
        const csvText = await response.text();
        
        // Processa o texto CSV para um formato de objeto JSON
        allData = parseCSV(csvText);
        
        if (allData.length === 0) {
            throw new Error("Nenhum dado encontrado na planilha. Verifique o formato.");
        }

        // Após carregar, aplica os filtros (inicialmente vazios) e atualiza o painel
        applyFilters();
        
        // Popula os menus de filtro pela primeira vez
        populateFilterOptions();

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
 * @param {string} text - O conteúdo do ficheiro CSV.
 * @returns {Array<Object>} - Um array de objetos, onde cada objeto representa uma linha.
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    // Encontra a linha do cabeçalho de forma dinâmica
    const headerIndex = lines.findIndex(line => line.includes('UNIDADE DE SAÚDE'));
    if (headerIndex === -1) return [];

    const headers = lines[headerIndex].split(',').map(h => h.trim());
    const data = [];

    // Mapeia os nomes das colunas para os nomes das propriedades do objeto
    const columnMapping = {
        'UNIDADE DE SAÚDE': 'unidadeSaude',
        'DATA': 'data',
        'HORÁRIO': 'horario',
        'NOME DO PACIENTE': 'nomePaciente',
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
 */
function applyFilters() {
    const unidadeFilter = getMultiSelectValues('unidadeFilter');
    const laboratorioFilter = getMultiSelectValues('laboratorioFilter');
    const dataInicio = document.getElementById('dataInicioFilter').value;
    const dataFim = document.getElementById('dataFimFilter').value;

    const startDate = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
    const endDate = dataFim ? new Date(dataFim + 'T23:59:59') : null;

    filteredData = allData.filter(item => {
        if (unidadeFilter.length > 0 && !unidadeFilter.includes(item.unidadeSaude)) return false;
        if (laboratorioFilter.length > 0 && !laboratorioFilter.includes(item.laboratorioColeta)) return false;

        const itemDate = parseDate(item.data);
        if (startDate && (!itemDate || itemDate < startDate)) return false;
        if (endDate && (!itemDate || itemDate > endDate)) return false;

        return true;
    });

    updateDashboard();
}

/**
 * Limpa todos os filtros e recarrega o painel com todos os dados.
 */
function clearFilters() {
    document.getElementById('unidadeFilter').selectedIndex = -1;
    document.getElementById('laboratorioFilter').selectedIndex = -1;
    document.getElementById('dataInicioFilter').value = '';
    document.getElementById('dataFimFilter').value = '';
    
    // Re-seleciona as opções nos filtros para refletir a limpeza (se usar uma biblioteca de multi-select)
    // Para selects nativos, o código acima é suficiente.

    applyFilters();
}

// =================================================================================
// FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE (UI)
// =================================================================================

/**
 * Atualiza todos os componentes do painel: KPIs, gráficos e tabela.
 */
function updateDashboard() {
    updateKPIs();
    updateCharts();
    updateTable();
}

/**
 * Popula os menus de seleção de filtros com opções únicas da base de dados.
 */
function populateFilterOptions() {
    const unidades = [...new Set(allData.map(item => item.unidadeSaude).filter(Boolean))].sort();
    const laboratorios = [...new Set(allData.map(item => item.laboratorioColeta).filter(Boolean))].sort();

    const unidadeSelect = document.getElementById('unidadeFilter');
    const laboratorioSelect = document.getElementById('laboratorioFilter');

    unidadeSelect.innerHTML = unidades.map(u => `<option value="${u}">${u}</option>`).join('');
    laboratorioSelect.innerHTML = laboratorios.map(l => `<option value="${l}">${l}</option>`).join('');
}

/**
 * Atualiza os cartões de indicadores (KPIs).
 */
function updateKPIs() {
    const totalVagas = filteredData.length;
    const vagasOcupadas = filteredData.filter(item => item.nomePaciente && item.nomePaciente !== 'Preencher').length;
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
 */
function updateCharts() {
    Chart.register(ChartDataLabels); // Garante que o plugin de labels está ativo

    // Dados para o gráfico de vagas por unidade
    const vagasPorUnidade = countBy(filteredData.filter(d => d.nomePaciente), 'unidadeSaude');
    const sortedUnidades = Object.entries(vagasPorUnidade).sort((a, b) => b[1] - a[1]);
    
    // Dados para o gráfico de distribuição por laboratório
    const vagasPorLab = countBy(filteredData.filter(d => d.nomePaciente), 'laboratorioColeta');

    // Gráfico 1: Vagas por Unidade (Barras)
    createOrUpdateChart('chartVagasUnidade', 'bar', {
        labels: sortedUnidades.map(item => item[0]),
        datasets: [{
            label: 'Vagas Ocupadas',
            data: sortedUnidades.map(item => item[1]),
            backgroundColor: '#3b82f6',
        }]
    }, { indexAxis: 'y', scales: { y: { ticks: { font: { size: 10 } } } } });

    // Gráfico 2: Distribuição por Laboratório (Pizza)
    createOrUpdateChart('chartVagasLaboratorio', 'pie', {
        labels: Object.keys(vagasPorLab),
        datasets: [{
            data: Object.values(vagasPorLab),
            backgroundColor: ['#ef4444', '#f97316', '#84cc16', '#10b981', '#6366f1', '#a855f7'],
        }]
    });
}

/**
 * Atualiza a tabela de dados detalhados.
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

/**
 * Exporta os dados filtrados para um ficheiro Excel.
 */
function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agendamentos');
    XLSX.writeFile(workbook, `Consolidado_Eldorado_${new Date().toISOString().split('T')[0]}.xlsx`);
}


// =================================================================================
// FUNÇÕES AUXILIARES
// =================================================================================

/**
 * Atualiza o indicador visual de status da conexão.
 * @param {'online'|'offline'|'loading'} status - O status atual.
 * @param {string} text - O texto a ser exibido.
 */
function updateConnectionStatus(status, text) {
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');
    statusIndicator.className = `status-indicator status-${status}`;
    statusText.textContent = text;
}

/**
 * Converte uma data em formato 'DD/MM/YYYY' para um objeto Date.
 * @param {string} dateStr - A data em formato string.
 * @returns {Date|null}
 */
function parseDate(dateStr) {
    if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
}

/**
 * Obtém os valores selecionados de um elemento <select> múltiplo.
 * @param {string} elementId - O ID do elemento select.
 * @returns {Array<string>}
 */
function getMultiSelectValues(elementId) {
    const select = document.getElementById(elementId);
    return Array.from(select.selectedOptions).map(option => option.value);
}

/**
 * Agrupa e conta ocorrências num array de objetos por uma propriedade específica.
 * @param {Array<Object>} data - O array de dados.
 * @param {string} key - A propriedade pela qual agrupar.
 * @returns {Object} - Um objeto com as contagens.
 */
function countBy(data, key) {
    return data.reduce((acc, item) => {
        const group = item[key] || 'Não especificado';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
    }, {});
}

/**
 * Cria um novo gráfico ou atualiza um existente.
 * @param {string} canvasId - O ID do elemento canvas.
 * @param {string} type - O tipo de gráfico (ex: 'bar', 'pie').
 * @param {Object} data - Os dados para o gráfico.
 * @param {Object} customOptions - Opções de configuração personalizadas.
 */
function createOrUpdateChart(canvasId, type, data, customOptions = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: type === 'pie' ? 'top' : 'none',
            },
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

// Carrega os dados assim que o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Opcional: recarregar os dados a cada 5 minutos
    // setInterval(loadData, 300000); 
});
