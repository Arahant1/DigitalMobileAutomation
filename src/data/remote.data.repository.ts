/* eslint @typescrip-eslint/no-empty-function: "off", typescript-eslint/no-unused-vars: "off" */

interface User {
    usename: string;
    password: string;
    server: string;
    desiredUserType: string;
    mobileNumber: string;
    group?: string [];
}

// TODO - Yet to implement remote data repository
export default class RemotDataRepository {
    constructor() {}

    async initialize(){}

    async  getAccount(appName: string, server: string, desiredUserType: string, mobileNumber?: string) {}

    async releaseAccount(user:Partial<User>) {}


}