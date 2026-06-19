// deps

    // externals
    import React from "react";
    import {
        Alert,
        Card, CardHeader, CardBody,
        Select
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";
    import TableCommandsEdit from "./TableCommandsEdit";

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
            .on("table.added", this._onTableAdded)
            .on("table.deleted", this._onTableDeleted);

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
            .off("table.added", this._onTableAdded)
            .off("table.deleted", this._onTableDeleted);

    }

    // events

    private readonly _onTableAdded = (tableName: components["schemas"]["TableName"]): void => {

        this.setState({
            "tables": [ ...this.state.tables, tableName ],
            "selectedTableName": tableName
        });

    };

    private readonly _onTableDeleted = (tableName: components["schemas"]["TableName"]): void => {

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

    // render

    public render (): React.JSX.Element {

        if (this.state.loading) {
            return <Alert variant="warning">Loading...</Alert>;
        }
        else if (0 >= this.state.tables.length) {
            return <Alert variant="warning">No tables found...</Alert>;
        }
        else {

            return <>

                <Card>

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

                </Card>

                { 0 < this.state.selectedTableName.length && <TableCommandsEdit tablename={ this.state.selectedTableName } onError={ this.props.onError } /> }

            </>;

        }

    }

}
