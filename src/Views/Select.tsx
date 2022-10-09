import React from 'react';
import Select, { ActionMeta, InputActionMeta } from 'react-select';

export type SelectObsProps = {
    options: {
		value: string;
		label: string;
	}[],
    placeholder?: string,
    value: string,
    onChange?: ((newValue: unknown, actionMeta: ActionMeta<unknown>) => void),
	onInputChange?: ((newValue: unknown, actionMeta: InputActionMeta) => void)
}

export const SelectObs = ({options, placeholder, value, onChange, onInputChange}:SelectObsProps) => {

    const selected = value && options.find(opt=>opt.value===value);

    return (
        <Select
            options={options}
            styles={customStyles}
            isClearable={true}
            defaultValue={selected}
            placeholder={placeholder}
            onChange={onChange}
            onInputChange={onInputChange}
            menuPortalTarget={document.body}
        />
    )

    
}


const customStyles = {
	option: (provided: any, state: any) => {


		return {
			...provided,
			background: state.isFocused ? "var(--background-secondary)" : "var(--background-primary)",
			color: "var(--text-normal)",
			"&:hover": {
				...provided["&:hover"],
				backgroundColor: "var(--background-secondary)",

			}
		}
	},
	valueContainer: (provided: any, state: any) => ({
		...provided,
		color: "var(--text-normal)",
	}),
	menu: (provided: any) => ({
		...provided,

	}),
	menuList: (provided: any, state: any) => ({
		...provided,
		border: "1px solid var(--background-modifier-border)",
		backgroundColor: "var(--background-secondary-alt)",
		color: "var(--text-normal)",
	}),
	input: (provided: any, state: any) => {


		return {
			...provided,
			color: "var(--text-normal)",

		};
	},
	singleValue: (provided: any, state: any) => {


		return {
			...provided,
			color: "var(--text-normal)",

		};
	},
	control: (provided: any, state: any) => {


		return {
			...provided,
			background: "var(--background-modifier-form-field)",
			color: "var(--text-normal)",
			border: "1px solid var(--background-modifier-border)",
			boxShadow: "none",
			width: "300px",
			'&:hover': {
				...provided["&:hover"],

				borderColor: 'var(--background-modifier-border)'
			},
			'&:active': {
				...provided["&:active"],

				borderColor: 'var(--interactive-accent);'
			},
			'&:focus': {
				...provided["&:focus"],

				borderColor: 'var(--interactive-accent);'
			},
			'&:focused': {
				...provided["&:focused"],

				borderColor: 'var(--interactive-accent);'
			},
			'&:focus-within': {
				...provided["&:focus-within"],

				borderColor: 'var(--interactive-accent);'
			}
		}
	},
	menuPortal: (base: any) => ({ ...base, zIndex: "var(--layer-modal)" })
	// container: (provided: any)=>({

	// })
}

