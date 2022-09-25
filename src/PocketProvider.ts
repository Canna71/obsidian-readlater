import { requestUrl } from "obsidian";
import { getReadlaterSettings } from "src/main";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron = require("electron");

export const POCKET_ACTION = "readlater-pocket";

export interface RequestResponse {
    code: string;
    state: string;
}

export interface AuthorizeResponse {
    access_token: string;
    username: string;
}

export async function enrollInPocket() {
    const { code, state } = await request();
    const redirectUrl = getAuthorizeUrl(
        code,
        `obsidian://${POCKET_ACTION}?code=${code}`
    );
    electron.shell.openExternal(redirectUrl);
}

export async function authorize(
    requestCode: string
): Promise<AuthorizeResponse> {
    const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Accept": "application/json",
    };

    const bodyContent = JSON.stringify({
        consumer_key: getReadlaterSettings().pocket.consumerKey,
        code: requestCode,
    });

    const response = await requestUrl({
        url: "https://getpocket.com/v3/oauth/authorize",
        method: "POST",
        body: bodyContent,
        headers: headersList,
    });

    const { json } = await response;

    return json;
}

//STEP 1

export async function request(): Promise<RequestResponse> {
    const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Accept": "application/json",
    };

    const bodyContent = JSON.stringify({
        consumer_key: getReadlaterSettings().pocket.consumerKey,
        redirect_uri: "obsidian://readlater",
        state: "pocket",
    });

    //    const response = await fetch("https://getpocket.com/v3/oauth/request", {
    //      method: "POST",
    //      body: bodyContent,
    //      headers: headersList
    //    });

    const response = requestUrl({
        url: "https://getpocket.com/v3/oauth/request",
        method: "POST",
        body: bodyContent,
        headers: headersList,
    });

    const { json } = await response;
    console.log(json);
    return json;
}

export function getAuthorizeUrl(requestToken: string, redirectUrl: string) {
    return `https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirectUrl}`;
}
