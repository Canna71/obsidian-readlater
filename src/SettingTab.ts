import ReadlaterPlugin from "src/main";
import { App, ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import { enrollInPocket } from "./PocketProvider";


export class ReadlaterSettingsTab extends PluginSettingTab {
	plugin: ReadlaterPlugin;

	constructor(app: App, plugin: ReadlaterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Readlater Settings'});

        this.createToggle(containerEl, "Add Ribbon Icon",
            "Adds an icon to the ribbon to add URL",
            "addRibbonIcon"
        );
        const pocketCfg = this.plugin.settings.pocket;

        containerEl.createEl('h3', {text: 'Pocket Integration'});

        let desc = "Authorize the app to integrate with Pocket";

        if(pocketCfg.username && pocketCfg.access_token){
           desc = "Authenticated as " + pocketCfg.username;

        }

        new Setting(containerEl)
        .setName("Pocket")
        .setDesc(desc)
        .addButton(button=>button
            .setButtonText("Authorize")
            .onClick(vutton=>{
                enrollInPocket();
            })
        )
        
       
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
}
