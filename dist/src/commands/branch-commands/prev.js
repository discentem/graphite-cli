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
exports.handler = exports.builder = exports.description = exports.aliases = exports.canonical = exports.command = void 0;
const branch_traversal_1 = require("../../actions/branch_traversal");
const exec_state_config_1 = require("../../lib/config/exec_state_config");
const profile_1 = require("../../lib/telemetry/profile");
const args = {
    steps: {
        describe: `The number of levels to traverse downstack.`,
        demandOption: false,
        default: 1,
        type: 'number',
        alias: 'n',
    },
};
exports.command = 'down [steps]';
exports.canonical = 'branch down';
exports.aliases = ['d', 'prev', 'p'];
exports.description = "If you're in a stack: Branch A → Branch B (you are here) → Branch C, checkout the branch directly downstack (Branch A). Pass the `steps` arg to checkout the branch `[steps]` levels below in the stack.";
exports.builder = args;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    return profile_1.profile(argv, exports.canonical, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield branch_traversal_1.switchBranchAction(branch_traversal_1.TraversalDirection.Down, {
            numSteps: argv.steps,
            interactive: exec_state_config_1.execStateConfig.interactive(),
        }, context);
    }));
});
exports.handler = handler;
//# sourceMappingURL=prev.js.map