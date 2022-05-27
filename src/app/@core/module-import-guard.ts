// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throwIfAlreadyLoaded(parentModule: any, moduleName: string): void {
    if (parentModule) {
        throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
    }
}
