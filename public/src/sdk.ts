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
    "message": [ string ];
}> {

    public constructor () {

        super();

        const socket = new WebSocket("ws://localhost:{{app.port}}");

        socket.addEventListener("error", (err: Event): void => {
            console.error("socket error", err);
        });

        socket.addEventListener("open", (): void => {
            this.emit("connected");
        });

        socket.addEventListener("close", (data: CloseEvent): void => {
            this.emit("disconnected", data.code, data.reason);
        });

        socket.addEventListener("message", (data: MessageEvent): void => {
            this.emit("message", data.data);
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
