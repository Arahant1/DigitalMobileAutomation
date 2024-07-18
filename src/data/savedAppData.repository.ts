import moment from "momnet";

// To save data from the app in a particular step and retrieve in some other step
const savedData: { [key: string]: string | number | object | boolean | moment.Moment } = {};

export const setData = (key: string, value: string | number | object| boolean| moment.Moment) => {
    if (value === undefined || value === null) {
        throw new Error(`call to set data for ${key} is either undefined or null`);
    }
    savedData[key] = value;
};

export const getData = (key: string) => {
    const value = savedData[key];
    if (value === undefined || value === null) {
        throw new Error(`Unable to retrieve value for ${key} before it has been set`);
    }
    return value;
};

export const resetData = (key: string)=> {
    delete savedData[key];
}