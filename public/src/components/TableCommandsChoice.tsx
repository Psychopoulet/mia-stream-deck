// deps

    // externals
    import React from "react";
    import {
        Alert,
        Card, CardHeader, CardBody, CardFooter,
        Select,
        ButtonGroup, Button
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";
    import TableCommands from "./TableCommands";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";
    import type { SDK } from "../SDK";

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "loading": boolean;
        "running": boolean;
        "tables": Array<components["schemas"]["TableName"]>;
        "seeTableName": boolean;
        "selectedTableName": string;
        "newTableName": string;
    }

// component

export default class TableCommandsChoice extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "TableCommandsChoice";

    // private

        private readonly _sdk: SDK = getSDK();
        private readonly _research: URLSearchParams = new URLSearchParams(window.location.search);

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

        this._sdk.getTables().then((tablenames: Array<components["schemas"]["TableName"]>): void => {

            let seeTableName: boolean = false;
            let selectedTableName: string = "";
            let newTableName: string = "";

            // if there is a wanted tablename in the url
            if (this._research.has("tablename")) {

                const wantedTableName: components["schemas"]["TableName"] = this._research.get("tablename") as components["schemas"]["TableName"];

                // if registered, set it as the wanted table to see
                if (tablenames.some((value: components["schemas"]["TableName"]): boolean => {
                    return value === wantedTableName;
                })) {

                    seeTableName = true;
                    selectedTableName = wantedTableName;
                    newTableName = "";

                }

                // if not registered, set it as the newTableName
                else {

                    seeTableName = false;
                    selectedTableName = "";
                    newTableName = wantedTableName;

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

        this._sdk.deleteTableByName(this.state.selectedTableName).then((): Promise<Array<components["schemas"]["TableName"]>> => {

            return this._sdk.getTables();

        }).then((tablenames: Array<components["schemas"]["TableName"]>): void => {

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
            return <Alert variant="warning">Loading...</Alert>;
        }
        else if (this.state.seeTableName) {
            return <TableCommands name={ this.state.selectedTableName } onError={ this.props.onError } />;
        }
        else if (0 >= this.state.tables.length) {
            return <Alert variant="warning">No tables found...</Alert>;
        }
        else {

            return <Card>

                <CardHeader>Choose table</CardHeader>

                <CardBody>

                    <Select
                        value={ this.state.selectedTableName } onChange={ this._handleChangeTable }
                        disabled={ this.state.running || 0 >= this.state.tables.length }
                    >

                        <option value="">-</option>

                        { this.state.tables.map((value: string, key: number): React.JSX.Element => {
                            return <option key={ key } value={ value }>{ value }</option>;
                        }) }

                    </Select>

                </CardBody>

                <CardFooter>

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

                </CardFooter>

            </Card>;

        }

    }

}
