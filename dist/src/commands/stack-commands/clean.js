"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
const clean_1 = require("../../actions/clean");
const telemetry_1 = require("../../lib/telemetry");
const args = {
    trunk: {
        type: "string",
        describe: "The name of your trunk branch that stacks get merged into.",
        required: true,
        alias: "t",
    },
    silent: {
        describe: `silence output from the command`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "s",
    },
    force: {
        describe: `Don't prompt on each branch to confirm deletion.`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "f",
    },
    pull: {
        describe: `Pull the trunk branch before comparison.`,
        demandOption: false,
        default: false,
        type: "boolean",
        alias: "p",
    },
};
exports.command = "clean";
exports.description = "Delete any branches that have been merged or squashed into the trunk branch, and restack their upstack branches recursively.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return telemetry_1.profiledHandler(exports.command, () => __awaiter(void 0, void 0, void 0, function* () {
        yield clean_1.cleanAction({
            silent: argv.silent,
            pull: argv.pull,
            force: argv.force,
            trunk: argv.trunk,
        });
    }));
});
exports.handler = handler;
//# sourceMappingURL=clean.js.map