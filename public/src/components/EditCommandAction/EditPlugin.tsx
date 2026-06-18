// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardBody,
        InputTextLabel, TextAreaLabel
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../../lib/src/Descriptor";

    interface iProps extends iPropsNode {
        "action": components["schemas"]["ActionPlugin"];
        "onChange": (action: components["schemas"]["ActionPlugin"]) => void;
    }

// component

export default class EditPlugin extends React.PureComponent<iProps> {

    // name

        public static displayName: string = "EditPlugin";

    // interface handlers

    private readonly _handleChangePluginName = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.props.onChange({
            ...this.props.action,
            "plugin": newValue
        });

    };

    private readonly _handleChangeOperationId = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.props.onChange({
            ...this.props.action,
            "operationId": newValue
        });

    };

    private readonly _handleChangeUrlParameters = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        this.props.onChange({
            ...this.props.action,
            "urlParameters": {
                ...(this.props.action.urlParameters ?? {}),
                "path": JSON.parse(newValue)
            }
        });

    };

    // render

    public render (): React.JSX.Element {

        return <div className="row">

            <div className="col-12 col-md-6">

                <InputTextLabel label="Plugin name"
                    value={ this.props.action.plugin }
                    onChange={ this._handleChangePluginName }
                />

            </div>

            <div className="col-12 col-md-6">

                <InputTextLabel label="Operation ID"
                    value={ this.props.action.operationId }
                    onChange={ this._handleChangeOperationId }
                />

            </div>

            <div className="col-12">

                <Card>

                    <CardHeader>URL parameters</CardHeader>

                    <CardBody>

                        <TextAreaLabel label="Paths"
                            value={ "object" === typeof this.props.action?.urlParameters?.path ? JSON.stringify(this.props.action.urlParameters.path) : "" }
                            onChange={ this._handleChangeUrlParameters }
                        />

                    </CardBody>

                </Card>

            </div>

        </div>;

    }

}
