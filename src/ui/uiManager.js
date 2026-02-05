const loadingEl = document.getElementById("loading");
const errorEl   = document.getElementById("error");
const successEl = document.getElementById("success");

export function showLoading(show = true) {
  if (!loadingEl) return;
  loadingEl.classList.toggle("hidden", !show);
}

export function showError(message) {
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");

  setTimeout(() => {
    errorEl.classList.add("hidden");
  }, 4000);
}

export function showSuccess(message) {
  if (!successEl) return;
  successEl.textContent = message;
  successEl.classList.remove("hidden");

  setTimeout(() => {
    successEl.classList.add("hidden");
  }, 3000);
}

export function populateSymbolSelector(market) {
  const select = document.getElementById("symbol");
  if (!select) return;

  select.innerHTML = "";

  const symbols = {
    stocks: ["AAPL", "MSFT", "GOOGL"],
    forex: ["USD/BRL", "EUR/USD", "GBP/USD"],
    crypto: ["BTC/USD", "ETH/USD"]
  };

  symbols[market].forEach(sym => {
    const option = document.createElement("option");
    option.value = sym;
    option.textContent = sym;
    select.appendChild(option);
  });

  console.log(`✅ Seletor populado: ${market}`);
}

