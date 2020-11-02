import * as request from "request-promise";

export class ApiLayer {

    private _protocol: any;
    private _urlApi: any;
    private _protoc_urlApiol: any;
    private _urlSecure: any;
    private _strictSSL: any;
    private _accessKey: any;

	constructor(access_key: String = "") {
        this._urlApi = "http://api.currencylayer.com/api"
        this._accessKey = access_key;
	}

    callApi(opts, loopback = {}) {
        return new Promise((resolve, reject) => {

            if(!opts.path)
                reject('Missing path')            

            if(!opts.params.hasOwnProperty("access_key"))
                opts.params['access_key'] = this._accessKey;
            
            
            let options = {
                method: opts.method || 'GET',
                uri: `${this._urlApi}${opts.path}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                json: true,
                qs: '',
                body: ''
            }

            if(options.method === 'GET')
                options.qs = opts.params || {}

            if(options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')
                options.body = opts.params || {}
            
            request(options) 
                .then((res) => {
                    Object.assign(res, loopback);
                    resolve(res)
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    /** Sanitize string
     * @name sanitize
     * @function
     * @param {string} str - String to sanitize
     */
    sanitize(str) {
        if(!str || typeof str != 'string')
            return ''

        return str.replace(/[^a-zA-Z0-9\-]/g, '')
    }

    /** getCurrencyList
     * @name getCurrencyList
     * @function
     */
    getCurrencyList(params = { format: 1 }) {
        let opts = { 
            method: 'GET',
            path: `/list`,
            params
        }
        return this.callApi(opts)
    }

    /** getCurrencyValues
     * @name getCurrencyValues
     * @function
     */
    getCurrencyValues(params = { format: 1 }) {
        let opts = { 
            method: 'GET',
            path: `/live`,
            params
        }
        return this.callApi(opts)
    }


    
}