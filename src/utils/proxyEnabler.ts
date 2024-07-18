import { ProxyAgent, setGlobalDispatcher } from 'undici';

// export (process.env.GLOBAL_AGENT_NO_PROXY).toBe('*avivacloud.com,dev.azure.com);

export const initialize = () => {
    const proxyHost = process.env.PROXY_HOST;
    const proxyPort = process.env.PROXY_PORT;
    const proxyUser = process.env.PROXY_USER;
    const proxyPWD = process.env.PROXY_PWD;

    if (proxyHost && proxyPort){
        let proxy = `${proxyHost}:${proxyPort}`;

        if (proxyUser && proxyPWD) {
            const encodedPassword = encodeURIComponent(proxyPWD).replace(/!/g,'%21');
            proxy = `${proxyUser} ${encodedPassword}@${proxy}`;
        }

        const dispatcher = new ProxyAgent ({ uri: new URL(`http://${proxy}`).toString()});
        setGlobalDispatcher(dispatcher);
    }
};