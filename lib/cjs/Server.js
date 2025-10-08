"use strict";
// deps
Object.defineProperty(exports, "__esModule", { value: true });
// externals
const node_pluginsmanager_plugin_1 = require("node-pluginsmanager-plugin");
// module
class ServerStreamDeck extends node_pluginsmanager_plugin_1.Server {
    constructor(opts) {
        super(opts);
        this._onCommandRunning = this._onCommandRunning.bind(this);
        this._onCommandSuccess = this._onCommandSuccess.bind(this);
        this._onCommandFail = this._onCommandFail.bind(this);
    }
    _initWorkSpace() {
        this._Mediator
            .on("command.running", this._onCommandRunning)
            .on("command.success", this._onCommandSuccess)
            .on("command.fail", this._onCommandFail);
        return Promise.resolve();
    }
    _releaseWorkSpace() {
        this._Mediator
            .off("command.running", this._onCommandRunning)
            .off("command.success", this._onCommandSuccess)
            .off("command.fail", this._onCommandFail);
        return Promise.resolve();
    }
    // events
    _onCommandRunning(command) {
        const event = command;
        this.push("command.running", event);
    }
    _onCommandSuccess(command, content) {
        const event = {
            "content": content,
            "command": command
        };
        this.push("command.success", event);
    }
    _onCommandFail(command, err) {
        const event = {
            "command": command,
            "error": {
                "code": "COMMAND",
                "message": err.message
            }
        };
        this.push("command.fail", event);
    }
}
exports.default = ServerStreamDeck;
