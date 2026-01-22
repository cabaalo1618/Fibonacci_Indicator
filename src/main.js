import { initializeChart, updateCandles, drawFibonacci, clearFibonacci } from './charts/chartManager.js';
import { fetchMarketData } from './api/alphaVantage.js';
import { formatCandles } from './utils/dataFormatter.js';
import { showLoading, showError, showSuccess, populateSymbolSelector } from './ui/uiManager.js';
import { calculateManualFibonacci } from './indicators/fibonacci.js';

let currentMarket = 'stocks';

document.addEventListener('DOMContentLoaded', () => {

  /* =======================
     INICIALIZAÇÃO
  ======================= */
  initializeChart('chartContainer');
  populateSymbolSelector(currentMarket);

  /* =======================
     MERCADO
  ======================= */
  const marketButtons = document.querySelectorAll('.market-btn');

  marketButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      marketButtons.forEach(b => b.classList.remove('active'));
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
      window.lastCandles = candles;

      showSuccess(`📈 ${candles.length} candles carregados`);
    } catch (e) {
      showError(e.message);
    } finally {
      showLoading(false);
    }
    console.log("🧪 lastCandles:", window.lastCandles?.length);

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
      showError("O valor máximo deve ser maior que o mínimo");
      return;
    }

    const color = document.getElementById("fibColor").value;
    const width = parseInt(document.getElementById("fibWidth").value);
    const style = parseInt(document.getElementById("fibStyle").value);

    const levels = calculateManualFibonacci(high, low);

    drawFibonacci(levels, { color, width, style });

    showSuccess("📐 Fibonacci manual aplicado");
  });

  document.getElementById("clearFibBtn").addEventListener("click", () => {
    clearFibonacci();
    showSuccess("❌ Fibonacci removido");
  });

});
