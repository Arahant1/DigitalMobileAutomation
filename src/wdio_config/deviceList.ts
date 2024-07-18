import _ from 'lodash';

const deviceList = {
   localAppium:{
    Android: [''],
    iOS:[]
   },
   
   weekNightWokplace:{
    Anndroid: [
        { deviceName: 'Samsung Galaxy S23', platformVersion: '13.0' },
        { deviceName: 'Samsung Galaxy S10', platfromVersion: '9.0'}
    ],

    iOS: [
        {deviceName: 'iPhone 15 plus', paltformVersion: '17'},
        {deviceName: 'iPhone 13', platformVersion: '15'}
    ]
   },
   weekNightdirectwealth:{
    Anndroid:['Samsung Galaxy S23'],
    iOS:['iPhone 15 plus']
   },
   weekNightManga:{
    Anndroid: [
        { deviceName: 'Samsung Galaxy S23', platformVersion: '13.0' },
        { deviceName: 'Samsung Galaxy S10', platfromVersion: '9.0'}
    ],

    iOS: [
        {deviceName: 'iPhone 15 plus', paltformVersion: '17'},
        {deviceName: 'iPhone 13', platformVersion: '15'}
    ]
   }


};

export const getPresetDevice = (deviceSet: string, platform: string)=> _.get(deviceList,`${deviceSet}.${platform}`);