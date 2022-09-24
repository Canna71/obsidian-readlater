import { App, htmlToMarkdown, TFile } from "obsidian";

import Server from "http-proxy";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";

const PROXY_PORT = 54800;

export default class Processor {
    app: App;

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

    async processFile(file: TFile) {
        const metaData = app.metadataCache.getFileCache(file);
        const frontMatter = metaData?.frontmatter;

        const syncUrl = frontMatter?.syncUrl;

        if (syncUrl) {
            const md = await this.downloadAsMarkDown(syncUrl);
            const content: string = await this.app.vault.cachedRead(file);
            const newContent =
                content.substring(0, frontMatter.position.end.offset) +
                "\n" +
                md;
            app.vault.modify(file, newContent);
        }
    }

    // https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
    // https://gist.github.com/jesperorb/6ca596217c8dfba237744966c2b5ab1e
    // https://dhanrajsp.me/blog/the-tale-of-bypassing-cors
    // https://www.npmjs.com/package/http-proxy#using-https
    async downloadAsMarkDown(syncUrl: string) {
        const url = new URL(syncUrl);
        console.log(url.pathname, url.search);

        this.createProxy(url.origin);

        let md = "";
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
            md = htmlToMarkdown(html);
        } catch (error) {
            console.warn(error);
        } finally {
            this.closeProxy();
        }
        return md;
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
            Processor._ports.set(p,true);
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
            ) => {}
        );
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
