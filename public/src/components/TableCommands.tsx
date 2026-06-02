// deps

    // externals
    import React from "react";
    import { Alert, Button, Image, Table, TableBody } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";

// types & interfaces

    // externals
    import type { iPropsNode, tIcon } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../../lib/src/Descriptor";
    import type { SDK } from "../SDK";

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
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

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iProps) {

        super(props);

        this.state = {
            "loading": false,
            "running": false,
            "table": []
        };

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

        this._sdk.getTableByName(this.props.name).then((table: components["schemas"]["Table"]): void => {

            this.setState({
                "table": table,
                "loading": false
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
            .off("command.running", this._onCommandRunning)
            .off("command.fail", this._onCommandFail)
            .off("command.success", this._onCommandSuccess);

    }

    // events

    private _onCommandRunning (): void {

        this.setState({
            "running": true
        });

    }

    private _onCommandFail (cmd: components["schemas"]["Command"], err: components["schemas"]["Error"]): void {

        alert(err.message);

        this.setState({
            "running": false
        });

        this.props.onError(new Error(err.message));

    }

    private _onCommandSuccess (): void {

        this.setState({
            "running": false
        });

    }

    // handlers

    private _executeCommand (cmd: components["schemas"]["Command"]): void {

        this._sdk.executeCommand(cmd).catch((err: Error): void => {

            this.setState({
                "running": false
            });

            this.props.onError(err);

        });

    }

    // render

    public render (): React.JSX.Element {

        if (this.state.loading) {

            return <div className="container">
                <Alert variant="warning">Loading...</Alert>
            </div>;

        }

        let countMaxRows: number = 0;

        this.state.table.forEach((line: Array<components["schemas"]["Command"]>): void => {

            if (countMaxRows < line.length) {
                countMaxRows = line.length;
            }

        });

        const maxPercentLineSize: number = 100 / this.state.table.length;
        const maxPercentRowSize: number = 100 / countMaxRows;

        return <Table borderless className="m-0 p-0 vh-100">

            <TableBody>

                { this.state.table.map((line: Array<components["schemas"]["Command"]>, indexLine: number): React.JSX.Element => {

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

    private _renderCommand (cmd: components["schemas"]["Command"]): React.JSX.Element {

        if ("EMPTY" === cmd.action.type) {
            return <></>;
        }

        if (cmd.icon) {
            return this._renderCommandIcon(cmd);
        }
        else if (cmd.picture) {
            return this._renderCommandPicture(cmd);
        }
        else if (cmd.label) {
            return this._renderCommandLabel(cmd);
        }
        else {

            return this._renderCommandIcon({
                ...cmd,
                "icon": "question"
            });

        }

    }

    private _renderCommandIcon (cmd: components["schemas"]["Command"]): React.JSX.Element {

        return <Button title={ cmd.label }
            icon={ cmd.icon as tIcon } variant="secondary"
            className="w-100 h-100 d-block" outline
            disabled={ this.state.running }
            onClick={ (e: React.MouseEvent<HTMLButtonElement>): void => {

            e.preventDefault();
            e.stopPropagation();

            return this._executeCommand(cmd);

        } }>
            { cmd.label }
        </Button>;

    }

    private _renderCommandPicture (cmd: components["schemas"]["Command"]): React.JSX.Element {

        return <Image crossOrigin="anonymous" src={ cmd.picture as string }
            className="rounded h-100"
            onClick={ (e: React.MouseEvent<HTMLImageElement>): void => {

            e.preventDefault();
            e.stopPropagation();

            if (this.state.running) {
                return;
            }

            return this._executeCommand(cmd);

        } } />;

    }

    private _renderCommandLabel (cmd: components["schemas"]["Command"]): React.JSX.Element {

        return <Button title={ cmd.label }
            variant="secondary"
            className="w-100 h-100 d-block" outline
            disabled={ this.state.running }
            onClick={ (e: React.MouseEvent<HTMLButtonElement>): void => {

            e.preventDefault();
            e.stopPropagation();

            return this._executeCommand(cmd);

        } }>
            { cmd.label }
        </Button>;

    }

}
