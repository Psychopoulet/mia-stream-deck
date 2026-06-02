// deps

    // natives
    import { join } from "node:path";
    import { stat } from "node:fs";
    import { mkdir, writeFile } from "node:fs/promises";

    // externals
    import { Orchestrator } from "node-pluginsmanager-plugin";

// types & interfaces

    // natives
    import type { Stats } from "node:fs";

    // externals
    import type { iOrchestratorOptions } from "node-pluginsmanager-plugin";

// module

export default class OrchestratorStreamDeck extends Orchestrator {

    public constructor (data: iOrchestratorOptions) {

        super({
            ...data,
            "packageFile": join(__dirname, "..", "..", "package.json"),
            "descriptorFile": join(__dirname, "..", "data", "Descriptor.json"),
            "mediatorFile": join(__dirname, "Mediator.js"),
            "serverFile": join(__dirname, "Server.js")
        });

    }

    protected _initWorkSpace (): Promise<void> {

        const tablesFile: string = join(this._externalResourcesDirectory, "tables.json");

        return new Promise((resolve: (isFile: boolean) => void): void => {

            return stat(tablesFile, (err: Error | null, res: Stats): void => {
                return resolve(!err && res.isFile());
            });

        }).then((isFile: boolean): Promise<void> => {

            return isFile ? Promise.resolve() : mkdir(this._externalResourcesDirectory, {
                "recursive": true
            }).then((): Promise<void> => {
                return writeFile(tablesFile, "{}", "utf-8");
            });

        });

    }

}
