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
		"table": components["schemas"]["Table"];
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
        }).then((res: Response): Promise<components["schemas"]["Table"]> => {

            if (res.ok) {
                return res.json();
            }
            else {
                return Promise.reject(new Error("Problem with request getTable has status '" + res.status + "' (" + res.statusText + ")"));
            }

        }).then((table: components["schemas"]["Table"]): void => {

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

	private _renderCommand (row: components["schemas"]["Command"]): React.JSX.Element {

		if ("empty" === row.action.type) {
			return <></>;
		}

		if (row.icon) {

			return <Button icon={ row.icon as tIcon } variant="secondary" outline className="w-100 h-100 d-block" onClick={ () => {
				alert("click Icon : " + JSON.stringify(row));
			} } />

		}
		else if (row.picture) {

			return <Image crossOrigin="anonymous" src={ row.picture } className="rounded h-100" onClick={ () => {
				alert("click Image : " + JSON.stringify(row));
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
