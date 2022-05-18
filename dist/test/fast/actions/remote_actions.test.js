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
const chai_1 = require("chai");
const push_branch_1 = require("../../../src/actions/submit/push_branch");
const pull_1 = require("../../../src/actions/sync/pull");
const branch_1 = require("../../../src/wrapper-classes/branch");
const clone_scene_1 = require("../../lib/scenes/clone_scene");
const configure_test_1 = require("../../lib/utils/configure_test");
for (const scene of [new clone_scene_1.CloneScene()]) {
    // eslint-disable-next-line max-lines-per-function
    describe('handle remote actions properly (sync/submit)', function () {
        configure_test_1.configureTest(this, scene);
        it('can push a branch to remote', () => __awaiter(this, void 0, void 0, function* () {
            scene.repo.createChange('1');
            scene.repo.execCliCommand(`branch create 1 -am "1"`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('1');
            push_branch_1.push(new branch_1.Branch('1'), scene.context);
            chai_1.expect(scene.repo.getRef('refs/heads/1')).to.equal(scene.originRepo.getRef('refs/heads/1'));
        }));
        it('fails to push to a branch with external commits', () => {
            scene.repo.createChange('1');
            scene.repo.execCliCommand(`branch create 1 -am "1"`);
            chai_1.expect(scene.repo.currentBranchName()).to.equal('1');
            scene.originRepo.createChange('2');
            scene.originRepo.execCliCommand(`branch create 1 -am "1"`);
            chai_1.expect(scene.originRepo.getRef('refs/heads/1')).to.not.equal(scene.repo.getRef('refs/heads/1'));
            chai_1.expect(() => push_branch_1.push(new branch_1.Branch('1'), scene.context)).to.throw();
        });
        it('can fetch a branch from remote', () => __awaiter(this, void 0, void 0, function* () {
            scene.originRepo.createChangeAndCommit('a');
            scene.originRepo.createChange('1');
            scene.originRepo.execCliCommand(`branch create 1 -am "1"`);
            pull_1.pull({
                oldBranchName: scene.repo.currentBranchName(),
                branchesToFetch: ['main', '1'],
            }, scene.context);
            chai_1.expect(scene.repo.getRef('refs/heads/main')).to.equal(scene.originRepo.getRef('refs/heads/main'));
            chai_1.expect(scene.repo.getRef('refs/remotes/origin/1')).to.equal(scene.originRepo.getRef('refs/heads/1'));
        }));
    });
}
//# sourceMappingURL=remote_actions.test.js.map