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
    import type { components } from "../../../lib/src/Descriptor";

    interface iProps extends iPropsNode {
        "action": components["schemas"]["ActionPlugin"];
        "onChange": (action: components["schemas"]["ActionPlugin"]) => void;
    }

    interface iState {
        "urlParameters": {
            "path": string;
            "query": string;
            "headers": string;
            "cookies": string;
        };
        "bodyParameters": string;
    }

// component

export default class EditPlugin extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "EditPlugin";

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "urlParameters": {
                "path": "object" === typeof this.props.action.urlParameters?.path ? JSON.stringify(this.props.action.urlParameters.path) : "",
                "query": "object" === typeof this.props.action.urlParameters?.query ? JSON.stringify(this.props.action.urlParameters.query) : "",
                "headers": "object" === typeof this.props.action.urlParameters?.headers ? JSON.stringify(this.props.action.urlParameters.headers) : "",
                "cookies": "object" === typeof this.props.action.urlParameters?.cookies ? JSON.stringify(this.props.action.urlParameters.cookies) : ""
            },
            "bodyParameters": "string" === typeof this.props.action.bodyParameters ? this.props.action.bodyParameters : ""
        };

    }

    public componentDidUpdate (prevProps: iProps): void {

        if (prevProps.action.urlParameters === this.props.action.urlParameters && prevProps.action.bodyParameters === this.props.action.bodyParameters) {
            return;
        }

        this.setState({
            "urlParameters": prevProps.action.urlParameters !== this.props.action.urlParameters ? {
                "path": "object" === typeof this.props.action.urlParameters?.path ? JSON.stringify(this.props.action.urlParameters.path) : "",
                "query": "object" === typeof this.props.action.urlParameters?.query ? JSON.stringify(this.props.action.urlParameters.query) : "",
                "headers": "object" === typeof this.props.action.urlParameters?.headers ? JSON.stringify(this.props.action.urlParameters.headers) : "",
                "cookies": "object" === typeof this.props.action.urlParameters?.cookies ? JSON.stringify(this.props.action.urlParameters.cookies) : ""
            } : this.state.urlParameters,
            "bodyParameters": prevProps.action.bodyParameters !== this.props.action.bodyParameters ? JSON.stringify(this.props.action.bodyParameters) : this.state.bodyParameters
        });

    }

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

    private readonly _handleChangeUrlPath = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "urlParameters": {
                ...this.state.urlParameters,
                "path": newValue
            }
        });

        try {

            this.props.onChange({
                ...this.props.action,
                "urlParameters": {
                    ...(this.props.action.urlParameters ?? {}),
                    "path": JSON.parse(newValue) as Record<string, string>
                }
            });

        }
        catch (err: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // nothing to do here
        }

    };

    private readonly _handleChangeUrlQuery = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "urlParameters": {
                ...this.state.urlParameters,
                "query": newValue
            }
        });

        try {

            this.props.onChange({
                ...this.props.action,
                "urlParameters": {
                    ...(this.props.action.urlParameters ?? {}),
                    "query": JSON.parse(newValue) as Record<string, string>
                }
            });

        }
        catch (err: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // nothing to do here
        }

    };

    private readonly _handleChangeUrlHeaders = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "urlParameters": {
                ...this.state.urlParameters,
                "headers": newValue
            }
        });

        try {

            this.props.onChange({
                ...this.props.action,
                "urlParameters": {
                    ...(this.props.action.urlParameters ?? {}),
                    "headers": JSON.parse(newValue) as Record<string, string>
                }
            });

        }
        catch (err: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // nothing to do here
        }

    };

    private readonly _handleChangeUrlCookies = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "urlParameters": {
                ...this.state.urlParameters,
                "cookies": newValue
            }
        });

        try {

            this.props.onChange({
                ...this.props.action,
                "urlParameters": {
                    ...(this.props.action.urlParameters ?? {}),
                    "cookies": JSON.parse(newValue) as Record<string, string>
                }
            });

        }
        catch (err: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // nothing to do here
        }

    };

    private readonly _handleChangeBodyParameters = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "bodyParameters": newValue
        });

        try {

            this.props.onChange({
                ...this.props.action,
                "bodyParameters": this.props.action.bodyParameters ?? {}
            });

        }
        catch (err: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // nothing to do here
        }

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

                    <CardBody className="pb-1">

                        <TextAreaLabel label="Paths"
                            value={ this.state.urlParameters.path }
                            onChange={ this._handleChangeUrlPath }
                        />

                        <TextAreaLabel label="Query"
                            value={ this.state.urlParameters.query }
                            onChange={ this._handleChangeUrlQuery }
                        />

                        <TextAreaLabel label="Headers"
                            value={ this.state.urlParameters.headers }
                            onChange={ this._handleChangeUrlHeaders }
                        />

                        <TextAreaLabel label="Cookies"
                            value={ this.state.urlParameters.cookies }
                            onChange={ this._handleChangeUrlCookies }
                        />

                    </CardBody>

                    <CardBody className="pb-1">

                        <TextAreaLabel label="Body"
                            value={ this.state.bodyParameters }
                            onChange={ this._handleChangeBodyParameters }
                        />

                    </CardBody>

                </Card>

            </div>

        </div>;

    }

}
