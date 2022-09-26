// https://oauth.net/core/1.0a/
// https://www.instapaper.com/api
// https://www.npmjs.com/package/oauth-signature
// https://github.com/robertklep/node-instapaper

import Instapaper from "instapaper";

const CONSUMER_KEY = "";
const CONSUMER_SECRET = "";

export async function loginUser(username: string, password: string) {
    const client = Instapaper(CONSUMER_KEY, CONSUMER_SECRET);
    const {token, secret} =  await client.setUserCredentials(username, password).authenticate();
    return {token, secret};
}

export function authorize() {
    // TODO
}
