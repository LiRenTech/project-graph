import { Octokit } from "@octokit/core";

export const octo = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
