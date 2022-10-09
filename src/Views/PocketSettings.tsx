import * as React from "react";
import { enrollInPocket } from "../Logic/PocketProvider";
import { SettingControl, SettingItem, SettingsInfo, Toggle } from "./SettingControls";
import { SelectObs } from "src/Views/Select";
import { ProviderSettingsProps } from "./SettingTab";
import { FrequencySelect } from "./FrequencySelect";
import { SynchFrequency } from "src/Settings";
import PocketIcon from "../svg/pocket.svg";

export const PocketSettings = ({ plugin, folders }: ProviderSettingsProps) => {
    const pocketCfg = plugin.settings.pocket;
    const [settings, update] = React.useState({ ...plugin.settings });

    let desc = "Authorize the app to integrate with Pocket";

    const isAuthorized = !!pocketCfg.access_token;
    if (pocketCfg.username && pocketCfg.access_token) {
        desc = "Authenticated as " + pocketCfg.username;

    }

    const onUpdate = React.useCallback(() => {
        update(settings => ({ ...settings }));

    }, []);

    const onChange = React.useCallback(() => {
        plugin.saveSettings();
        onUpdate();

    }, [plugin]);

    const onAuthorizePocket = React.useCallback(async () => {
        plugin.event.on("settings-saved", () => {
            plugin.event.off("settings-saved", onUpdate);
            onUpdate();
        });

        await enrollInPocket();

    }, []);

    const deAuthorize = React.useCallback(async () => {
        plugin.settings.pocket.access_token = undefined;
        plugin.settings.pocket.username = undefined;
        plugin.saveSettings();
        onUpdate();
    }, [plugin, onUpdate]);

    const onFolderChange = React.useCallback((newValue: any, actionMeta: any) => {
        if (actionMeta.action === "select-option") {
            plugin.settings.pocket.folder = newValue.value;
            plugin.saveSettings();
            onUpdate();
        } else if (actionMeta.action === "clear") {
            plugin.settings.pocket.folder = undefined;
            plugin.saveSettings();
            onUpdate();
        }

    }, [plugin, onUpdate]);

    const onChangeFrequency = React.useCallback(
        (e:React.ChangeEvent<HTMLSelectElement>) => {
            console.log(e.target.value);
            plugin.settings.pocket.frequency = e.target.value as SynchFrequency;
            plugin.saveSettings();
            onUpdate();
        },
        [plugin, onUpdate]
    )


    return (
        <>
            <h3><PocketIcon />&nbsp; Pocket Integration</h3>
            <SettingItem>
                <SettingsInfo description={desc} name={""} />
                <SettingControl>
                    {isAuthorized ?
                        <button onClick={deAuthorize}>Logout</button>
                        :
                        <button onClick={onAuthorizePocket}>Login</button>
                    }



                </SettingControl>
            </SettingItem>
            <SettingItem>
                <SettingsInfo
                    description="How often it should check for new bookmarks to save"
                    name="Synch Frequency" />
                <FrequencySelect
                    value={pocketCfg.frequency}
                    onChange={onChangeFrequency}
                />
            </SettingItem>
            <SettingItem>
                <SettingsInfo description="Articles will be saved in this folder, if provided" name={""} />
                <SettingControl>
                    <SelectObs
                        options={folders}
                        value={plugin.settings.pocket.folder || ""}
                        placeholder="Select a folder..."
                        onChange={onFolderChange}
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
                        }} />

                </SettingControl>
            </SettingItem>
        </>
    );
};
