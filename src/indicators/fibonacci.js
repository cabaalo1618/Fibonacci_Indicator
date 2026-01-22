export function calculateFibonacci(candles) {
    let high = Math.max(...candles.map(c => c.high));
    let low  = Math.min(...candles.map(c => c.low));
    const diff = high - low;

    return [
        { level: '0%', value: high },
        { level: '23.6%', value: high - diff*0.236 },
        { level: '38.2%', value: high - diff*0.382 },
        { level: '50%', value: high - diff*0.5 },
        { level: '61.8%', value: high - diff*0.618 },
        { level: '78.6%', value: high - diff*0.786 },
        { level: '100%', value: low },
    ];
}

export function calculateManualFibonacci(high, low) {
    const diff = high - low;
    return [
        { level: '0%', value: high },
        { level: '23.6%', value: high - diff*0.236 },
        { level: '38.2%', value: high - diff*0.382 },
        { level: '50%', value: high - diff*0.5 },
        { level: '61.8%', value: high - diff*0.618 },
        { level: '78.6%', value: high - diff*0.786 },
        { level: '100%', value: low },
    ];
}
