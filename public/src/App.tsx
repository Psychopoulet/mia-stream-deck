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

	interface iState {
		"table": components["schemas"]["Table"];
		"loading": boolean;
		"running": boolean;
	}

// component

export default class App extends React.Component<iPropsNode, iState> {

	// name

		public static displayName: string = "App";

	// private

		private _sdk: SDK = getSDK();

	// constructor

	public constructor (props: iPropsNode) {

		super(props);

		this.state = {
			"table": [],
			"loading": true,
			"running": false
		};

	}

	public componentDidMount (): void {

		this.setState({
			"table": [],
			"loading": true
		});

		this._sdk.getTables().then((tablenames: components["schemas"]["TableName"][]): Promise<components["schemas"]["Table"]> => {

			return this._sdk.getTableByName("presentation");

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

        }).catch((err: Error): void => {

            console.error(err);

            alert(err.message);

			this.setState({
				"loading": false
			});

        });

	}

	// events

	private _executeCommand (cmd: components["schemas"]["Command"]): void {

		this.setState({
			"running": true
		});

		this._sdk.executeCommand(cmd).then((): void => {

			alert("running");

			this.setState({
				"running": false
			});

		}).catch((err: Error): void => {

            console.error(err);

            alert(err.message);

			this.setState({
				"running": false
			});

        });

	}

	// render

	private _renderCommand (cmd: components["schemas"]["Command"]): React.JSX.Element {

		if ("empty" === cmd.action.type) {
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
