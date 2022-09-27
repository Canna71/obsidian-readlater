import React, { ReactChild, ReactChildren } from "react";

type SettingsInfoProps = {
    name: string;
    description: string;
}


export const SettingsInfo = ({ name, description }: SettingsInfoProps) => {

    return (
        <Info>
            <SettingName>{name}</SettingName>
            <SettingDescription>{description}</SettingDescription>
        </Info>
    )
}

export const Info = ({ children }: React.PropsWithChildren) => {
    return (
        <div className="setting-item-info">{children}</div>
    )
}

export const SettingName = ({ children }: React.PropsWithChildren) => {
    return (
        <div className="setting-item-name">{children}</div>
    )
}

export const SettingDescription = ({ children }: React.PropsWithChildren) => {
    return (
        <div className="setting-item-description">{children}</div>
    )
}
export const SettingControl = ({ children }: React.PropsWithChildren) => {
    return (
        <div className="setting-item-control">{children}</div>
    )
}
