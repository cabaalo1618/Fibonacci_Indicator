import { initializeChart, updateCandles, drawFibonacci, clearFibonacci, drawMA, clearMA } from './charts/chartManager.js';
import { fetchMarketData } from './api/alphaVantage.js';
import { formatCandles } from './utils/dataFormatter.js';
import { showLoading, showError, showSuccess, populateSymbolSelector } from './ui/uiManager.js';
import { calculateManualFibonacci } from './indicators/fibonacci.js';
import { calculateMA } from "./indicators/movingAverage.js";

let currentMarket = 'stocks';
let lastCandles = [];

document.addEventListener('DOMContentLoaded', () => {

  /* =======================
     INICIALIZAÇÃO
  ======================= */
  initializeChart('chartContainer');
  populateSymbolSelector(currentMarket);

  /* =======================
     MERCADO
  ======================= */
  document.querySelectorAll('.market-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.market-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentMarket = btn.dataset.type;
      populateSymbolSelector(currentMarket);

      console.log('📊 Mercado selecionado:', currentMarket);
    });
  });

  /* =======================
     BUSCAR DADOS
  ======================= */
  document.getElementById('buscar').addEventListener('click', async () => {
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const dateFrom = document.getElementById('dateFrom').value;

    try {
      showLoading(true);

      const series = await fetchMarketData(symbol, currentMarket);
      const candles = formatCandles(series, currentMarket, dateFrom);

      if (!candles.length) throw new Error("Sem dados");

      updateCandles(candles);
      lastCandles = candles;

      showSuccess(`📈 ${candles.length} candles carregados`);
      console.log("🧪 lastCandles:", lastCandles.length);

    } catch (e) {
      showError(e.message);
    } finally {
      showLoading(false);
    }
  });

  /* =======================
     FIBONACCI MANUAL
  ======================= */
  document.getElementById("manualFibBtn").addEventListener("click", () => {
    const high = parseFloat(document.getElementById("fibHigh").value);
    const low  = parseFloat(document.getElementById("fibLow").value);

    if (isNaN(high) || isNaN(low)) {
      showError("Preencha máximo e mínimo");
      return;
    }

    if (high <= low) {
      showError("O máximo deve ser maior que o mínimo");
      return;
    }

    const color = document.getElementById("fibColor").value;
    const width = Number(document.getElementById("fibWidth").value);
    const style = Number(document.getElementById("fibStyle").value);

    const levels = calculateManualFibonacci(high, low);
    drawFibonacci(levels, { color, width, style });

    showSuccess("📐 Fibonacci aplicado");
  });

  document.getElementById("clearFibBtn").addEventListener("click", () => {
    clearFibonacci();
    showSuccess("❌ Fibonacci removido");
  });

  /* =======================
     MOVING AVERAGE (MA)
  ======================= */
  document.getElementById("maBtn").addEventListener("click", () => {

    if (!lastCandles.length) {
      showError("Carregue os dados primeiro");
      return;
    }

    const period = Number(document.getElementById("maPeriod").value);
    const color  = document.getElementById("maColor").value;
    const width  = Number(document.getElementById("maWidth").value);
    const style  = Number(document.getElementById("maStyle").value);

    const maData = calculateMA(lastCandles, period);
    drawMA(maData, { color, width, style });

    showSuccess("📈 Moving Average aplicada");
  });

  document.getElementById("clearMaBtn").addEventListener("click", () => {
    clearMA();
    showSuccess("❌ MA removida");
  });

});
