import * as React from "react";
import ReadlaterPlugin from "src/main";
import { App, ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import { enrollInPocket } from "./PocketProvider";
import { createRoot, Root } from "react-dom/client";
import { ReadlaterContext } from "Views/ReadlaterView";
import { SettingControl, SettingsInfo } from "./SettingControls";
import Select from 'react-select'
import { getFolders } from "./utils";
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
    }

    display(): void {
        const { containerEl } = this;
        console.log("Readlater Setings display");

        const folders = getFolders(this.app);
        const options = folders.map(f => ({ value: f, label: f }));

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Readlater Settings' });

        this.createToggle(containerEl, "Add Ribbon Icon",
            "Adds an icon to the ribbon to add URL",
            "addRibbonIcon"
        );
        const pocketCfg = this.plugin.settings.pocket;

        containerEl.createEl('h3', { text: 'Pocket Integration' });

        let desc = "Authorize the app to integrate with Pocket";

        if (pocketCfg.username && pocketCfg.access_token) {
            desc = "Authenticated as " + pocketCfg.username;

        }

        const customStyles = {
            option: (provided: any, state: any) => {

                if(state.label === "/") console.log(state);
                
                return{
                ...provided,
                background: state.isFocused ? "var(--background-secondary)" : "var(--background-modifier-form-field)",
                color: "var(--text-normal)",
                "&:hover": {
                    ...provided["&:hover"],
                    backgroundColor: "var(--background-secondary)",

                }
            }},
            valueContainer: (provided: any, state: any) => ({
                ...provided,
                color: "var(--text-normal)",
            }),
            menuList: (provided: any, state: any) => ({
                ...provided,
                border: "none",
                backgroundColor: "var(--background-secondary-alt)",
                color: "var(--text-normal)",
            }),
            input: (provided: any, state: any) => {


                return { ...provided,
                    color: "var(--text-normal)",
                
                };
            },
            singleValue: (provided: any, state: any) => {


                return { ...provided,
                    color: "var(--text-normal)",
                
                };
            },
            control: (provided: any, state: any) => {


                return {
                    ...provided,
                    background: "var(--background-secondary-alt)",
                    color: "var(--text-normal)",
                    border: "1px solid var(--background-modifier-form-field)",
                    boxShadow: "none",
                    width: "300px",
                    '&:hover': {
                        ...provided["&:hover"],

                        borderColor: 'var(--background-secondary-alt)'
                    },
                    '&:focused': {
                        ...provided["&:focused"],

                        borderColor: 'var(--background-secondary-alt)'
                    }
                }
            },

            // container: (provided: any)=>({

            // })
        }

        const pocketEl = new Setting(containerEl).settingEl;
        createRoot(pocketEl).render(
            <React.StrictMode>
                <ReadlaterContext.Provider value={{}}>

                    <SettingsInfo description={desc} name={""} />
                    <SettingControl>
                        <button onClick={this.onAuthorizePocket}>Authorize</button>
                        <Select
                            options={options}
                            styles={customStyles}
                        />

                    </SettingControl>

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
}
