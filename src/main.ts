import {
    DEFAULT_SETTINGS,
    ReadlaterProvider,
    ReadlaterSettings,
} from "src/Settings";
import { addIcon, MarkdownView, Notice, ObsidianProtocolData } from "obsidian";

// import { MathResult } from './Extensions/ResultMarkdownChild';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReadlaterView, READLATER_VIEW } from "./Views/ReadlaterView";
import {
    App,
    finishRenderMath,
    loadMathJax,
    Modal,
    Plugin,
    WorkspaceLeaf,
} from "obsidian";
import { ReadlaterSettingsTab } from "src/Views/SettingTab";
import Processor, { Bookmark, shouldProcess } from "./Logic/Processor";
import { URL } from "url";
import { threadId } from "worker_threads";
import {
    authorize,
    GetBookmarks as getPocketBookmarks,
    POCKET_ACTION,
} from "./Logic/PocketProvider";
import { runInThisContext } from "vm";
import { CredentialsModal } from "./CredentialsModal";
import { getUnreadArticles as getInstapaperUnread } from "./Logic/InstapaperProvider";
import { EventEmitter } from "events";
import moment from "moment";
// import { EventEmitter } from "stream";

const sigma = `<path stroke="currentColor" fill="none" d="M78.6067 22.8905L78.6067 7.71171L17.8914 7.71171L48.2491 48.1886L17.8914 88.6654L78.6067 88.6654L78.6067 73.4866" opacity="1"  stroke-linecap="round" stroke-linejoin="round" stroke-width="6" />
`;
export const ADD_URL_ACTION = "readlater-add";
// Remember to rename these classes and interfaces!

let gSettings: ReadlaterSettings;

export function getReadlaterSettings() {
    return gSettings;
}

export type Credentials = {
    username: string;
    password: string;
};

export default class ReadlaterPlugin extends Plugin {
    settings: ReadlaterSettings;
    synching = false;
    event = new EventEmitter();

    async onload() {
        await this.loadSettings();

        this.registerView(READLATER_VIEW, (leaf) => new ReadlaterView(leaf));

        addIcon("sigma", sigma);

        this.registerProtocolHandlers();

        this.registerCommands();

        this.registerCodeBlock();
        this.registerPostProcessor();
        this.registerEditorExtensions();

        this.registerEvents();

        this.addSettingTab(new ReadlaterSettingsTab(this.app, this));

        // register an interval for synching pages
        this.registerSynchInterval();
    }

    private registerSynchInterval() {
        this.registerInterval(
            window.setInterval(async () => {
                if (!this.synching) {
                    this.synching = true;
                    try {
                        await new Processor(this.app).synchAll();
                        await this.synchAllProviders();
                    } finally {
                        this.synching = false;
                    }
                }
            }, this.settings.synchPeriodMS)
        );
    }
    async synchAllProviders() {
        // Pocket
        if (this.settings.pocket.access_token) {
            if (
                shouldProcess(
                    this.settings.pocket.frequency,
                    this.settings.pocket.lastSynch
                )
            ) {
                try {
                    await this.synchProvider(
                        getPocketBookmarks,
                        ReadlaterProvider.Pocket
                    );
                    this.settings.pocket.lastSynch = moment().valueOf();
                } catch (error) {
                    console.warn(error);
                }
            }
        }
        if (this.settings.instapaper.token) {
            if (
                shouldProcess(
                    this.settings.instapaper.frequency,
                    this.settings.instapaper.lastSynch
                )
            ) {
                try {
                    await this.synchProvider(
                        getInstapaperUnread,
                        ReadlaterProvider.Instapaper
                    );
                    this.settings.instapaper.lastSynch = moment().valueOf();
                } catch (error) {
                    console.warn(error);
                }
            }
        }
    }

    private registerProtocolHandlers() {
        this.registerObsidianProtocolHandler(
            POCKET_ACTION,
            this.onPocketCallback.bind(this)
        );
        this.registerObsidianProtocolHandler(
            ADD_URL_ACTION,
            this.onAddUrlAction.bind(this)
        );
    }

    private registerEvents() {
        this.app.workspace.on(
            "active-leaf-change",
            (leaf: WorkspaceLeaf | null) => {
                // console.log("active-leaf-change", leaf);
                if (leaf?.view instanceof MarkdownView) {
                    // @ts-expect-error, not typed
                    const editorView = leaf.view.editor.cm as EditorView;
                }
            },
            this
        );

        this.app.workspace.on(
            "codemirror",
            (cm: CodeMirror.Editor) => {
                console.log("codemirror", cm);
            },
            this
        );

        this.app.workspace.onLayoutReady(() => {
            if (this.settings.showAtStartup) {
                this.activateView();
            }
        });
    }

    private registerCommands() {
        this.addCommand({
            id: "process-current",
            name: "Synch Current Page",
            checkCallback: (checking: boolean) => {
                const file = this.app.workspace.getActiveFile();
                if (!checking) {
                    file && new Processor(this.app).processFile(file);
                } else return !!file;
            },
        });

        this.addCommand({
            id: "process-clipboard",
            name: "Synch Url from Clipboard",
            callback: async () => {
                const clip = await navigator.clipboard.readText();
                try {
                    const url = new URL(clip);
                    new Processor(this.app).createFileFromURL(url.toString());
                } catch (error) {
                    console.warn(error);
                }
            },
        });

        this.addCommand({
            id: "synch-pocket",
            name: "Synch Pocket Unread List",
            checkCallback: (checking: boolean) => {
                if (checking) {
                    return !!this.settings.pocket.access_token;
                }
                (async () => {
                    await this.synchProvider(
                        getPocketBookmarks,
                        ReadlaterProvider.Pocket
                    );
                })();
            },
        });

        this.addCommand({
            id: "synch-instapaper",
            name: "Synch Instapaper Unread List",
            checkCallback: (checking: boolean) => {
                if (checking) {
                    return !!this.settings.instapaper.token;
                }
                (async () => {
                    await this.synchProvider(
                        getInstapaperUnread,
                        ReadlaterProvider.Instapaper
                    );
                })();

                // TODO:
            },
        });
    }

    private async synchProvider(
        fn: () => Promise<Bookmark[]>,
        provider: ReadlaterProvider
    ) {
        const bookmarks = await fn();
        const res = await new Processor(this.app).processBookmarks(
            bookmarks,
            provider
        );
        const message = res.processed
            ? `Readlater synched ${res.provider}, downloaded ${res.processed} articles and saved into ${res.folder}`
            : `Readlater found no new article to save`;
        new Notice(message);
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(READLATER_VIEW);
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
        gSettings = this.settings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.event.emit("settings-saved");
    }

    async activateView() {
        return;
        this.app.workspace.detachLeavesOfType(READLATER_VIEW);

        await this.app.workspace.getRightLeaf(false).setViewState(
            {
                type: READLATER_VIEW,
                active: true,
            },
            { settings: this.settings }
        );

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(READLATER_VIEW)[0]
        );
    }

    async registerCodeBlock() {
        await loadMathJax();
        await finishRenderMath();
        this.registerMarkdownCodeBlockProcessor(
            "Readlater",
            (source, el, ctx) => {
                // processCodeBlock(source, el, this.settings, ctx);
            }
        );
    }

    async registerPostProcessor() {
        // await loadMathJax();
        // await finishRenderMath();
        // this.registerMarkdownPostProcessor(getPostPrcessor(this.settings));
    }

    async registerEditorExtensions() {
        // this.registerEditorExtension([resultField, ReadlaterConfigField]);
    }

    async onPocketCallback(data: ObsidianProtocolData) {
        if (data.action === POCKET_ACTION) {
            const auth = await authorize(data.code);
            this.settings.pocket.access_token = auth.access_token;
            this.settings.pocket.username = auth.username;
            this.saveSettings();
        }
    }

    async onAddUrlAction(data: ObsidianProtocolData) {
        if (data.action === ADD_URL_ACTION) {
            const url = data.url;
            new Processor(this.app).createFileFromURL(url.toString());
        }
    }

    public async askCredentials(): Promise<Credentials> {
        return new Promise<Credentials>((resolve, reject) => {
            const modal = new CredentialsModal(
                this.app,
                (username: string, password: string) => {
                    resolve({ username, password });
                }
            );
            modal.open();
        });
    }
}
