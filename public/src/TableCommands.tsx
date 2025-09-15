"use strict";

// deps

    // externals
    import React from "react";
    import { Alert, Button, Image, Table, TableBody } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "./sdk";

// types & interfaces

    // externals
    import type { iPropsNode, tIcon } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../lib/src/Descriptor";
    import type { SDK } from "./sdk";

    interface iProps extends iPropsNode {
        "name": string;
    }

    interface iState {
        "loading": boolean;
        "running": boolean;
        "table": components["schemas"]["Table"];
    }

// component

export default class TableCommands extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "TableCommands";

    // private

        private _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "loading": false,
            "running": false,
            "table": []
        };

        this._onCommandRunning = this._onCommandRunning.bind(this);
        this._onCommandSuccess = this._onCommandSuccess.bind(this);
        this._onCommandFail = this._onCommandFail.bind(this);

    }

    public componentDidMount (): void {

        this.setState({
            "table": [],
            "loading": true
        });

        this._sdk
            .on("command.running", this._onCommandRunning)
            .on("command.fail", this._onCommandFail)
            .on("command.success", this._onCommandSuccess);

        this._sdk.getTableByName("presentation").then((table: components["schemas"]["Table"]): void => {

            this.setState({
                "table": table,
                "loading": false
            });

        }).catch((err: Error): void => {

            console.error(err);

            alert(err.message);

            this.setState({
                "loading": false
            });

        }).catch((err: Error): void => {

            console.error(err);

            alert(err.message);

            this.setState({
                "loading": false
            });

        });

    }

    public componentWillUnmount(): void {

        this._sdk
            .off("command.running", this._onCommandRunning)
            .off("command.fail", this._onCommandFail)
            .off("command.success", this._onCommandSuccess);

    }

    // events

    private _onCommandRunning (cmd: components["schemas"]["Command"]): void {

        console.log("_onCommandRunning", cmd);

        this.setState({
            "running": true
        });

    }

    private _onCommandFail (cmd: components["schemas"]["Command"], err: components["schemas"]["Error"]): void {

        console.log("_onCommandFail", cmd, err);

        console.error(err);

        alert(err.message);

        this.setState({
            "running": false
        });

    }

    private _onCommandSuccess (cmd: components["schemas"]["Command"]): void {

        console.log("_onCommandSuccess", cmd);

        this.setState({
            "running": false
        });

    }

    // handlers

    private _executeCommand (cmd: components["schemas"]["Command"]): void {

        this._sdk.executeCommand(cmd).catch((err: Error): void => {

            console.error(err);

            alert(err.message);

            this.setState({
                "running": false
            });

        });

    }

    // render

    private _renderCommand (cmd: components["schemas"]["Command"]): React.JSX.Element {

        if ("EMPTY" === cmd.action.type) {
            return <></>;
        }

        if (cmd.icon) {

            return <Button
                icon={ cmd.icon as tIcon } variant="secondary"
                className="w-100 h-100 d-block" outline
                disabled={ this.state.running }
                onClick={ (e: React.MouseEvent<HTMLButtonElement>): void => {

                e.preventDefault();
                e.stopPropagation();

                return this._executeCommand(cmd);

            } } />

        }
        else if (cmd.picture) {

            return <Image crossOrigin="anonymous" src={ cmd.picture }
                className="rounded h-100"
                onClick={ (e: React.MouseEvent<HTMLImageElement>): void => {

                e.preventDefault();
                e.stopPropagation();

                if (this.state.running) {
                    return;
                }

                return this._executeCommand(cmd);

            } } />

        }
        else {
            return <span>{ JSON.stringify(cmd) }</span>;
        }

    }

    public render (): React.JSX.Element {

        if (this.state.loading) {

            return <div className="container">
                <Alert variant="warning">Loading...</Alert>
            </div>;

        }

        let countMaxRows: number = 0;

        this.state.table.forEach((line: components["schemas"]["Command"][]): void => {

            if (countMaxRows < line.length) {
                countMaxRows = line.length;
            }

        });

        const maxPercentLineSize: number = 100 / this.state.table.length;
        const maxPercentRowSize: number = 100 / countMaxRows;

        return <Table borderless className="m-0 p-0 vh-100">

            <TableBody>

                { this.state.table.map((line: components["schemas"]["Command"][], indexLine: number): React.JSX.Element => {

                    return <tr key={ indexLine }>

                        { line.map((row: components["schemas"]["Command"], indexRow: number): React.JSX.Element => {

                            return <td key={ indexLine + "-" + indexRow } className="text-center" style={{
                                "height": maxPercentLineSize + "%",
                                "width": maxPercentRowSize + "%"
                            }}>

                                { this._renderCommand(row) }

                            </td>;

                        }) }

                    </tr>;

                }) }

            </TableBody>

        </Table>;

    }

};
