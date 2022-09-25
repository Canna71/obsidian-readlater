
export interface ReadlaterSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    urlAttribute: string;
    readLaterFolder: string;
    pocket: {
        
        access_token?: string;
        username?: string;
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
    domainsForHeadless: [
        "medium.com",
        "msn.com"
    ]

}

