/* eslint-disable @typescript-eslint/ban-types */
import { debounce, finishRenderMath, ItemView,  WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";



import { loadMathJax } from "obsidian";
import { ReadlaterSettings } from "src/Settings";
import { getReadlaterSettings } from "src/main";
export const READLATER_VIEW = "Readlater-view";

export const ReadlaterContext = React.createContext<any>({});



export class ReadlaterView extends ItemView {
    settings: ReadlaterSettings;
    root: Root;
    state = {

    };



    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        // this.settings = (this.app as any).plugins.plugins["obsidian-Readlater"].settings as ReadlaterSettings;
        this.settings = getReadlaterSettings();
        this.state = {

        };
        this.icon = "sigma";
    }

    getViewType() {
        return READLATER_VIEW;
    }

    getDisplayText() {
        return "Readlater";
    }

    override onResize(): void {
        super.onResize();
        this.handleResize();
    }

    handleResize = debounce(() => {
        this.render();
    }, 300);




    render() {

        this.root.render(
            <React.StrictMode>
                <ReadlaterContext.Provider value={{
                    width: this.contentEl.innerWidth,
                    settings: this.settings
                }}>
                   <div>TODO:</div>
                </ReadlaterContext.Provider>
            </React.StrictMode>
        );
    }



    async onOpen() {
        const { contentEl } = this;
        // contentEl.setText('Woah!');
        // this.titleEl.setText("Obsidian Janitor")	

        this.root = createRoot(contentEl/*.children[1]*/);
        await loadMathJax();
        await finishRenderMath();
        this.render();

    }

    async onClose() {

        this.root.unmount();
    }
}
