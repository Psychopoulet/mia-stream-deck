// deps

    // natives
    import { spawn } from "node:child_process";
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// types & interfaces

    // natives
    import type { ChildProcess } from "node:child_process";

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type ConfManager from "node-confmanager";
    import type { iDescriptorUserOptions } from "node-pluginsmanager-plugin";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorStreamDeck extends Mediator {

    protected _port: number;

    public constructor (data: iDescriptorUserOptions) {

        super(data);

        this._port = 0;

    }

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {

        this._port = (container.get("conf") as ConfManager).get("port") as number;

        return Promise.resolve();

    }

    protected _releaseWorkSpace  (container: ContainerPattern): Promise<void> {
        return Promise.resolve();
    }

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return readFile(join(__dirname, "..", "..", "public", "bundle.js"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{app.port}}/g, String(this._port))
                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {
        return readFile(join(__dirname, "..", "..", "public", "bundle.js.map"), "utf-8");
    }

    public getTables (): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> {

        return Promise.resolve([
            "presentation"
        ]);

    }

    public getTableByName (urlParameters: operations["getTableByName"]["parameters"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> {

        if ("presentation" !== urlParameters.path.tablename) {
            return Promise.resolve([]);
        }

        return Promise.resolve([
            [
                {
                    "picture": "http://localhost:3000/public/pictures/warcraft3.png",
                    "action": {
                        "type": "COMMAND",
                        "command": "npm run daemon-start",
                        "cwd": "C:\\Users\\FlowUP\\Documents\\projects\\warcraft3sounds",
                        "insideShell": true
                    }
                },
                {
                    "icon": "up",
                    "action": {
                        "type": "INPUT-KEY",
                        "key": "up"
                    }
                },
                {
                    "picture": "http://localhost:3000/public/pictures/warcraft3.png",
                    "action": {
                        "type": "COMMAND",
                        "command": "vlc --intf dummy http://localhost:3000/public/sounds/PeonReady1.wav vlc://quit",
                        "insideShell": true
                    }
                }
            ], [
                {
                    "icon": "left",
                    "action": {
                        "type": "INPUT-KEY",
                        "key": "left"
                    }
                },
                {
                    "action": {
                        "type": "EMPTY"
                    }
                },
                {
                    "icon": "right",
                    "action": {
                        "type": "INPUT-KEY",
                        "key": "right"
                    }
                }
            ], [
                {
                    "action": {
                        "type": "EMPTY"
                    }
                },
                {
                    "icon": "down",
                    "action": {
                        "type": "INPUT-KEY",
                        "key": "down"
                    }
                },
                {
                    "action": {
                        "type": "EMPTY"
                    }
                }
            ]
        ]);

    }

    public executeCommand (urlParameters: operations["executeCommand"]["parameters"], bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]> {

        if ("COMMAND" === bodyParameters.action.type) {

            return new Promise((resolve: (value: unknown) => void, reject: (value: Error) => void): void => {

                const command: components["schemas"]["ActionCommand"] = bodyParameters.action as components["schemas"]["ActionCommand"];

                let ended: boolean = false;
                let running: boolean = false;
                let stderr: string = "";
                let stdout: string = "";

                let options: Record<string, string | boolean> = {
                    "windowsHide": true
                };

                if ("undefined" !== typeof command.cwd) {
                    options.cwd = command.cwd;
                }
                if ("undefined" !== typeof command.detached) {
                    options.detached = command.detached;
                }
                if ("undefined" !== typeof command.shell) {
                    options.shell = command.shell;
                }
                else if ("undefined" !== typeof command.insideShell) {
                    options.shell = command.insideShell;
                }

                const childProcess: ChildProcess = spawn(command.command, options);

                childProcess.once("error", (err: Error): void => {

                    if (!ended) {

                        ended = true;

                        if (running) {
                            this.emit("command.fail", bodyParameters, err);
                        }

                        reject(err);

                    }

                }).once("spawn", (): void => {

                    running = true;

                    this.emit("command.running", bodyParameters);

                }).once("close", (code: number | null, signal: NodeJS.Signals | null): void => {

                    if (!ended) {

                        ended = true;

                        if (code) {

                            this.emit("command.fail", bodyParameters, new Error(stderr));

                            return reject(new Error(stderr));

                        }
                        else {

                            this.emit("command.success", bodyParameters, stdout);

                            return resolve(stdout);

                        }

                    }

                });

                if (childProcess.stderr) {

                    childProcess.stderr?.setEncoding("utf-8");

                    childProcess.stderr.on("data", (chunk: string): void => {
                        stderr += chunk;
                    });

                }

                if (childProcess.stdout) {

                    childProcess.stdout?.setEncoding("utf-8");

                    childProcess.stdout.on("data", (chunk: string): void => {
                        stdout += chunk;
                    });

                }

            });

        }

        return Promise.resolve();

    }

}
