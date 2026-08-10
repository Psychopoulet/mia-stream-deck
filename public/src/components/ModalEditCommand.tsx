// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        Card, CardHeader, CardBody,
        InputTextLabel, SelectLabel,
        Icon, Image,
        Button,
        generateFocus
    } from "react-bootstrap-fontawesome";

    // locals
    import EditPlugin from "./EditPlugin";

// types & interfaces

    // externals
    import type { iPropsNode, iGenerateFocusCallback, tIcon } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";

    type ActionType = components["schemas"]["ActionEmpty"]["type"] | components["schemas"]["ActionPlugin"]["type"];

    interface iProps extends iPropsNode {
        "command": components["schemas"]["Command"];
        "onChange": (command: components["schemas"]["Command"]) => void;
        "onClose": () => void;
        "onError": (err: Error) => void;
    }

    interface iState {
        "command": components["schemas"]["Command"];
    }

// component

export default class ModalEditCommand extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "ModalEditCommand";

    // private

        private readonly _focus: iGenerateFocusCallback<HTMLInputElement>;

    // constructor

    public constructor (props: iProps) {

        super(props);

        this._focus = generateFocus<HTMLInputElement>();

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

    private readonly _handleChangeActionPlugin = (action: components["schemas"]["ActionPlugin"]): void => {

        this.setState({
            "command": {
                ...this.state.command,
                "action": action
            }
        });

    };

    // render

    private readonly _renderActionType = (disabled: boolean): React.JSX.Element => {

        return <SelectLabel label="Type"
            disabled={ disabled }
            value={ this.state.command.action.type }
            onChange={ this._handleChangeActionType }
        >

            { ([
                "EMPTY",
                "PLUGIN"
            ] as ActionType[]).map((actionType: ActionType): React.JSX.Element => {
                return <option key={ actionType } value={ actionType }>{ actionType }</option>;
            }) }

        </SelectLabel>;

    };

    public render (): React.JSX.Element {

        return <Modal appId="{{plugin.name}}-app" title="Edit command" size="lg" scrollable
            onSubmit={ this._handleSubmit }
            onClose={ this.props.onClose }
        >

            <ModalBody>

                <InputTextLabel label="Label" _ref={ this._focus.ref }
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

                { "EMPTY" === this.state.command.action.type
                    ? this._renderActionType(false)
                    : <Card>

                        <CardHeader>Action</CardHeader>

                        <CardBody>

                            { this._renderActionType(true) }

                            <EditPlugin
                                action={ this.state.command.action }
                                onSave={ this._handleChangeActionPlugin }
                                onError={ this.props.onError }
                            />

                        </CardBody>

                    </Card>

                }

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
