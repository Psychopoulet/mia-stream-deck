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
        "action": components["schemas"]["ActionInputKey"];
        "onChange": (action: components["schemas"]["ActionInputKey"]) => void;
    }

// component

export default class EditKey extends React.PureComponent<iProps> {

    // name

        public static displayName: string = "EditKey";

    // interface handlers

    private readonly _handleChangeKey = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.props.onChange({
            ...this.props.action,
            "key": newValue
        });

    };

    private readonly _handleChangeAlt = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.props.onChange({
            ...this.props.action,
            "alt": newValue
        });

    };

    private readonly _handleChangeCtrl = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.props.onChange({
            ...this.props.action,
            "ctrl": newValue
        });

    };

    private readonly _handleChangeShift = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.props.onChange({
            ...this.props.action,
            "shift": newValue
        });

    };

    private readonly _handleChangeCommand = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.props.onChange({
            ...this.props.action,
            "command": newValue
        });

    };

    // render

    public render (): React.JSX.Element {

        return <div className="row">

            <div className="col-12">

                <InputTextLabel label="Key"
                    value={ this.props.action.key }
                    onChange={ this._handleChangeKey }
                />
            </div>

            <div className="col-12 col-md-6">

                <CheckBoxLabel label="Alt"
                    checked={ this.props.action.alt }
                    onToogle={ this._handleChangeAlt }
                />

                <CheckBoxLabel label="Ctrl"
                    checked={ this.props.action.ctrl }
                    onToogle={ this._handleChangeCtrl }
                />

            </div>

            <div className="col-12 col-md-6">

                <CheckBoxLabel label="Shift"
                    checked={ this.props.action.shift }
                    onToogle={ this._handleChangeShift }
                />

                <CheckBoxLabel label="Command"
                    checked={ this.props.action.command }
                    onToogle={ this._handleChangeCommand }
                />

            </div>

        </div>;

    }

}
