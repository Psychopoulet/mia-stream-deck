"use strict";
// deps
Object.defineProperty(exports, "__esModule", { value: true });
// natives
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
// externals
const node_pluginsmanager_plugin_1 = require("node-pluginsmanager-plugin");
// module
class OrchestratorStreamDeck extends node_pluginsmanager_plugin_1.Orchestrator {
    constructor(data) {
        super({
            ...data,
            "packageFile": (0, node_path_1.join)(__dirname, "..", "..", "package.json"),
            "descriptorFile": (0, node_path_1.join)(__dirname, "..", "data", "Descriptor.json"),
            "mediatorFile": (0, node_path_1.join)(__dirname, "Mediator.js"),
            "serverFile": (0, node_path_1.join)(__dirname, "Server.js")
        });
    }
    _initWorkSpace() {
        const tablesFile = (0, node_path_1.join)(this._externalRessourcesDirectory, "tables.json");
        return new Promise((resolve) => {
            return (0, node_fs_1.stat)(tablesFile, (err, res) => {
                return resolve(!err && res.isFile());
            });
        }).then((isFile) => {
            return isFile ? Promise.resolve() : (0, promises_1.mkdir)(this._externalRessourcesDirectory, {
                "recursive": true
            }).then(() => {
                return (0, promises_1.writeFile)(tablesFile, "{}", "utf-8");
            });
        });
    }
}
exports.default = OrchestratorStreamDeck;
