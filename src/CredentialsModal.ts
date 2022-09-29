import { App, Modal, Setting } from "obsidian";

export class CredentialsModal extends Modal {
    username: string;
    password: string;
    onSubmit: (username: string, password: string) => void;

    constructor(
        app: App,
        onSubmit: (username: string, password: string) => void
    ) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: "Please enter credentials" });

        new Setting(contentEl).setName("Username").addText((text) =>
            text.onChange((value) => {
                this.username = value;
            })
        );
        new Setting(contentEl).setName("Password").addText((text) => {
            text.inputEl.type = "password";
            text.onChange((value) => {
                this.password = value;
            });
        });

        new Setting(contentEl).addButton((btn) =>
            btn
                .setButtonText("OK")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(this.username, this.password);
                })
        );
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
