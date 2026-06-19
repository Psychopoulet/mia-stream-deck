// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardBody, CardFooter,
        InputText, Button,
        generateFocus
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";

// types & interfaces

    // externals
    import type { iPropsNode, iGenerateFocusCallback } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";
    import type { SDK } from "../SDK";

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "running": boolean;
        "newTableName": components["schemas"]["TableName"];
    }

// component

export default class AddTable extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "AddTable";

    // private

        private readonly _sdk: SDK = getSDK();
        private readonly _focus: iGenerateFocusCallback<HTMLInputElement> = generateFocus<HTMLInputElement>();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this._focus = generateFocus();

        this.state = {
            "running": false,
            "newTableName": ""
        };

    }

    public componentDidMount (): void {

        this._focus.setFocus();

    }

    // interface handlers

    private readonly _handleChangeNewTableName = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "newTableName": newValue
        });

    };

    private readonly _handleAddNewTableName = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "running": true
        });

        this._sdk.addTable(this.state.newTableName).then((): void => {

            this.setState({
                "running": false,
                "newTableName": ""
            });

            setTimeout((): void => {
                this._focus.setFocus();
            }, 200);

        }).catch((err: Error): void => {

            this.setState({
                "running": false
            });

            this.props.onError(err);

        });

    };

    // render

    public render (): React.JSX.Element {

        return <Card onSubmit={ this._handleAddNewTableName }>

            <CardHeader>Add new table</CardHeader>

            <CardBody>

                <InputText _ref={ this._focus.ref }
                    value={ this.state.newTableName } onChange={ this._handleChangeNewTableName } minLength={ 1 }
                    disabled={ this.state.running }
                />

            </CardBody>

            <CardFooter>

                <Button type="submit"
                    icon="plus" variant="success" block
                    disabled={ this.state.running || 0 >= this.state.newTableName.length }
                >
                    Add new table
                </Button>

            </CardFooter>

        </Card>;

    }

}
