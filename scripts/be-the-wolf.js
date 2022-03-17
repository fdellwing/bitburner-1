// Stock market bot for bitburner, primary written by steamid/Meng- https://danielyxie.github.io/bitburner/
// Modified by Tonalnan https://steamcommunity.com/profiles/76561198152627199/

export async function main(ns) {
    ns.disableLog('sleep')
    ns.disableLog('getServerMoneyAvailable')
    let stockSymbols = ns.stock.getSymbols() // all symbols
    let portfolio = [] // init portfolio
    //~~~~~~~~~~~~~~~~~~~~~You can edit these~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const FORECAST_THRESH = 0.6   // buy above this forecast value, 0.6=60% (0.6 default)
    const MIN_CASH = 0           // minimum cash to keep (0 default)
    const SELL_THRESH = 0.5     // sell belove this forecast value, 0.5=50% (0.5 default)
    const SPEND_RATIO = 1      // spends up to this ratio of your total money to buy stocks (minus your min_cash set), 1=100% (1 default)
    const MIN_SPEND = 100000000 // minimum available money to buy stocks, limited due to 100k commission fees, 100000000=100m (100000000 default)
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    ns.print("Starting run - Do we own any stocks?") //Finds and adds any stocks we already own
    for (const stock of stockSymbols) {
        let pos = ns.stock.getPosition(stock)
        if (pos[0] > 0) {
            portfolio.push({ sym: stock, value: pos[1], shares: pos[0] })
            ns.print('Detected: ' + stock + ', quant: ' + pos[0] + ' @ ' + pos[1])
        }
    }

    if (ns.getServerMoneyAvailable('home') < MIN_CASH) {
        ns.print("Stockbot has no money to play with!")
        ns.print("Stockbot will nap for 5 mins while you make some money")
        await ns.sleep(300000)
    }

    while (true) {
        let goodoffers = []
        let lenght = 0
        for (const stock of stockSymbols) {	// for each stock symbol
            if (portfolio.findIndex(obj => obj.sym === stock) !== -1) {	 //if we own the stock...
                if (ns.stock.getForecast(stock) < SELL_THRESH) {		//...look at forecast to decide sell it
                    sellStock(stock)
                }
            }
            if (ns.stock.getForecast(stock) >= FORECAST_THRESH) {	//if the forecast is better than threshold then...
                goodoffers.push([stock, (ns.stock.getForecast(stock) - 0.5) * ns.stock.getVolatility(stock)])	//...record it to stock massive with information about profitability
                lenght += 1
            }
        }

        for (let i = 0; i < lenght - 1; i++) {	//bubble sort stock with positive forecast from most profitable to less
            for (let ii = 0; ii < lenght - 1 - i; ii++) {
                if (goodoffers[ii + 1][1] > goodoffers[ii][1]) {
                    let t0 = goodoffers[ii + 1][0]
                    let t1 = goodoffers[ii + 1][1]
                    goodoffers[ii + 1][0] = goodoffers[ii][0]
                    goodoffers[ii + 1][1] = goodoffers[ii][1]
                    goodoffers[ii][0] = t0
                    goodoffers[ii][1] = t1
                }
            }
        }

        for (let i = 0; i < lenght; i++) {	//buy stocks from most profitable to less
            if ((ns.getServerMoneyAvailable('home') - MIN_CASH - 100000) * SPEND_RATIO > MIN_SPEND) {
                buyStock(goodoffers[i][0])
            }
        }

        await ns.sleep(6000) //wait for stocks update
    }

    function buyStock(stock) {
        let stockPrice = ns.stock.getAskPrice(stock)                   // Get the stockprice
        let shares = stockBuyQuantCalc(stockPrice, stock)              // calculate the shares to buy using stockBuyQuantCalc
        ns.stock.buy(stock, shares)
        ns.print('Bought: ' + stock + ', quant: ' + Math.round(shares) + ' @ $' + Math.round(stockPrice))
        portfolio.push({ sym: stock, value: stockPrice, shares: shares }) //store the purchase info in portfolio
    }

    function sellStock(stock) {
        let position = ns.stock.getPosition(stock)
        let stockPrice = ns.stock.getAskPrice(stock)
        let i = portfolio.findIndex(obj => obj.sym === stock)      //Find the stock info in the portfolio
        ns.print('SOLD: ' + stock + ', quant: ' + Math.round(portfolio[i].shares) + ' @ $' + Math.round(stockPrice) + ' - bought at $' + Math.round(portfolio[i].value))
        portfolio.splice(i, 1)                                    // Remove the stock from portfolio
        ns.stock.sell(stock, position[0])
    }

    function stockBuyQuantCalc(stockPrice, stock) { // Calculates how many shares to buy
        let playerMoney = ns.getServerMoneyAvailable('home') - MIN_CASH - 100000
        let maxSpend = playerMoney * SPEND_RATIO
        let calcShares = Math.floor(maxSpend / stockPrice)
        let position = ns.stock.getPosition(stock)
        let avShares = ns.stock.getMaxShares(stock) - position[0]
        if (calcShares > avShares) { return avShares }
        else { return calcShares }
    }
}