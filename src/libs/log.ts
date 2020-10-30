import { userInfo } from 'os';
import * as dateFormat from 'dateformat';
import { sprintf, vsprintf } from 'sprintf-js';
import { v1 as UUID } from 'uuid';

/**
 * @name Log()
 * @function log.debug(opts)
 * @function log.info(opts)
 * @function log.warn(opts)
 * @function log.err(opts)
 * @function log.crit(opts)
 * @param {object} opts
 * @param {string} [opts.method=undefined] Method name
 * @param {string} [opts.system=undefined] System name
 * @param {string} [opts.messageTemplate=''] Message template. sprintf style. Use $t for timeUsed substitude.
 * @param {array} [opts.messageValues=[]] Message values for messageTemplate.
 */


export class Log {

    private _start: number;
    private _message: string;
    private _uuid: string;
    private _logLevel: string;
    private _logLevels: Array<string>;
    private _logFormat: string;

	constructor() {
        this._start = Date.now()
        this._message = ''
        this._uuid = UUID()
        this._logLevel = process.env.LOGLEVEL || "info";
        this._logLevels = [ "debug", "info", "warning", "error", "critical" ];
        this._logFormat = process.env.LOGFORMAT || "string";
    }
    
    private log(level: string = 'info', opts): void {

        let logLevel = this._logLevels.findIndex(x => x === this._logLevel) || 1;
        let curLevel = this._logLevels.findIndex(x => x === level) || 1;
        if (logLevel > curLevel)
            return

        let unixTimestamp = Date.now()
        let timeUsed = Date.now() - this._start
        let datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss Z")

        let user = userInfo().username || undefined

        let method = opts.method || undefined
        let system = opts.system || undefined

        let messageTemplate = opts.messageTemplate || ''
        let messageValues = opts.messageValues || []
        let message = vsprintf(messageTemplate, messageValues).replace('$t', timeUsed + 'ms')
        this._message = message

        let audit = {
            uuid: this._uuid,
            unixTimestamp,
            datetime,
            timeUsed,
            user,
            system,
            method,
            level,
            messageTemplate,
            messageValues,
            message
        }

        let custom: string[] = Object.keys(opts).filter(k => Object.keys(audit).indexOf(k) === -1)

        for(let k in opts) {
            if(custom.includes(k)) {
                audit[k] = opts[k]
            }
        }
        if(this._logFormat === "string")
            console.log(audit.message)
        else if(this._logFormat === "json")
            console.log(JSON.stringify(audit))
    }

    public debug(opts): void {
        this.log('debug', opts)
    }
    public info(opts): void {
        this.log('info', opts)
    }
    public warn(opts): void {
        this.log('warning', opts)
    }
    public err(opts): void {
        this.log('error', opts)
    }
    public crit(opts): void {
        this.log('critical', opts)
    }
    public get msg(): string {
        return this._message;
    }
    public get uuid(): string {
        return this._uuid;
    }
}

export default Log