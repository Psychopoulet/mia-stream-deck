// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        Card, CardHeader, CardBody,
        InputTextLabel, SelectLabel, CheckBoxLabel,
        Icon, Image,
        Button,
        generateFocus
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsNode, iGenerateFocusCallback, tIcon } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";

    type ActionType = components["schemas"]["ActionEmpty"]["type"] | components["schemas"]["ActionInputString"]["type"] | components["schemas"]["ActionInputKey"]["type"] | components["schemas"]["ActionPlugin"]["type"];

    interface iProps extends iPropsNode {
        "command": components["schemas"]["Command"];
        "onChange": (command: components["schemas"]["Command"]) => void;
        "onClose": () => void;
    }

    interface iState {
        "command": components["schemas"]["Command"];
    }

// component

export default class ModalEditCommand extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "ModalEditCommand";

    // private

        private readonly _focus: iGenerateFocusCallback<HTMLInputElement> = generateFocus<HTMLInputElement>();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "command": this.props.command
        };

    }

    public componentDidMount (): void {

        this._focus.setFocus();

    }

    // interface handlers

    private readonly _handleSubmit = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this.props.onChange(this.state.command);

    };

    private readonly _handleChangeLabel = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({ "command": { ...this.state.command, "label": 0 < newValue.length ? newValue : undefined } });

    };

    private readonly _handleChangeIcon = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({ "command": { ...this.state.command, "icon": 0 < newValue.length ? newValue : undefined } });

    };

    private readonly _handleChangePicture = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({ "command": { ...this.state.command, "picture": 0 < newValue.length ? newValue : undefined } });

    };

    private readonly _handleChangeActionType = (e: React.ChangeEvent<HTMLSelectElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        switch (newValue as ActionType) {

            case "INPUT-STRING":

                this.setState({
                    "command": { ...this.state.command,
                    "action": { "type": "INPUT-STRING", "string": "" } }
                });

            break;

            case "INPUT-KEY":

                this.setState({
                    "command": { ...this.state.command,
                    "action": { "type": "INPUT-KEY", "key": "" } }
                });

            break;

            case "PLUGIN":

                this.setState({
                    "command": { ...this.state.command,
                    "action": { "type": "PLUGIN", "plugin": "", "operationId": "" } }
                });

            break;

            default:

                this.setState({
                    "command": { ...this.state.command,
                    "action": { "type": "EMPTY" } }
                });

            break;

        }

    };

    private readonly _handleChangeActionString = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "command": {
                ...this.state.command,
                "action": {
                    ...this.state.command.action as components["schemas"]["ActionInputString"],
                    "string": newValue
                }
            }
        });

    };

    private readonly _handleChangeActionEnter = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "command": {
                ...this.state.command,
                "action": {
                    ...this.state.command.action as components["schemas"]["ActionInputString"],
                    "enter": newValue
                }
            }
        });

    };

    private readonly _handleChangeActionKey = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "command": {
                ...this.state.command,
                "action": {
                    ...this.state.command.action as components["schemas"]["ActionInputKey"],
                    "key": newValue
                }
            }
        });

    };

    private readonly _handleChangeActionAlt = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "command": {
                ...this.state.command,
                "action": {
                    ...this.state.command.action as components["schemas"]["ActionInputKey"],
                    "alt": newValue
                }
            }
        });

    };

    private readonly _handleChangeActionCtrl = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "command": {
                ...this.state.command,
                "action": {
                    ...this.state.command.action as components["schemas"]["ActionInputKey"],
                    "ctrl": newValue
                }
            }
        });

    };

    private readonly _handleChangeActionShift = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "command": {
                ...this.state.command,
                "action": {
                    ...this.state.command.action as components["schemas"]["ActionInputKey"],
                    "shift": newValue
                }
            }
        });

    };

    private readonly _handleChangeActionCommand = (e: React.ChangeEvent<HTMLInputElement>, newValue: boolean): void => {

        this.setState({
            "command": {
                ...this.state.command,
                "action": {
                    ...this.state.command.action as components["schemas"]["ActionInputKey"],
                    "command": newValue
                }
            }
        });

    };

    // render

    private readonly _renderInputKey = (): React.JSX.Element | undefined => {

        if ("INPUT-KEY" !== this.state.command.action.type) {
            return undefined;
        }

        return <div className="row">

            <div className="col-12">

                <InputTextLabel label="Key"
                    value={ this.state.command.action.key }
                    onChange={ this._handleChangeActionKey }
                />
            </div>

            <div className="col-12 col-md-6">

                <CheckBoxLabel label="Alt"
                    checked={ this.state.command.action.alt }
                    onToogle={ this._handleChangeActionAlt }
                />

                <CheckBoxLabel label="Ctrl"
                    checked={ this.state.command.action.ctrl }
                    onToogle={ this._handleChangeActionCtrl }
                />

            </div>

            <div className="col-12 col-md-6">

                <CheckBoxLabel label="Shift"
                    checked={ this.state.command.action.shift }
                    onToogle={ this._handleChangeActionShift }
                />

                <CheckBoxLabel label="Command"
                    checked={ this.state.command.action.command }
                    onToogle={ this._handleChangeActionCommand }
                />

            </div>

        </div>;

    };

    private readonly _renderInputString = (): React.JSX.Element | undefined => {

        if ("INPUT-STRING" !== this.state.command.action.type) {
            return undefined;
        }

        return <>

            <InputTextLabel label="String"
                value={ this.state.command.action.string }
                onChange={ this._handleChangeActionString }
            />

            <CheckBoxLabel label="Enter"
                checked={ this.state.command.action.enter }
                onToogle={ this._handleChangeActionEnter }
            />

        </>;

    };

    public render (): React.JSX.Element {

        return <Modal appId="{{plugin.name}}-app" title="Edit command" size="lg"
            onSubmit={ this._handleSubmit }
            onClose={ this.props.onClose }
        >

            <ModalBody>

                <InputTextLabel label="Label"
                    value={ this.state.command.label }
                    onChange={ this._handleChangeLabel }
                />

                <InputTextLabel label="Icon"
                    value={ this.state.command.icon }
                    onChange={ this._handleChangeIcon }
                >

                    { "string" === typeof this.state.command.icon && 0 < this.state.command.icon.length && <div className="input-group-text">
                        <Icon type={ this.state.command.icon as tIcon } />
                    </div> }

                </InputTextLabel>

                <InputTextLabel label="Picture"
                    value={ this.state.command.picture }
                    onChange={ this._handleChangePicture }
                >
                    { "string" === typeof this.state.command.picture && 0 < this.state.command.picture.length && <div className="input-group-text">
                        <Image height={ 25 } width={ 25 } src={ this.state.command.picture } />
                    </div> }
                </InputTextLabel>

                <Card>

                    <CardHeader>Action</CardHeader>

                    <CardBody>

                        <SelectLabel label="Action"
                            value={ this.state.command.action.type }
                            onChange={ this._handleChangeActionType }
                        >

                            { ([
                                "EMPTY",
                                "INPUT-STRING",
                                "INPUT-KEY",
                                "PLUGIN"
                            ] as ActionType[]).map((actionType: ActionType): React.JSX.Element => {
                                return <option key={ actionType } value={ actionType }>{ actionType }</option>;
                            }) }

                        </SelectLabel>

                        { this._renderInputString() }
                        { this._renderInputKey() }

                    </CardBody>

                </Card>

                { JSON.stringify(this.state.command) }

            </ModalBody>

            <ModalFooter>

                <Button type="submit"
                    icon="save" variant="success" block
                >
                    Save command
                </Button>

            </ModalFooter>

        </Modal>;

    }

}
