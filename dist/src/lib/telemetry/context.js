"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEmail = void 0;
const exec_sync_1 = require("../utils/exec_sync");
function getUserEmail() {
    return (0, exec_sync_1.gpExecSync)({
        command: `git config user.email`,
    });
}
exports.getUserEmail = getUserEmail;
//# sourceMappingURL=context.js.map