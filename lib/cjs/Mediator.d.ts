import { Mediator } from "node-pluginsmanager-plugin";
import type ContainerPattern from "node-containerpattern";
import type { iEventsMinimal, iDescriptorUserOptions } from "node-pluginsmanager-plugin";
import type { operations, components } from "./Descriptor";
export default class MediatorStreamDeck extends Mediator<iEventsMinimal & {
    "initialized": [ContainerPattern];
    "released": [ContainerPattern];
    "command.running": [components["schemas"]["Command"]];
    "command.fail": [components["schemas"]["Command"], components["schemas"]["Error"]];
    "command.success": [components["schemas"]["Command"], string];
}> {
    private _file;
    private _pluginsManager;
    constructor(data: iDescriptorUserOptions);
    protected _initWorkSpace(container: ContainerPattern): Promise<void>;
    protected _releaseWorkSpace(): Promise<void>;
    getFrontIndex(): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]>;
    getFrontApp(): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]>;
    getFrontAppMap(): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]>;
    getTables(): Promise<operations["getTables"]["responses"]["200"]["content"]["application/json"]>;
    getTableByName(urlParameters: operations["getTableByName"]["parameters"]): Promise<operations["getTableByName"]["responses"]["200"]["content"]["application/json"]>;
    deleteTableByName(urlParameters: operations["deleteTableByName"]["parameters"]): Promise<operations["deleteTableByName"]["responses"]["204"]["content"]["application/json"]>;
    executeCommand(urlParameters: operations["executeCommand"]["parameters"], bodyParameters: operations["executeCommand"]["requestBody"]["content"]["application/json"]): Promise<operations["executeCommand"]["responses"]["204"]["content"]["application/json"]>;
    private _executeActionInputString;
    private _executeActionInputKey;
    private _executeActionCommand;
    private _executeActionPlugin;
}
