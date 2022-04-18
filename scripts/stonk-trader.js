import {log, formatMoney} from "helpers.js";

/** @type import(".").NS */
let ns = null;
let stock_symbols = [];
const TRANSACTION_FEE = 100_000;
const HISTORY_FILE = "stock_history.txt";
const HOME = "home";

class Stonk {
    constructor(symbol="") {
        this.symbol = "";
        this.updates = 0;
        this.currentPrice = 0;
        this.minPrice = 0;
        this.maxPrice = 0;
        this.meanPrice = 0;
    }
}

class StonkTrader {

    constructor() {
        this.marketHistory = [];
    }

    loadHistory(){
        // If a history file exists then load it, otherwise start
        // a new history
        if(ns.fileExists(HISTORY_FILE, HOME)){
            let historyString = ns.read(HISTORY_FILE);
            this.marketHistory = JSON.parse(historyString);
            log(ns, "INFO: Loaded history from file.");
        } else {
            let stockSymbols = ns.stock.getSymbols();
            for(let symbol of stockSymbols){
                this.marketHistory.push(new Stonk(symbol));
            }
            log(ns, "INFO: Starting new stock history.");
        }
    }

    async saveHistory(){
        let historyString = JSON.stringify(this.marketHistory);
        await ns.write(HISTORY_FILE, historyString,"w");
    }
    
    /** @param {Stonk} stock*/
    updateStock(stock){
        stock.currentPrice = ns.stock.getPrice(stock.symbol);
        let total = stock.meanPrice * stock.updates;
        stock.updates++;
        stock.meanPrice = total / stock.updates;
        if(stock.currentPrice < stock.minPrice){
            stock.minPrice = stock.currentPrice;
        }
        if(stock.currentPrice > stock.maxPrice){
            stock.maxPrice = stock.currentPrice;
        }
    }

    async start(){
        this.loadHistory();
        for(let stock of this.marketHistory){

        }
    }
}

/** @param {NS} _ns **/
export async function main(_ns) {
    ns = _ns;
    ns.disableLog("ALL");
    stock_symbols = ns.stock.getSymbols(); // all symbol

}



