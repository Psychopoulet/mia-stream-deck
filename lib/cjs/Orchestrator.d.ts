import { Orchestrator } from "node-pluginsmanager-plugin";
import type { iOrchestratorOptions } from "node-pluginsmanager-plugin";
export default class OrchestratorStreamDeck extends Orchestrator {
    constructor(data: iOrchestratorOptions);
    protected _initWorkSpace(): Promise<void>;
}
