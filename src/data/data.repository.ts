import fs from 'node:fs';
import path from 'node:path';

import _ from 'lodash';

import LocalDataRepository from './local.data.repository.js';
import RemotDataRepository from './remote.data.repository.js';

export interface AssinedUser {
    username: string;
    password: string;
    server: string;
    desiredUserType: string;
    data?: object;
    groups?: string[];
    mobileNumber: string;
}

export default class DataRepository {
    private localDataRepository: LocalDataRepository;
    private remotDataRepository: RemotDataRepository;
    private dataSource: LocalDataRepository | RemotDataRepository;
    public assinedUser: AssinedUser;

    constructor(localDataRepository = new LocalDataRepository(), remotDataRepository = new RemotDataRepository()){
        this.localDataRepository = localDataRepository;
        this.remotDataRepository = remotDataRepository;
        // Since we have two diff data sources on which test can be executed we need to override the source in runtime
        this.dataSource = this.localDataRepository;
        this.assinedUser = <AssinedUser>{};
    }

    async initialize (dataSource: string) {
        if(dataSource === 'remote') {
            this.dataSource = this.remotDataRepository;
        }
        await this.dataSource.initialize();    
    }

    getConfiguredValues (appName: string){
        const file = path.join(path.resolve('./src/data'), `${appName.toLowerCase()}/default.json`);
        if (fs.existsSync(file)){
            return JSON.parse(fs.readFileSync(file).toString());
        }
        return {};
    }

    async assign(appName: string, server: string, desiredUserType: string, mobileNumber?: string) {
        const user = await this.dataSource.getAccount(appName, server, desiredUserType, mobileNumber);
        if (user){
           this.assinedUser = user;
        }else {
            throw new Error( `Test data not found for ${appName}, ${server}, ${desiredUserType}, ${mobileNumber}`);
        }

        Object.assign(this.assinedUser, this.getConfiguredValues(appName));
        await this.releaseAccount();
        return this.assinedUser;
    }

    async releaseAccount() {
        await this.dataSource.releaseAccount(this.assinedUser);
    }

    async  get () {
        if (_.isEmpty(this.assinedUser)) {
            throw new Error('Unable to retrieve data which has not been assigned. ');
        }
        return Promise.resolve(this.assinedUser);
    }

    async unAssign() {
        if (this.assinedUser) {
            this.assinedUser = <AssinedUser>{};
        }
        return Promise.resolve(this.assinedUser);
    }
}