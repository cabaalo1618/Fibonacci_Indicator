// Lista de símbolos disponíveis (Alpha Vantage - plano gratuito)

export const SYMBOLS = {
    stocks: [
        { label: 'Apple (AAPL)', value: 'AAPL' },
        { label: 'Microsoft (MSFT)', value: 'MSFT' },
        { label: 'Amazon (AMZN)', value: 'AMZN' },
        { label: 'Google (GOOGL)', value: 'GOOGL' },
        { label: 'Tesla (TSLA)', value: 'TSLA' },
        { label: 'Petrobras (PETR4.SA)', value: 'PETR4.SA' },
        { label: 'Vale (VALE3.SA)', value: 'VALE3.SA' }
    ],

    forex: [
        { label: 'EUR / USD', value: 'EURUSD' },
        { label: 'GBP / USD', value: 'GBPUSD' },
        { label: 'USD / JPY', value: 'USDJPY' },
        { label: 'USD / BRL', value: 'USDBRL' },
        { label: 'EUR / GBP', value: 'EURGBP' }
    ],

    crypto: [
        { label: 'Bitcoin (BTC / USD)', value: 'BTCUSD' },
        { label: 'Ethereum (ETH / USD)', value: 'ETHUSD' },
        { label: 'Solana (SOL / USD)', value: 'SOLUSD' },
        { label: 'Cardano (ADA / USD)', value: 'ADAUSD' }
    ]
};
