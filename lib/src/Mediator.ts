// deps

    // natives
    import { readFile, writeFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator, NotFoundError } from "node-pluginsmanager-plugin";
    import robotjs from "@hurdlegroup/robotjs";

// types & interfaces

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
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
    "table.added": [ components["schemas"]["PushEventTableAdded"]["data"] ];
    "table.deleted": [ components["schemas"]["PushEventTableDeleted"]["data"] ];
    "command.running": [ components["schemas"]["PushEventCommandRunning"]["data"] ];
    "command.fail": [ components["schemas"]["PushEventCommandFail"]["data"]["command"], components["schemas"]["PushEventCommandFail"]["data"]["error"] ];
    "command.success": [ components["schemas"]["PushEventCommandSuccess"]["data"]["command"], components["schemas"]["PushEventCommandSuccess"]["data"]["content"] ];
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

        return readFile(join(__dirname, "..", "..", "public", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getTablePage (urlParameters: operations["getTablePage"]["parameters"]): Promise<operations["getTablePage"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "table.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription())
                .replace(/{{tablename}}/g, urlParameters.query.tablename);

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

    public getFrontAppMap (): Promise<string> { // tricks return to avoid costful parsing
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

            if ("undefined" === typeof content[urlParameters.path.tablename]) {
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

        }).then((): void => {
            this.emit("table.added", urlParameters.path.tablename);
        });

    }

    public deleteTableByName (urlParameters: operations["deleteTableByName"]["parameters"]): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> {

        return readFile(this._file, "utf-8").then((content: string): Record<string, components["schemas"]["Table"]> => {
            return JSON.parse(content) as Record<string, components["schemas"]["Table"]>;
        }).then((content: Record<string, components["schemas"]["Table"]>): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> => {

            if ("undefined" === typeof content[urlParameters.path.tablename]) {
                return Promise.reject(new NotFoundError("Table \"" + urlParameters.path.tablename + "\" not found"));
            }
            else {

                return writeFile(this._file, JSON.stringify(Object.fromEntries(
                    Object.entries(content).filter(([ key ]) => {
                        return key !== urlParameters.path.tablename;
                    })
                )), "utf-8");

            }

        }).then((): void => {
            this.emit("table.deleted", urlParameters.path.tablename);
        });

    }

    public executeCommand (urlParameters: operations["executeCommand"]["parameters"], bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<operations["executeCommand"]["responses"]["201"]["content"]["application/json"]> {

        return Promise.resolve().then((): Promise<void> => {

            switch (bodyParameters.action.type) {

                case "EMPTY":

                    return Promise.resolve();

                case "INPUT-STRING":

                    return this._executeActionInputString(bodyParameters);

                case "INPUT-KEY":

                    return this._executeActionInputKey(bodyParameters);

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

                if ("boolean" === typeof command.enter && command.enter) {
                    robotjs.keyTap("enter");
                }

                return resolve();

            }
            catch (e: unknown) {

                return reject(e instanceof Error ? e : new Error(String(e)));

            }

        });

    }

    private _executeActionInputKey (bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

            try {

                const command: components["schemas"]["ActionInputKey"] = bodyParameters.action as components["schemas"]["ActionInputKey"];

                const modifiers: string[] = [];

                if ("boolean" === typeof command.alt && command.alt) {
                    modifiers.push("alt");
                }
                if ("boolean" === typeof command.ctrl && command.ctrl) {
                    modifiers.push("control");
                }
                if ("boolean" === typeof command.shift && command.shift) {
                    modifiers.push("shift");
                }
                if ("boolean" === typeof command.command && command.command) {
                    modifiers.push("command");
                }

                // https://www.piathome.com/homepage/docs/robotjs-key-syntax.html
                robotjs.keyTap(command.key, modifiers);

                return resolve();

            }
            catch (e: unknown) {

                return reject(e instanceof Error ? e : new Error(String(e)));

            }

        });

    }

    private _executeActionPlugin (bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => { // eslint-disable-line consistent-return

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
            else {

                const pluginWithtypedSubPluginMethod: Record<string, tSubPluginMethod> = plugin as unknown as Record<string, tSubPluginMethod>;

                if ("undefined" === typeof pluginWithtypedSubPluginMethod[command.operationId]) {
                    return reject(new NotFoundError("Unknown \"" + command.operationId + "\" operationId method \" for " + command.plugin + "\" plugin"));
                }
                else if ("function" !== typeof pluginWithtypedSubPluginMethod[command.operationId]) {
                    return reject(new Error("\"" + command.operationId + "\" operationId method \" for " + command.plugin + "\" plugin is not a valid method"));
                }

                pluginWithtypedSubPluginMethod[command.operationId](command.urlParameters, command.bodyParameters).then((): void => {
                    return resolve();
                }).catch((err: Error): void => {
                    return reject(err);
                });

            }

        });

    }

}
