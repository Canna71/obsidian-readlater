import  ReadlaterPlugin, { getReadlaterSettings }  from "src/main";
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
        return crypto
            .createHmac("sha1", key)
            .update(base_string)
            .digest("base64");
    },
});
oauth.parameter_seperator = ", ";

const sample =
    "oauth_token_secret=26d01c2595674eb0a282fe60c8a95712&oauth_token=d68c56d46f874eafa6d59d6a6b6cfd03";

export async function enroll(plugin: ReadlaterPlugin) {
    const { oauth_token, oauth_token_secret } = await getAccessToken(plugin);
    plugin.settings.instapaper.token = oauth_token;
    plugin.settings.instapaper.secret = oauth_token_secret;
    plugin.saveSettings();
    const verify = await verifyCredentials();
    if (verify.username) {
        plugin.settings.instapaper.username = verify.username;
        plugin.settings.instapaper.user_id = verify.user_id;
        plugin.saveSettings();
    }
} 

export type AccessTokenResponse = {
    oauth_token: string;
    oauth_token_secret: string;
};

export async function getAccessToken(plugin: ReadlaterPlugin): Promise<AccessTokenResponse> {

    const credentials = await plugin.askCredentials();

    const data = {
        url: `https://www.instapaper.com/api/1/oauth/access_token`,
        method: `POST`,
        data: {
            x_auth_username: credentials.username,
            x_auth_password: credentials.password,
            x_auth_mode: "client_auth",
        },
    };
    const au = oauth.authorize({ ...data });

    const req = {
        url: data.url,
        method: data.method,
        body: new URLSearchParams(data.data).toString(),
        headers: oauth.toHeader(au) as any,
        contentType: "application/x-www-form-urlencoded",
        throw: true,
    };
    // try {
    const response = await requestUrl(req);
    const usp = new URLSearchParams(response.text);
    const oauth_token_secret = usp.get("oauth_token_secret") || "";
    const oauth_token = usp.get("oauth_token") || "";
    return { oauth_token, oauth_token_secret };
    // } catch (error) {
    //     console.warn(error);
    // }
}


export type VerifyCredentialsResponse = {
    subscription_is_active: string;
    type: string;
    user_id: number;
    username: string;
};

export async function verifyCredentials(
    
): Promise<VerifyCredentialsResponse> {
    const {token, secret} = getReadlaterSettings().instapaper;
    if(!token || !secret) throw new Error("Not authorized with Instapaper");

    const data = {
        url: `https://www.instapaper.com/api/1/account/verify_credentials`,
        method: `POST`,
    };
    const au = oauth.authorize(
        { ...data },
        { key: token, secret: secret }
    );
    const req = {
        url: data.url,
        method: data.method,
        // body: new URLSearchParams(data.data).toString(),
        headers: oauth.toHeader(au) as any,
        contentType: "application/x-www-form-urlencoded",
        throw: false,
    };
    const response = await requestUrl(req);
    return response.json[0];
}

export type InstaBookmark = {
    bookmark_id: number
    description: string
    hash: string
    private_source: string
    progress: number
    progress_timestamp: number
    starred: string
    time: number
    title: string
    type: string
    url: string
};

export async function getUnreadArticles ()  : Promise<InstaBookmark[]>{
        const {token, secret} = getReadlaterSettings().instapaper;
        if(!token || !secret) throw new Error("Not authorized with Instapaper");
        const data = {
            url: `https://www.instapaper.com/api/1/bookmarks/list`,
            method: `POST`,
        };
        const au = oauth.authorize(
            { ...data },
            { key: token, secret: secret }
        );
        const req = {
            url: data.url,
            method: data.method,
            // body: new URLSearchParams(data.data).toString(),
            headers: oauth.toHeader(au) as any,
            contentType: "application/x-www-form-urlencoded",
            throw: false,
        };
        const response = await requestUrl(req);
        return response.json.filter((item:any) => item.type === "bookmark");
}

export async function archiveBookmark (bookmark_id:number)  : Promise<InstaBookmark>{
    const {token, secret} = getReadlaterSettings().instapaper;
    if(!token || !secret) throw new Error("Not authorized with Instapaper");
    const data = {
        url: `https://www.instapaper.com/api/1/bookmarks/archive`,
        method: `POST`,
        data: {
            bookmark_id: bookmark_id.toString()
        }
    };
    const au = oauth.authorize(
        { ...data },
        { key: token, secret: secret }
    );
    const req = {
        url: data.url,
        method: data.method,
        body: new URLSearchParams(data.data).toString(),
        headers: oauth.toHeader(au) as any,
        contentType: "application/x-www-form-urlencoded",
        throw: false,
    };
    const response = await requestUrl(req);
    return response.json.filter((item:any) => item.type === "bookmark");
}
