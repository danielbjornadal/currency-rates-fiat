import app from "./app";

declare global {
    namespace NodeJS {
        interface Global {
            health: {
                ready: boolean,
                alive: boolean
            };
            path: string;
        }
    }
}

const PORT = process.env.PORT || 80;
const server = app.listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})

process.on('SIGTERM', function () {
    global.health.ready = false;
    server.close(() => {
        process.exit(0);
    });
});

/*
import app from './app';
import * as https from 'https';
import * as fs from 'fs';
const PORT = 3000;

const httpsOptions = {
    key: fs.readFileSync('./config/key.pem'),
    cert: fs.readFileSync('./config/cert.pem')
}

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})
*/