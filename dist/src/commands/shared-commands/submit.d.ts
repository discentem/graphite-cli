import yargs from 'yargs';
export declare const command = "submit";
/**
 * Primary interaction patterns:
 *
 * # (default) allows user to edit PR fields inline and then submits stack as a draft
 * gt stack submit
 *
 * # skips editing PR fields inline, submits stack as a draft
 * gt stack submit --no-edit
 *
 * # allows user to edit PR fields inline, then publishes
 * gt stack submit --no-draft
 *
 * # same as gt stack submit --no-edit
 * gt stack submit --no-interactive
 *
 */
export declare const args: {
    readonly draft: {
        readonly describe: "Creates new PRs in draft mode. If --no-interactive is true, this is automatically set to true.";
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly edit: {
        readonly describe: "Edit PR fields inline. If --no-interactive is true, this is automatically set to false.";
        readonly type: "boolean";
        readonly default: true;
        readonly alias: "e";
    };
    readonly reviewers: {
        readonly describe: "Prompt to manually set reviewers if true";
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "r";
    };
    readonly 'dry-run': {
        readonly describe: "Reports the PRs that would be submitted and terminates. No branches are pushed and no PRs are opened or updated.";
        readonly type: "boolean";
        readonly default: false;
    };
    readonly 'update-only': {
        readonly describe: "Only update the PRs that have been already been submitted.";
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "u";
    };
};
export declare const builder: {
    readonly draft: {
        readonly describe: "Creates new PRs in draft mode. If --no-interactive is true, this is automatically set to true.";
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly edit: {
        readonly describe: "Edit PR fields inline. If --no-interactive is true, this is automatically set to false.";
        readonly type: "boolean";
        readonly default: true;
        readonly alias: "e";
    };
    readonly reviewers: {
        readonly describe: "Prompt to manually set reviewers if true";
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "r";
    };
    readonly 'dry-run': {
        readonly describe: "Reports the PRs that would be submitted and terminates. No branches are pushed and no PRs are opened or updated.";
        readonly type: "boolean";
        readonly default: false;
    };
    readonly 'update-only': {
        readonly describe: "Only update the PRs that have been already been submitted.";
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "u";
    };
};
export declare const aliases: string[];
export declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
