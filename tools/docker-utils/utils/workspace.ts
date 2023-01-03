import path from 'path'
import fs from 'fs'
import micromatch from 'micromatch'

interface PackageJSON {
  name?: string
  version?: string
  workspaces?: string[]
  // Other...
}

export function findWorkspaceRoot(intiialPath?: string) {
  if (!intiialPath) {
    intiialPath = process.cwd()
  }

  let previousPath = null
  let currentPath = path.normalize(intiialPath)

  do {
    const manifest = readPackageJSON(currentPath)

    if (manifest && manifest.workspaces) {
      const relativePath = path.relative(currentPath, intiialPath)
      if (relativePath === '' || micromatch([relativePath], manifest.workspaces).length > 0) {
        return currentPath
      }
      return null
    }

    previousPath = currentPath
    currentPath = path.dirname(currentPath)
  } while (previousPath !== currentPath)
}

export function readPackageJSON(directory: string): PackageJSON | null {
  // Check if the file exists
  const packagePath = path.join(directory, 'package.json')
  if (fs.existsSync(packagePath)) {
    return JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  }
  return null
}

export function getPackageRelativePaths() {
  const workspaceRoot = findWorkspaceRoot()
  if (!workspaceRoot) {
    throw new Error('Could not find workspace root')
  }

  const manifest = readPackageJSON(workspaceRoot)
  if (!manifest || !manifest.workspaces) {
    throw new Error('Could not find workspaces in package.json')
  }

  const workspaceNames = manifest.workspaces.map((w) => w.split('/')[0])

  let packageRelativePaths: string[] = []
  for (const workspace of workspaceNames) {
    for (const packageName of fs.readdirSync(path.join(workspaceRoot, workspace))) {
      const packagePath = path.join(workspaceRoot, workspace, packageName)
      const packageManifest = readPackageJSON(packagePath)
      if (packageManifest) {
        packageRelativePaths = packageRelativePaths.concat(packagePath)
      }
    }
  }
}
