// deps

    // externals
    import { Server } from "node-pluginsmanager-plugin";

// types & interfaces

    // externals
    import type { iMediatorUserOptions } from "node-pluginsmanager-plugin";

    // locals
    import type { components } from "./Descriptor";
    import type MediatorStreamDeck from "./Mediator";

// module

export default class ServerStreamDeck extends Server {

    public constructor (opts: iMediatorUserOptions) {

        super(opts);

        this._onCommandRunning = this._onCommandRunning.bind(this);
        this._onCommandSuccess = this._onCommandSuccess.bind(this);
        this._onCommandFail = this._onCommandFail.bind(this);

    }

    public _initWorkSpace (): Promise<void> {

        (this._Mediator as MediatorStreamDeck)
            .on("command.running", this._onCommandRunning)
            .on("command.success", this._onCommandSuccess)
            .on("command.fail", this._onCommandFail);

        return Promise.resolve();

    }

    public _releaseWorkSpace (): Promise<void> {

        (this._Mediator as MediatorStreamDeck)
            .off("command.running", this._onCommandRunning)
            .off("command.success", this._onCommandSuccess)
            .off("command.fail", this._onCommandFail);

        return Promise.resolve();

    }

    // events

    private _onCommandRunning (command: components["schemas"]["Command"]): void {

        const event: components["schemas"]["PushEventCommandRunning"]["data"] = command;

        this.push("command.running", event);

    }

    private _onCommandSuccess (command: components["schemas"]["Command"], content: string): void {

        const event: components["schemas"]["PushEventCommandSuccess"]["data"] = {
            "content": content,
            "command": command
        };

        this.push("command.success", event);

    }

    private _onCommandFail (command: components["schemas"]["Command"], err: components["schemas"]["Error"]): void {

        const event: components["schemas"]["PushEventCommandFail"]["data"] = {
            "command": command,
            "error": err
        };

        this.push("command.fail", event);

    }

}
