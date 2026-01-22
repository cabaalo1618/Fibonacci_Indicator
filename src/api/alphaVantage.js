const API_KEY = "QYZIOPB8LI9WW9U2";

export async function fetchMarketData(symbol, marketType) {
    let url = '';

    if (marketType === 'forex') {
        url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${symbol.slice(0,3)}&to_symbol=${symbol.slice(3)}&outputsize=full&apikey=${API_KEY}`;
    } else if (marketType === 'crypto') {
        url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol.slice(0,3)}&market=USD&apikey=${API_KEY}`;
    } else {
        url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data["Error Message"]) throw new Error("Símbolo inválido");
    if (data["Note"]) throw new Error("Limite da API atingido");

    const series =
        marketType === 'forex' ? data["Time Series FX (Daily)"] :
        marketType === 'crypto' ? data["Time Series (Digital Currency Daily)"] :
        data["Time Series (Daily)"];

    if (!series) throw new Error("Dados indisponíveis");

    return series;
}
