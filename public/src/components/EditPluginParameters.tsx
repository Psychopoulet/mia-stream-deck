// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        TextAreaLabel,
        Button
    } from "react-bootstrap-fontawesome";

    // locals
    import parseParameters from "../tools/parseParameters";
    import formateParameters from "../tools/formateParameters";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";

    interface iProps extends iPropsNode {
        "action": components["schemas"]["ActionPlugin"];
        "onSave": (urlParameters: components["schemas"]["ActionPlugin"]["urlParameters"], bodyParameters: components["schemas"]["ActionPlugin"]["bodyParameters"]) => void;
        "onError": (err: Error) => void;
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

export default class EditPluginParameters extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "EditPluginParameters";

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "urlParameters": {
                "path": parseParameters(this.props.action.urlParameters?.path),
                "query": parseParameters(this.props.action.urlParameters?.query),
                "headers": parseParameters(this.props.action.urlParameters?.headers),
                "cookies": parseParameters(this.props.action.urlParameters?.cookies)
            },
            "bodyParameters": parseParameters(this.props.action.bodyParameters)
        };

    }

    // interface handlers

    private readonly _handleChangeUrlPath = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "urlParameters": {
                ...this.state.urlParameters,
                "path": newValue
            }
        });

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

    };

    private readonly _handleChangeBodyParameters = (e: React.ChangeEvent<HTMLTextAreaElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "bodyParameters": newValue
        });

    };

    private readonly _handleSave = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        let body: Record<string, string> | string | undefined = "";

        if ("" === this.state.bodyParameters.trim()) {
            body = undefined;
        }
        else {

            try {
                body = JSON.parse(this.state.bodyParameters) as Record<string, string>;
            }
            catch (err: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
                body = this.state.bodyParameters;
            }

        }

        try {

            const urlParameters: components["schemas"]["ActionPlugin"]["urlParameters"] = {
                ...(this.props.action.urlParameters ?? {}),
                "path": formateParameters(this.state.urlParameters.path),
                "query": formateParameters(this.state.urlParameters.query),
                "headers": formateParameters(this.state.urlParameters.headers),
                "cookies": formateParameters(this.state.urlParameters.cookies)
            };

            this.props.onSave(urlParameters, body);

        }
        catch (err: unknown) {
            this.props.onError(err as Error);
        }

    };

    private readonly _handleClose = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this.props.onSave(this.props.action.urlParameters, this.props.action.bodyParameters);

    };

    // render

    public render (): React.JSX.Element {

        return <Modal appId={ "{{plugin.name}}-app" } title="Modify parameters"
            onSubmit={ this._handleSave } onClose={ this._handleClose }
        >

            <ModalBody>

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

                <TextAreaLabel label="Body"
                    value={ this.state.bodyParameters }
                    onChange={ this._handleChangeBodyParameters }
                />

            </ModalBody>

            <ModalFooter>

                <Button type="submit"
                    icon="save" variant="success" block
                >
                    Save changes
                </Button>

            </ModalFooter>

        </Modal>;

    }

}
