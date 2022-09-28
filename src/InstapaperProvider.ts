// https://oauth.net/core/1.0a/
// https://www.instapaper.com/api
// https://www.npmjs.com/package/oauth-signature
// https://github.com/robertklep/node-instapaper
// https://github.com/Kong/mashape-oauth
// https://github.com/robertklep/node-instapaper/blob/master/lib/index.js
// https://www.npmjs.com/package/oauth-1.0a

import crypto from "crypto";
import OAuth from "oauth-1.0a";
import { requestUrl } from "obsidian";

const CONSUMER_KEY = "d9199656c5cf4e1ebd6021e9cc73eef4";
const CONSUMER_SECRET = "90e4d04cf8a3476fa9bcc7a7efa704bf";

function fixedEncodeUriComponent(str: string) {
    return encodeURIComponent(str)
        .replace(/!/g, "%21")
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29")
        .replace(/\*/g, "%2A");
}

export async function enrollInstapaper() {
    // TODO: ask username and password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const {token, secret} = await loginUser("******", "******!");
    const oauth = new OAuth({
        consumer: {
            key: CONSUMER_KEY,
            secret: CONSUMER_SECRET,
        },
        signature_method: "HMAC-SHA1",
        hash_function(base_string, key) {
            console.log("base_string", base_string)
            return crypto
                .createHmac("sha1", key)
                .update(base_string)
                .digest("base64");
        },
    });
    oauth.parameter_seperator=", ";

    const req_access_token = {
        url: `https://www.instapaper.com/api/1/oauth/access_token`,
        method: `POST`,
        data: {
            // oauth_consumer_key: CONSUMER_KEY,
            // oauth_nonce: oauth.getNonce(),
            // oauth_signature_method: "HMAC-SHA1",
            // oauth_timestamp: oauth.getTimeStamp(),
            // oauth_version: "1.0",
            x_auth_username: "gcannata",
            x_auth_password: "WhenIm64!",
            x_auth_mode: "client_auth"
        },
    };

    const au = oauth.authorize(req_access_token);
    oauth.toHeader(au)
    // const oauth_timestamp = au.oauth_timestamp;
    console.log(au);
    // const authHeader = `OAuth oauth_consumer_key="${fixedEncodeUriComponent(au.oauth_consumer_key)}", oauth_signature_method="HMAC-SHA1", oauth_signature="${fixedEncodeUriComponent(au.oauth_signature)}", oauth_timestamp="${fixedEncodeUriComponent(au.oauth_timestamp.toString())}", oauth_nonce="${fixedEncodeUriComponent(au.oauth_nonce)}", oauth_version="1.0"`;


    const req = {
        url: req_access_token.url,
        method: req_access_token.method,
        body: JSON.stringify(req_access_token.data),
        headers: oauth.toHeader(au) as any,
    };
    console.log(req);
    console.log(req_access_token.data)
    try {
        const response = await requestUrl(req);
        console.log(response);
    } catch (error) {
        console.warn(error);
    }
}

export async function loginUser(username: string, password: string) {
    // const client = Instapaper(CONSUMER_KEY, CONSUMER_SECRET);
    // const {token, secret} =  await client.setUserCredentials(username, password).authenticate();
    // console.log({token, secret})
    // return {token, secret};
}

export function authorize() {
    // TODO
}
