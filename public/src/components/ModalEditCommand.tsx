// deps

    // externals
    import React from "react";
    import {
        Modal, ModalBody, ModalFooter,
        Button,
        generateFocus
    } from "react-bootstrap-fontawesome";

// types & interfaces

    // externals
    import type { iPropsNode, iGenerateFocusCallback } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";

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

        this.props.onChange({
            "label": "test",
            "action": {
                "type": "INPUT-STRING",
                "string": "This is a test"
            }
        });

    };

    // render

    public render (): React.JSX.Element {

        return <Modal appId="{{plugin.name}}-app" title="Edit command"
            onSubmit={ this._handleSubmit }
            onClose={ this.props.onClose }
        >

            <ModalBody>

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
