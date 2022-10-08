import * as React from "react";
import { SettingControl, SettingItem, SettingsInfo } from "./SettingControls";
import { SelectObs } from "src/Views/Select";
import { enroll as enrollInstapaper } from "../Logic/InstapaperProvider";
import { ProviderSettingsProps } from "./SettingTab";

export const InstapaperSettings = ({ plugin, folders }: ProviderSettingsProps) => {
    const instaCfg = plugin.settings.instapaper;
    const [settings, update] = React.useState({ ...plugin.settings });


    let desc = "Authorize the app to integrate with Instapaper";
    const isAuthorized = !!instaCfg.username;
    if (instaCfg.username) {
        desc = "Authenticated as " + instaCfg.username;
    }
    const [status, setStatus] = React.useState("");
    const onAuthorizeInstapaper = React.useCallback(async () => {
        try {
            await enrollInstapaper(plugin);
            setStatus("");
            update(settings => ({ ...settings }));
        } catch (ex) {
            console.warn(ex);
            setStatus("Login Failed");
        }

    }, [plugin]);

    const deAuthorize = React.useCallback(() => {
        plugin.settings.instapaper.secret = undefined;
        plugin.settings.instapaper.token = undefined;
        plugin.settings.instapaper.user_id = undefined;
        plugin.settings.instapaper.username = undefined;
        plugin.saveSettings();
        update(settings => ({ ...settings }));
    }, [plugin])

    const onFolderChange = React.useCallback((newValue: any, actionMeta: any) => {
        if (actionMeta.action === "select-option") {
            plugin.settings.instapaper.folder = newValue.value;
            plugin.saveSettings();
            update(settings => ({ ...settings }));

        } else if (actionMeta.action === "clear") {
            plugin.settings.instapaper.folder = undefined;
            plugin.saveSettings();
            update(settings => ({ ...settings }));

        }

    }, [plugin, update]);

    return (
        <>
            <h3>InstaPaper Integration</h3>
            <SettingItem>
                <SettingsInfo description={desc} name={""} />
                {status && <SettingsInfo description={status} name={""} />}

                <SettingControl>
                    {isAuthorized ?
                        <button onClick={deAuthorize}>Logout</button>
                        :
                        <button onClick={onAuthorizeInstapaper}>Login</button>

                    }


                </SettingControl>
            </SettingItem>
            <SettingItem>
                <SettingsInfo description="Articles will be saved in this folder, if provided" name={""} />
                <SettingControl>
                    <SelectObs
                        options={folders}
                        value={plugin.settings.instapaper.folder || ""}
                        onChange={onFolderChange}
                        placeholder="Select a folder..."

                    />

                </SettingControl>
            </SettingItem>
        </>
    );
};
