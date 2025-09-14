"use strict";

// deps

    // externals
    import React from "react";
    import { Alert, SelectLabel } from "react-bootstrap-fontawesome";

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
        "tablename": string;
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
            "tables": [],
            "tablename": ""
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

    // events

    private _handleChangeTable (e: React.ChangeEvent<HTMLSelectElement>, newValue: string): void {

        e.stopPropagation();
        e.preventDefault();

        this.setState({
            "tablename": newValue
        });

    }

    // render

    public render (): React.JSX.Element {

        if (this.state.loading) {

            return <div className="container">
                <Alert variant="warning">Loading...</Alert>
            </div>;

        }
        else if (0 >= this.state.tablename.length || !this.state.tables.find((value: string): boolean => {
            return value === this.state.tablename;
        })) {

            return <div className="container">

                <SelectLabel label="Choose table" value={ this.state.tablename } onChange={ this._handleChangeTable.bind(this) }>

                    <option value="">-</option>

                    { this.state.tables.map((value: string, key: number): React.JSX.Element => {
                        return <option key={ key } value={ value }>{ value }</option>;
                    }) }

                </SelectLabel>

            </div>

        }
        else {

            return <TableCommands name={ this.state.tablename } />

        }

    }

};
