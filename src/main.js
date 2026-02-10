import {
  initializeChart,
  updateCandles,
  drawFibonacci,
  clearFibonacci,
  drawMA,
  clearMA
} from './charts/chartManager.js';
import { setDrawingTool, clearDrawings } from "./charts/chartManager.js";
import { initializeRSI, drawRSI, clearRSI } from "./charts/rsiChart.js";
import { fetchMarketData } from './api/alphaVantage.js';
import { formatCandles } from './utils/dataFormatter.js';
import { showLoading, showError, showSuccess, populateSymbolSelector } from './ui/uiManager.js';
import { calculateManualFibonacci } from './indicators/fibonacci.js';
import { calculateMA } from "./indicators/movingAverage.js";
import { calculateRSI } from "./indicators/rsi.js";

let currentMarket = 'stocks';
let lastCandles = [];

document.addEventListener('DOMContentLoaded', () => {

  // DOM 
  document.querySelectorAll(".market-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".market-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      currentMarket = btn.dataset.type;

      populateSymbolSelector(currentMarket);

      showSuccess(`📊 Mercado alterado para ${currentMarket.toUpperCase()}`);
      console.log("📊 Mercado selecionado:", currentMarket);
    });
  });


  // GRÁFICO PRINCIPAL
  initializeChart('chartContainer');
  populateSymbolSelector(currentMarket);

  //  RSI (somente quando abrir)

  initializeRSI("rsiContainer");
  window.__rsiInitialized = true;


  // ================= BUSCAR DADOS =================

  document.getElementById('buscar').addEventListener('click', async () => {
    try {
      showLoading(true);

      const symbol = document.getElementById('symbol').value.toUpperCase();
      const dateFrom = document.getElementById('dateFrom').value;

      const series = await fetchMarketData(symbol, currentMarket);
      const candles = formatCandles(series, currentMarket, dateFrom);

      if (!candles.length) throw new Error("Sem dados");

      updateCandles(candles);
      lastCandles = candles;

      showSuccess(`📈 ${candles.length} candles carregados`);
    } catch (e) {
      showError(e.message);
    } finally {
      showLoading(false);
    }
  });

  //===================   fibonacci   ===============================

  document.getElementById("manualFibBtn").addEventListener("click", () => {
    if (!lastCandles.length) return showError("Carregue os dados primeiro");

    const high = Number(document.getElementById("fibHigh").value);
    const low = Number(document.getElementById("fibLow").value);

    if (!high || !low) return showError("Informe máximo e mínimo");

    const levels = calculateManualFibonacci(high, low);

    drawFibonacci(levels, {
      color: document.getElementById("fibColor").value,
      width: Number(document.getElementById("fibWidth").value),
      style: Number(document.getElementById("fibStyle").value)
    });

    showSuccess("📐 Fibonacci gerado");
  });
  document.getElementById("clearFibBtn").addEventListener("click", () => {
    clearFibonacci();
  });

  // ================ MA =====================

  document.getElementById("maBtn").addEventListener("click", () => {
    if (!lastCandles.length) return showError("Carregue os dados primeiro");

    const period = Number(document.getElementById("maPeriod").value);

    const maData = calculateMA(lastCandles, period);

    drawMA(maData, {
      color: document.getElementById("maColor").value,
      width: Number(document.getElementById("maWidth").value),
      style: Number(document.getElementById("maStyle").value)
    });

    showSuccess("📈 MA aplicada");
  });


  // ================= RSI =================

  document.getElementById("rsiBtn").addEventListener("click", () => {
    if (!lastCandles.length) return showError("Carregue os dados primeiro");

    const rsiData = calculateRSI(
      lastCandles,
      Number(document.getElementById("rsiPeriod").value)
    );

    drawRSI(rsiData, {
      color: document.getElementById("rsiColor").value,
      width: Number(document.getElementById("rsiWidth").value),
      upper: Number(document.getElementById("rsiUpper").value),
      lower: Number(document.getElementById("rsiLower").value)
    });

    showSuccess("📊 RSI aplicado");
  });

  document.getElementById("clearRsiBtn").addEventListener("click", () => {
    clearRSI();
    showSuccess("❌ RSI removido");
  });

  // drawing tools ============
  document.getElementById("trendlineBtn").addEventListener("click", () => {
  document.getElementById("trendlineBtn").classList.toggle("active");

  setDrawingTool("trendline", {
    color: document.getElementById("drawColor").value,
    width: Number(document.getElementById("drawWidth").value),
    style: Number(document.getElementById("drawStyle").value)
  });

  showSuccess("✏️ Clique em dois pontos no gráfico");
});

document.getElementById("clearDrawingsBtn").addEventListener("click", () => {
  clearDrawings();
  showSuccess("🧹 Desenhos removidos");
});


});


