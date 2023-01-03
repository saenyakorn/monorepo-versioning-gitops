import yargs from 'yargs'
import { buildDockerImage, generateDockerComposeBuildFile, pushDockerImage } from './utils/docker'
import { findWorkspaceRoot, readPackageJSON } from './utils/workspace'
import path from 'path'
import fs from 'fs'
import { ChangesetResult } from './types'

const REGISTRY = 'ghcr.io'
const ORGANIZATION = 'saenyakorn'
const SCRIPT_NAME = 'docker-utils'

function main() {
  const argv = yargs.scriptName(SCRIPT_NAME)
  const workspaceRoot = findWorkspaceRoot() as string

  // The `generate` command
  argv.command('generate', 'Generate the docker-compose-build.yaml file', {}, (args) => {
    const appNames = fs.readdirSync(path.join(workspaceRoot, 'apps'))
    generateDockerComposeBuildFile(workspaceRoot, appNames, REGISTRY, ORGANIZATION)
  })

  // The `build` command
  argv.command(
    'build',
    "Build the Docker image with tag from package.json's version",
    {
      app: {
        alias: 'a',
        describe: 'The name of the app in the workspace',
        type: 'string',
      },
      push: {
        describe: 'Enable pushing the image to the registry after building',
        type: 'boolean',
      },
      fromChangeset: {
        alias: 'c',
        describe: "Build the image based on changeset's publishedPackages result",
        type: 'string',
      },
    },
    async (args) => {
      // Prepare the Docker Compose file
      const appNames = fs.readdirSync(path.join(workspaceRoot, 'apps'))
      generateDockerComposeBuildFile(workspaceRoot, appNames, REGISTRY, ORGANIZATION)
      // If the `--fromChangeset` flag is provied, build the apps that are in the changeset publishedPackages result
      if (args.fromChangeset) {
        // Since the args.fromChangeset is a string, we need to parse it to JSON
        let result: ChangesetResult
        try {
          result = JSON.parse(args.fromChangeset)
        } catch (err) {
          throw new Error('The `--fromChangeset` flag is not a valid JSON string')
        }
        await Promise.all(result.map((app) => buildDockerImage(workspaceRoot, app.name)))
        // Push the Docker image that are in the changeset publishedPackages result, if the `--push` flag is enabled
        if (args.push) {
          await Promise.all(
            result.map((app) => pushDockerImage(app.name, app.version, REGISTRY, ORGANIZATION)),
          )
        }
        return
      }
      // Else, if the `--fromChangeset` flag is not provided, build the app that is specified in the `--app` flag
      if (!args.app) {
        throw new Error('The `--app` flag is required')
      }
      // Build the Docker image
      buildDockerImage(workspaceRoot, args.app)
      // Push the Docker image if the `--push` flag is enabled
      if (args.push) {
        const manifest = readPackageJSON(path.join(workspaceRoot, 'apps', args.app))
        const version = manifest?.version ?? '0.0.1'
        pushDockerImage(args.app, version, REGISTRY, ORGANIZATION)
      }
    },
  )

  argv.demandCommand().recommendCommands().strict().help(true).showHelpOnFail(true).argv

  return argv
}

main()

// [{"name": "docs", "version": "1.0.0"}]
