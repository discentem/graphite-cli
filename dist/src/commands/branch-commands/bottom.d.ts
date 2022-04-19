import yargs from 'yargs';
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "bottom";
export declare const canonical = "branch bottom";
export declare const aliases: string[];
export declare const description = "If you're in a stack: Branch A \u2192 Branch B \u2192 Branch C (you are here), checkout the branch at the bottom of the stack (Branch A).";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
