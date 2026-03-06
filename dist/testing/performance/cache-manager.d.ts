interface CacheOptions {
    ttl: number;
}
export declare class CacheManager {
    private cache;
    private ttl;
    constructor(options: CacheOptions);
    set<T>(key: string, value: T): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    clear(): Promise<void>;
    delete(key: string): Promise<void>;
}
export declare function getCachedAnalysis<T>(key: string): Promise<T | null>;
export declare function setCachedAnalysis<T>(key: string, value: T): Promise<void>;
export {};
//# sourceMappingURL=cache-manager.d.ts.map