import * as React from "react";
import { SynchFrequency } from "src/Settings";

export const FrequencySelect = (props:any) => 
<select
    onChange={props.onChange}
    value={props.value}
>
    {Object.values(SynchFrequency)
        .map(freq => <option key={freq} value={freq}>{freq}</option>)}
</select>;
