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

    type HttpMethodsOf<P extends keyof paths> = {
        [M in keyof paths[P]]: paths[P][M] extends { "responses": unknown }
            ? M
            : never;
    }[keyof paths[P]];

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

    // protected methods

    protected _parseResponse (res: Response): Promise<unknown> {

        if (res.ok) {

            return new Promise((resolve: (content: unknown) => void, reject: (error: Error) => void): void => {

                res.text().then((content: string): void => {

                    try {
                        return resolve(JSON.parse(content));
                    }
                    catch (e: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
                        return resolve(content);
                    }

                }).catch((err: Error): void => {
                    console.warn(err);
                    return reject(new Error("Impossible to parse response"));
                });

            });

        }

        return new Promise((resolve: unknown, reject: (error: Error) => void): void => {

            res.json().then((content: components["schemas"]["Error"]): void => {
                return reject(new Error(content.message));
            }).catch((): void => {
                return reject(new Error("Problem with request getPluginStatus has status '" + res.status + "' (" + res.statusText + ")"));
            });

        });

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

        this._socket.onmessage = (event: MessageEvent<string>): void => {

            const parsedMessage: tEvents = JSON.parse(event.data) as tEvents;

            if ("mia-stream-deck" === parsedMessage.plugin as string) { // must be forced string type to avoid useless type error

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

            return this._parseResponse(res) as Promise<operations["getPluginDescriptor"]["responses"]["200"]["content"]["application/json"]>;

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

            if (404 === res.status) {
                return Promise.resolve("RELEASED");
            }

            return this._parseResponse(res) as Promise<operations["getPluginStatus"]["responses"]["200"]["content"]["application/json"]>;

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

            return this._parseResponse(res) as Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]>;

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

            return this._parseResponse(res);

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

            return this._parseResponse(res) as Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]>;

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

            return this._parseResponse(res);

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

            return this._parseResponse(res);

        });

    }

}

let _sdk: SDK | null = null;

export default function getSDK (): SDK {

    _sdk ??= new SDK();

    return _sdk;

}
