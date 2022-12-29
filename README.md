# Turborepo demo with Changesets <!-- omit in toc -->

This is a demo for [Turborepo](https://turborepo.com) and [Changesets](https://github.com/changesets/changesets).

# Table of Contents <!-- omit in toc -->

- [What is versioning](#what-is-versioning)
- [Setup Changeset for monorepo](#setup-changeset-for-monorepo)
- [How to use Changeset](#how-to-use-changeset)
- [Question](#question)

# What is versioning

Versioning is a way to describe the changes of your packages. There are many versioning strategies, but the most popular one is [Semantic Versioning](https://semver.org/). There're the rules to assign version numbers:

1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a backwards compatible manner, and
3. PATCH version when you make backwards compatible bug fixes.

See more detail at https://semver.org/

# Setup Changeset for monorepo

1. Install Changeset CLI

   ```bash
   pnpm add -D @changesets/cli @changesets/changelog-github
   ```

2. Initialize Changeset

   ```bash
   pnpm changeset init
   ```

   At this point, you'll find out that 2 files are created:

   ```
   .changeset/config.json
   .changeset/README.md
   ```

3. Configure the `config.json` file

   ```json
   {
     "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
     "changelog": ["@changesets/changelog-github", { "repo": "ORGANIZATION_NAME/REPO_NAME" }],
     "commit": false,
     "fixed": [],
     "linked": [],
     "access": "restricted",
     "baseBranch": "main",
     "updateInternalDependencies": "patch",
     "ignore": []
   }
   ```

   - `changelog` - This is the changelog generator used to generate the changelog for each package. In this case, we use GitHub changelog generator.

4. Set up GitHub Action workflow for releasing apps and packages. You can copy [the action YAML](./.github/workflows/release.yaml) here.
5. Install [Changeset bot](https://github.com/apps/changeset-bot) for your repository.
6. You're done! Now you're ready to use Changeset to release your apps and packages.

# How to use Changeset

I'll assume your development workflow is:

1. You have the `main` branch as the production branch.
2. You and your team members create feature branches from the `main` branch.
3. When one of your teams finishes the task, they'll create a PR to merge their feature branch to the `main` branch.

Here's what will happen when you open a pull request to merge your feature branch to the `main` branch:

![](./docs/assets/open-pr.png)

The changeset bot will automatically add a comment to your PR. It tells you to run the `pnpm changeset` command to create a changeset file. Click the **second link** to create a changeset file

![](./docs/assets/changeset-add.png)

> You can see more detail what is Changeset file for https://github.com/changesets/changesets/blob/main/docs/command-line-options.md#add

After creating the changeset file, you can merge your PR to the `main` branch. The GitHub action will be triggered to open the release PR. Like this one:

![](./docs/assets/version-package.png)

> If you add more changeset files, the GitHub Action will automatically update the release PR.

If you're happy with the release PR, you can merge it to the `main` branch. The GitHub Action will automatically publish your apps and packages (if you want), or you can do other things like deploy your apps by modifying the `release` command in [package.json](./package.json) in the root.

The current release command is to execute `pnpm changeset tag` to add Git tags for your apps and packages. Like what you see in the image below:

![](./docs/assets/git-graph.png)

# Question

1. What if I forgot to create a changeset file for my PR?

   **Answer**: you can create a changeset file for your change manually in the `main` branch by running `pnpm changeset` or `pnpm changeset add` and describing your change. Then, commit them as hotfix to the `main` branch.
