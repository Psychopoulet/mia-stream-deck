"use strict";

// deps

	// externals
    import React from "react";
    import { Alert } from "react-bootstrap-fontawesome";

	// locals
    import getSDK from "./sdk";
    import TableCommandsChoice from "./TableCommandsChoice";

// types & interfaces

	// externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

	// locals
    import type { SDK } from "./sdk";

	interface iState {
		"connected": boolean;
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
			"connected": false
		};

	}

	public componentDidMount (): void {

		this._sdk.on("connected", (): void => {

			this.setState({
				"connected": true
			});

		}).on("disconnected", (): void => {

			this.setState({
				"connected": false
			});

		});

	}

	// render

	public render (): React.JSX.Element {

		if (!this.state.connected) {

			return <div className="container">
				<Alert variant="warning">Not connected yet...</Alert>
			</div>;

		}
		else {

			return <TableCommandsChoice />

		}

	}

};
