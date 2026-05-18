"use strict";

// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // locals

    import type { components, operations, paths } from "../../lib/src/Descriptor";

// component

export class SDK extends EventEmitter<{
    "connected": [];
    "disconnected": [ number, string ];
    "command.running": [ components["schemas"]["Command"] ];
    "command.fail": [ components["schemas"]["Command"], components["schemas"]["Error"] ];
    "command.success": [ components["schemas"]["Command"], string ];
}> {

    public constructor () {

        super();

        const socket = new WebSocket(
            ("https:" === window.location.protocol ? "wss:" : "ws:")
            + "//" + window.location.host
        );

        socket.addEventListener("error", (err: Event): void => {
            console.error("socket error", err);
        });

        socket.addEventListener("open", (): void => {
            this.emit("connected");
        });

        socket.addEventListener("close", (data: CloseEvent): void => {
            this.emit("disconnected", data.code, data.reason);
        });

        socket.addEventListener("message", (message: MessageEvent): void => {

            const parsedMessage: components["schemas"]["PushEventCommandRunning"] | components["schemas"]["PushEventCommandSuccess"] | components["schemas"]["PushEventCommandFail"] = JSON.parse(message.data);

            if ("mia-stream-deck" === parsedMessage.plugin) {

                switch (parsedMessage.command) {

                    case "command.running":
                        this.emit(parsedMessage.command, parsedMessage.data);
                    break;

                    case "command.success":
                        this.emit(parsedMessage.command, parsedMessage.data.command, parsedMessage.data.content);
                    break;

                    case "command.fail":
                        this.emit(parsedMessage.command, parsedMessage.data.command, parsedMessage.data.error);
                    break;

                }

            }

        });

    }

    public getTables (): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables";

        return fetch(url).then((res: Response): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }
            else {
                return Promise.reject(new Error("Problem with request getTables has status '" + res.status + "' (" + res.statusText + ")"));
            }

        });

    }

    public addTable (tableName: string): Promise<operations["addTable"]["responses"]["201"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables/{tablename}";

        return fetch(url.replace("{tablename}", tableName), {
            "method": "PUT"
        }).then((res: Response): Promise<operations["addTable"]["responses"]["201"]["content"]["application/json"]> => {

            if (res.ok) {
                return Promise.resolve();
            }
            else {
                return Promise.reject(new Error("Problem with request addTable has status '" + res.status + "' (" + res.statusText + ")"));
            }

        });

    }

    public getTableByName (tableName: components["schemas"]["TableName"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables/{tablename}";

        return fetch(url.replace("{tablename}", tableName)).then((res: Response): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }
            else {
                return Promise.reject(new Error("Problem with request getTableByName has status '" + res.status + "' (" + res.statusText + ")"));
            }

        });

    }

    public deleteTableByName (tableName: string): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables/{tablename}";

        return fetch(url.replace("{tablename}", tableName), {
            "method": "DELETE"
        }).then((res: Response): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> => {

            if (res.ok) {
                return Promise.resolve();
            }
            else {
                return Promise.reject(new Error("Problem with request addTable has status '" + res.status + "' (" + res.statusText + ")"));
            }

        });

    }

    public executeCommand (cmd: components["schemas"]["Command"]): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/execute-command";

        return fetch(url, {
            "method": "put",
            "body": JSON.stringify(cmd)
        }).then((res: Response): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]> => {

            if (res.ok) {
                return Promise.resolve();
            }
            else {

                return new Promise((resolve, reject: (err: Error) => void): void => {

                    res.json().then((err: operations["executeCommand"]["responses"]["default"]["content"]["application/json"]): void => {
                        return reject(new Error("[" + err.code + "] " + err.message));
                    }).catch((): void => {
                        return reject(new Error("Problem with request executeCommand has status '" + res.status + "' (" + res.statusText + ")"));
                    });

                });

            }

        });

    }

}

let _sdk: SDK | null = null;

export default function getSDK (): SDK {

    if (null === _sdk) {
        _sdk = new SDK();
    }

    return _sdk;

}
