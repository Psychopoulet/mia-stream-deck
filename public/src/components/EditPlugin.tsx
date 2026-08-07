// deps

    // externals
    import React from "react";
    import {
        InputTextLabel,
        Button
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";
    import EditPluginParameters from "./EditPluginParameters";

    type tAction = components["schemas"]["ActionPlugin"];

    interface iProps extends iPropsNode {
        "action": components["schemas"]["ActionPlugin"];
        "onSave": (action: components["schemas"]["ActionPlugin"]) => void;
        "onError": (err: Error) => void;
    }

    interface iState extends tAction {
        "editParameters": boolean;
    }

// component

export default class EditPlugin extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "EditPlugin";

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            ...this.props.action,
            "editParameters": false
        };

    }

    // interface handlers

    private readonly _handleChangePluginName = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "plugin": newValue
        });

    };

    private readonly _handleChangeOperationId = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "operationId": newValue
        });

    };

    private readonly _handleChangeParameters = (urlParameters: components["schemas"]["ActionPlugin"]["urlParameters"], bodyParameters: components["schemas"]["ActionPlugin"]["bodyParameters"]): void => {

        this.setState({
            "urlParameters": urlParameters,
            "bodyParameters": bodyParameters,
            "editParameters": false
        });

    };

    private readonly _handleEditParameters = (): void => {

        this.setState({
            "editParameters": true
        });

    };

    // render

    public render (): React.JSX.Element {

        return <div className="row">

            <div className="col-12 col-md-6">

                <InputTextLabel label="Plugin name"
                    value={ this.state.plugin }
                    onChange={ this._handleChangePluginName }
                />

            </div>

            <div className="col-12 col-md-6">

                <InputTextLabel label="Operation ID"
                    value={ this.state.operationId }
                    onChange={ this._handleChangeOperationId }
                />

            </div>

            <div className="col-12">

                { this.state.editParameters
                    ? <EditPluginParameters action={ this.state }
                        onSave={ this._handleChangeParameters } onError={ this.props.onError }
                    />
                    : <Button icon="edit" variant="primary" block outline
                        onClick={ this._handleEditParameters }
                    >
                        Edit parameters
                    </Button>
                }

            </div>

        </div>;

    }

}
