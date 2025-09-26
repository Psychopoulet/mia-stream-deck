"use strict";

// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // locals
    import type { components, operations } from "../../lib/src/Descriptor";

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

        const socket = new WebSocket("ws://" + window.location.host);

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

        return fetch("/{{plugin.name}}/api/tables").then((res: Response): Promise<components["schemas"]["TableName"][]> => {

            if (res.ok) {
                return res.json();
            }
            else {
                return Promise.reject(new Error("Problem with request getTables has status '" + res.status + "' (" + res.statusText + ")"));
            }

        });

    }

    public getTableByName (tablename: components["schemas"]["TableName"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> {

        return fetch("/{{plugin.name}}/api/tables/" + tablename).then((res: Response): Promise<components["schemas"]["Table"]> => {

            if (res.ok) {
                return res.json();
            }
            else {
                return Promise.reject(new Error("Problem with request getTableByName has status '" + res.status + "' (" + res.statusText + ")"));
            }

        });

    }

    public executeCommand (cmd: components["schemas"]["Command"]): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]> {

        return fetch("/{{plugin.name}}/api/execute-command", {
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
