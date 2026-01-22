import { showError } from "../ui/uiManager.js";

let chart = null;
let candleSeries = null;
let maSeries = [];

/* ===========================
   ESTADOS DE INDICADORES
=========================== */
let fibonacciLines = [];

/* ===========================
   INICIALIZAÇÃO DO GRÁFICO
=========================== */
export function initializeChart(containerId) {
  console.log("🔄 Inicializando gráfico...");

  const container = document.getElementById(containerId);

  if (!container) {
    console.error("❌ Container do gráfico não encontrado:", containerId);
    return;
  }

  if (typeof LightweightCharts === "undefined") {
    showError("LightweightCharts não foi carregado!");
    return;
  }

  container.innerHTML = "";

  chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 600,
    layout: {
      background: { color: "#000000" },
      textColor: "#d1d4dc",
    },
    grid: {
      vertLines: { color: "rgba(42, 46, 57, 0.5)" },
      horzLines: { color: "rgba(42, 46, 57, 0.5)" },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  });

  candleSeries = chart.addCandlestickSeries({
    upColor: "#26a69a",
    downColor: "#ef5350",
    borderUpColor: "#26a69a",
    borderDownColor: "#ef5350",
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
  });

  window.addEventListener("resize", () => {
    chart.applyOptions({
      width: container.clientWidth,
      height: 600,
    });
  });

  console.log("✅ Gráfico inicializado!");
}

/* ===========================
   ATUALIZAÇÃO DE CANDLES
=========================== */
export function updateCandles(candles) {
  if (!candleSeries) {
    showError("Gráfico ainda não foi inicializado.");
    return;
  }

  console.log("📊 Atualizando candles:", candles.length);

  candleSeries.setData([]);
  candleSeries.setData(candles);

  chart.timeScale().fitContent();

  console.log("✅ Gráfico atualizado!");
}

/* ===========================
   FIBONACCI
=========================== */

/**
 * Desenha níveis de Fibonacci no gráfico
 */
export function drawFibonacci(levels, options = {}) {
  if (!candleSeries || !chart) {
    showError("Gráfico não inicializado");
    return;
  }

  clearFibonacci();

  const {
    color = "#f5d76e",
    width = 1,
    style = 0
  } = options;

  const prices = levels.map(l => l.value);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  levels.forEach(level => {
    const line = candleSeries.createPriceLine({
      price: level.value,
      color,
      lineWidth: width,
      lineStyle: style,
      axisLabelVisible: true,
      title: `Fibo ${level.level}`,
    });

    fibonacciLines.push(line);
  });

  // 🔥 FORÇA VISUALIZAÇÃO DO RANGE
 

  console.log("📐 Fibonacci desenhado:", levels);
}


/**
 * Remove todos os níveis de Fibonacci
 */
export function clearFibonacci() {
  if (!candleSeries) return;

  fibonacciLines.forEach(line => {
    candleSeries.removePriceLine(line);
  });

  fibonacciLines = [];

  console.log("❌ Fibonacci removido");
}

// =============================== MA ===========================

export function drawMA(maData, options = {}) {
  if (!chart) return;

  const {
    color = "#00ffea",
    width = 2,
    style = 0
  } = options;

  const series = chart.addLineSeries({
    color,
    lineWidth: width,
    lineStyle: style
  });

  series.setData(maData);
  maSeries.push(series);
}

export function clearMA() {
  if (!chart) return;

  maSeries.forEach(series => chart.removeSeries(series));
  maSeries = [];
}

