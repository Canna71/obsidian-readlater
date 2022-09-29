// https://oauth.net/core/1.0a/
// https://www.instapaper.com/api
// https://www.npmjs.com/package/oauth-signature
// https://github.com/robertklep/node-instapaper
// https://github.com/Kong/mashape-oauth
// https://github.com/robertklep/node-instapaper/blob/master/lib/index.js
// https://www.npmjs.com/package/oauth-1.0a
// https://gist.github.com/killercup/4205541

import crypto from "crypto";
import OAuth from "oauth-1.0a";
import { requestUrl } from "obsidian";
import { URLSearchParams } from "url";

const CONSUMER_KEY = "d9199656c5cf4e1ebd6021e9cc73eef4";
const CONSUMER_SECRET = "90e4d04cf8a3476fa9bcc7a7efa704bf";
const oauth = new OAuth({
    consumer: {
        key: CONSUMER_KEY,
        secret: CONSUMER_SECRET,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
        console.log({base_string})
        return crypto
            .createHmac("sha1", key)
            .update(base_string)
            .digest("base64");
    }
    
});
oauth.parameter_seperator=", ";

const sample = "oauth_token_secret=26d01c2595674eb0a282fe60c8a95712&oauth_token=d68c56d46f874eafa6d59d6a6b6cfd03";

export type AccessTokenResponse = {
    oauth_token: string,
    oauth_token_secret: string
}

export async function enrollInstapaper():Promise<AccessTokenResponse> {
    // TODO: ask username and password


    const data = {
        
        url: `https://www.instapaper.com/api/1/oauth/access_token`,
        // url: `https://www.instapaper.com/api/1/account/verify_credentials`,
        method: `POST`,
        data: {
            x_auth_username: "cippa.lippa@mail.com",
            x_auth_password: "****",
            x_auth_mode: "client_auth"
        }
    };
    const au = oauth.authorize({...data});

    const req = {
        url: data.url,
        method: data.method,
        body: new URLSearchParams(data.data).toString(),
        headers: oauth.toHeader(au) as any,
        contentType: "application/x-www-form-urlencoded",
        throw: true
    };
    console.log(req);
    // try {
        const response = await requestUrl(req);
        const usp = new URLSearchParams(response.text);
        const oauth_token_secret = usp.get("oauth_token_secret") || "";
        const oauth_token = usp.get("oauth_token") || "";
        console.log({oauth_token, oauth_token_secret});
        return {oauth_token, oauth_token_secret};
    // } catch (error) {
    //     console.warn(error);
    // }
}

export async function loginUser(username: string, password: string) {
    // const client = Instapaper(CONSUMER_KEY, CONSUMER_SECRET);
    // const {token, secret} =  await client.setUserCredentials(username, password).authenticate();
    // console.log({token, secret})
    // return {token, secret};
}
export type VerifyCredentialsResponse = {
    subscription_is_active: string, 
    type: string,
    user_id: number,
    username: string
}

export async function veriftCredentials(token:string, token_secret: string) : Promise<VerifyCredentialsResponse>{
    const data = {
        
        url: `https://www.instapaper.com/api/1/account/verify_credentials`,
        method: `POST`
        
    };
    const au = oauth.authorize({...data},{key:token, secret:token_secret}); 
    const req = {
        url: data.url,
        method: data.method,
        // body: new URLSearchParams(data.data).toString(),
        headers: oauth.toHeader(au) as any,
        contentType: "application/x-www-form-urlencoded",
        throw: false
    };
    const response = await requestUrl(req);
    console.log(response);
    return response.json[0];
}

export function authorize() {
    // TODO
}
