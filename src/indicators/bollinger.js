export function calculateBollinger(candles, period=20, dev=2) {
    const middle=[], upper=[], lower=[];

    for (let i=0;i<candles.length;i++){
        if (i < period) {
            middle.push(null); upper.push(null); lower.push(null);
            continue;
        }

        const slice = candles.slice(i-period,i).map(c=>c.close);
        const avg = slice.reduce((a,b)=>a+b,0)/slice.length;
        const std = Math.sqrt(slice.reduce((s,v)=>s+(v-avg)**2,0)/slice.length);

        middle.push(avg);
        upper.push(avg + dev*std);
        lower.push(avg - dev*std);
    }

    return { middle, upper, lower };
}
