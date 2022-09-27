
export interface ReadlaterSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    urlAttribute: string;
    readLaterFolder: string;
    pocket: {
        
        access_token?: string;
        username?: string;
        markAsRead: boolean;
    },
    instapaper: {
        token?: string;
        secret?: string;
        markAsRead: boolean;

    }
    domainsForHeadless: string[];
}   

export const DEFAULT_SETTINGS: ReadlaterSettings = {
    addRibbonIcon: true,
    showAtStartup: true,
    urlAttribute: "url",
    readLaterFolder: "Read Later",
    pocket: {
        markAsRead: false
    },
    instapaper: {
        markAsRead: false
    },
    domainsForHeadless: [
        "medium.com",
        "msn.com"
    ]

}

