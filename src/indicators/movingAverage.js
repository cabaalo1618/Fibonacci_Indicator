export function calculateMA(candles, period) {
    const result = [];

    for (let i = period - 1; i < candles.length; i++) {
        const slice = candles.slice(i - period + 1, i + 1);
        const avg = slice.reduce((s,c)=>s+c.close,0) / period;

        result.push({ time: candles[i].time, value: avg });
    }
    return result;
}
