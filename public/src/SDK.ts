// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // natives
    type Timeout = ReturnType<typeof setTimeout>;

    // locals
    import type { components, operations, paths } from "./Descriptor";
    type tEvents = components["schemas"]["PushEventPluginInitialized"] | components["schemas"]["PushEventPluginReleased"] | components["schemas"]["PushEventPluginError"]
        | components["schemas"]["PushEventCommandRunning"] | components["schemas"]["PushEventCommandSuccess"] | components["schemas"]["PushEventCommandFail"];

    type NonNeverKeys<T> = {
        [K in keyof T]: T[K] extends never ? never : K
    }[keyof T];

    type HttpMethodsOf<P extends keyof paths> = Exclude<
        NonNeverKeys<paths[P]>,
        "parameters"
    >;

// component

export class SDK extends EventEmitter<{
    "connected": [];
    "disconnected": [ number, string ];
    "initialized": [];
    "released": [];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
    "command.running": [ components["schemas"]["Command"] ];
    "command.fail": [ components["schemas"]["Command"], components["schemas"]["Error"] ];
    "command.success": [ components["schemas"]["Command"], string ];
}> {

    // static

        public static readonly BASE_URL: string = window.location.protocol + "//" + window.location.host;

    // protected

        protected _socket: WebSocket | null;
        protected _reconnectTimeout: Timeout | null;

    public constructor () {

        super();

        this._socket = null;
        this._reconnectTimeout = null;

    }


    // public methods

    public connect (): void {

        if (WebSocket.OPEN === this._socket?.readyState) {
            return;
        }

        if (this._reconnectTimeout) {
            return;
        }

        this._socket = new WebSocket(
            ("https:" === window.location.protocol ? "wss:" : "ws:")
            + "//" + window.location.host
        );

        this._socket.onopen = (): void => {
            this.emit("connected");
        };

        this._socket.onclose = (event: CloseEvent): void => {

            this.emit("disconnected", event.code, event.reason);

            // normal closure
            if (1000 === event.code) {
                return;
            }

            this._reconnectTimeout = setTimeout((): void => {
                this._reconnectTimeout = null;
                return this.connect();
            }, 1000);

        };

        this._socket.onerror = (evt: Event): void => {

            // avoid catching error on reconnection
            if (evt instanceof ErrorEvent) {

                this.emit("error", {
                    "code": "unknown",
                    "message": evt.message
                });

            }

        };

        this._socket.onmessage = (message: MessageEvent): void => {

            const parsedMessage: tEvents = JSON.parse(message.data) as tEvents;

            if ("mia-stream-deck" === parsedMessage.plugin) {

                switch (parsedMessage.command) {

                    case "initialized":
                        this.emit("initialized");
                    break;
                    case "released":
                        this.emit("released");
                    break;
                    case "error":
                        this.emit("error", parsedMessage.data);
                    break;

                    case "command.running":
                        this.emit(parsedMessage.command, parsedMessage.data);
                    break;

                    case "command.success":
                        this.emit(parsedMessage.command, parsedMessage.data.command, parsedMessage.data.content);
                    break;

                    case "command.fail":
                        this.emit(parsedMessage.command, parsedMessage.data.command, parsedMessage.data.error);
                    break;

                    default:
                        // nothing to do here
                    break;

                }

            }

        };

    }

    public disconnect (): void {

        if (this._reconnectTimeout) {
            clearTimeout(this._reconnectTimeout);
            this._reconnectTimeout = null;
        }

        if (this._socket
            && (
                WebSocket.CONNECTING === this._socket.readyState
                || WebSocket.OPEN === this._socket.readyState
            )
        ) {
            this._socket.close(1000, "Normal closure");
        }

        this._socket = null;

    }

    // api

    public getPluginDescriptor (): Promise<operations["getPluginDescriptor"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/descriptor";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getPluginDescriptor"]["responses"]["200"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }

            return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                res.json().then((content: operations["getPluginDescriptor"]["responses"]["default"]["content"]["application/json"]): void => {
                    return reject(new Error(content.message));
                }).catch((): void => {
                    return reject(new Error("Problem with request getPluginDescriptor has status '" + res.status + "' (" + res.statusText + ")"));
                });

            });

        });

    }

    public getPluginStatus (): Promise<operations["getPluginStatus"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/status";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getPluginStatus"]["responses"]["200"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }
            else if (404 === res.status) {
                return Promise.resolve("RELEASED");
            }

            return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                res.json().then((content: operations["getPluginStatus"]["responses"]["default"]["content"]["application/json"]): void => {
                    return reject(new Error(content.message));
                }).catch((): void => {
                    return reject(new Error("Problem with request getPluginStatus has status '" + res.status + "' (" + res.statusText + ")"));
                });

            });

        });

    }

    public getTables (): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }

            return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                res.json().then((content: operations["getTables"]["responses"]["default"]["content"]["application/json"]): void => {
                    return reject(new Error(content.message));
                }).catch((): void => {
                    return reject(new Error("Problem with request getTables has status '" + res.status + "' (" + res.statusText + ")"));
                });

            });

        });

    }

    public addTable (tableName: string): Promise<operations["addTable"]["responses"]["201"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables/{tablename}";
        const method: HttpMethodsOf<typeof url> = "put";

        return fetch(url.replace("{tablename}", tableName), {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["addTable"]["responses"]["201"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }

            return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                res.json().then((content: operations["addTable"]["responses"]["default"]["content"]["application/json"]): void => {
                    return reject(new Error(content.message));
                }).catch((): void => {
                    return reject(new Error("Problem with request addTable has status '" + res.status + "' (" + res.statusText + ")"));
                });

            });

        });

    }

    public getTableByName (tableName: components["schemas"]["TableName"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables/{tablename}";
        const method: HttpMethodsOf<typeof url> = "get";

        return fetch(url.replace("{tablename}", tableName), {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }

            return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                res.json().then((content: operations["getTableByName"]["responses"]["default"]["content"]["application/json"]): void => {
                    return reject(new Error(content.message));
                }).catch((): void => {
                    return reject(new Error("Problem with request getTableByName has status '" + res.status + "' (" + res.statusText + ")"));
                });

            });

        });

    }

    public deleteTableByName (tableName: string): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/tables/{tablename}";
        const method: HttpMethodsOf<typeof url> = "delete";

        return fetch(url.replace("{tablename}", tableName), {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }

            return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                res.json().then((content: operations["deleteTableByName"]["responses"]["default"]["content"]["application/json"]): void => {
                    return reject(new Error(content.message));
                }).catch((): void => {
                    return reject(new Error("Problem with request deleteTableByName has status '" + res.status + "' (" + res.statusText + ")"));
                });

            });

        });

    }

    public executeCommand (cmd: components["schemas"]["Command"]): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]> {

        const url: keyof paths = "/mia-stream-deck/api/execute-command";
        const method: HttpMethodsOf<typeof url> = "put";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(cmd)
        }).then((res: Response): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]> => {

            if (res.ok) {
                return res.json();
            }

            return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

                res.json().then((content: operations["executeCommand"]["responses"]["default"]["content"]["application/json"]): void => {
                    return reject(new Error(content.message));
                }).catch((): void => {
                    return reject(new Error("Problem with request executeCommand has status '" + res.status + "' (" + res.statusText + ")"));
                });

            });

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
