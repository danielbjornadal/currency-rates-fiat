import { Request, Response, NextFunction } from "express";
import { CurrencyController } from "../controllers/currencyController";

let path = process.env.ROUTERPATH || "";

export class currencyRouter { 
    public currencyController: CurrencyController = new CurrencyController()  
    public routes(app): void {   
        // TOTO: Add currencies as metrics for Prometheus
        app.route(`${path}/metrics`);
    }
}

export class defaultRouter {      
    public routes(app): void {   
        app.route(path)
            .get((req: Request, res: Response) => {
                res.status(200).json({
                    message: "OK"
                })
            })
        app.route(`${path}/ready`)
            .get((req: Request, res: Response) => {
                let statusCode = global.health.ready ? 200 : 503
                res.status(statusCode).json({
                    ready: global.health.ready
                })
            })
        app.route(`${path}/health`)
            .get((req: Request, res: Response) => {
                let statusCode = global.health.alive ? 200 : 503
                res.status(statusCode).json({
                    alive: global.health.alive
                })
            })
    }
}

export class fallbackRouter { 
    public routes(app): void {   
        app.route("*")
            .get((req: Request, res: Response) => {
                let statusCode = 404;
                res.status(statusCode).json({error: "Not found"})
            })
    }
}