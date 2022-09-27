import React from 'react';
import Select from 'react-select';

export type SelectObsProps = {
    options: any,
    placeholder?: string
}

export const SelectObs = ({options, placeholder}:SelectObsProps) => {

    return (
        <Select
            options={options}
            styles={customStyles}
            isClearable={true}
            placeholder={placeholder}
        />
    )

    
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
