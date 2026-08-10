// module

export default function formateParameters (raw: string): Record<string, string> {

    const parsed: unknown = JSON.parse(raw);

    if ("object" !== typeof parsed || null === parsed || Array.isArray(parsed)) {
        throw new Error("URL parameters must be a plain object of type Record<string, string>");
    }

    const record: Record<string, unknown> = parsed as Record<string, unknown>;

    for (const value of Object.values(record)) {

        if ("string" !== typeof value) {
            throw new Error("URL parameters must be a plain object of type Record<string, string>");
        }

    }

    return record as Record<string, string>;

}
