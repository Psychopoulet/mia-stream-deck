"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// natives
const node_child_process_1 = require("node:child_process");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
// externals
const node_pluginsmanager_plugin_1 = require("node-pluginsmanager-plugin");
const robotjs_1 = __importDefault(require("@hurdlegroup/robotjs"));
// module
class MediatorStreamDeck extends node_pluginsmanager_plugin_1.Mediator {
    // constructor
    constructor(data) {
        super(data);
        // attributes
        this._file = "";
        this._pluginsManager = null;
    }
    _initWorkSpace(container) {
        this._file = (0, node_path_1.join)(this._externalRessourcesDirectory, "tables.json");
        this._pluginsManager = container.get("plugins-manager");
        return Promise.resolve();
    }
    _releaseWorkSpace() {
        this._file = "";
        this._pluginsManager = null;
        return Promise.resolve();
    }
    // front files
    getFrontIndex() {
        return (0, promises_1.readFile)((0, node_path_1.join)(__dirname, "..", "..", "public", "dist", "index.html"), "utf-8").then((content) => {
            return content
                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());
        });
    }
    getFrontApp() {
        return (0, promises_1.readFile)((0, node_path_1.join)(__dirname, "..", "..", "public", "dist", "bundle.js"), "utf-8");
    }
    getFrontAppMap() {
        return (0, promises_1.readFile)((0, node_path_1.join)(__dirname, "..", "..", "public", "dist", "bundle.js.map"), "utf-8");
    }
    // api
    getTables() {
        return (0, promises_1.readFile)(this._file, "utf-8").then((content) => {
            return JSON.parse(content);
        }).then((content) => {
            return Promise.resolve(Object.keys(content));
        });
    }
    getTableByName(urlParameters) {
        return (0, promises_1.readFile)(this._file, "utf-8").then((content) => {
            return JSON.parse(content);
        }).then((content) => {
            if (!content[urlParameters.path.tablename]) {
                return Promise.reject(new node_pluginsmanager_plugin_1.NotFoundError("Table \"" + urlParameters.path.tablename + "\" not found"));
            }
            else {
                return Promise.resolve(content[urlParameters.path.tablename]);
            }
        });
    }
    deleteTableByName(urlParameters) {
        return (0, promises_1.readFile)(this._file, "utf-8").then((content) => {
            return JSON.parse(content);
        }).then((content) => {
            if (!content[urlParameters.path.tablename]) {
                return Promise.reject(new node_pluginsmanager_plugin_1.NotFoundError("Table \"" + urlParameters.path.tablename + "\" not found"));
            }
            else {
                delete content[urlParameters.path.tablename];
                return (0, promises_1.writeFile)(this._file, JSON.stringify(content), "utf-8");
            }
        });
    }
    executeCommand(urlParameters, bodyParameters) {
        return Promise.resolve().then(() => {
            switch (bodyParameters.action.type) {
                case "EMPTY":
                    return Promise.resolve();
                case "INPUT-STRING":
                    return this._executeActionInputString(bodyParameters);
                case "INPUT-KEY":
                    return this._executeActionInputKey(bodyParameters);
                case "COMMAND":
                    return this._executeActionCommand(bodyParameters);
                case "PLUGIN":
                    return this._executeActionPlugin(bodyParameters);
                // force catch not typed action type
                default:
                    return Promise.reject(new node_pluginsmanager_plugin_1.NotFoundError("Unknown \"" + bodyParameters.action.type + "\" action type"));
            }
        }).catch((err) => {
            this._log("error", err.message);
            return Promise.reject(err);
        });
    }
    _executeActionInputString(bodyParameters) {
        return new Promise((resolve, reject) => {
            try {
                const command = bodyParameters.action;
                robotjs_1.default.typeString(command.string);
                if (command.enter) {
                    robotjs_1.default.keyTap("enter");
                }
                return resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    _executeActionInputKey(bodyParameters) {
        return new Promise((resolve, reject) => {
            try {
                const command = bodyParameters.action;
                const modifiers = [];
                if (command.alt) {
                    modifiers.push("alt");
                }
                if (command.ctrl) {
                    modifiers.push("control");
                }
                if (command.shift) {
                    modifiers.push("shift");
                }
                if (command.command) {
                    modifiers.push("command");
                }
                // https://www.piathome.com/homepage/docs/robotjs-key-syntax.html
                robotjs_1.default.keyTap(command.key, modifiers);
                return resolve();
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    _executeActionCommand(bodyParameters) {
        return new Promise((resolve, reject) => {
            var _a, _b;
            const command = bodyParameters.action;
            let ended = false;
            let running = false;
            let stderr = "";
            let stdout = "";
            let options = {
                "windowsHide": true
            };
            if ("undefined" !== typeof command.cwd) {
                options.cwd = command.cwd;
            }
            if ("undefined" !== typeof command.detached) {
                options.detached = command.detached;
            }
            if ("undefined" !== typeof command.shell) {
                options.shell = command.shell;
            }
            else if ("undefined" !== typeof command.insideShell) {
                options.shell = command.insideShell;
            }
            const childProcess = (0, node_child_process_1.spawn)(command.command, options);
            childProcess.once("error", (err) => {
                if (!ended) {
                    ended = true;
                    if (running) {
                        this.emit("command.fail", bodyParameters, err);
                    }
                    return reject(err);
                }
            }).once("spawn", () => {
                running = true;
                this.emit("command.running", bodyParameters);
            }).once("close", (code, signal) => {
                if (!ended) {
                    ended = true;
                    if (code) {
                        this.emit("command.fail", bodyParameters, new Error(stderr));
                        return reject(new Error(stderr));
                    }
                    else {
                        this.emit("command.success", bodyParameters, stdout);
                        return resolve(stdout);
                    }
                }
            });
            if (childProcess.stderr) {
                (_a = childProcess.stderr) === null || _a === void 0 ? void 0 : _a.setEncoding("utf-8");
                childProcess.stderr.on("data", (chunk) => {
                    stderr += chunk;
                });
            }
            if (childProcess.stdout) {
                (_b = childProcess.stdout) === null || _b === void 0 ? void 0 : _b.setEncoding("utf-8");
                childProcess.stdout.on("data", (chunk) => {
                    stdout += chunk;
                });
            }
            // force return nothing
        }).then(() => {
            return Promise.resolve();
        });
    }
    _executeActionPlugin(bodyParameters) {
        return new Promise((resolve, reject) => {
            const command = bodyParameters.action;
            if (!this._pluginsManager.getPluginsNames().includes(command.plugin)) {
                return reject(new node_pluginsmanager_plugin_1.NotFoundError("Unknown \"" + command.plugin + "\" plugin"));
            }
            const plugin = this._pluginsManager.plugins.find((value) => {
                return value.name === command.plugin;
            });
            if (!plugin) {
                return reject(new node_pluginsmanager_plugin_1.NotFoundError("Unknown \"" + command.plugin + "\" plugin"));
            }
            else if ("undefined" === typeof plugin[command.operationId]) {
                return reject(new node_pluginsmanager_plugin_1.NotFoundError("Unknown \"" + command.operationId + "\" operationId method \" for " + command.plugin + "\" plugin"));
            }
            else if ("function" !== typeof plugin[command.operationId]) {
                return reject(new Error("\"" + command.operationId + "\" operationId method \" for " + command.plugin + "\" plugin is not a valid method"));
            }
            plugin[command.operationId](command.urlParameters, command.bodyParameters).then(() => {
                return resolve();
            }).catch((err) => {
                return reject(err);
            });
        });
    }
}
exports.default = MediatorStreamDeck;
