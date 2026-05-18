// deps

    // externals
    import React from "react";
    import {
        Alert,
        InputTextLabel, ButtonGroup, Button,
        SelectLabel
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../sdk";
    import TableCommands from "./TableCommands";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";
    import type { SDK } from "../sdk";

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "loading": boolean;
        "running": boolean;
        "tables": components["schemas"]["TableName"][];
        "seeTableName": boolean;
        "selectedTableName": string;
        "newTableName": string;
    }

// component

export default class TableCommandsChoice extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "TableCommandsChoice";

    // private

        private _sdk: SDK = getSDK();
        private _research: URLSearchParams = new URLSearchParams(window.location.search);

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "loading": true,
            "running": false,
            "tables": [],
            "seeTableName": false,
            "selectedTableName": "",
            "newTableName": ""
        };

    }

    public componentDidMount (): void {

        this._sdk.getTables().then((tablenames: components["schemas"]["TableName"][]): void => {

            let seeTableName: boolean = false;
            let selectedTableName: string = "";
            let newTableName: string = "";

            // if there is a wanted tablename in the url
            if (this._research.has("tablename")) {

                // if registered, set it as the wanted table to see
                if (tablenames.find((value: string): boolean => {
                    return value === this._research.get("tablename");
                })) {

                    seeTableName = true;
                    selectedTableName = this._research.get("tablename") as string;
                    newTableName = "";

                }

                // if not registered, set it as the newTableName
                else {

                    seeTableName = false;
                    selectedTableName = "";
                    newTableName = this._research.get("tablename") as string;

                }

            }

            this.setState({
                "loading": false,
                "tables": tablenames,
                "seeTableName": seeTableName,
                "selectedTableName": selectedTableName,
                "newTableName": newTableName
            });

        }).catch((err: Error): void => {

            this.setState({
                "loading": false
            });

            this.props.onError(err);

        });

    }

    // events

    private readonly _handleChangeNewTableName = (e: React.ChangeEvent<HTMLInputElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "newTableName": newValue
        });

    };

    private readonly _handleAddNewTableName = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "running": true
        });

        this._sdk.addTable(this.state.newTableName).then((): Promise<components["schemas"]["TableName"][]> => {

            return this._sdk.getTables();

        }).then((tablenames: components["schemas"]["TableName"][]): void => {

            this.setState({
                "running": false,
                "tables": tablenames,
                "selectedTableName": this.state.newTableName
            });

        }).catch((err: Error): void => {

            this.setState({
                "running": false
            });

            this.props.onError(err);

        });

    };

    private readonly _handleChangeTable = (e: React.ChangeEvent<HTMLSelectElement>, newValue: string): void => {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "selectedTableName": newValue
        });

    };

    private readonly _handleSeeTable = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this._research.set("tablename", this.state.selectedTableName);
        window.location.search = "?tablename=" + this.state.selectedTableName;

        this.setState({
            "seeTableName": true
        });

    };

    private readonly _handleDeleteTable = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this._sdk.deleteTableByName(this.state.selectedTableName).then((): Promise<components["schemas"]["TableName"][]> => {

            return this._sdk.getTables();

        }).then((tablenames: components["schemas"]["TableName"][]): void => {

            this.setState({
                "running": false,
                "tables": tablenames,
                "selectedTableName": ""
            });

        }).catch((err: Error): void => {

            this.setState({
                "running": false
            });

            this.props.onError(err);

        });

    };

    // render

    public render (): React.JSX.Element {

        if (this.state.loading) {

            return <div className="container">
                <Alert variant="warning">Loading...</Alert>
            </div>;

        }
        else if (this.state.seeTableName) {
            return <TableCommands name={ this.state.selectedTableName } onError={ this.props.onError } />;
        }
        else {

            return <div className="container">

                <InputTextLabel label="New table name"
                    value={ this.state.newTableName } onChange={ this._handleChangeNewTableName } minLength={ 1 }
                    disabled={ this.state.running }
                />

                <Button icon="plus" variant="success" block
                    onClick={ this._handleAddNewTableName }
                    disabled={ this.state.running || 0 >= this.state.newTableName.length }
                >
                    Add new table
                </Button>

                { 0 >= this.state.tables.length ? undefined : <>

                    <SelectLabel label="Choose table"
                        value={ this.state.selectedTableName } onChange={ this._handleChangeTable }
                        disabled={ this.state.running || 0 >= this.state.tables.length }
                    >

                        <option value="">-</option>

                        { this.state.tables.map((value: string, key: number): React.JSX.Element => {
                            return <option key={ key } value={ value }>{ value }</option>;
                        }) }

                    </SelectLabel>

                    <ButtonGroup block>

                        <Button icon="eye" variant="success"
                            onClick={ this._handleSeeTable }
                            disabled={ this.state.running || 0 >= this.state.selectedTableName.length }
                        >
                            See table
                        </Button>

                        <Button icon="trash" variant="danger"
                            onClick={ this._handleDeleteTable }
                            disabled={ this.state.running || 0 >= this.state.selectedTableName.length }
                        >
                            Delete table
                        </Button>

                    </ButtonGroup>

                </> }

            </div>

        }

    }

};
