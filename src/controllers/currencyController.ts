import { ApiLayer } from "../libs/apiLayer";
import * as currencyModel from '../models/currencyModel';
import Log from '../libs/log'

let system = "currencyController";
const ApiLayerKey = process.env.APILAYER_KEY || "";

export class CurrencyController {

    // private log: Log;
    public apiLayer: ApiLayer;
    private log: Log;

    constructor() {
        this.apiLayer = new ApiLayer(ApiLayerKey);
        this.run();
    }

    run() {
        this.log = new Log();
        let method = "run";

        let self = this;

        let promises = [
            this.getCurrencies()
        ]
        Promise.all(promises)
            .then(rowCount => {
                let timeout = 1000 * 60 * 60 * 4; // 4 hours
                global.health.alive = true;
                global.health.ready = true;
                this.log.info({ system, method, messageTemplate: 'Updated %d currencies in $t', messageValues: [rowCount] })   
                this.log.info({ system, method, messageTemplate: 'Next update at %s', messageValues: [(new Date(Date.now() + timeout).toLocaleString('no-NO'))] })               
                setTimeout(function () { self.run() }, timeout);                
            })
            .catch(err => {
                let timeout = 1000 * 60 * 60 * 4; // 4 hours
                global.health.alive = true;
                global.health.ready = false; 
                let error = err.error || {}
                let errorMessage = err.message || "Unknown Error"                
                this.log.err({ system, method, error, messageTemplate: '%s', messageValues: [errorMessage] })    
                this.log.warn({ system, method, messageTemplate: 'Changing ready status to %s', messageValues: [global.health.ready] })
                this.log.info({ system, method, messageTemplate: 'Next update at %s', messageValues: [(new Date(Date.now() + timeout).toLocaleString('no-NO'))] })            
                setTimeout(function () { self.run() }, timeout);
            })
         
    }    

    private getCurrencies(): Promise<object> {

        return new Promise((resolve, reject) => {

            let currencies = []
            let currencyPromises = [
                this.apiLayer.getCurrencyList(),
                this.apiLayer.getCurrencyValues()
            ]

            Promise.all(currencyPromises)
                .then((r: any) => {
                    let currencyList = r[0];
                    let currencyValues = r[1];

                    if(!currencyList.success && currencyList.error && currencyList.error.info)
                        reject({ message: `Could not get Currency List. ${currencyList.error.info}`, error: currencyList.error.info });

                    if(!currencyValues.success && currencyValues.error && currencyValues.error.info)
                        reject({ message: `Could not get Currency Values. ${currencyValues.error.info}`, error: currencyValues.error.info });
                    
                    for(let currency in currencyList.currencies) {
                        currencies.push({
                            Name: String(currencyList.currencies[currency]),
                            NameShort: currency,
                            Value: (currencyValues.quotes.hasOwnProperty(`USD${currency}`) ? currencyValues.quotes[`USD${currency}`] : undefined)
                        })
                    }
                    return currencyModel.Currency.bulkCreate(currencies, { updateOnDuplicate: ["Value", "Name"] })
                })
                .then((r: any) => {
                    resolve(r.length);
                })
                .catch(err => {
                    console.log(err);
                    reject({ message: `Could not update currencies`, error: err });
                })
        
        })
    }
}
