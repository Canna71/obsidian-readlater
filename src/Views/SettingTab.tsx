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
import { Info, SettingControl, SettingDescription, SettingItem, SettingName, SettingsInfo, Toggle } from "./SettingControls";
import { DomainsModal } from "./DomainsModal";
import { useCallback } from "react";
export class ReadlaterSettingsTab extends PluginSettingTab {
    plugin: ReadlaterPlugin;
    root: Root;

    constructor(app: App, plugin: ReadlaterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
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
                    <SettingsComponent plugin={this.plugin} folders={folders} app={this.app} />
                </ReadlaterContext.Provider>
            </React.StrictMode>
        );

    }

}

const SettingsComponent = ({ folders, plugin, app }: {
    app: App
    plugin: ReadlaterPlugin
    folders: {
        value: string;
        label: string;
    }[]
}) => {
    const [settings, update] = React.useState(plugin.settings);

    const onChange = React.useCallback(() => {
        plugin.saveSettings();
        update(settings => ({ ...settings }));
    }, [plugin]);

    const onOpenDomainModal = useCallback(
      () => {
        new DomainsModal(app, plugin.settings,
            async (domains:string[])=>{
                plugin.settings.domainsForHeadless = domains;
                await plugin.saveSettings();
                update(settings => ({ ...plugin.settings }));
            })
            .open();
      },
      [],
    )
    

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
            <SettingItem>
                <Info>
                    <SettingName>Headless Browser Domains</SettingName>
                    <SettingDescription>
                        If some web pages are not fetched correctly, try adding the domain to this list. Read Later will use a headless browser to open the page and get the content. Use only if needed.
                        <ul>
                            {settings.domainsForHeadless.map(domain => <li key={domain}>{domain}</li>)}
                        </ul>
                    </SettingDescription>
                </Info>
                <SettingControl>
                    <button onClick={onOpenDomainModal}>Manage</button>
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

