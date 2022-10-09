
export enum ReadlaterProvider {
    Pocket = "pocket",
    Instapaper = "instapaper"
}

export enum SynchFrequency {
    Hourly = "Hourly",
    Daily = "Daily",
    Weekly = "Weekly",
    Monthly = "Monthly",
    Yearly = "Yearly"
}

export interface ProviderSettings {
    folder?: string;
    markAsRead: boolean;
}

export interface ReadlaterSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    urlAttribute: string;
    readLaterFolder: string;
    pocket: {
        folder?: string;
        access_token?: string;
        username?: string;
        markAsRead: boolean;
    },
    instapaper: {
        token?: string;
        secret?: string;
        markAsRead: boolean;
        username?: string;
        user_id?: number;
        folder?: string;
    }
    domainsForHeadless: string[];
    synchPeriodMS: number;
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
    ],
    synchPeriodMS: 1000*60*15 // check every 15 mins, but at most we have hourly frequency

}

