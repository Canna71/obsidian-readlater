import { Bookmark } from "./Processor";

export interface BookmarksProvider {
    getBookmarks(): Promise<Bookmark[]>,
    archiveBookmark(id: string):Promise<void>,
    isAuthorized():boolean
}
export enum ReadlaterProvider {
    Pocket = "pocket",
    Instapaper = "instapaper"
}
