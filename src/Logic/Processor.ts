import {
    ProviderSettings,
    SynchFrequency,
} from "./../Settings";
import { BrowserView, BrowserWindow } from "electron";
import { getReadlaterSettings } from "src/main";
import {
    App,
    htmlToMarkdown,
    normalizePath,
    requestUrl,
    stringifyYaml,
    TFile,
} from "obsidian";

import Server from "http-proxy";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
// import {JSDOM} from "jsdom";
import { DOMParser, parseHTML } from "linkedom";
import path from "path";
import { getFilesInFolder } from "src/utils";
import moment from "moment";
import { ReadlaterProvider } from "./Provider";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const electron = require("electron");

const PROXY_PORT = 54800;
// if we have markdown less than this number of chars, we try with BrowserWindow
const CONTENT_THRESHOLD = 32;
const WAIT_AFTER_LOAD = 2000;
const TEST_URL =
    "https://dorianlazar.medium.com/scraping-medium-with-python-beautiful-soup-3314f898bbf5";

export type Bookmark = {
    id: string;
    title: string;
    url: string;
};

export type CreateFileOpts = {
    unattended?: boolean;
    title?: string;
    id?: string;
    provider: string;
    folder?: string;
};

export default class Processor {
    app: App;
    static fileNameRE = /[\\/:]/gm;
    // static _proxies: Map<Server,number> = new Map();
    static _ports: Map<number, boolean> = new Map();
    /**
     *
     */
    constructor(app: App) {
        this.app = app;
    }

    _proxy: Server | undefined;
    _port: number;
    _win: BrowserWindow;

    private get headlessBrowser(): BrowserWindow {
        if (!this._win) {
            //@ts-ignore
            this._win = new electron.remote.BrowserWindow({
                show: false,
            }) as BrowserWindow;
        }
        return this._win;
    }

    async downloadAsMarkdownUsingBrowserWindow(syncUrl: string) {
        await this.headlessBrowser.loadURL(syncUrl);
        await new Promise((r) => setTimeout(r, WAIT_AFTER_LOAD));
        const wc = this.headlessBrowser.webContents;
        const frame = wc.mainFrame;
        const title = this.headlessBrowser.getTitle();
        const html = await frame.executeJavaScript(
            "document.documentElement.outerHTML"
        );
        const [_, article] = this.extractData(html as string);
        const md = htmlToMarkdown(article);
        return [title, md];
    }

    async processFile(file: TFile) {
        const metaData = app.metadataCache.getFileCache(file);
        const frontMatter = metaData?.frontmatter;
        const attr = getReadlaterSettings().urlAttribute;

        const syncUrl = frontMatter?.[attr];

        if (syncUrl) {
            const [title, md] = await this.downloadAsMarkDown(syncUrl);
            const content: string = await this.app.vault.cachedRead(file);
            const frontMatter: any =
                this.app.metadataCache.getFileCache(file)?.frontmatter || {};
            frontMatter.position = undefined;
            frontMatter.readlater = {
                ...frontMatter.readlater,
                synchtime: moment().valueOf(),
            };
            const newContent =
                "---\n" + stringifyYaml(frontMatter) + "---\n" + md;
            app.vault.modify(file, newContent);

            app.vault.rename(
                file,
                normalizePath(
                    path.join(
                        file.parent.path,
                        this.normalizeFileName(title) + ".md"
                    )
                )
            );
        }
    }

    async createFileFromURL(url: string, options?: CreateFileOpts) {
        const [extractedTitle, md] = await this.downloadAsMarkDown(url);
        const title = options?.title || extractedTitle || url;
        const attr = getReadlaterSettings().urlAttribute;
        // const content = `---\n${attr}: "${url}"\n---\n` + md;
        const frontMatter: any = {};
        frontMatter[attr] = url;
        frontMatter.readlater = {
            id: options?.id,
            provider: options?.provider,
            synchtime: moment().valueOf(),
        };
        const content = "---\n" + stringifyYaml(frontMatter) + "---\n" + md;
        const fileName = this.normalizeFileName(title) + ".md";
        let folder = options?.folder || getReadlaterSettings().readLaterFolder;
        if (!folder) {
            folder =
                (!options?.unattended &&
                    this.app.workspace.getActiveFile()?.parent.path) ||
                "/";
        }
        const fullPath = normalizePath(path.join(folder, fileName));
        // test if file exists
        const usablepath = await this.checkForUsablePath(fullPath);
        const file = await this.app.vault.create(usablepath, content);
        const leaf = this.app.workspace.getLeaf(false);
        if (!options?.unattended) {
            await leaf.openFile(file);
        }
    }

    private async checkForUsablePath(fullPath: string) {
        let exists = await this.app.vault.adapter.exists(fullPath);
        let n = 1;
        let usablepath = fullPath;
        while (exists) {
            usablepath = fullPath.replace(".md", ` (${n}).md`);
            exists = await this.app.vault.adapter.exists(usablepath);
            n++;
        }
        return usablepath;
    }

    async downloadAsMarkDown(urlString: string) {
        const url = new URL(urlString);
        const match = getReadlaterSettings().domainsForHeadless.find((domain) =>
            url.hostname.contains(domain)
        );
        if (match) {
            return this.downloadAsMarkdownUsingBrowserWindow(urlString);
        } else {
            const [title, md] = await this.downloadAsMarkDownUsingRequestUrl(
                urlString
            );
            if (!md || md.length < CONTENT_THRESHOLD) {
                return this.downloadAsMarkdownUsingBrowserWindow(urlString);
            }
            return Promise.resolve([title, md]);
        }
    }

    // https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
    // https://gist.github.com/jesperorb/6ca596217c8dfba237744966c2b5ab1e
    // https://dhanrajsp.me/blog/the-tale-of-bypassing-cors
    // https://www.npmjs.com/package/http-proxy#using-https
    async downloadAsMarkDownUsingRequestUrl(syncUrl: string) {
        const url = new URL(syncUrl);

        // this.createProxy(url.origin);

        let md = "";
        let title = "";
        try {
            const resp = await requestUrl({
                url: syncUrl,
                method: "GET",
                headers: {
                    "user-agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.50",
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    cookie: "",
                },
            });

            const html = resp.text;
            let article;
            [title, article] = this.extractData(html);
            md = htmlToMarkdown(article);
        } catch (error) {
            console.warn(error);
        } finally {
            // this.closeProxy();
        }
        return [title, md];
    }

    async downloadAsMarkDownUsingProxy(syncUrl: string) {
        const url = new URL(syncUrl);

        this.createProxy(url.origin);

        let md = "";
        let title = "";
        try {
            // const tmp = process.env.NODE_TLS_REJECT_UNAUTHORIZED
            // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

            const resp = await fetch(
                `http://localhost:${this._port}/${url.pathname}${url.search}`,
                {
                    method: "GET",
                    // mode: "no-cors",
                    headers: {
                        "Content-Type": "text/html",
                    },
                }
            );
            // process.env.NODE_TLS_REJECT_UNAUTHORIZED = tmp;

            const html = await resp.text();
            let article;
            [title, article] = this.extractData(html);
            md = htmlToMarkdown(article);
        } catch (error) {
            console.warn(error);
        } finally {
            this.closeProxy();
        }
        return [title, md];
    }

    extractData(html: string) {
        const dom = parseHTML(html);
        // const dom = new JSDOM(html);
        const title = dom.window.document.title;
        let article = dom.window.document.querySelector("article");
        if (!article) {
            article = dom.window.document.body;
        }
        return [title, article.outerHTML];
    }

    closeProxy() {
        this._proxy && this._proxy.close();
        Processor._ports.delete(this._port);
        this._proxy = undefined;
    }

    createProxy(server: string) {
        if (this._proxy) {
            this._proxy.close();
        } else {
            let p = PROXY_PORT;
            while (Processor._ports.has(p)) {
                p++;
            }
            this._port = p;
            Processor._ports.set(p, true);
        }
        this._proxy = Server.createProxyServer({
            target: server,
            secure: false,
            changeOrigin: true,
            followRedirects: true,
        }).listen(this._port);

        this._proxy.on(
            "proxyRes",
            function (
                proxyRes: IncomingMessage,
                req: IncomingMessage,
                res: ServerResponse
            ) {
                enableCors(proxyRes, req, res);
            }
        );

        this._proxy.on(
            "proxyReq",
            (
                proxyReq: ClientRequest,
                req: IncomingMessage,
                res: ServerResponse
            ) => {
                proxyReq.removeHeader("cookie");
            }
        );
    }

    private normalizeFileName(title: string) {
        const result = title.replace(Processor.fileNameRE, "");
        return result;
    }

    async processBookmarks(
        bookmarks: Bookmark[],
        // options: { markAsRead: boolean; folder?: string }
        provider: ReadlaterProvider
    ) {
        // TODO:
        // use title as file name if provided, page title otherwise
        // set metadata in the file:
        // - readlater
        // -     downladed when
        // mark as read if specified
        const settings = getReadlaterSettings();
        const providerSettings = settings[provider] as ProviderSettings;
        const destFolder =
            providerSettings.folder || settings.readLaterFolder || "/";
        const files = getFilesInFolder(this.app, destFolder);
        const urls = new Map<string, boolean>();
        // we determine what we already have
        for (const f of files) {
            const md = this.app.metadataCache.getFileCache(f);
            const url = md?.frontmatter?.[settings.urlAttribute];
            if (url) {
                urls.set(url, true);
            }
        }
        const toProcess = bookmarks.filter(
            (bookmark) => !urls.has(bookmark.url)
        );

        try {
            await Promise.all(
                toProcess.map((bookmark) =>
                    this.createFileFromURL(bookmark.url, {
                        unattended: true,
                        provider: provider,
                        folder: destFolder,
                        id: bookmark.id,
                        title: bookmark.title,
                    })
                )
            );
        } catch (error) {
            console.warn(error);
        }
        return {
            processed: toProcess.length,
            folder: destFolder,
            provider,
        };
    }

    async synchAll() {
        const attr = getReadlaterSettings().urlAttribute;

        const files = this.app.vault.getMarkdownFiles();
        const toProcess = files.filter((file) => {
            const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;

            if (fm?.[attr]) {
                // determine if we should synch this
                const synchTime: number | undefined = fm.readlater?.synchtime;
                const synchPeriod = fm.readlater?.synch as SynchFrequency;
                // no synch attribute, we do not synch it unattendedly
                if (!synchPeriod) return false;

                return shouldProcess(synchPeriod, synchTime);
            }
        });
        // 1665310248866

        await Promise.all(toProcess.map((file) => this.processFile(file)));
    }
}

const enableCors = (
    proxyRes: IncomingMessage,
    req: IncomingMessage,
    res: ServerResponse
) => {
    if (req.headers["access-control-request-method"]) {
        res.setHeader(
            "access-control-allow-methods",
            req.headers["access-control-request-method"]
        );
    }

    if (req.headers["access-control-request-headers"]) {
        res.setHeader(
            "access-control-allow-headers",
            req.headers["access-control-request-headers"]
        );
    }

    if (req.headers.origin) {
        res.setHeader("access-control-allow-origin", req.headers.origin);
        res.setHeader("access-control-allow-credentials", "true");
    }
    if (req.method === "OPTIONS") {
        res.statusCode = 200;
        proxyRes.statusCode = 200;
    }
};
export function shouldProcess(synchPeriod: SynchFrequency, lastSynchTime?: number) {
    // we have a synch attribute but it was never synched, we process it
    if (!lastSynchTime) return true;
    const now = moment();
    const lastSynch = moment(lastSynchTime);
    switch (synchPeriod) {
        case SynchFrequency.Daily:
            return now.diff(lastSynch, "days") > 0;
        case SynchFrequency.Hourly:
            return now.diff(lastSynch, "hours") > 0;
        case SynchFrequency.Monthly:
            return now.diff(lastSynch, "month") > 0;
        case SynchFrequency.Weekly:
            return now.diff(lastSynch, "weeks") > 0;
        case SynchFrequency.Yearly:
            return now.diff(lastSynch, "years") > 0;
        case SynchFrequency.Manual:
            return false;
        default:
            throw Error("Invalid synch attribute " + synchPeriod);
           
    }
}

