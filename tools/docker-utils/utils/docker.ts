import path from 'path'
import yaml from 'yaml'
import { readPackageJSON } from './workspace'
import { writeFileSync } from 'fs'
import { execute } from './command'

const DEFAULT_DOCKER_COMPOSE_FILE = 'docker-compose-build.yaml'

export function generateDockerComposeBuildFile(
  workspaceRoot: string,
  appNames: string[],
  registry: string,
  organization: string,
  dockerComposeFileName = DEFAULT_DOCKER_COMPOSE_FILE,
) {
  const services = appNames.reduce((prev, appName) => {
    const packageJSON = readPackageJSON(path.join(workspaceRoot, 'apps', appName))

    if (!packageJSON) {
      throw new Error(`Could not find package.json for app ${appName}`)
    }

    const packageName = packageJSON['name']
    const appVersion = packageJSON['version'] ?? '0.0.1'

    if (!packageName) {
      throw new Error(`Could not find package name for app ${appName}`)
    }

    return {
      ...prev,
      [packageName]: {
        image: `${registry}/${organization}/${packageName}:${appVersion}`,
        build: {
          context: '.',
          dockerfile: `apps/${appName}/Dockerfile`,
        },
      },
    }
  }, {})

  const dockerCompose = {
    version: '3.9',
    services,
  }

  writeFileSync(path.join(workspaceRoot, dockerComposeFileName), yaml.stringify(dockerCompose))
}

export function buildDockerImage(
  workspaceRoot: string,
  appName: string,
  dockerComposeFileName = DEFAULT_DOCKER_COMPOSE_FILE,
) {
  return new Promise((resolve) => {
    const dockerComposePath = path.join(workspaceRoot, dockerComposeFileName)
    const command = `docker compose -f ${dockerComposePath} build ${appName}`
    execute(command.split(' '))

    resolve(true)
  })
}

/**
 * Publish the docker image
 * @param {string} appName - The name of the app
 * @param {string} version - The version of the app
 */
export function pushDockerImage(
  appName: string,
  version: string,
  registry: string,
  organization: string,
) {
  return new Promise((resolve) => {
    const tagCommand = `docker tag ${registry}/${organization}/${appName}:${version} ${registry}/${organization}/${appName}:latest`
    execute(tagCommand.split(' '))

    const publishCommand1 = `docker push ${registry}/${organization}/${appName}:${version}`
    execute(publishCommand1.split(' '))

    const publishCommand2 = `docker push ${registry}/${organization}/${appName}:latest`
    execute(publishCommand2.split(' '))

    resolve(true)
  })
}
