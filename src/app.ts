import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as router from "./routes/routes";

global.health = { ready: false, alive: true };
global.path = process.env.ROUTERPATH || "";

class App {

    public app: express.Application;
    public defaultRoutes: router.defaultRouter = new router.defaultRouter();
    public fallbackRoutes: router.fallbackRouter = new router.fallbackRouter();
    public currencyRoutes: router.currencyRouter = new router.currencyRouter();
 
    constructor() {
        this.app = express();
        this.config();  
        this.defaultRoutes.routes(this.app);
        this.currencyRoutes.routes(this.app);
        this.fallbackRoutes.routes(this.app);       
    }

    private config(): void {
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // serving static files 
        this.app.use(express.static('public'));
    }

}

export default new App().app;