📊 Fibonacci Indicator — Crypto, Forex & Metals (Candlestick Chart)

A lightweight JavaScript-based market analysis tool that fetches real-time historical data (Crypto, Forex, Commodities, Stocks) from Alpha Vantage, and displays it using candlestick charts with stylish custom colors.
This project was developed as a personal tool for studying Fibonacci behavior in price action, but anyone can use or expand it.

🚀 Features

📈 Candlestick chart visualization

🔍 Fetches real-time or recent market OHLC data

🌐 Supports any ticker symbol from Alpha Vantage

🎨 Custom bullish (sky blue) and bearish (wine/red) candle colors

⚙ Built with:

JavaScript (vanilla)

Chart.js

chartjs-chart-financial (for candlestick support)

date-fns adapter

🌙 Dark UI for better chart visibility

♾ Automatically displays the maximum possible number of candles

🔧 Simple, clean code — easy to modify

📁 Full separation: index.html + app.js + style.css

📂 Project Structure
Fibonacci_Indicator/
│
├── index.html      # Main app interface
├── app.js          # Chart logic + API communication
├── style.css       # Visual design / color scheme
└── README.md       # Project documentation

⚙ How It Works

The user enters any trading symbol
(e.g. BTCUSD, GOLD, AAPL, USD/BRL, EURUSD...)

The app sends a request to Alpha Vantage using the function:

TIME_SERIES_DAILY


The response returns OHLC data
(Open, High, Low, Close)

The tool transforms that data into a format accepted by chartjs-chart-financial

The candlestick chart is drawn with custom colors and responsive layout

The chart updates each time the user searches a new symbol

📡 API Used
Alpha Vantage

Website: https://www.alphavantage.co/

The free tier supports:

Stocks

Crypto

Forex

Metals (Gold, Silver)

Many international tickers

You must use your own API key.
Insert it inside app.js:

const API_KEY = "YOUR_API_KEY_HERE";

📦 Installation & Usage
Clone the repository
git clone https://github.com/cabaalo1618/Fibonacci_Indicator.git

🔮 Future Improvements

Add Fibonacci retracement levels automatically                          B
Add moving averages (EMA, SMA)                                          E
Add volume bars                                                                         T
Add timeframe selection (1min, 5min, 1h, daily…)                                        O
                                                                                                H
Cache responses locally                                                  W                      E
Integrate Plotly for zoom-based charts                                   E                      L
Deploy via GitHub Pages for live demo                                    L                      P
Pull requests are welcome!                                               C
If you find an issue or want to suggest a feature,                       O
open an Issue in the repository.                                         M
                                                                         E
🧑‍💻 Author

Thiago Monteiro
Brazil 🇧🇷
Passionate about markets, mathematics, coding, 
patterns in nature, and technology.

⭐ If you like this project…

Please consider starring the repository ⭐ on GitHub — it helps a lot!



            - Thiago Monteiro Github : @cabaalo1618