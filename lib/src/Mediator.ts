// deps

    // natives
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// types & interfaces

    // externals
    import type ContainerPattern from "node-containerpattern";

    // locals
    import type { operations } from "./Descriptor";

// module

export default class MediatorStreamDeck extends Mediator {

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {

        console.log("init for", container.get("app.name") as string, container.get("app.version") as string);

        return Promise.resolve();

    }

    protected _releaseWorkSpace  (container: ContainerPattern): Promise<void> {

        console.log("release for", container.get("app.name") as string, container.get("app.version") as string);

        return Promise.resolve();

    }

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace("{{plugin.name}}", this.getPluginName())
                .replace("{{plugin.version}}", this.getPluginVersion())
                .replace("{{plugin.description}}", this.getPluginDescription())

                .replace("{{plugin.appFront}}", "/" + this.getPluginName() + "/public/app.js");

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return readFile(join(__dirname, "..", "..", "public", "app.js"), "utf-8");

    }

    public swipe (urlParameters: operations["swipe"]["parameters"]): Promise<operations["swipe"]["responses"]["201"]["content"]> {

        console.log("direction", urlParameters.path.direction);

        return Promise.resolve(undefined);

    }

}
