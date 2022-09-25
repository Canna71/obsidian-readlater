
export interface ReadlaterSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    urlAttribute: string;
    readLaterFolder: string;
    pocket: {
        consumerKey: string;
        access_token?: string;
        username?: string;
    }
    
}   

export const DEFAULT_SETTINGS: ReadlaterSettings = {
    addRibbonIcon: true,
    showAtStartup: true,
    urlAttribute: "url",
    readLaterFolder: "Read Later",
    pocket: {
        consumerKey: "103949-5250a92d096442648cc99a6"
        
    }

}

