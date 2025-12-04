📐 Fibonacci Indicator (Python)

A custom financial indicator based on Fibonacci mathematics, designed for pattern recognition, cycle analysis, and potential integration into trading strategies.
This project is part of a broader exploration of mathematical patterns found in nature and financial markets.

🚀 Features

✓ Computes multiple Fibonacci levels automatically
✓ Works with both price highs and lows
✓ Clean and modular Python code
✓ Easy to integrate with trading bots or backtesting systems
✓ Beginner-friendly structure for study and expansion

📦 Project Structure
Fibonacci_Indicator/
│
├── main.py               # Example of indicator usage
├── fibonacci.py          # Indicator logic and calculations
├── utils.py              # Helper functions (math, validation, etc.)
├── README.md             # Documentation
└── requirements.txt      # Dependencies (if needed)

📊 How it Works

The indicator computes Fibonacci-based levels derived from price inputs.
These levels may help identify:

potential support zones

resistance zones

trend reversal points

cyclic movements in price action

This tool is not a ready-to-use trading bot, but a core mathematical engine meant to be extended.

🧩 Example Usage
from fibonacci import FibonacciIndicator

fib = FibonacciIndicator(high=100, low=80)

levels = fib.calculate()
print(levels)


Output:

{
    '0%': 80,
    '23.6%': 84.72,
    '38.2%': 87.64,
    '50%': 90,
    '61.8%': 92.36,
    '78.6%': 95.72,
    '100%': 100
}

🛠 Requirements

Python 3.10+

No external libraries (pure Python)

📘 To-Do / Future Improvements

Integration with real market data

Candlestick pattern recognition

Fibonacci time cycles

TradingView or MetaTrader version

Visualization (matplotlib charts)

🧑‍💻 Author

Developed by Thiago Monteiro (cabaalo1618)