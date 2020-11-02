import * as Sequelize from "sequelize"
import { sequelize, model, dataTypes } from '../instances/database'

export interface CurrenciesModel {
    Name?: string
    NameShort?: string
    Symbol?: string
    Value?: string
}

export const FiatLive = sequelize.define("fiat_live", {
	Name: { 
		type: dataTypes.STRING 
	},
	NameShort: { 
		type: dataTypes.STRING,
		primaryKey: true,
	},
	Symbol: { 
		type: dataTypes.STRING 
	},
	Value: { 
		type: dataTypes.FLOAT 
	}
},{
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
    underscored: false
}); 

export const Sync = sequelize.sync({force: false}).then((err) => {
    //if(err)
     //   console.log(err)
})

export const Tables = sequelize.getQueryInterface().describeTable('fiat_live');

export const Op = Sequelize.Op;
