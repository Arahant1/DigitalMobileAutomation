import fs from 'node:fs';
import path from 'node:path';

import {parse } from 'csv-parse/sync';
import _ from 'lodash';

import { DesiredUserTypeEnum } from '../enums/desiredType.enum.js';
import logger from '../utils/logger.js';

export interface User {
    username: string;
    password: string;
    server: string;
    appNmae: string;
    desiredUserType: string;
    mobileNumner: string;
}

export default class LocalDataRepository {
    private readonly directory: string;
    private readonly users: User[];

    constructor(directory: string = path.resolve('/src/data')){
        this.directory = path.resolve(directory);
        this.users = this.loadData();
    }

    loadData() {
        return _.flatten([this.loadDataFromCSVFile('data.csv')]);
    }

    loadDataFromCSVFile(fileName: string) {
       try {
            const file = fs.readFileSync(path.join(this.directory, fileName));
            const users: User[] = parse(file, { columns: true, skip_empty_lines: true});
            const mappedUser = users.map((user) => {
                const {desiredUserType } = user;
                if (!(desiredUserType in DesiredUserTypeEnum)) {
                    throw new Error (`desiredUserType "${desiredUserType}" not found in Enum`);
                }
                return user;
            });
            return mappedUser;
        } catch (error) {
            logger.error ('Error occured in parsing data from csv files')
            throw new Error(error.message)
        }
    }

    async initialize() {
        return Promise.resolve(this.users);
    }

    async getAccount (appName: string, server: string, desiredUserType: string, mobileNumber?: string) {
        const filteredUsers = _.filter(this.users, {appName, server, desiredUserType, mobileNumber});
        const randomUser = _.sample(filteredUsers);
        return Promise.resolve(randomUser);
    }

    // TODO - Need to write unit tests for below method

    async releaseAccount (user: Partial<User>){
        if (user) {
            return Promise.resolve(this.users);
        }
    }

}