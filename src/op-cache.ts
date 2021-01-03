import node_path from "path";
import fs from "fs";

type TupleArr<T> = [keyof T, T[keyof T]][];

interface Options {
    path?: string;
    validate?: (fileContents: any) => void;
    throwOnCorruption?: boolean;
}

type Store<T> = Map<keyof T, T[keyof T]>;

class OPCache<Schema = any> implements Map<keyof Schema, Schema[keyof Schema]> {
    private options: Options;
    private map: Map<keyof Schema, Schema[keyof Schema]>;
    private persistantMap: Map<keyof Schema, Schema[keyof Schema]>;

    has: Store<Schema>["has"];
    keys: Store<Schema>["keys"];
    values: Store<Schema>["values"];
    forEach: Store<Schema>["forEach"];
    [Symbol.iterator]: () => IterableIterator<
        [keyof Schema, Schema[keyof Schema]]
    >;
    [Symbol.toStringTag]: "PCache";

    constructor(options?: Options) {
        this.options = this.processOptions(options);
        this.map = this.createMap();
        this.bindNativeMapProps(this.map);
    }

    private bindNativeMapProps = (store: Store<Schema>): void => {
        this.has = store.has.bind(store);
        this.keys = store.keys.bind(store);
        this.values = store.values.bind(store);
        this.forEach = store.forEach.bind(store);
        this[Symbol.iterator] = store[Symbol.iterator].bind(store);
    };

    private processOptions = (options: Options): Options => {
        if (options && options.path) {
            options.path = this.resolvePath(options.path);
            if (!fs.existsSync(options.path)) {
                fs.writeFileSync(options.path, "[]");
            }
        }
        return options || {};
    };

    private createMap = (): Store<Schema> => {
        this.persistantMap = new Map();
        if (this.options.path) {
            if (!fs.existsSync(this.options.path)) {
                fs.writeFileSync(this.options.path, "[]");
            }

            const persistedData = this.readFile();

            if (this.options.validate) this.options.validate(persistedData);

            return new Map<keyof Schema, Schema[keyof Schema]>(persistedData);
        } else {
            return new Map<keyof Schema, Schema[keyof Schema]>();
        }
    };

    private writeFile = (data: TupleArr<Schema>) => {
        if (this.options.path) {
            fs.writeFileSync(this.options.path, JSON.stringify(data));
        }
    };

    private writeMemCache = () => {
        if (this.options.path) {
            this.writeFile([...this.persistantMap]);
        }
    };

    private tryParse = (fileContents: string): TupleArr<Schema> => {
        let parsed: TupleArr<Schema>;
        try {
            parsed = JSON.parse(fileContents);
        } catch (err) {
            parsed = [...this.persistantMap];
        }
        if (!Array.isArray(parsed)) {
            if (this.options.throwOnCorruption === true) {
                throw new Error("Cache corrupted: Not an array.");
            } else {
                this.writeMemCache();
            }
        } else if (!parsed.every((arr) => Array.isArray(arr))) {
            if (this.options.throwOnCorruption) {
                const corruptedKeys = parsed.reduce<string[]>(
                    (prev, current) => {
                        if (!Array.isArray(current)) {
                            prev.push(current);
                        }
                        return prev;
                    },
                    []
                );
                throw new Error(
                    `The following items have been corrupted: ${corruptedKeys}`
                );
            } else {
                this.writeMemCache();
                return this.readFile();
            }
        }
        return parsed;
    };

    private readFile = (path?: string): TupleArr<Schema> => {
        if (path) {
            path = this.resolvePath(path);
        } else if (this.options.path) {
            const { path: cachePath } = this.options;
            try {
                const raw = fs.readFileSync(cachePath, "utf8");
                return this.tryParse(raw);
            } catch (err) {
                if (this.options.throwOnCorruption) {
                    throw err;
                } else {
                    this.writeFile([]);
                    return [];
                }
            }
        }
    };

    private persistKey = <K extends keyof Schema>(key: K, val: Schema[K]) => {
        if (this.options.path) {
            this.persistantMap.set(key, val);

            this.writeFile([...this.persistantMap]);
        }
    };

    private dropPersistedKey = <K extends keyof Schema>(key: K) => {
        if (this.options.path) {
            this.persistantMap.delete(key);
            let currentData = this.readFile();

            const persistedFileIndex = currentData.findIndex(
                ([k]) => k === key
            );

            if (persistedFileIndex !== -1) {
                currentData.splice(persistedFileIndex, 1);
                this.writeFile(currentData);
            } else {
                this.writeMemCache();
                this.writeFile(currentData);
            }
        }
    };

    private resolvePath = (path: string) => {
        return node_path.resolve(process.cwd(), path);
    };

    private rmCacheFile = () => {
        if (this.options.path) {
            fs.rmSync(this.options.path, { force: true });
        }
    };

    get size() {
        return this.map.size;
    }

    get = <K extends keyof Schema>(key: K): Schema[K] | undefined => {
        //@ts-ignore
        return this.map.get(key);
    };

    set = <K extends keyof Schema>(
        key: K,
        val: Schema[K],
        persist = false
    ): this => {
        if (persist && this.options.path) {
            this.persistKey(key, val);
        }
        this.map.set(key, val);
        return this;
    };

    entries = (): IterableIterator<[keyof Schema, Schema[keyof Schema]]> => {
        return this.map.entries();
    };

    clear = (persist?: boolean) => {
        this.map.clear();
        if (persist === false) {
            this.rmCacheFile();
        }
    };

    delete = <K extends keyof Schema>(key: K, persist = false): boolean => {
        if (persist) {
            this.dropPersistedKey(key);
        }
        return this.map.delete(key);
    };

    // Non Map compliant methods

    persist = (): void => {
        if (this.options.path) {
            this.writeMemCache();
        }
    };
}

export default OPCache;
