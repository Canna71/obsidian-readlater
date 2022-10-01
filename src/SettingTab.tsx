import * as React from "react";
import ReadlaterPlugin from "src/main";
import { App, ButtonComponent, Modal, PluginSettingTab, Setting } from "obsidian";
import { enrollInPocket } from "./PocketProvider";
import { createRoot, Root } from "react-dom/client";
import { ReadlaterContext } from "Views/ReadlaterView";
import { SettingControl, SettingItem, SettingsInfo, Toggle } from "./SettingControls";
import { getFolders } from "./utils";
import { SelectObs } from "Views/Select";
import { ReadlaterSettings } from "./Settings";
import { enroll as enrollInstapaper } from "./InstapaperProvider";
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
        // this.onAuthorizePocket = this.onAuthorizePocket.bind(this);
        // this.onAuthorizeInstapaper = this.onAuthorizeInstapaper.bind(this);
        // this.onChange = this.onChange.bind(this);
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
                    <SettingsComponent plugin={this.plugin} folders={folders} />
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

    

    private async onAuthorizeInstapaper() {
        try {
            await enrollInstapaper(this.plugin);
            this.display();

        } catch (error) {
            // TODO: improve error reporting
            new Modal(this.app).containerEl.appendText(error.message);
        }

    }


}

const SettingsComponent = ({ folders, plugin }: { 

    plugin: ReadlaterPlugin
    folders: {
        value: string;
        label: string;
    }[]
}) => {


    

   

    

    

    return (
        <>
            <PocketSettings
                plugin={plugin}
                folders={folders}
                
            />
            <InstapaperSettings
                plugin={plugin}
                folders={folders}
                
            />
        </>
    )
}

type ProviderSettingsProps = {
    plugin: ReadlaterPlugin,
    folders: {
        value: string;
        label: string;
    }[]
}

const PocketSettings = ({ plugin, folders }: ProviderSettingsProps) => {
    const pocketCfg = plugin.settings.pocket;
    const [settings, update] = React.useState({...plugin.settings});

    let desc = "Authorize the app to integrate with Pocket";

    if (pocketCfg.username && pocketCfg.access_token) {
        desc = "Authenticated as " + pocketCfg.username;

    }

    const onUpdate = React.useCallback(()=>{
        update(settings => ({...settings}));

    },[]);

    const  onChange = React.useCallback(()=>{
        plugin.saveSettings();
        onUpdate();
        
    },[]);

    const  onAuthorizePocket = React.useCallback(async ()=>{
        plugin.event.on("settings-saved",()=>{
            plugin.event.off("settings-saved", onUpdate);
            onUpdate();
        });
        
        await enrollInPocket();
        
    },[])

    return (
        <>
            <h3>Pocket Integration</h3>
            <SettingItem>
                <SettingsInfo description={desc} name={""} />
                <SettingControl>
                    <button onClick={onAuthorizePocket}>Authorize</button>


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
                        onChange={() => {
                            pocketCfg.markAsRead = !pocketCfg.markAsRead;
                            onChange();
                        }}
                    />

                </SettingControl>
            </SettingItem>
        </>
    )
}


const InstapaperSettings = ({ plugin, folders }: ProviderSettingsProps) => {
    const instaCfg = plugin.settings.instapaper;
    const [settings, update] = React.useState({...plugin.settings});
    

    let desc = "Authorize the app to integrate with Instapaper";

    if (instaCfg.username) {
        desc = "Authenticated as " + instaCfg.username;
    }
    const [status, setStatus] = React.useState("");
    const  onAuthorizeInstapaper = React.useCallback(async ()=>{
        try {
            await enrollInstapaper(plugin);
            setStatus("")
            update(settings => ({...settings}));
        } catch(ex){
            console.warn(ex);
            setStatus("Login Failed")
        }

    },[plugin]);

    return (
        <>
            <h3>InstaPaper Integration</h3>
            <SettingItem>
                <SettingsInfo description={desc} name={""} />
                {status && <SettingsInfo description={status} name={""} />}

                <SettingControl>
                    <button onClick={onAuthorizeInstapaper}>Login</button>


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
