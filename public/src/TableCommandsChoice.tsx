"use strict";

// deps

    // externals
    import React from "react";
    import { Alert } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "./sdk";
    import TableCommands from "./TableCommands";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { components } from "../../lib/src/Descriptor";
    import type { SDK } from "./sdk";

    interface iState {
        "loading": boolean;
        "tables": components["schemas"]["TableName"][];
    }

// component

export default class TableCommandsChoice extends React.Component<iPropsNode, iState> {

    // name

        public static displayName: string = "TableCommandsChoice";

    // private

        private _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iPropsNode) {

        super(props);

        this.state = {
            "loading": true,
            "tables": []
        };

    }

    public componentDidMount (): void {

        this._sdk.getTables().then((tablenames: components["schemas"]["TableName"][]): void => {

            this.setState({
                "loading": false,
                "tables": tablenames
            });

        }).catch((err: Error): void => {

            console.error(err);

            alert(err.message);

            this.setState({
                "loading": false
            });

        });

    }

    // render

    public render (): React.JSX.Element {

        if (this.state.loading) {

            return <div className="container">
                <Alert variant="warning">Loading...</Alert>
            </div>;

        }
        else {

            return <TableCommands name="presentation" />

        }

    }

};
