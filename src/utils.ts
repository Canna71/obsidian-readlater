import { App, TFile } from "obsidian";

export  function getFolders(app: App):string[]{
    //@ts-ignore
    const files = app.vault.adapter.files;
    const folders = [];
    for(const key in files){
        if(files[key].type === "folder"){
            folders.push(files[key].realpath);
        }
    }
    return folders;
}

export  function getFilesInFolder(app: App, path: string):TFile[]{
    //@ts-ignore
    return app.vault.getFiles().filter(
        file => file.parent.path === path
    );
    
}
