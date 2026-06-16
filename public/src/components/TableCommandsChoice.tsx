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

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components, paths } from "../../../lib/src/Descriptor";
    import type { SDK } from "../SDK";

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "loading": boolean;
        "running": boolean;
        "tables": Array<components["schemas"]["TableName"]>;
        "selectedTableName": string;
    }

// component

export default class TableCommandsChoice extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "TableCommandsChoice";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "loading": true,
            "running": false,
            "tables": [],
            "selectedTableName": ""
        };

    }

    public componentDidMount (): void {

        this._sdk
            .on("table.added", this._handleTableAdded)
            .on("table.deleted", this._handleTableDeleted);

        this._sdk.getTables().then((tablenames: Array<components["schemas"]["TableName"]>): void => {

            this.setState({
                "loading": false,
                "tables": tablenames,
                "selectedTableName": ""
            });

        }).catch((err: Error): void => {

            this.setState({
                "loading": false
            });

            this.props.onError(err);

        });

    }

    public componentWillUnmount (): void {

        this._sdk
            .off("table.added", this._handleTableAdded)
            .off("table.deleted", this._handleTableDeleted);

    }

    // events

    private readonly _handleTableAdded = (tableName: components["schemas"]["TableName"]): void => {

        this.setState({
            "tables": [ ...this.state.tables, tableName ]
        });

    };

    private readonly _handleTableDeleted = (tableName: components["schemas"]["TableName"]): void => {

        const newTables: Array<components["schemas"]["TableName"]> = this.state.tables.filter((value: components["schemas"]["TableName"]): boolean => {
            return value !== tableName;
        });

        this.setState({
            "tables": newTables,
            "selectedTableName": this.state.selectedTableName === tableName ? "" : this.state.selectedTableName
        });

    };

    // interface handlers

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

        let url: keyof paths = "/mia-stream-deck/public/table.html";
        url += "?tablename=" + this.state.selectedTableName;

        const redirectWindow: WindowProxy | null = window.open(url, "_blank");

        if (redirectWindow) {
            redirectWindow.focus();
        }

    };

    private readonly _handleDeleteTable = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this._sdk.deleteTableByName(this.state.selectedTableName).then((): void => {

            this.setState({
                "running": false,
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

                        { "" === this.state.selectedTableName && <option value="">-</option> }

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
