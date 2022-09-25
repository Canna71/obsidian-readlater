import { getReadlaterSettings } from 'src/main';
// import {shell} from "electron";

export interface RequestResponse {
    code: string,
    state: string
}

export async function enrollInPocket(){
    const {code,state} = await request();
    const redirectUrl = getAuthorizeUrl(code,`obsidian://settings`);
    (electron as any).shell.openExternal(redirectUrl);
}

//STEP 1

export async function request():Promise<RequestResponse> {

    const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Accept": "application/json"
       }
       
       const bodyContent = JSON.stringify({"consumer_key":getReadlaterSettings().consumerKey,
       "redirect_uri":"obsidian://"});
       
       const response = await fetch("https://getpocket.com/v3/oauth/request", { 
         method: "POST",
         body: bodyContent,
         headers: headersList
       });
       
       const data = await response.json();
       console.log(data); 
       return data;
}

export function getAuthorizeUrl(requestToken: string, redirectUrl: string) {
    return `https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirectUrl}`;
}
