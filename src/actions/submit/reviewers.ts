import prompts from 'prompts';
import { KilledError } from '../../lib/errors';

export async function getReviewers(args: {
  fetchReviewers: boolean;
}): Promise<string[]> {
  if (!args.fetchReviewers) {
    return [];
  }
  const response = await prompts(
    {
      type: 'list',
      name: 'reviewers',
      message: 'Reviewers (comma-separated GitHub usernames)',
      seperator: ',',
    },
    {
      onCancel: () => {
        throw new KilledError();
      },
    }
  );
  return response.reviewers;
}
