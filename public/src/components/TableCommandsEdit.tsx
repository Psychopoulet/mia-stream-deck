// deps

    // externals
    import React from "react";
    import {
        Alert,
        Card, CardHeader, CardBody,
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
        "table": components["schemas"]["Table"] | null;
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
            "table": null
        };

    }

    public componentDidMount (): void {

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

    // render

    private _renderContent (): React.JSX.Element | string {

        if (this.state.loading) {
            return <Alert variant="warning">Loading...</Alert>;
        }
        else if (!this.state.table) {
            return <Alert variant="warning">Table not found...</Alert>;
        }
        else {
            return JSON.stringify(this.state.table);
        }

    }

    public render (): React.JSX.Element {

        return <Card className="mt-3">

            <CardHeader>Edit table</CardHeader>

            <CardBody>

                <ButtonGroup block>

                    <Button icon="eye" variant="success"
                        onClick={ this._handleSeeTable }
                        disabled={ this.state.running }
                    >
                        See table
                    </Button>

                    <Button icon="trash" variant="danger"
                        onClick={ this._handleDeleteTable }
                        disabled={ this.state.running }
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
