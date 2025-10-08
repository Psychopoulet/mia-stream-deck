import { Server } from "node-pluginsmanager-plugin";
import type { iMediatorUserOptions } from "node-pluginsmanager-plugin";
export default class ServerStreamDeck extends Server {
    constructor(opts: iMediatorUserOptions);
    _initWorkSpace(): Promise<void>;
    _releaseWorkSpace(): Promise<void>;
    private _onCommandRunning;
    private _onCommandSuccess;
    private _onCommandFail;
}
