// deps

    // natives
    import { spawn } from "node:child_process";
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator, NotFoundError } from "node-pluginsmanager-plugin";

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

    // attributes

        // private

        private _port: number;
        private _file: string;

    // constructor

    public constructor (data: iDescriptorUserOptions) {

        super(data);

        this._port = 0;
        this._file = "";

    }

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {

        this._port = (container.get("conf") as ConfManager).get("port") as number;
        this._file = join(this._externalRessourcesDirectory, "tables.json");

        return Promise.resolve();

    }

    protected _releaseWorkSpace  (): Promise<void> {
        return Promise.resolve();
    }

    // front files

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "dist", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.js"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{app.port}}/g, String(this._port))
                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {
        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.js.map"), "utf-8");
    }

    // api

    public getTables (): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> {

        return readFile(this._file, "utf-8").then((content: string) => {
            return JSON.parse(content);
        }).then((content: Record<string, components["schemas"]["Table"]>): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> => {
            return Promise.resolve(Object.keys(content));
        });

    }

    public getTableByName (urlParameters: operations["getTableByName"]["parameters"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> {

        return readFile(this._file, "utf-8").then((content: string) => {
            return JSON.parse(content);
        }).then((content: Record<string, components["schemas"]["Table"]>): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> => {

            if (!content[urlParameters.path.tablename]) {
                return Promise.reject(new NotFoundError("Table \"" + urlParameters.path.tablename + "\" not found"));
            }
            else {
                return Promise.resolve(content[urlParameters.path.tablename]);
            }

        });

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
