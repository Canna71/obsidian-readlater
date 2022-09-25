import { DEFAULT_SETTINGS, ReadlaterSettings } from "src/Settings";
import { addIcon, MarkdownView, ObsidianProtocolData } from "obsidian";

// import { MathResult } from './Extensions/ResultMarkdownChild';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReadlaterView, READLATER_VIEW } from "../Views/ReadlaterView";
import {
    App,
    finishRenderMath,
    loadMathJax,
    Modal,
    Plugin,
    WorkspaceLeaf,
} from "obsidian";
import { ReadlaterSettingsTab } from "src/SettingTab";
import Processor from "./Processor";
import { URL } from "url";
import { threadId } from "worker_threads";
import { authorize, getUnreadList, POCKET_ACTION } from "./PocketProvider";

const sigma = `<path stroke="currentColor" fill="none" d="M78.6067 22.8905L78.6067 7.71171L17.8914 7.71171L48.2491 48.1886L17.8914 88.6654L78.6067 88.6654L78.6067 73.4866" opacity="1"  stroke-linecap="round" stroke-linejoin="round" stroke-width="6" />
`;

// Remember to rename these classes and interfaces!

let gSettings: ReadlaterSettings;

export function getReadlaterSettings() {
    return gSettings;
}
export default class ReadlaterPlugin extends Plugin {
    settings: ReadlaterSettings;

    async onload() {
        await this.loadSettings();

        this.registerView(READLATER_VIEW, (leaf) => new ReadlaterView(leaf));

        addIcon("sigma", sigma);

        this.registerObsidianProtocolHandler(POCKET_ACTION, this.onPocketCallback.bind(this))
       
        this.addCommand({
            id: "process-current",
            name: "Synch Current Page",
            checkCallback: (checking:boolean)=>{
                const file = this.app.workspace.getActiveFile();
                if(!checking){
                    file && new Processor(this.app).processFile(file);
                }
                else return !!file;
                
            }
        });

        this.addCommand({
            id: "process-clipboard",
            name: "Synch Url from Clipboard",
            callback: async ()=>{
                const clip = await navigator.clipboard.readText();
                try{
                    const url = new URL(clip);
                    new Processor(this.app).createFileFromURL(url.toString());
                } catch(error) {
                    console.warn(error);
                }
                
                
            }
        });

        this.addCommand({
            id: "synch-pocket",
            name: "Synch Pocket Unread List",
            checkCallback: (checking:boolean)=>{
                if(checking){
                    return !!this.settings.pocket.access_token;
                }
                getUnreadList();
            }
        });

        this.app.workspace.onLayoutReady(() => {
            if (this.settings.showAtStartup) {
                this.activateView();
            }
        });

        this.registerCodeBlock();
        this.registerPostProcessor();
        this.registerEditorExtensions();

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

        this.addSettingTab(new ReadlaterSettingsTab(this.app, this));
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

    async onPocketCallback(data:ObsidianProtocolData){
        if(data.action===POCKET_ACTION){
            const auth = await authorize(data.code);
            this.settings.pocket.access_token = auth.access_token;
            this.settings.pocket.username = auth.username;
            this.saveSettings();
        }
    }
}
