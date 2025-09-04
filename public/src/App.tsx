"use strict";

// deps

	// externals
    import React from "react";
    import { Alert, Button, Image, Table, TableBody } from "react-bootstrap-fontawesome";

// types & interfaces

	// externals
    import type { iPropsNode, tIcon } from "react-bootstrap-fontawesome";

	// locals
    import type { components } from "../../lib/src/Descriptor";

	interface iState {
		"table": components["schemas"]["Line"][];
		"loading": boolean;
	}

// component

export default class App extends React.Component<iPropsNode, iState> {

	// name

		public static displayName: string = "App";

	// constructor

	public constructor (props: iPropsNode) {

		super(props);

		this.state = {
			"table": [],
			"loading": true
		};

	}

	public componentDidMount (): void {

		this.setState({
			"table": [],
			"loading": true
		});

        fetch("/{{plugin.name}}/api/table", {
            "method": "get"
        }).then((res: Response): Promise<components["schemas"]["Line"][]> => {

            if (res.ok) {
                return res.json();
            }
            else {
                return Promise.reject(new Error("Problem with request getTable has status '" + res.status + "' (" + res.statusText + ")"));
            }

        }).then((table: components["schemas"]["Line"][]): void => {

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

        });

	}

	// render

	private _renderRow (row: components["schemas"]["Row"]): React.JSX.Element {

		if ("empty" === row.action.type) {
			return <></>;
		}

		if (row.icon) {

			return <Button icon={ row.icon as tIcon } block onClick={ () => {
				console.log("click Icon", row);
			} } />

		}
		else if (row.picture) {

			return <Image crossOrigin="anonymous" src={ row.picture } onClick={ () => {
				console.log("click Image", row);
			} } />

		}
		else {
			return <span>{ JSON.stringify(row) }</span>;
		}

	}

	public render (): React.JSX.Element {

		if (this.state.loading) {
			return <Alert variant="warning">Loading...</Alert>;
		}

		let countMaxRow: number = 0;

		this.state.table.forEach((line: components["schemas"]["Line"]): void => {

			if (countMaxRow < line.length) {
				countMaxRow = line.length;
			}

		});

		console.log("countMaxRow", countMaxRow);

		const maxPercentRowSize: number = 100 / countMaxRow;

		return <Table borderless className="m-0" style={{
			"minHeight": "100vh"
		}}>

			<TableBody>

				{ this.state.table.map((line: components["schemas"]["Line"], indexLine: number): React.JSX.Element => {

					return <tr key={ indexLine }>

						{ line.map((row: components["schemas"]["Row"], indexRow: number): React.JSX.Element => {

							return <td key={ indexLine + "-" + indexRow } style={{ "width": maxPercentRowSize + "%" }}>

								{ this._renderRow(row) }

							</td>;

						}) }

					</tr>;

				}) }

			</TableBody>

		</Table>;

	}

};
