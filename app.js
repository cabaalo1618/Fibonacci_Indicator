// Configuração da API Alpha Vantage
const API_KEY = "QYZIOPB8LI9WW9U2";

// Variáveis globais
let chart = null;
let candleSeries = null;
let currentSymbol = 'AAPL';
let currentMarket = 'stocks';

// ---------------------------------------------------------
// 1. Inicialização do gráfico
// ---------------------------------------------------------
function initializeChart() {
    console.log('🔄 Inicializando gráfico...');
    
    const chartContainer = document.getElementById('chartContainer');
    
    try {
        if (typeof LightweightCharts === 'undefined') {
            throw new Error('Biblioteca LightweightCharts não carregada!');
        }

        console.log('✅ LightweightCharts carregada');
        
        // CORREÇÃO: Limpar container antes de criar novo gráfico
        chartContainer.innerHTML = '';
        
        chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 600,
            layout: {
                background: { color: '#000000' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        console.log('✅ Gráfico criado');

        // CORREÇÃO: Configuração mais robusta para candlesticks
        candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        console.log('✅ Série de candlesticks adicionada');

        // Ajustar quando a janela for redimensionada
        window.addEventListener('resize', () => {
            chart.applyOptions({
                width: chartContainer.clientWidth,
                height: 600,
            });
        });

        return true;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar gráfico:', error);
        showError('Erro ao carregar gráfico: ' + error.message);
        return false;
    }
}

// ---------------------------------------------------------
// 2. Buscar dados da API Alpha Vantage
// ---------------------------------------------------------
async function fetchStockData(symbol, marketType) {
    showLoading(true);
    hideMessages();

    let url = '';
    
    try {
        console.log(`🔍 Buscando dados para: ${symbol} (${marketType})`);
        
        // CORREÇÃO: URLs diferentes para cada tipo de mercado
        if (marketType === 'forex') {
            url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${symbol.substring(0,3)}&outputsize=full&to_symbol=${symbol.substring(3)}&apikey=${API_KEY}`;
        } else if (marketType === 'crypto') {
            url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol.substring(0,3)}&market=USD&apikey=${API_KEY}`;
        } else {
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Resposta da API recebida:', data);

        // Verificar erros da API
        if (data["Error Message"]) {
            throw new Error("Símbolo não encontrado. Verifique o código.");
        }

        if (data["Note"]) {
            throw new Error("Limite de requisições da API atingido. Aguarde 1 minuto.");
        }

        // CORREÇÃO: Diferentes estruturas para diferentes mercados
        let timeSeries;
        if (marketType === 'forex') {
            timeSeries = data["Time Series FX (Daily)"];
        } else if (marketType === 'crypto') {
            timeSeries = data["Time Series (Digital Currency Daily)"];
        } else {
            timeSeries = data["Time Series (Daily)"];
        }

        if (!timeSeries) {
            throw new Error("Dados não disponíveis para este símbolo.");
        }

        return { timeSeries, marketType };
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw new Error(`Falha ao buscar dados: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// ---------------------------------------------------------
// 3. Converter dados para formato de candlestick
// ---------------------------------------------------------
function formatCandlestickData(timeSeries, marketType, dateFrom) {
    let dates = Object.keys(timeSeries);

    // Ordenação REAL por data
    dates.sort((a, b) => new Date(a) - new Date(b));

    // Filtrar por data inicial
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        dates = dates.filter(date => new Date(date) >= fromDate);
    }

    const candles = [];

    for (const date of dates) {
        const dailyData = timeSeries[date];
        if (!dailyData) continue;

        let open, high, low, close;

        if (marketType === 'forex') {
            open = parseFloat(dailyData["1. open"]);
            high = parseFloat(dailyData["2. high"]);
            low = parseFloat(dailyData["3. low"]);
            close = parseFloat(dailyData["4. close"]);
        } else if (marketType === 'crypto') {
            open = parseFloat(dailyData["1a. open (USD)"]);
            high = parseFloat(dailyData["2a. high (USD)"]);
            low = parseFloat(dailyData["3a. low (USD)"]);
            close = parseFloat(dailyData["4a. close (USD)"]);
        } else {
            open = parseFloat(dailyData["1. open"]);
            high = parseFloat(dailyData["2. high"]);
            low = parseFloat(dailyData["3. low"]);
            close = parseFloat(dailyData["4. close"]);
        }

        // PROTEÇÃO CONTRA VALORES NULOS / NaN
        if (
            isNaN(open) || isNaN(high) ||
            isNaN(low) || isNaN(close)
        ) {
            console.warn("⚠️ Candle ignorado por valores inválidos:", date, dailyData);
            continue; // pula candle inválido
        }

        candles.push({
            time: Math.floor(new Date(date).getTime() / 1000),
            open, high, low, close
        });
    }

    console.log(`✅ ${candles.length} candles válidos`, candles.slice(0, 3));
    return candles;
}

// ---------------------------------------------------------
// 4. Calcular níveis de Fibonacci
// ---------------------------------------------------------
function calculateFibonacciLevels(candles) {
    if (candles.length < 2) return [];
    
    let highest = candles[0].high;
    let lowest = candles[0].low;
    
    candles.forEach(candle => {
        if (candle.high > highest) highest = candle.high;
        if (candle.low < lowest) lowest = candle.low;
    });
    
    const difference = highest - lowest;
    
    return [
        { level: '0%', value: highest },
        { level: '23.6%', value: highest - difference * 0.236 },
        { level: '38.2%', value: highest - difference * 0.382 },
        { level: '50%', value: highest - difference * 0.5 },
        { level: '61.8%', value: highest - difference * 0.618 },
        { level: '78.6%', value: highest - difference * 0.786 },
        { level: '100%', value: lowest },
    ];
}

// ---------------------------------------------------------
// 5. Adicionar linhas de Fibonacci ao gráfico
// ---------------------------------------------------------
function addFibonacciLevels(levels, candles) {
    // Limpar linhas anteriores
    if (window.fibLines) {
        window.fibLines.forEach(line => {
            try {
                chart.removeSeries(line);
            } catch (e) {
                console.warn('Erro ao remover linha Fibonacci:', e);
            }
        });
        window.fibLines = [];
    } else {
        window.fibLines = [];
    }
    
    if (!candles || candles.length === 0) {
        console.warn('⚠️ Nenhum candle disponível para Fibonacci');
        return;
    }
    
    levels.forEach(level => {
        try {
            const line = chart.addLineSeries({
                color: level.level === '61.8%' ? '#f5d76e' : 
                       level.level === '38.2%' ? '#f5d76e' : 'rgba(245, 215, 110, 0.5)',
                lineWidth: level.level === '61.8%' || level.level === '38.2%' ? 2 : 1,
                lineStyle: level.level === '61.8%' || level.level === '38.2%' ? 0 : 2,
            });
            
            const firstTime = candles[0].time;
            const lastTime = candles[candles.length - 1].time;
            
            line.setData([
                { time: firstTime, value: level.value },
                { time: lastTime, value: level.value },
            ]);
            
            window.fibLines.push(line);
        } catch (error) {
            console.warn(`⚠️ Não foi possível adicionar linha Fibonacci ${level.level}:`, error);
        }
    });
}

// ---------------------------------------------------------
// 6. Atualizar gráfico com novos dados
// ---------------------------------------------------------
function updateChart(candles) {
    if (!candleSeries) {
        showError('Gráfico não inicializado corretamente.');
        return;
    }

    try {
        console.log('🔄 Atualizando gráfico com', candles.length, 'candles');
        
        // CORREÇÃO IMPORTANTE: Limpar dados anteriores primeiro
        candleSeries.setData([]);
        
        // Adicionar novos dados
        candleSeries.setData(candles);
        
        // Calcular e adicionar Fibonacci
        const fibLevels = calculateFibonacciLevels(candles);
        addFibonacciLevels(fibLevels, candles);
        
        // Ajustar zoom para mostrar todos os dados
        chart.timeScale().fitContent();
        
        showSuccess(`✅ ${candles.length} candles carregados para ${currentSymbol}`);
        console.log('🎉 Gráfico atualizado com sucesso!', candles);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar gráfico:', error);
        showError('Erro ao renderizar gráfico: ' + error.message);
    }
}

// ---------------------------------------------------------
// 7. Funções auxiliares de UI
// ---------------------------------------------------------
function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    const buttonEl = document.getElementById('buscar');
    
    if (show) {
        loadingEl.classList.remove('hidden');
        buttonEl.disabled = true;
        buttonEl.textContent = '⏳ Carregando...';
    } else {
        loadingEl.classList.add('hidden');
        buttonEl.disabled = false;
        buttonEl.textContent = '🚀 Buscar Dados';
    }
}

function showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    
    setTimeout(() => {
        errorEl.classList.add('hidden');
    }, 10000);
}

function showSuccess(message) {
    const successEl = document.getElementById('success');
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    
    setTimeout(() => {
        successEl.classList.add('hidden');
    }, 5000);
}

function hideMessages() {
    document.getElementById('error').classList.add('hidden');
    document.getElementById('success').classList.add('hidden');
}

function updateSymbolSuggestions(marketType) {
    // Esconder todos primeiro
    document.querySelectorAll('.symbol-btn').forEach(btn => {
        btn.classList.add('hidden');
    });
    
    // Mostrar apenas os do mercado selecionado
    document.querySelectorAll(`.${marketType}-symbol`).forEach(btn => {
        btn.classList.remove('hidden');
    });
}

// ---------------------------------------------------------
// 8. Event Listeners e Inicialização
// ---------------------------------------------------------
document.getElementById('buscar').addEventListener('click', async () => {
    const symbolInput = document.getElementById('symbol');
    const dateFromInput = document.getElementById('dateFrom');
    
    currentSymbol = symbolInput.value.trim().toUpperCase();
    const dateFrom = dateFromInput.value;
    
    if (!currentSymbol) {
        showError('❌ Por favor, digite um símbolo válido.');
        return;
    }
    
    try {
        const { timeSeries, marketType } = await fetchStockData(currentSymbol, currentMarket);
        const candles = formatCandlestickData(timeSeries, marketType, dateFrom);
        
        if (candles.length === 0) {
            throw new Error('Nenhum dado encontrado para o período selecionado.');
        }
        
        updateChart(candles);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        showError(`❌ ${error.message}`);
    }
});

// Sugestões de símbolos
document.querySelectorAll('.symbol-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const symbol = btn.getAttribute('data-symbol');
        document.getElementById('symbol').value = symbol;
        currentSymbol = symbol;
        document.getElementById('buscar').click();
    });
});

// Seletor de tipo de mercado
document.querySelectorAll('.market-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover active de todos
        document.querySelectorAll('.market-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        // Adicionar active ao clicado
        btn.classList.add('active');
        currentMarket = btn.getAttribute('data-type');
        
        // Atualizar sugestões de símbolos
        updateSymbolSuggestions(currentMarket);
        
        // Limpar símbolo atual
        document.getElementById('symbol').value = '';
    });
});

// Buscar com Enter
document.getElementById('symbol').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('buscar').click();
    }
});

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicação...');
    
    // Configurar data padrão (6 meses atrás)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    document.getElementById('dateFrom').value = sixMonthsAgo.toISOString().split('T')[0];
    
    // Inicializar gráfico primeiro
    const chartInitialized = initializeChart();
    
    if (chartInitialized) {
        // Buscar dados iniciais
        setTimeout(() => {
            document.getElementById('buscar').click();
        }, 1000);
    }
});
