import yargs from 'yargs';
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "docs";
export declare const canonical = "docs";
export declare const aliases: string[];
export declare const description = "Show the Graphite CLI docs.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
