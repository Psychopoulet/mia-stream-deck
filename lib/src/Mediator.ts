// deps

    // natives
    import { spawn } from "node:child_process";
    import { readFile, writeFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator, NotFoundError } from "node-pluginsmanager-plugin";
    import robotjs from "@hurdlegroup/robotjs";

// types & interfaces

    // natives
    import type { ChildProcess } from "node:child_process";

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type { iEventsMinimal, iDescriptorUserOptions, Orchestrator, iUrlAllowedParameters } from "node-pluginsmanager-plugin";
    import type Pluginsmanager from "node-pluginsmanager";

    // locals
    import type { operations, components } from "./Descriptor";
    type tSubPluginMethod = (urlParameters?: iUrlAllowedParameters, bodyParameters?: unknown) => Promise<unknown>;

// module

export default class MediatorStreamDeck extends Mediator<iEventsMinimal & {
        "initialized": [ ContainerPattern ];
        "released": [ ContainerPattern ];
        "command.running": [ components["schemas"]["Command"] ];
        "command.fail": [ components["schemas"]["Command"], components["schemas"]["Error"] ];
        "command.success": [ components["schemas"]["Command"], string ];
    }> {

    // attributes

        // private

        private _file: string;
        private _pluginsManager: Pluginsmanager | null;

    // constructor

    public constructor (data: iDescriptorUserOptions) {

        super(data);

        // attributes

        this._file = "";
        this._pluginsManager = null;

    }

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {

        this._file = join(this._externalResourcesDirectory, "tables.json");
        this._pluginsManager = container.get<Pluginsmanager>("plugins-manager");

        return Promise.resolve();

    }

    protected _releaseWorkSpace (): Promise<void> {

        this._file = "";
        this._pluginsManager = null;

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

        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {
        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js.map"), "utf-8");
    }

    // api

    public getTables (): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> {

        return readFile(this._file, "utf-8").then((content: string): Record<string, components["schemas"]["Table"]> => {
            return JSON.parse(content) as Record<string, components["schemas"]["Table"]>;
        }).then((content: Record<string, components["schemas"]["Table"]>): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> => {
            return Promise.resolve(Object.keys(content));
        });

    }

    public getTableByName (urlParameters: operations["getTableByName"]["parameters"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> {

        return readFile(this._file, "utf-8").then((content: string): Record<string, components["schemas"]["Table"]> => {
            return JSON.parse(content) as Record<string, components["schemas"]["Table"]>;
        }).then((content: Record<string, components["schemas"]["Table"]>): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> => {

            if (!content[urlParameters.path.tablename]) {
                return Promise.reject(new NotFoundError("Table \"" + urlParameters.path.tablename + "\" not found"));
            }
            else {
                return Promise.resolve(content[urlParameters.path.tablename]);
            }

        });

    }

    public addTable (urlParameters: operations["addTable"]["parameters"]): Promise<operations["addTable"]["responses"]["201"]["content"]["application/json"]> {

        return readFile(this._file, "utf-8").then((content: string): Record<string, components["schemas"]["Table"]> => {
            return JSON.parse(content) as Record<string, components["schemas"]["Table"]>;
        }).then((content: Record<string, components["schemas"]["Table"]>): Promise<operations["addTable"]["responses"]["201"]["content"]["application/json"]> => {

            content[urlParameters.path.tablename] = [];

            return writeFile(this._file, JSON.stringify(content), "utf-8");

        });

    }

    public deleteTableByName (urlParameters: operations["deleteTableByName"]["parameters"]): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> {

        return readFile(this._file, "utf-8").then((content: string): Record<string, components["schemas"]["Table"]> => {
            return JSON.parse(content) as Record<string, components["schemas"]["Table"]>;
        }).then((content: Record<string, components["schemas"]["Table"]>): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> => {

            if (!content[urlParameters.path.tablename]) {
                return Promise.reject(new NotFoundError("Table \"" + urlParameters.path.tablename + "\" not found"));
            }
            else {

                delete content[urlParameters.path.tablename];

                return writeFile(this._file, JSON.stringify(content), "utf-8");

            }

        });

    }

    public executeCommand (urlParameters: operations["executeCommand"]["parameters"], bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]> {

        return Promise.resolve().then((): Promise<void> => {

            switch (bodyParameters.action.type) {

                case "EMPTY":

                    return Promise.resolve();

                case "INPUT-STRING":

                    return this._executeActionInputString(bodyParameters);

                case "INPUT-KEY":

                    return this._executeActionInputKey(bodyParameters);

                case "COMMAND":

                    return this._executeActionCommand(bodyParameters);

                case "PLUGIN":

                    return this._executeActionPlugin(bodyParameters);

                // force catch not typed action type
                default:
                    return Promise.reject(new NotFoundError("Unknown \"" + (bodyParameters.action as Record<string, string>).type + "\" action type"));

            }

        }).catch((err: Error): Promise<void> => {

            this._log("error", err.message);

            return Promise.reject(err);

        });

    }

    private _executeActionInputString (bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

            try {

                const command: components["schemas"]["ActionInputString"] = bodyParameters.action as components["schemas"]["ActionInputString"];

                robotjs.typeString(command.string);

                if (command.enter) {
                    robotjs.keyTap("enter");
                }

                return resolve();

            }
            catch (e) {

                return reject(e as Error);

            }

        });

    }

    private _executeActionInputKey (bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

            try {

                const command: components["schemas"]["ActionInputKey"] = bodyParameters.action as components["schemas"]["ActionInputKey"];

                const modifiers: string[] = [];

                if (command.alt) {
                    modifiers.push("alt");
                }
                if (command.ctrl) {
                    modifiers.push("control");
                }
                if (command.shift) {
                    modifiers.push("shift");
                }
                if (command.command) {
                    modifiers.push("command");
                }

                // https://www.piathome.com/homepage/docs/robotjs-key-syntax.html
                robotjs.keyTap(command.key, modifiers);

                return resolve();

            }
            catch (e) {

                return reject(e as Error);

            }

        });

    }

    private _executeActionCommand (bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: (value: string) => void, reject: (value: Error) => void): void => {

            const command: components["schemas"]["ActionCommand"] = bodyParameters.action as components["schemas"]["ActionCommand"];

            let ended: boolean = false;
            let running: boolean = false;
            let stderr: string = "";
            let stdout: string = "";

            const options: Record<string, string | boolean> = {
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

                        this.emit("command.fail", bodyParameters, {
                            "code": "COMMAND",
                            "message": err.message
                        });

                    }

                    reject(err);

                }

            }).once("spawn", (): void => {

                running = true;

                this.emit("command.running", bodyParameters);

            }).once("close", (code: number | null): void => {

                if (!ended) {

                    ended = true;

                    if (code) {

                        this.emit("command.fail", bodyParameters, {
                            "code": "COMMAND",
                            "message": stderr
                        });

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

        // force return nothing
        }).then((): Promise<void> => {
            return Promise.resolve();
        });

    }

    private _executeActionPlugin (bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

            const command: components["schemas"]["ActionPlugin"] = bodyParameters.action as components["schemas"]["ActionPlugin"];

            if (!(this._pluginsManager as Pluginsmanager).getPluginsNames().includes(command.plugin)) {
                return reject(new NotFoundError("Unknown \"" + command.plugin + "\" plugin"));
            }

            const plugin: Orchestrator | undefined = (this._pluginsManager as Pluginsmanager).plugins.find((value: Orchestrator): boolean => {
                return value.name === command.plugin;
            });

            if (!plugin) {
                return reject(new NotFoundError("Unknown \"" + command.plugin + "\" plugin"));
            }
            else if ("undefined" === typeof (plugin as Record<string, any>)[command.operationId]) {
                return reject(new NotFoundError("Unknown \"" + command.operationId + "\" operationId method \" for " + command.plugin + "\" plugin"));
            }
            else if ("function" !== typeof (plugin as Record<string, any>)[command.operationId]) {
                return reject(new Error("\"" + command.operationId + "\" operationId method \" for " + command.plugin + "\" plugin is not a valid method"));
            }

            ((plugin as Record<string, any>)[command.operationId] as tSubPluginMethod)(command.urlParameters, command.bodyParameters).then((): void => {
                return resolve();
            }).catch((err: Error): void => {
                return reject(err);
            });

        });

    }

}
