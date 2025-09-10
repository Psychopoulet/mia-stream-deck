"use strict";

// types & interfaces

    // locals
    import type { components, operations } from "../../lib/src/Descriptor";

// component

export class SDK {

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
        }).then((res: Response): Promise<void> => {

            if (res.ok) {
                return Promise.resolve();
            }
            else {
                return Promise.reject(new Error("Problem with request executeCommand has status '" + res.status + "' (" + res.statusText + ")"));
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
