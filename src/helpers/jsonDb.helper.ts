import { Config, JsonDB } from 'node-json-db';

export default class JsonDBHelper {
    dataBase: JsonDB;
    constructor(dataBaseName: string = 'local-json-db'){
        this.dataBase = new JsonDB(new Config(dataBaseName,true, true,'/'));
    }

    async set (key:string, value: object) {
        await this.dataBase.push(key, value);
    }

    async get (key:string) {
       return await this.dataBase.getData(key);
    }
}