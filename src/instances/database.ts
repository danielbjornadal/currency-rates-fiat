import { Sequelize, Model, DataTypes } from 'sequelize'

const host = process.env.DATABASE_HOST || "localhost";
const port = (process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306)
const logging = (process.env.DATABASE_LOGGING ? true : false);

const db = process.env.DATABASE || "currency";
const username = process.env.DATABASE_USERNAME || "root";
const password = process.env.DATABASE_PASSWORD || "password";
const domain = process.env.DATABASE_USERDOMAIN || "";

export const sequelize = new Sequelize(db, username, password, {
    dialect: "mariadb",
    host,
    port,
    dialectOptions: {
      domain
    },
    logging
});

export const model = Model;

export const dataTypes = DataTypes;
 
sequelize.authenticate()
  .then(() => {
    console.log("Connection to database OK");
    global.health.alive = true;
    global.health.ready = true;
  })
  .catch(() => {
    console.log("Connection to database FAILED");
    global.health.alive = false;
  }); 