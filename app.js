// Configuração da API Alpha Vantage
const API_KEY = "QYZIOPB8LI9WW9U2";

// Variáveis globais
let chart = null;
let candleSeries = null;
let currentSymbol = 'AAPL';
let currentMarket = 'stocks';

// -----------------------------------------------------------------------------
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

        candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

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

// ------------------------------------------------------------------------------
// 2. Buscar dados
// ---------------------------------------------------------
async function fetchStockData(symbol, marketType) {
    showLoading(true);
    hideMessages();

    let url = '';

    try {
        console.log(`🔍 Buscando dados para: ${symbol} (${marketType})`);

        if (marketType === 'forex') {
            url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${symbol.substring(0, 3)}&outputsize=full&to_symbol=${symbol.substring(3)}&apikey=${API_KEY}`;
        } else if (marketType === 'crypto') {
            url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol.substring(0, 3)}&market=USD&apikey=${API_KEY}`;
        } else {
            url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data["Error Message"]) {
            throw new Error("Símbolo não encontrado.");
        }

        if (data["Note"]) {
            throw new Error("Limite da API atingido.");
        }

        let timeSeries;
        if (marketType === 'forex') {
            timeSeries = data["Time Series FX (Daily)"];
        } else if (marketType === 'crypto') {
            timeSeries = data["Time Series (Digital Currency Daily)"];
        } else {
            timeSeries = data["Time Series (Daily)"];
        }

        if (!timeSeries) {
            throw new Error("Dados não disponíveis.");
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
// 3. Converter dados
// ---------------------------------------------------------------------
function formatCandlestickData(timeSeries, marketType, dateFrom) {
    let dates = Object.keys(timeSeries);

    dates.sort((a, b) => new Date(a) - new Date(b));

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

        if (
            isNaN(open) || isNaN(high) ||
            isNaN(low) || isNaN(close)
        ) continue;

        candles.push({
            time: Math.floor(new Date(date).getTime() / 1000),
            open, high, low, close
        });
    }

    return candles;
}

// -------------------------------------------------------------
// 4. Calcular Fibonacci
// ---------------------------------------------------------
function calculateFibonacciLevels(candles) {
    if (candles.length < 2) return [];

    let highest = candles[0].high;
    let lowest = candles[0].low;

    candles.forEach(candle => {
        if (candle.high > highest) highest = candle.high;
        if (candle.low < lowest) lowest = candle.low;
    });

    const diff = highest - lowest;

    return [
        { level: '0%', value: highest },
        { level: '23.6%', value: highest - diff * 0.236 },
        { level: '38.2%', value: highest - diff * 0.382 },
        { level: '50%', value: highest - diff * 0.5 },
        { level: '61.8%', value: highest - diff * 0.618 },
        { level: '78.6%', value: highest - diff * 0.786 },
        { level: '100%', value: lowest },
    ];
}

//--------------------------------------------------
// Calcular fibo manualmente atravez dos inputs :
//-------------------------------------------------------
function calculateManualFibonacci(high, low) {
    const diff = high - low;

    return [
        { level: '0%', value: high },
        { level: '23.6%', value: high - diff * 0.236 },
        { level: '38.2%', value: high - diff * 0.382 },
        { level: '50%', value: high - diff * 0.5 },
        { level: '61.8%', value: high - diff * 0.618 },
        { level: '78.6%', value: high - diff * 0.786 },
        { level: '100%', value: low },
    ];
}




// ---------------------------------------------------------
// 6. Atualizar gráfico
// ------------------------------------------------------------------
function updateChart(candles) {
    if (!candleSeries) {
        showError('Gráfico não inicializado corretamente.');
        return;
    }

    try {
        candleSeries.setData([]);
        candleSeries.setData(candles);

        // <- removido: fibonacci automático
        // const fibLevels = calculateFibonacciLevels(candles);
        // addFibonacciLevels(fibLevels, candles);

        chart.timeScale().fitContent();

        // guarda candle global para Fibo manual
        window.lastCandles = candles;

        showSuccess(`✅ ${candles.length} candles carregados para ${currentSymbol}`);

    } catch (error) {
        console.error('❌ Erro ao atualizar gráfico:', error);
        showError('Erro: ' + error.message);
    }
}


// -----------------------------------------------------------------
// 7. UI
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
    setTimeout(() => errorEl.classList.add('hidden'), 10000);
}

function showSuccess(message) {
    const successEl = document.getElementById('success');
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    setTimeout(() => successEl.classList.add('hidden'), 5000);
}

function hideMessages() {
    document.getElementById('error').classList.add('hidden');
    document.getElementById('success').classList.add('hidden');
}

function updateSymbolSuggestions(marketType) {
    document.querySelectorAll('.symbol-btn').forEach(btn => btn.classList.add('hidden'));
    document.querySelectorAll(`.${marketType}-symbol`).forEach(btn => btn.classList.remove('hidden'));
}

// -------------------------------------------------------------
// 8. Eventos
// ---------------------------------------------------------
document.getElementById('buscar').addEventListener('click', async () => {
    const symbolInput = document.getElementById('symbol');
    const dateFromInput = document.getElementById('dateFrom');

    currentSymbol = symbolInput.value.trim().toUpperCase();
    const dateFrom = dateFromInput.value;

    if (!currentSymbol) {
        showError('❌ Digite um símbolo válido.');
        return;
    }

    try {
        const { timeSeries, marketType } = await fetchStockData(currentSymbol, currentMarket);
        const candles = formatCandlestickData(timeSeries, marketType, dateFrom);

        if (candles.length === 0) {
            throw new Error('Nenhum dado encontrado.');
        }

        updateChart(candles);

    } catch (error) {
        showError(`❌ ${error.message}`);
    }
});

// --------------------------------------------------------------------Evetos Fibonacci --------------------

document.getElementById("manualFibBtn").addEventListener("click", () => {
    const high = parseFloat(document.getElementById("fibHigh").value);
    const low = parseFloat(document.getElementById("fibLow").value);

    if (isNaN(high) || isNaN(low) || high <= low) {
        showError("Valores inválidos: Máximo deve ser maior que mínimo.");
        return;
    }

    const levels = calculateManualFibonacci(high, low);

    if (!window.lastCandles || window.lastCandles.length === 0) {
        showError("Carregue um gráfico antes de gerar Fibonacci.");
        return;
    }

    addFibonacciLevels(levels, window.lastCandles);
    showSuccess("📐 Fibonacci manual gerado!");
});
// --------------------------------------------------------------------Evetos da MA --------------------
document.getElementById("maBtn").addEventListener("click", () => {
    const period = parseInt(document.getElementById("maPeriod").value);

    if (!window.lastCandles) {
        showError("Carregue um gráfico antes de gerar MA.");
        return;
    }
    if (period < 2) {
        showError("Período inválido para MA.");
        return;
    }

    const maData = calculateMA(window.lastCandles, period);
    addMALine(maData);

    showSuccess("📈 Média Móvel adicionada!");
});
document.getElementById("clearFibBtn")?.addEventListener("click", clearFibonacci);
document.getElementById("clearMaBtn")?.addEventListener("click", clearMA);
document.getElementById("clearAllBtn")?.addEventListener("click", resetChartOnlyOverlays);

// --------------------------------------------------------------------Evetos da BB --------------------

let bbMiddleLine = null;
let bbUpperLine = null;
let bbLowerLine = null;
document.getElementById("clearBbBtn").addEventListener("click", clearBB);

document.getElementById("bbBtn").addEventListener("click", () => {
  if (!globalChartData || globalChartData.length === 0) {
    showError("Carregue os dados primeiro!");
    return;
  }

  const period = parseInt(document.getElementById("bbPeriod").value);
  const deviations = parseFloat(document.getElementById("bbDeviations").value);

  const colorMA = document.getElementById("bbColorMA").value;
  const colorUpper = document.getElementById("bbColorUpper").value;
  const colorLower = document.getElementById("bbColorLower").value;

  const width = parseInt(document.getElementById("bbWidth").value);

  // CALCULAR BB
  const { middle, upper, lower } = calcularBollingerBands(globalChartData, period, deviations);

  // Criar linhas se ainda não existem
  if (!bbMiddleLine) {
    bbMiddleLine = chart.addLineSeries({ color: colorMA, lineWidth: width });
    bbUpperLine = chart.addLineSeries({ color: colorUpper, lineWidth: width });
    bbLowerLine = chart.addLineSeries({ color: colorLower, lineWidth: width });
  }

  // Gerar arrays formatados para o gráfico
  const times = globalChartData.map(c => c.time);

  const midData = times.map((t, i) => middle[i] ? { time: t, value: middle[i] } : null).filter(Boolean);
  const upData  = times.map((t, i) => upper[i]  ? { time: t, value: upper[i] } : null).filter(Boolean);
  const lowData = times.map((t, i) => lower[i]  ? { time: t, value: lower[i] } : null).filter(Boolean);

  bbMiddleLine.setData(midData);
  bbUpperLine.setData(upData);
  bbLowerLine.setData(lowData);

  showSuccess("Bollinger Bands geradas com sucesso!");
});



// Sugestões
document.querySelectorAll('.symbol-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const symbol = btn.getAttribute('data-symbol');
        document.getElementById('symbol').value = symbol;
        currentSymbol = symbol;
        document.getElementById('buscar').click();
    });
});

// Mercado
document.querySelectorAll('.market-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.market-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMarket = btn.getAttribute('data-type');

        updateSymbolSuggestions(currentMarket);
        document.getElementById('symbol').value = '';
    });
});

// Enter
document.getElementById('symbol').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('buscar').click();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicação...');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    document.getElementById('dateFrom').value = sixMonthsAgo.toISOString().split('T')[0];


});
// --------------------------------------------------------------
// 5. ADICIONAR LINHAS E RÓTULOS DE FIBONACCI (única mudança)
// ---------------------------------------------------------
function addFibonacciLevels(levels, candles) {
    if (!chart || !candles || candles.length === 0) return;

    // remover linhas antigas
    if (window.fibLines) {
        window.fibLines.forEach(line => {
            try { chart.removeSeries(line); } catch { }
        });
    }
    window.fibLines = [];

    const color = document.getElementById("fibColor")?.value || "#f5d76e";
    const baseWidth = parseFloat(document.getElementById("fibWidth")?.value || 1);
    const style = parseInt(document.getElementById("fibStyle")?.value || 0);

    const firstTime = candles[0].time;
    const lastTime = candles[candles.length - 1].time;

    levels.forEach(level => {
        const isKey = (level.level === '38.2%' || level.level === '61.8%');
        const lineWidth = isKey ? baseWidth + 1 : baseWidth;

        const line = chart.addLineSeries({
            color: color,
            lineWidth: lineWidth,
            lineStyle: style,
            priceLineVisible: false
        });

        line.setData([
            { time: firstTime, value: level.value },
            { time: lastTime, value: level.value },
        ]);

        // LABEL
        const labelSeries = chart.addLineSeries({
            color: color,
            lineWidth: 0,
            priceLineVisible: false
        });

        labelSeries.setData([
            {
                time: lastTime,
                value: level.value,
                text: `[ ${level.level} ]`
            }
        ]);

        window.fibLines.push(line, labelSeries);
    });
}
//------------------------------------------------------------
// -------------------------------------------------------Funcoes pra add MA e respectiva linha no grafico----------------
//-------------------------------

function calculateMA(candles, period) {
    if (candles.length < period) return [];

    const result = [];

    for (let i = period - 1; i < candles.length; i++) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
            sum += candles[j].close;
        }
        const avg = sum / period;

        result.push({ time: candles[i].time, value: avg });
    }

    return result;
}
function addMALine(maData) {
    const color = document.getElementById("maColor").value;
    const width = parseInt(document.getElementById("maWidth").value);
    const style = parseInt(document.getElementById("maStyle").value);

    const maLine = chart.addLineSeries({
        color: color,
        lineWidth: width,
        lineStyle: style,
        priceLineVisible: false
    });

    maLine.setData(maData);

    if (!window.maLines) window.maLines = [];
    window.maLines.push(maLine);

    return maLine;
}


// --------------------------------       BOLLINGER BANDS          ----------------------------------


function calcularBollingerBands(data, period = 20, deviations = 2) {
  const middle = [];
  const upper = [];
  const lower = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      middle.push(null);
      upper.push(null);
      lower.push(null);
      continue;
    }

    const slice = data.slice(i - period, i).map(c => c.close);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;

    const variance =
      slice.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / slice.length;

    const stdDev = Math.sqrt(variance);

    middle.push(avg);
    upper.push(avg + deviations * stdDev);
    lower.push(avg - deviations * stdDev);
  }

  return { middle, upper, lower };
}


// ---------------------------------------------
//  Limpar Fibonacci
// ---------------------------------
function clearFibonacci() {
    if (window.fibLines && window.fibLines.length > 0) {
        window.fibLines.forEach(line => {
            try { chart.removeSeries(line); } catch {}
        });
        window.fibLines = [];
        showSuccess("📐 Fibonacci removido!");
    } else {
        showError("Nenhuma Fibonacci para limpar.");
    }
}



// ---------------------------------------------
// Limpar Médias Móveis
// -------------------------------------------
function clearMA() {
    if (window.maLines && window.maLines.length > 0) {
        window.maLines.forEach(line => {
            try { chart.removeSeries(line); } catch {}
        });
        window.maLines = [];
        showSuccess("📈 Médias móveis removidas!");
    } else {
        showError("Nenhuma MA para limpar.");
    }
}

// ------------------------------------------------------
// Limpar Bollinger Bands
//----------------------------------------------------------------
function clearBB() {
    let removedSomething = false;

    if (bbMiddleLine) {
        bbMiddleLine.setData([]);
        try { chart.removeSeries(bbMiddleLine); } catch {}
        bbMiddleLine = null;
        removedSomething = true;
    }

    if (bbUpperLine) {
        bbUpperLine.setData([]);
        try { chart.removeSeries(bbUpperLine); } catch {}
        bbUpperLine = null;
        removedSomething = true;
    }

    if (bbLowerLine) {
        bbLowerLine.setData([]);
        try { chart.removeSeries(bbLowerLine); } catch {}
        bbLowerLine = null;
        removedSomething = true;
    }

    if (removedSomething) {
        showSuccess("📉 Bollinger Bands removidas!");
    } else {
        showError("Nenhuma Bollinger Band para limpar.");
    }
}

// ---------------------------------------------
// Limpar Médias Móveis
// -------------------------------------------

function clearMA() {
    if (window.maLines && window.maLines.length > 0) {
        window.maLines.forEach(line => {
            try { chart.removeSeries(line); } catch {}
        });
        window.maLines = [];
        showSuccess("📈 Médias móveis removidas!");
    } else {
        showError("Nenhuma MA para limpar.");
    }
}



// ------------------------------------------
//  Função: limpar TUDO, menos os candles
// ---------------------------------------------
function resetChartOnlyOverlays() {
    clearFibonacci();
    clearMA();
    clearBB();
    showSuccess("🔄 Sobreposições limpas (Fibo + MA + BB).");
}



initializeChart();


//     .´.
//1,618...yes my friends, it is EVERYWHERE   

