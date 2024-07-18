const get = async (url: string, headers = {}) =>{
    const response = await fetch(url, {
        method: 'get',
        headers
    });
    return {body: await response.json(), statusCode: response.status, headers: response.headers };
};

const post = async (url: string, body: string,headers = {} ) =>{
    const response = await fetch(url, {
        method: 'post',
        headers,
        body
    });
    return {boday: await response.json(), statusCode: response.status, headers: response.headers };
};

const put = async (url: string, body: string,headers = {} ) =>{
    const response = await fetch(url, {
        method: 'put',
        headers,
        body
    });
    return {boday: await response.json(), statusCode: response.status, headers: response.headers };
};

const del = async (url: string, body: string,headers = {} ) =>{
    const response = await fetch(url, {
        method: 'delete',
        headers,
        body
    });
    return {boday: await response.json(), statusCode: response.status, headers: response.headers };
};

const patch = async (url: string, body: string,headers = {} ) =>{
    const response = await fetch(url, {
        method: 'patch',
        headers,
        body
    });
    return {boday: await response.json(), statusCode: response.status, headers: response.headers };
};

const requestHelper = {get,post,put,del,patch};

export default requestHelper;