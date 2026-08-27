// deps

    // natives
    const { join } = require("node:path");
    const { mkdir, mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const { deepStrictEqual, rejects, strictEqual } = require("node:assert");

    // externals
    const { NotFoundError } = require("node-pluginsmanager-plugin");
    const Container = require("node-containerpattern");

    // locals
    const Mediator = require("../lib/cjs/Mediator.js").default;

// consts

    const DESCRIPTOR_FILE = join(__dirname, "..", "lib", "data", "Descriptor.json");
    const DIST_DIR = join(__dirname, "..", "public", "dist");
    const BUNDLE_FILE = join(DIST_DIR, "bundle.min.js");
    const MAP_FILE = join(DIST_DIR, "bundle.min.js.map");
    const MAX_TIMEOUT = 10000;

// module

function createPluginsManager (overrides) {

    return {
        "getPluginsNames": function getPluginsNames () {
            return [ "mia-inputs" ];
        },
        "plugins": [
            {
                "inputString": function inputString () {
                    return Promise.resolve();
                },
                "name": "mia-inputs",
                "notAMethod": "value"
            }
        ],
        ...overrides
    };

}

function createContainer (pluginsManager) {

    const container = new Container();

    container.set("plugins-manager", pluginsManager);

    return container;

}

// tests

describe("mediator", () => {

    let descriptor = null;
    let resourcesDir = "";
    let tablesFile = "";
    let mediator = null;

    before(() => {

        return readFile(DESCRIPTOR_FILE, "utf-8").then((content) => {

            descriptor = JSON.parse(content);

            return mkdtemp(join(tmpdir(), "mia-stream-deck-"));

        }).then((created) => {

            resourcesDir = created;
            tablesFile = join(resourcesDir, "tables.json");

            return mkdir(DIST_DIR, {
                "recursive": true
            });

        }).then(() => {

            return writeFile(BUNDLE_FILE, "{{plugin.name}}|{{plugin.version}}|{{plugin.description}}", "utf-8");

        }).then(() => {

            return writeFile(MAP_FILE, "sourcemap", "utf-8");

        });

    });

    beforeEach(() => {

        mediator = new Mediator({
            "descriptor": descriptor,
            "externalResourcesDirectory": resourcesDir
        });

        return writeFile(tablesFile, "{}", "utf-8").then(() => {

            return mediator._initWorkSpace(createContainer(createPluginsManager()));

        });

    });

    afterEach(() => {

        return mediator._releaseWorkSpace();

    });

    after(() => {

        return Promise.all([
            rm(resourcesDir, {
                "force": true,
                "recursive": true
            }),
            rm(BUNDLE_FILE, {
                "force": true
            }),
            rm(MAP_FILE, {
                "force": true
            })
        ]);

    });

    it("should replace plugin placeholders in front index", () => {

        return mediator.getFrontIndex().then((content) => {

            strictEqual(content.includes(descriptor.info.title), true);
            strictEqual(content.includes("{{plugin.name}}"), false);

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in table page", () => {

        return mediator.getTablePage({
            "query": {
                "tablename": "office"
            }
        }).then((content) => {

            strictEqual(content.includes(descriptor.info.title), true);
            strictEqual(content.includes("office"), true);
            strictEqual(content.includes("{{tablename}}"), false);

        });

    }).timeout(MAX_TIMEOUT);

    it("should replace plugin placeholders in front app", () => {

        return mediator.getFrontApp().then((content) => {

            strictEqual(content, descriptor.info.title + "|" + descriptor.info.version + "|" + descriptor.info.description);

        });

    }).timeout(MAX_TIMEOUT);

    it("should return front app sourcemap", () => {

        return mediator.getFrontAppMap().then((content) => {

            strictEqual(content, "sourcemap");

        });

    }).timeout(MAX_TIMEOUT);

    it("should return table names", () => {

        return mediator.getTables().then((tables) => {

            deepStrictEqual(tables, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should add a table and emit table.added", () => {

        let emitted = "";

        mediator.once("table.added", (tablename) => {

            emitted = tablename;

        });

        return mediator.addTable({
            "path": {
                "tablename": "office"
            }
        }).then(() => {

            strictEqual(emitted, "office");

            return mediator.getTables();

        }).then((tables) => {

            deepStrictEqual(tables, [ "office" ]);

            return mediator.getTableByName({
                "path": {
                    "tablename": "office"
                }
            });

        }).then((table) => {

            deepStrictEqual(table, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject getting an unknown table", () => {

        return rejects(() => {

            return mediator.getTableByName({
                "path": {
                    "tablename": "missing"
                }
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should update a table", () => {

        const body = [
            [
                {
                    "action": {
                        "type": "EMPTY"
                    }
                }
            ]
        ];

        return mediator.addTable({
            "path": {
                "tablename": "office"
            }
        }).then(() => {

            return mediator.updateTable({
                "path": {
                    "tablename": "office"
                }
            }, body);

        }).then(() => {

            return mediator.getTableByName({
                "path": {
                    "tablename": "office"
                }
            });

        }).then((table) => {

            deepStrictEqual(table, body);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject updating an unknown table", () => {

        return rejects(() => {

            return mediator.updateTable({
                "path": {
                    "tablename": "missing"
                }
            }, []);

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should delete a table and emit table.deleted", () => {

        let emitted = "";

        return mediator.addTable({
            "path": {
                "tablename": "office"
            }
        }).then(() => {

            mediator.once("table.deleted", (tablename) => {

                emitted = tablename;

            });

            return mediator.deleteTableByName({
                "path": {
                    "tablename": "office"
                }
            });

        }).then(() => {

            strictEqual(emitted, "office");

            return mediator.getTables();

        }).then((tables) => {

            deepStrictEqual(tables, []);

        });

    }).timeout(MAX_TIMEOUT);

    it("should reject deleting an unknown table", () => {

        return rejects(() => {

            return mediator.deleteTableByName({
                "path": {
                    "tablename": "missing"
                }
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should execute an EMPTY command", () => {

        return mediator.executeCommand({}, {
            "action": {
                "type": "EMPTY"
            }
        });

    }).timeout(MAX_TIMEOUT);

    it("should execute a PLUGIN command", () => {

        return mediator.executeCommand({}, {
            "action": {
                "operationId": "inputString",
                "plugin": "mia-inputs",
                "type": "PLUGIN"
            }
        });

    }).timeout(MAX_TIMEOUT);

    it("should reject an unknown action type", () => {

        return rejects(() => {

            return mediator.executeCommand({}, {
                "action": {
                    "type": "UNKNOWN"
                }
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should reject an unknown plugin name", () => {

        return rejects(() => {

            return mediator.executeCommand({}, {
                "action": {
                    "operationId": "inputString",
                    "plugin": "missing",
                    "type": "PLUGIN"
                }
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should reject a plugin listed but not found", () => {

        mediator._pluginsManager = createPluginsManager({
            "getPluginsNames": function getPluginsNames () {
                return [ "ghost" ];
            },
            "plugins": []
        });

        return rejects(() => {

            return mediator.executeCommand({}, {
                "action": {
                    "operationId": "inputString",
                    "plugin": "ghost",
                    "type": "PLUGIN"
                }
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should reject an unknown operationId", () => {

        return rejects(() => {

            return mediator.executeCommand({}, {
                "action": {
                    "operationId": "missing",
                    "plugin": "mia-inputs",
                    "type": "PLUGIN"
                }
            });

        }, NotFoundError);

    }).timeout(MAX_TIMEOUT);

    it("should reject an operationId that is not a method", () => {

        return rejects(() => {

            return mediator.executeCommand({}, {
                "action": {
                    "operationId": "notAMethod",
                    "plugin": "mia-inputs",
                    "type": "PLUGIN"
                }
            });

        }, Error);

    }).timeout(MAX_TIMEOUT);

    it("should reject when the plugin method fails", () => {

        mediator._pluginsManager = createPluginsManager({
            "plugins": [
                {
                    "inputString": function inputString () {
                        return Promise.reject(new Error("plugin failed"));
                    },
                    "name": "mia-inputs"
                }
            ]
        });

        return rejects(() => {

            return mediator.executeCommand({}, {
                "action": {
                    "operationId": "inputString",
                    "plugin": "mia-inputs",
                    "type": "PLUGIN"
                }
            });

        }, {
            "message": "plugin failed"
        });

    }).timeout(MAX_TIMEOUT);

});
