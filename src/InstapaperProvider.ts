// https://oauth.net/core/1.0a/
// https://www.instapaper.com/api
// https://www.npmjs.com/package/oauth-signature
// https://github.com/robertklep/node-instapaper
// https://github.com/Kong/mashape-oauth
// https://github.com/robertklep/node-instapaper/blob/master/lib/index.js
// https://www.npmjs.com/package/oauth-1.0a

import crypto from "crypto";
import OAuth from "oauth-1.0a";

const CONSUMER_KEY = "d9199656c5cf4e1ebd6021e9cc73eef4";
const CONSUMER_SECRET = "90e4d04cf8a3476fa9bcc7a7efa704bf";

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
            return crypto
                .createHmac("sha1", key)
                .update(base_string)
                .digest("base64");
        },
    });

    const res = oauth.authorize({
        url: `https://www.instapaper.com/api/1/oauth/access_token`,
        method: `POST`,
        data: {
            x_auth_username: "*****",
            x_auth_password: "******",
            x_auth_mode: "client_auth",
        },
    });

    console.log(res);
    // accessUrl: `https://www.instapaper.com/api/1/oauth/access_token`,
    // signatureMethod: "HMAC-SHA1",
    // oauth.get
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
