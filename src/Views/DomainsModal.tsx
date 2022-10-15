
import * as React from "react";
import { App, Modal } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import CloseIcon from "../svg/close.svg";
import { useCallback, useMemo, useRef, useState } from "react";
import { Info, SettingControl, SettingItem, SettingsInfo } from "./SettingControls";
import { getFolders } from "src/Utils";
import { SelectObs } from "./Select";
import { ReadlaterSettings } from "src/Settings";

export class DomainsModal extends Modal {
	settings: ReadlaterSettings;
	root: Root;
	onDomainsChanged: (domain: string[]) => void;
	

	constructor(app: App, settings: ReadlaterSettings, onDomainsChanged: (domains:string[])=>void) {
		super(app);
		this.settings = settings;
		this.titleEl.setText("Read Later Domains for Headless Browser");
		this.onDomainsChanged = onDomainsChanged;
	}



	render() {
		

		this.root.render(
			<React.StrictMode>
				<DomainsView
					domains={this.settings.domainsForHeadless}
					onCancel={()=>{this.close()}}
					onDomainsChanged={(domains:string[])=>{
						this.close();
						this.onDomainsChanged && this.onDomainsChanged(domains);
					}}
				/>
			</React.StrictMode>
		);
	}

	onOpen() {
		const { contentEl } = this;

		this.root = createRoot(contentEl);
		this.render();

	}

	onClose() {

		this.root.unmount();
	}
}

type DomainsViewProps = {
	domains: string[],
	onCancel: ()=>void,
	onDomainsChanged: (domains:string[])=>void
}
const DomainsView = ({ domains, onCancel, onDomainsChanged }: DomainsViewProps) => {

	const [state, setState] = useState({
		domains,
		value: ""
	});
	const list = state.domains;

	// const [currentValue, updateValue] = useState("");
	const ref = useRef<HTMLDivElement>(null);

	const onAdd = useCallback((e: React.MouseEvent) => {
		setState(state => {
	
			return ({
				...state,
				domains: [...state.domains, state.value],
				value: ""
			})
		})
	}, [])

	const onChange = useCallback((e:React.ChangeEvent<HTMLInputElement>) => {


			setState(state => {
				return ({
					...state,
					value: e.target.value
				})
			})
		
	}, []);



	const onDelete = useCallback((i:number)=>{
		setState(state=>{

			return ({
				...state,
				domains: state.domains.filter((v,index)=>!(i===index))
			})
		})
	},[]);

	const onDone = useCallback(()=>{
		onDomainsChanged && onDomainsChanged(state.domains);
	},[state.domains]);

	return <div ref={ref}>
		<div>Pages on domains containing the following will be fetched using a headless browser</div>
		{list.map((domain, i) => (
			<div key={i} className="mobile-option-setting-item">
				<span className="mobile-option-setting-item-name">{domain}</span>
				<span className="mobile-option-setting-item-option-icon" onClick={()=>onDelete(i)}><CloseIcon /></span>
			</div>
		))}
		<SettingItem>
			<SettingsInfo name="Domain" description="" />
			<SettingControl>
				<input value={state.value}
                onChange={onChange}
                />
				<button onClick={onAdd}>Add</button>
			</SettingControl>
		</SettingItem>
		<div className="modal-button-container">
			<button className="mod-cta" onClick={onDone}>Done</button>
			<button onClick={onCancel}>Cancel</button></div>
	</div>
}


