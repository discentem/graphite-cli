import { cache } from '../lib/config/cache';
import { TContext } from '../lib/context';
import { ExitFailedError } from '../lib/errors';
import { getRef } from '../lib/git-refs/branch_ref';
import { branchExists } from '../lib/git/branch_exists';
import { getCommitterDate } from '../lib/git/committer_date';
import { getCurrentBranchName } from '../lib/git/current_branch_name';
import { getBranchRevision } from '../lib/git/get_branch_revision';
import { sortedBranchNames } from '../lib/git/sorted_branch_names';
import {
  readMetadataRef,
  TMeta,
  writeMetadataRef,
} from '../lib/state/metadata_ref';
import { gpExecSync } from '../lib/utils/exec_sync';
import { getTrunk } from '../lib/utils/trunk';

export class Branch {
  name: string;
  shouldUseMemoizedResults: boolean;

  static create(
    branchName: string,
    parentBranchName: string,
    parentBranchRevision: string
  ): void {
    const branch = new Branch(branchName);
    branch.writeMeta({ parentBranchName, parentBranchRevision });
  }

  constructor(name: string, opts?: { useMemoizedResults: boolean }) {
    this.name = name;
    this.shouldUseMemoizedResults = opts?.useMemoizedResults || false;
  }

  /**
   * Uses memoized results for some of the branch calculations. Only turn this
   * on if the git tree should not change at all during the current invoked
   * command.
   */
  public useMemoizedResults(): Branch {
    this.shouldUseMemoizedResults = true;
    return this;
  }

  public toString(): string {
    return this.name;
  }

  getParentFromMeta(context: TContext): Branch | undefined {
    if (this.name === getTrunk(context).name) {
      return undefined;
    }

    let parentName = readMetadataRef(this.name)?.parentBranchName;

    if (!parentName) {
      return undefined;
    }

    // Cycle until we find a parent that has a real branch, or just is undefined.
    while (parentName && !branchExists(parentName)) {
      parentName = readMetadataRef(parentName)?.parentBranchName;
    }
    if (parentName) {
      this.setParentBranchName(parentName);
    } else {
      this.clearParentMetadata();
      return undefined;
    }

    if (parentName === this.name) {
      this.clearParentMetadata();
      throw new ExitFailedError(
        `Branch (${this.name}) has itself listed as a parent in the meta. Deleting (${this.name}) parent metadata and exiting.`
      );
    }
    return new Branch(parentName);
  }

  private static calculateMemoizedMetaChildren(
    context: TContext
  ): Record<string, Branch[]> {
    context.splog.logDebug(
      `Meta Children: initialize memoization | finding all branches...`
    );
    const metaChildren: Record<string, Branch[]> = {};
    const allBranches = Branch.allBranches(context, {
      useMemoizedResults: true,
    });

    context.splog.logDebug(
      `Meta Children: intiialize memoization | sifting through branches...`
    );
    allBranches.forEach((branch, i) => {
      context.splog.logDebug(
        `               Branch ${i}/${allBranches.length} (${branch.name})`
      );
      const parentBranchName = branch.getParentBranchName();
      if (parentBranchName === undefined) {
        return;
      }
      if (parentBranchName in metaChildren) {
        metaChildren[parentBranchName].push(branch);
      } else {
        metaChildren[parentBranchName] = [branch];
      }
    });
    context.splog.logDebug(`Meta Children: initialize memoization | done`);

    cache.setMetaChildren(metaChildren);
    return metaChildren;
  }

  public getChildrenFromMeta(context: TContext): Branch[] {
    context.splog.logDebug(`Meta Children (${this.name}): start`);

    if (!this.shouldUseMemoizedResults) {
      const children = Branch.allBranches(context).filter(
        (b) => readMetadataRef(b.name)?.parentBranchName === this.name
      );
      context.splog.logDebug(`Meta Children (${this.name}): end`);
      return children;
    }

    const memoizedMetaChildren = cache.getMetaChildren();
    if (memoizedMetaChildren) {
      context.splog.logDebug(`Meta Children (${this.name}): end (memoized)`);
      return memoizedMetaChildren[this.name] ?? [];
    }

    context.splog.logDebug(`Meta Children (${this.name}): end (recalculated)`);
    return Branch.calculateMemoizedMetaChildren(context)[this.name] ?? [];
  }

  public ref(): string {
    return getRef(this);
  }

  private getMeta(): TMeta | undefined {
    return readMetadataRef(this.name);
  }

  private writeMeta(meta: TMeta): void {
    writeMetadataRef(this.name, meta);
  }

  public clearMetadata(): this {
    this.writeMeta({});
    return this;
  }

  public clearParentMetadata(): void {
    const meta: TMeta = this.getMeta() || {};
    delete meta.parentBranchName;
    delete meta.parentBranchRevision;
    this.writeMeta(meta);
  }

  public getParentBranchSha(): string | undefined {
    const meta: TMeta = this.getMeta() || {};
    return meta.parentBranchRevision;
  }

  public getParentBranchName(): string | undefined {
    const meta: TMeta = this.getMeta() || {};
    return meta.parentBranchName;
  }

  public setParentBranchName(parentBranchName: string): void {
    const meta: TMeta = this.getMeta() || {};
    meta.parentBranchName = parentBranchName;
    this.writeMeta(meta);
  }

  public setParentBranch(parentBranchName: string): void {
    const meta: TMeta = this.getMeta() || {};
    meta.parentBranchName = parentBranchName;
    meta.parentBranchRevision = getBranchRevision(parentBranchName);
    this.writeMeta(meta);
  }

  public lastCommitTime(): number {
    return parseInt(
      gpExecSync({ command: `git log -1 --format=%ct ${this.name} --` })
    );
  }

  public isTrunk(context: TContext): boolean {
    return this.name === getTrunk(context).name;
  }

  static branchWithName(name: string): Branch {
    if (!branchExists(name)) {
      throw new Error(`Failed to find branch named ${name}`);
    }
    return new Branch(name);
  }

  static currentBranch(): Branch | undefined {
    const name = getCurrentBranchName();

    // When the object we've checked out is a commit (and not a branch),
    // git rev-parse --abbrev-ref HEAD returns 'HEAD'. This isn't a valid
    // branch.
    return name ? new Branch(name) : undefined;
  }

  static allBranches(
    context: TContext,
    opts?: {
      useMemoizedResults?: boolean;
      maxDaysBehindTrunk?: number;
      maxBranches?: number;
      filter?: (branch: Branch) => boolean;
    }
  ): Branch[] {
    const branchNames = sortedBranchNames();

    const maxDaysBehindTrunk = opts?.maxDaysBehindTrunk;
    let minUnixTimestamp = undefined;
    if (maxDaysBehindTrunk) {
      const trunkUnixTimestamp = parseInt(
        getCommitterDate({
          revision: getTrunk(context).name,
          timeFormat: 'UNIX_TIMESTAMP',
        })
      );
      const secondsInDay = 24 * 60 * 60;
      minUnixTimestamp = trunkUnixTimestamp - maxDaysBehindTrunk * secondsInDay;
    }
    const maxBranches = opts?.maxBranches;

    const filteredBranches = [];
    for (const branchName of branchNames) {
      if (filteredBranches.length === maxBranches) {
        break;
      }

      // If the current branch is older than the minimum time, we can
      // short-circuit the rest of the search as well - we gathered the
      // branches in descending chronological order.
      if (minUnixTimestamp !== undefined) {
        const committed = parseInt(
          getCommitterDate({
            revision: branchName,
            timeFormat: 'UNIX_TIMESTAMP',
          })
        );
        if (committed < minUnixTimestamp) {
          break;
        }
      }

      const branch = new Branch(branchName, {
        useMemoizedResults: opts?.useMemoizedResults ?? false,
      });

      if (!opts?.filter || opts.filter(branch)) {
        filteredBranches.push(branch);
      }
    }

    return filteredBranches;
  }
}
