// deps

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// types & interfaces

    // externals
    import type ContainerPattern from "node-containerpattern";

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

    public swipe (urlParameters: object): Promise<void> {

        console.log("swipe", urlParameters);

        return Promise.resolve();

    }

}
