
export interface ReadlaterSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    urlAttribute: string;
    readLaterFolder: string;
    pocket: {
        
        access_token?: string;
        username?: string;
    },
    instapaper: {
        token?: string,
        secret?: string
    }
    domainsForHeadless: string[];
}   

export const DEFAULT_SETTINGS: ReadlaterSettings = {
    addRibbonIcon: true,
    showAtStartup: true,
    urlAttribute: "url",
    readLaterFolder: "Read Later",
    pocket: {
    },
    instapaper: {

    },
    domainsForHeadless: [
        "medium.com",
        "msn.com"
    ]

}

