export function formatCandles(timeSeries, marketType, dateFrom) {
    let dates = Object.keys(timeSeries).sort((a,b)=>new Date(a)-new Date(b));

    if (dateFrom) {
        const from = new Date(dateFrom);
        dates = dates.filter(d => new Date(d) >= from);
    }

    return dates.map(date => {
        const d = timeSeries[date];
        if (!d) return null;

        const open  = parseFloat(d["1. open"] || d["1a. open (USD)"]);
        const high  = parseFloat(d["2. high"] || d["2a. high (USD)"]);
        const low   = parseFloat(d["3. low"]  || d["3a. low (USD)"]);
        const close = parseFloat(d["4. close"]|| d["4a. close (USD)"]);

        if ([open,high,low,close].some(isNaN)) return null;

        return {
            time: Math.floor(new Date(date).getTime() / 1000),
            open, high, low, close
        };
    }).filter(Boolean);
}