import { ApiLayer } from "../libs/apiLayer";
import * as currencyModel from '../models/currencyModel';
import Log from '../libs/log'

let system = "FiatController";
const ApiLayerKey = process.env.APILAYER_KEY || "";

export class FiatController {

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
            let promises = [
                this.apiLayer.getFiatList(),
                this.apiLayer.getFiatValues()
            ]

            Promise.all(promises)
                .then((r: any) => {
                    let fiatList = r[0];
                    let fiatValues = r[1];

                    if(!fiatList.success && fiatList.error && fiatList.error.info)
                        reject({ message: `Could not get Currency List. ${fiatList.error.info}`, error: fiatList.error.info });

                    if(!fiatValues.success && fiatValues.error && fiatValues.error.info)
                        reject({ message: `Could not get Currency Values. ${fiatValues.error.info}`, error: fiatValues.error.info });
                    
                    for(let currency in fiatList.currencies) {
                        currencies.push({
                            Name: String(fiatList.currencies[currency]),
                            NameShort: currency,
                            Value: (fiatValues.quotes.hasOwnProperty(`USD${currency}`) ? fiatValues.quotes[`USD${currency}`] : undefined)
                        })
                    }
                    return currencyModel.FiatLive.bulkCreate(currencies, { updateOnDuplicate: ["Value", "Name"] })
                })
                .then((r: any) => {
                    resolve(r.length);
                })
                .catch(err => {
                    console.log(err);
                    reject({ message: `Could not update fiat currency`, error: err });
                })
        
        })
    }
}
