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

        new Setting(containerEl)
        .setName("Pocket")
        .addButton(button=>button
            .setButtonText("Get Auth")
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
