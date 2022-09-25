
export interface ReadlaterSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    urlAttribute: string;
    readLaterFolder: string;
    consumerKey: string;
}   

export const DEFAULT_SETTINGS: ReadlaterSettings = {
    addRibbonIcon: true,
    showAtStartup: true,
    urlAttribute: "url",
    readLaterFolder: "Read Later",
    consumerKey: "103949-5250a92d096442648cc99a6"

}

