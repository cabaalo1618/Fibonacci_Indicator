console.log("📊 rsiChart.js carregado");

let rsiChart = null;
let rsiSeries = null;
let rsiLines = [];

export function initializeRSI(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  rsiChart = LightweightCharts.createChart(container, {
    height: 200,
    layout: {
      background: { color: "#0f141a" },
      textColor: "#d1d4dc",
    },
    grid: {
      vertLines: { color: "rgba(42,46,57,0.3)" },
      horzLines: { color: "rgba(42,46,57,0.3)" },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  });

  rsiSeries = rsiChart.addLineSeries({ lineWidth: 2 });

  addRSILevel(70);
  addRSILevel(30);
window.addEventListener("resize", () => {
  if (!rsiChart) return;

  const container = document.getElementById("rsiContainer");
  if (!container) return;

  rsiChart.resize(
    container.clientWidth,
    container.clientHeight
  );
});


}

export function drawRSI(data, options = {}) {
  if (!rsiSeries) {
    console.warn("⚠️ RSI não inicializado, inicializando agora...");
    initializeRSI("rsiContainer");
  }

  if (!data || !data.length) return;

  const {
    color = "#ff6b6b",
    width = 2,
    upper = 70,
    lower = 30
  } = options;

  rsiSeries.applyOptions({ color, lineWidth: width });
  rsiSeries.setData(data);

  clearRSILevels();
  addRSILevel(upper);
  addRSILevel(lower);
}

export function clearRSI() {
  if (!rsiSeries) return;
  rsiSeries.setData([]);
  clearRSILevels();
}

function addRSILevel(value) {
  const line = rsiSeries.createPriceLine({
    price: value,
    color: "#888",
    lineWidth: 1,
    lineStyle: LightweightCharts.LineStyle.Dotted,
    axisLabelVisible: true,
    title: `RSI ${value}`,
  });
  rsiLines.push(line);
}

function clearRSILevels() {
  rsiLines.forEach(l => rsiSeries.removePriceLine(l));
  rsiLines = [];
}

