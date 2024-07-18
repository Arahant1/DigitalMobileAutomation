import { readFileSync, writeFileSync } from "node:fs";

export default class DeviceState {
    deviceID: string;
    fileName: string;
    constructor(deviceID: string){
        this.deviceID = deviceID;
        this.fileName = `./temp/${this.deviceID}.json`;
    }

    setState(state: Object) {
        writeFileSync(this.fileName, JSON.stringify(state));
    }

    getState(){
        let state: { appInstalled?: boolean; enrolledUser?: string};
        try {
            state = JSON.parse(readFileSync(this.fileName).toLocaleString());            
        } catch {
            state = {
                appInstalled: false,
                enrolledUser: undefined
            };
        }
        return state;
    }

    get state(){
        return this.getState();
    }

    setAppInstalled(appInstalled: boolean) {
        const state = this.getState();
        state.appInstalled = appInstalled;
        this.setState(state);
    }

    getAppInstalled() {
        const state = this.getState();
        return state.appInstalled;
    }

    setEnrolledUser (enrolledUser?: string){
        const state = this.getState();
        state.enrolledUser = enrolledUser;
        this.setState(state);
    }

    getEnrolledUser() {
        const state = this.getState();
        return state.enrolledUser;
    }
}