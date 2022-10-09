import * as React from "react";
import ReadlaterPlugin from "src/main";
import { App, ButtonComponent, Modal, PluginSettingTab, Setting } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { ReadlaterContext } from "src/Views/ReadlaterView";
import { getFilesInFolder, getFolders } from "../utils";
import { ReadlaterSettings } from "../Settings";
import { enroll as enrollInstapaper } from "../Logic/InstapaperProvider";
import { PocketSettings } from "./PocketSettings";
import { InstapaperSettings } from "./InstapaperSettings";
import { SettingControl, SettingItem, SettingsInfo, Toggle } from "./SettingControls";
export class ReadlaterSettingsTab extends PluginSettingTab {
    plugin: ReadlaterPlugin;
    root: Root;

    constructor(app: App, plugin: ReadlaterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        console.log("Readlater Setings constructor");
        const { containerEl } = this;

        this.root = createRoot(containerEl);

    }

    display(): void {
        const { containerEl } = this;

        const folders = getFolders(this.app).map(f => ({ value: f, label: f }));
        

        containerEl.empty();

       
        const pocketEl = containerEl.createDiv();
        createRoot(pocketEl).render(
            <React.StrictMode>
                <ReadlaterContext.Provider value={{}}>
                    <SettingsComponent plugin={this.plugin} folders={folders} />
                </ReadlaterContext.Provider>
            </React.StrictMode>
        );

    }

}

const SettingsComponent = ({ folders, plugin }: {

    plugin: ReadlaterPlugin
    folders: {
        value: string;
        label: string;
    }[]
}) => {
    const [settings, update] = React.useState(plugin.settings);

    const onChange = React.useCallback(() => {
        plugin.saveSettings();
        update(settings=>({...settings}));
    }, [plugin]);

    return (
        <>
            <h2>Read Later Settings</h2>
            <SettingItem>
                <SettingsInfo name="Add Ribbon Icon" description="Adds an icon to the ribbon to add URL" />
                <SettingControl>
                <Toggle
                        checked={settings.addRibbonIcon}
                        onChange={() => {
                            settings.addRibbonIcon = !settings.addRibbonIcon;
                            onChange();
                        }} />
                </SettingControl>
            </SettingItem>

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

export type ProviderSettingsProps = {
    plugin: ReadlaterPlugin,
    folders: {
        value: string;
        label: string;
    }[]
}


