// deps

    // externals
    import { Server } from "node-pluginsmanager-plugin";

// types & interfaces

    // locals
    import type MediatorStreamDeck from "./Mediator";
    import type { components } from "./Descriptor";

// module

export default class ServerStreamDeck extends Server {

    public _initWorkSpace (): Promise<void> {

        (this._Mediator as MediatorStreamDeck)

            .on("initialized", this._onPluginInitialized)
            .on("released", this._onPluginReleased)
            .on("error", this._onPluginError)

            .on("table.added", this._onTableAdded)
            .on("table.deleted", this._onTableDeleted)

            .on("command.running", this._onCommandRunning)
            .on("command.success", this._onCommandSuccess)
            .on("command.fail", this._onCommandFail);

        return Promise.resolve();

    }

    public _releaseWorkSpace (): Promise<void> {

        (this._Mediator as MediatorStreamDeck)

            .off("initialized", this._onPluginInitialized)
            .off("released", this._onPluginReleased)
            .off("error", this._onPluginError)

            .off("table.added", this._onTableAdded)
            .off("table.deleted", this._onTableDeleted)

            .off("command.running", this._onCommandRunning)
            .off("command.success", this._onCommandSuccess)
            .off("command.fail", this._onCommandFail);

        return Promise.resolve();

    }

    // events

    private readonly _onPluginInitialized = (): void => {

        this.push("initialized");

    };

    private readonly _onPluginReleased = (): void => {

        this.push("released");

    };

    private readonly _onPluginError = (data: components["schemas"]["PushEventPluginError"]["data"]): void => {

        this.push("error", data);

    };

    private readonly _onTableAdded = (tableName: components["schemas"]["TableName"]): void => {

        const event: components["schemas"]["PushEventTableAdded"]["data"] = tableName;

        this.push("table.added", event);

    };

    private readonly _onTableDeleted = (tableName: components["schemas"]["TableName"]): void => {

        const event: components["schemas"]["PushEventTableDeleted"]["data"] = tableName;

        this.push("table.deleted", event);

    };

    private readonly _onCommandRunning = (command: components["schemas"]["Command"]): void => {

        const event: components["schemas"]["PushEventCommandRunning"]["data"] = command;

        this.push("command.running", event);

    };

    private readonly _onCommandSuccess = (command: components["schemas"]["Command"], content: string): void => {

        const event: components["schemas"]["PushEventCommandSuccess"]["data"] = {
            "content": content,
            "command": command
        };

        this.push("command.success", event);

    };

    private readonly _onCommandFail = (command: components["schemas"]["Command"], err: components["schemas"]["Error"]): void => {

        const event: components["schemas"]["PushEventCommandFail"]["data"] = {
            "command": command,
            "error": err
        };

        this.push("command.fail", event);

    };

}
