// deps

    // natives
    import { exec } from "node:child_process";
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// types & interfaces

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

        console.log("getTables");

        return Promise.resolve([
            "presentation"
        ]);

    }

    public getTableByName (urlParameters: operations["getTableByName"]["parameters"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> {

        console.log("getTableByName", urlParameters.path.tablename);

        return Promise.resolve([
            [
                {
                    "picture": "http://localhost:3000/public/pictures/warcraft3.png",
                    "action": {
                        "type": "COMMAND",
                        "command": "cd \"C:\\Users\\FlowUP\\Documents\\projects\\warcraft3sounds\" && npm run start"
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
                        "command": "vlc --intf dummy http://localhost:3000/public/sounds/PeonReady1.wav vlc://quit"
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

        console.log("executeCommand", bodyParameters);

        if ("COMMAND" === bodyParameters.action.type) {

            return new Promise((resolve: (value: unknown) => void, reject: (value: Error) => void): void => {

                const command: components["schemas"]["ActionCommand"] = bodyParameters.action as components["schemas"]["ActionCommand"];

                exec(command.command, (err: Error | null, stdout: string, stderr: string): void => {

                    if (err) {

                        console.log("err", err);

                        return reject(err);

                    }
                    else if (0 < stderr.length) {

                        console.log("stderr", stderr);

                        return reject(new Error(stderr));

                    }
                    else {

                        console.log("stdout", stdout);

                        return resolve(undefined);

                    }

                });

            });

        }

        return Promise.resolve();

    }

}
