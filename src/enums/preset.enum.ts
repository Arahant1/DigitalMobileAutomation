import {getPresetDevice} from '../wdio_config/deviceList.js';
import { AppNmaeEnum } from './appNmae.enum.js';
import { PlatformEnum } from './platform.enum.js';
import {ServerEnum} from './server.enum.js'


export const PresetEnum = {
    weekdaySainity: {
        provider: 'mock',
        platform: [PlatformEnum.Android, PlatformEnum.iOS],
        tags: '@smoke',
        app: [AppNmaeEnum.WORKSPACE],
        server: [ServerEnum.RUNWAY]
    },
    testPresetWitTags: {
        tags: 'not @manual and not @outOfScope'
    },
    testPresetWithoutTags: {
        tags: 'not @manual and  not @pending'

    },
    localAppium: {
        deviceIds: (platform: string) => getPresetDevice('localAppium', platform),
        provider: 'appium',
        platform: [PlatformEnum.Android, PlatformEnum.iOS],
        tags: '@smoke',
        app: [AppNmaeEnum.WORKSPACE],
        server: [ServerEnum.RUNWAY]

    },weekNightWorkplace: {
        deviceIds: (platform:string)=> getPresetDevice('weekNightWorkPlace', platform),
        provider: 'browserstack',
        platform: [PlatformEnum.Android, PlatformEnum.iOS],
        tags: '@regression',
        app: [AppNmaeEnum.WORKSPACE],
        server: [ServerEnum.RUNWAY]

    },weekNightDirectWealth: {
        deviceIds: (platform:string)=> getPresetDevice('weekNightDirectWealth', platform),
        provider: 'browserstack',
        platform: [PlatformEnum.Android, PlatformEnum.iOS],
        tags: '@regression',
        app: [AppNmaeEnum.DIRECT_WEALTH],
        server: [ServerEnum.RUNWAY]

    }
    ,weekNightManga: {
        deviceIds: (platform:string)=> getPresetDevice('weekNightManga', platform),
        provider: 'browserstack',
        platform: [PlatformEnum.Android, PlatformEnum.iOS],
        tags: '@regression',
        app: [AppNmaeEnum.MANGA],
        server: [ServerEnum.RUNWAY]

    }
} as const;