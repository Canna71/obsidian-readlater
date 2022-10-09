



export enum SynchFrequency {
    Manual = "Manual|",
    Hourly = "Hourly",
    Daily = "Daily",
    Weekly = "Weekly",
    Monthly = "Monthly",
    Yearly = "Yearly"
}

export interface ProviderSettings {
    folder?: string;
    markAsRead: boolean;
    frequency?: SynchFrequency;
    lastSynch?: number;
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
        frequency: SynchFrequency;
        lastSynch?: number;
    },
    instapaper: {
        token?: string;
        secret?: string;
        markAsRead: boolean;
        username?: string;
        user_id?: number;
        folder?: string;
        frequency: SynchFrequency;
        lastSynch?: number;
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
        markAsRead: false,
        frequency: SynchFrequency.Manual
    },
    instapaper: {
        markAsRead: false,
        frequency: SynchFrequency.Manual
    },
    domainsForHeadless: [
        "medium.com",
        "msn.com"
    ],
    synchPeriodMS: 1000*60*15 // check every 15 mins, but at most we have hourly frequency
}

