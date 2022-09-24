import { htmlToMarkdown, TFile } from "obsidian";

import httpProxy from "http-proxy";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";


const enableCors = (proxyRes : IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
    console.log(proxyRes,req,res)
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
    if(req.method === "OPTIONS"){
        res.statusCode = 200;
        proxyRes.statusCode = 200;
    }
    

};

export async function processFile(file: TFile) {
    const metaData = app.metadataCache.getFileCache(file);
    const frontMatter = metaData?.frontmatter;

    const syncUrl = frontMatter?.syncUrl;

    if (syncUrl) {
        const md = await downloadAsMarkDown(syncUrl);
        const content: string = await this.app.vault.cachedRead(file);
        const newContent =
            content.substring(0, frontMatter.position.end.offset) + "\n" + md;
        app.vault.modify(file, newContent);
    }
}
// https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
// https://gist.github.com/jesperorb/6ca596217c8dfba237744966c2b5ab1e
// https://dhanrajsp.me/blog/the-tale-of-bypassing-cors
async function downloadAsMarkDown(syncUrl: string) {
    const proxy = httpProxy
        .createProxyServer({
            target: "https://github.com/",
            secure: false,
            changeOrigin: true,
            followRedirects: true
        })
        .listen(8080);

    proxy.on("proxyRes", function (proxyRes : IncomingMessage, req: IncomingMessage, res: ServerResponse) {
        enableCors(proxyRes, req, res);
    });

    proxy.on("proxyReq", (proxyReq : ClientRequest, req: IncomingMessage, res: ServerResponse)=>{
        console.log(proxyReq, req, res);
        proxyReq.removeHeader("origin");
    })

    let md = "";
    try {
        const tmp = process.env.NODE_TLS_REJECT_UNAUTHORIZED
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
 
        const resp = await fetch("http://localhost:8080/Canna71", {
            method: "GET",
            // mode: "no-cors",
            headers: {
                "Content-Type": "text/html",
            },
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = tmp;
        const html = await resp.text();
        md = htmlToMarkdown(html);
    } catch (error) {
        console.warn(error);
    } finally {
        proxy.close();
    }
    console.log(md);
    return md;
    // try {
    // 	const response = await superagent.get(syncUrl)
    //     const htmk = await response.text
    // 	console.log(response)
    //     const md = htmlToMarkdown(htmk);
    // return md;
    // } catch (error) {
    // 	console.error(error)
    // }
}
