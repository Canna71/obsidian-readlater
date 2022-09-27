import * as React from "react";
import ReadlaterPlugin from "src/main";
import { App, ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import { enrollInPocket } from "./PocketProvider";
import { createRoot, Root } from "react-dom/client";
import { ReadlaterContext } from "Views/ReadlaterView";
import { SettingControl, SettingItem, SettingsInfo, Toggle } from "./SettingControls";
import { getFolders } from "./utils";
import { SelectObs } from "Views/Select";
import { ReadlaterSettings } from "./Settings";
// https://react-select.com/styles
export class ReadlaterSettingsTab extends PluginSettingTab {
    plugin: ReadlaterPlugin;
    root: Root;

    constructor(app: App, plugin: ReadlaterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        console.log("Readlater Setings constructor");
        const { containerEl } = this;

        this.root = createRoot(containerEl);
        this.onAuthorizePocket = this.onAuthorizePocket.bind(this);
        this.onAuthorizeInstapaper = this.onAuthorizeInstapaper.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    display(): void {
        const { containerEl } = this;
        console.log("Readlater Setings display");

        const folders = getFolders(this.app).map(f => ({ value: f, label: f }));

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Readlater Settings' });

        this.createToggle(containerEl, "Add Ribbon Icon",
            "Adds an icon to the ribbon to add URL",
            "addRibbonIcon"
        );
       

        // const pocketEl = new Setting(containerEl).settingEl;
        const pocketEl = containerEl.createDiv();
        createRoot(pocketEl).render(
            <React.StrictMode>
                <ReadlaterContext.Provider value={{}}>
                    <PocketSettings 
                        settings={this.plugin.settings}
                        folders={folders}
                        onAuthorize={this.onAuthorizePocket}
                        onChange={this.onChange}
                    />
                    <InstapaperSettings 
                        settings={this.plugin.settings}
                        folders={folders}
                        onAuthorize={this.onAuthorizeInstapaper}
                        onChange={this.onChange}
                    />
                </ReadlaterContext.Provider>
            </React.StrictMode>
        );




    }

    private createToggle(containerEl: HTMLElement, name: string, desc: string, prop: string) {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addToggle(bool => bool
                .setValue((this.plugin.settings as any)[prop] as boolean)
                .onChange(async (value) => {
                    (this.plugin.settings as any)[prop] = value;
                    await this.plugin.saveSettings();
                    this.display();
                })
            );
    }

    private onAuthorizePocket() {
        enrollInPocket();
    }

    private onAuthorizeInstapaper() {
    }

    private onChange(){
        this.plugin.saveSettings();
        this.display();
    }
}

type ProviderSettingsProps = {
    settings: ReadlaterSettings,
    onAuthorize: ()=>void,
    folders: {
        value: string;
        label: string;
    }[],
    onChange: ()=>void
}

const PocketSettings = ({ settings, onAuthorize, folders, onChange }: ProviderSettingsProps) => {
    const pocketCfg = settings.pocket;

    let desc = "Authorize the app to integrate with Pocket";

    if (pocketCfg.username && pocketCfg.access_token) {
        desc = "Authenticated as " + pocketCfg.username;

    }

    return (
        <>
            <h3>Pocket Integration</h3>
            <SettingItem>
                <SettingsInfo description={desc} name={""} />
                <SettingControl>
                    <button onClick={onAuthorize}>Authorize</button>


                </SettingControl>
            </SettingItem>
            <SettingItem>
                <SettingsInfo description="Articles will be saved in this folder, if provided" name={""} />
                <SettingControl>
                    <SelectObs
                        options={folders}
                        placeholder="Select a folder..."
                    />

                </SettingControl>
            </SettingItem>
            <SettingItem>
                <SettingsInfo description="Articles will be marked as read upon download" name={""} />
                <SettingControl>
                    <Toggle 
                        checked={!!pocketCfg.markAsRead}
                        onChange={()=>{
                            pocketCfg.markAsRead=!pocketCfg.markAsRead;
                            onChange();
                        }}
                    />

                </SettingControl>
            </SettingItem>
        </>
    )
}


const InstapaperSettings = ({ settings, onAuthorize, folders }: ProviderSettingsProps) => {
    const instaCfg = settings.instapaper;

    let desc = "Authorize the app to integrate with Instapaper";

    if (instaCfg.secret && instaCfg.token) {
        desc = "Authenticated as " + "TODO";

    }

    return (
        <>
            <h3>InstaPaper Integration</h3>
            <SettingItem>
                <SettingsInfo description={desc} name={""} />
                <SettingControl>
                    <button onClick={onAuthorize}>Login</button>


                </SettingControl>
            </SettingItem>
            <SettingItem>
                <SettingsInfo description="Articles will be saved in this folder, if provided" name={""} />
                <SettingControl>
                    <SelectObs
                        options={folders}
                        placeholder="Select a folder..."
                    />

                </SettingControl>
            </SettingItem>
        </>
    )
}
