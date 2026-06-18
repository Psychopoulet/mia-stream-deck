// deps

    // externals
    import React from "react";
    import {
        Alert,
        Card, CardHeader, CardBody,
        Table, TableHeader, TableBody,
        Range,
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
        "tablename": string;
    }

    interface iState {
        "loading": boolean;
        "running": boolean;
        "table": components["schemas"]["Table"];
        "countLines": number;
        "countRows": number;
    }

// consts

    const MAX_LINES: number = 10;
    const MAX_ROWS: number = 10;

    const EMPTY_COMMAND: components["schemas"]["Command"] = {
        "action": {
            "type": "EMPTY"
        }
    };

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
            "table": [],
            "countLines": 0,
            "countRows": 0
        };

    }

    public componentDidMount (): void {
        this._loadTable();
    }

    public componentDidUpdate (prevProps: iProps): void {

        if (prevProps.tablename !== this.props.tablename) {
            this._loadTable();
        }

    }

    // private

    private _loadTable (): void {

        this.setState({
            "loading": false
        });

        this._sdk.getTableByName(this.props.tablename).then((table: components["schemas"]["Table"]): void => {

            this.setState({
                "loading": false,
                "table": table
            });

        }).catch((err: Error): void => {

            this.setState({
                "loading": false
            });

            this.props.onError(err);

        });

    }

    // interface handlers

    private readonly _handleSeeTable = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        let url: keyof paths = "/mia-stream-deck/public/table.html";
        url += "?tablename=" + this.props.tablename;

        const redirectWindow: WindowProxy | null = window.open(url, "_blank");

        if (redirectWindow) {
            redirectWindow.focus();
        }

    };

    private readonly _handleDeleteTable = (e: React.MouseEvent<HTMLButtonElement>): void => {

        e.stopPropagation();
        e.preventDefault();

        this._sdk.deleteTableByName(this.props.tablename).then((): void => {

            this.setState({
                "running": false
            });

        }).catch((err: Error): void => {

            this.setState({
                "running": false
            });

            this.props.onError(err);

        });

    };

    private readonly _handleChangeCountLines = (e: React.MouseEvent<HTMLInputElement>, newValue: number): void => {

        if (this.state.countLines < newValue) {

            this.setState({
                "table": [
                    ...this.state.table,
                    ...(Array(newValue - this.state.countLines) as Array<Array<components["schemas"]["Command"]>>).fill( // new lines
                        (Array(this.state.countRows) as Array<components["schemas"]["Command"]>).fill(EMPTY_COMMAND) // new rows
                    )
                ],
                "countLines": newValue
            });

        }
        else if (this.state.countLines > newValue) {

            this.setState({
                "table": this.state.table.slice(0, newValue),
                "countLines": newValue
            });

        }

    };

    private readonly _handleChangeCountRows = (e: React.MouseEvent<HTMLInputElement>, newValue: number): void => {

        if (0 >= this.state.countLines) {
            return;
        }

        if (this.state.countRows < newValue) {

            this.setState({
                "table": this.state.table.map((line: Array<components["schemas"]["Command"]>): Array<components["schemas"]["Command"]> => {
                    return [ ...line, ...(Array(newValue - line.length) as Array<components["schemas"]["Command"]>).fill(EMPTY_COMMAND) ];
                }),
                "countRows": newValue
            });

        }
        else if (this.state.countRows > newValue) {

            this.setState({
                "table": this.state.table.map((line: Array<components["schemas"]["Command"]>): Array<components["schemas"]["Command"]> => {
                    return line.slice(0, newValue);
                }),
                "countRows": newValue
            });

        }

    };

    private readonly _handleEditCommand = (e: React.MouseEvent<HTMLButtonElement>, indexLine: number, indexRow: number, command: components["schemas"]["Command"]): void => {

        e.preventDefault();
        e.stopPropagation();

        console.log({ indexLine, indexRow, command });

    };

    // render

    private _renderContent (): React.JSX.Element | string {

        if (this.state.loading) {
            return <Alert variant="warning">Loading...</Alert>;
        }
        else {

            return <Table borderless small>

                <TableHeader>

                    <tr>

                        <td colSpan={ this.state.countRows + 1 }>

                            <Range
                                min={ 0 } max={ MAX_LINES } step={ 1 }
                                disabled={ this.state.loading || this.state.running }
                                value={ this.state.countLines } onChange={ this._handleChangeCountLines }
                            >

                                <div className="input-group-text">
                                    { this.state.countLines }
                                </div>

                            </Range>

                        </td>

                    </tr>

                </TableHeader>

                <TableBody>

                    { 0 < this.state.countLines && <tr>

                        <td rowSpan={ this.state.countLines + 1 } className="p-3 pt-0 pb-0" style={{ "width": "2.4em" }}>

                            <Range
                                min={ 0 } max={ MAX_ROWS } step={ 1 }
                                disabled={ this.state.loading || this.state.running }
                                orientation="vertical"
                                className="flex-column align-items-center"
                                style={{
                                    "height": (this.state.countLines * 3) + "rem",
                                    "borderTopLeftRadius": "var(--bs-border-radius)",
                                    "borderTopRightRadius": "var(--bs-border-radius)",
                                    "borderBottomLeftRadius": "0",
                                    "borderBottomRightRadius": "0"
                                }}
                                value={ this.state.countRows } onChange={ this._handleChangeCountRows }
                            >
                                <div className="input-group-text ml-0" style={{
                                    "borderTopLeftRadius": 0,
                                    "borderTopRightRadius": 0,
                                    "borderBottomLeftRadius": "var(--bs-border-radius)",
                                    "borderBottomRightRadius": "var(--bs-border-radius)",
                                    "marginTop": "calc(var(--bs-border-width) * -1)"
                                }}>
                                    { this.state.countRows }
                                </div>
                            </Range>

                        </td>

                    </tr> }

                    { this.state.table.map((line: Array<components["schemas"]["Command"]>, indexLine: number): React.JSX.Element => {

                        return <tr key={ indexLine }>

                            { line.map((row: components["schemas"]["Command"], indexRow: number): React.JSX.Element => {

                                const _handleEditCommand = (e: React.MouseEvent<HTMLButtonElement>): void => {
                                    return this._handleEditCommand(e, indexLine, indexRow, row);
                                };

                                return <td key={ indexLine + "-" + indexRow }>

                                    <Button title={ row.action.type } variant="info" outline block
                                        onClick={ _handleEditCommand }
                                    >
                                        { row.action.type }
                                    </Button>

                                </td>;

                            }) }

                        </tr>;

                    }) }

                </TableBody>

            </Table>;

        }

    }

    public render (): React.JSX.Element {

        return <Card className="mt-3">

            <CardHeader>Edit table "{ this.props.tablename }"</CardHeader>

            <CardBody>

                <ButtonGroup block>

                    <Button icon="eye" variant="success"
                        disabled={ this.state.loading || this.state.running }
                        onClick={ this._handleSeeTable }
                    >
                        See table
                    </Button>

                    <Button icon="trash" variant="danger"
                        disabled={ this.state.loading || this.state.running }
                        onClick={ this._handleDeleteTable }
                    >
                        Delete table
                    </Button>

                </ButtonGroup>

            </CardBody>

            <CardBody>

                { this._renderContent() }

            </CardBody>

        </Card>;

    }

}
