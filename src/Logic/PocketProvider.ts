import { Bookmark } from "./Processor";
import { requestUrl } from "obsidian";
import { getReadlaterSettings } from "src/main";
import moment from "moment";
import { BookmarksProvider } from "./Provider";

// DOCS: https://getpocket.com/developer/docs/authentication

// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron = require("electron");

export const POCKET_ACTION = "readlater-pocket";

const CONSUMER_KEY = "103949-5250a92d096442648cc99a6";

export interface RequestResponse {
    code: string;
    state: string;
}

export interface AuthorizeResponse {
    access_token: string;
    username: string;
}

export interface ListResult {
    status: number;
    complete: number;
    list: {
        [id: string]: {
            item_id: string;
            resolved_id: string;
            given_url: string;
            given_title: string;
            favorite: string;
            status: string;
            time_added: string;
            time_updated: string;
            time_read: string;
            time_favorited: string;
            sort_id: number;
            resolved_title: string;
            resolved_url: string;
            excerpt: string;
            is_article: string;
            is_index: string;
            has_video: string;
            has_image: string;
            word_count: string;
            lang: string;
            time_to_read: number;
            top_image_url: string;
            domain_metadata: {
                name: string;
                logo: string;
                greyscale_logo: string;
            };
            listen_duration_estimate: number;
            error: any;
            search_meta: {
                search_type: string;
            };
            since: number;
        };
    };
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
        consumer_key: CONSUMER_KEY,
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
        consumer_key: CONSUMER_KEY,
        redirect_uri: "obsidian://readlater",
        state: "pocket",
    });

    //    const response = await fetch("https://getpocket.com/v3/oauth/request", {
    //      method: "POST",
    //      body: bodyContent,
    //      headers: headersList
    //    });

    const response = await requestUrl({
        url: "https://getpocket.com/v3/oauth/request",
        method: "POST",
        body: bodyContent,
        headers: headersList,
    });

    const { json } = response;
    return json;
}

export function getAuthorizeUrl(requestToken: string, redirectUrl: string) {
    return `https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirectUrl}`;
}

async function getUnreadList(): Promise<ListResult> {
    const pocketCfg = getReadlaterSettings().pocket;

    const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Accept": "application/json",
    };

    const bodyContent = JSON.stringify({
        consumer_key: CONSUMER_KEY,
        access_token: pocketCfg.access_token,
    });

    const response = await requestUrl({
        url: "https://getpocket.com/v3/get",
        method: "POST",
        body: bodyContent,
        headers: headersList,
    });

    const data = response.json;
    return data;
}

async function GetBookmarks(): Promise<Bookmark[]> {
    const { list } = await getUnreadList();
    const bookmarks = Object.keys(list).map((key) => {
        const item = list[key];
        return {
            id: item.item_id,
            url: item.resolved_url,
            title: item.given_title,
        };
    });
    return bookmarks;
}

async function archive(itemId: string): Promise<ListResult> {
    const pocketCfg = getReadlaterSettings().pocket;

    const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Accept": "application/json",
    };

    const bodyContent = JSON.stringify({
        consumer_key: CONSUMER_KEY,
        access_token: pocketCfg.access_token,
        actions: [
            {
                action: "archive",
                item_id: itemId,
                time: moment().valueOf().toString(),
            },
        ],
    });

    const response = await requestUrl({
        url: "https://getpocket.com/v3/send",
        method: "POST",
        body: bodyContent,
        headers: headersList,
    });

    const data = response.json;
    return data;
}

export const pocketProvider: BookmarksProvider = {
    getBookmarks: GetBookmarks,
    archiveBookmark: async (id: string) => {
        await archive(id);
    },
};


