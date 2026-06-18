// deps

    // externals
    import React from "react";
    import {
        InputTextLabel, CheckBoxLabel
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../../lib/src/Descriptor";

    interface iProps extends iPropsNode {
        "action": components["schemas"]["ActionInputString"];
        "onChange": (action: components["schemas"]["ActionInputString"]) => void;
    }

// component

export default class EditString extends React.PureComponent<iProps> {

    // name

        public static displayName: string = "EditString";

    // interface handlers

    private readonly _handleChangeString = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.props.onChange({
            ...this.props.action,
            "string": newValue
        });

    };

    private readonly _handleChangeEnter = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.props.onChange({
            ...this.props.action,
            "enter": newValue
        });

    };

    // render

    public render (): React.JSX.Element {

        return <>

            <InputTextLabel label="String"
                value={ this.props.action.string }
                onChange={ this._handleChangeString }
            />

            <CheckBoxLabel label="Enter"
                checked={ this.props.action.enter }
                onToogle={ this._handleChangeEnter }
            />

        </>;

    }

}
