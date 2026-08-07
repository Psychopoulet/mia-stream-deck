// module

export default function parseParameters (parameters: unknown): string {

    if ("undefined" === typeof parameters) {
        return "";
    }
    else if ("string" === typeof parameters) {
        return parameters;
    }

    return JSON.stringify(parameters);

}
