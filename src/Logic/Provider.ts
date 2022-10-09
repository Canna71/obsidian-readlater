import { Bookmark } from "./Processor";

export interface BookmarksProvider {
    getBookmarks(): Promise<Bookmark[]>,
    archiveBookmark(id: string):Promise<void>
}
