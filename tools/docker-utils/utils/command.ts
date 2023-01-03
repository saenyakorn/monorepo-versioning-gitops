import { spawn } from 'child_process'

/**
 * Execute a command in a child process
 * @param commands Executable command and its arguments
 */
export function execute(commands: string[]) {
  console.info(`Executing command: ${commands.join(' ')}`)
  const command = spawn(commands[0], commands.slice(1))

  command.stdout.on('data', (data) => {
    console.info(`${data}`.replace('\n', ''))
  })
  command.stderr.on('data', (data) => {
    console.error(`${data}`.replace('\n', ''))
  })
  command.on('close', (code) => {
    console.info(`child process exited with code ${code}`)
  })
}
