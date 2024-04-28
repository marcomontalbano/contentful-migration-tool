import { execSync } from 'child_process'
import { resolve } from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'

const argv = yargs(hideBin(process.argv))
  .option('cfmversion', {
    description: 'Contentful Migration library version',
    default: 'latest',
    type: 'string',
  })
  .help().alias('help', 'h')
  .parseSync();

function installDependency(version: string = 'latest'): void {
  execSync(`pnpm add contentful-migration@${ version }`, {
    encoding: 'utf-8',
    stdio: 'ignore'
  })

  const cfmInstalledVersion = execSync(`pnpm ls contentful-migration --depth -1`, {
    encoding: 'utf-8',
    stdio: 'pipe'
  })

  console.log(
    chalk.green(
      `✔ ${cfmInstalledVersion.split('\n').splice(3, 1).join('') }`
    ), '\n'
  )
}

function removeDependency(): void {
  try {
    execSync(`pnpm remove contentful-migration`, {
      encoding: 'utf-8',
      stdio: 'ignore'
    })
  } catch {
    // console.info(chalk.blueBright('  nothing to remove'))
  }
}

function runMigration(): void {
  execSync(`tsx runner.ts run ${ resolve(__dirname, 'migrations') }`, {
    encoding: 'utf-8',
    stdio: 'inherit'
  })
}

function title(text: string): string {
  const spaces = Array(text.length + 4).fill(' ').join('')
  return chalk.black.bgCyanBright(`\n${spaces}\n  ${text}  \n${spaces}`)
}

((async function () {

  console.info(title(`Install contentful-migration@${ argv.cfmversion }`), '\n')
  removeDependency()
  installDependency(argv.cfmversion)

  console.info(title(`Run migration`), '\n')
  runMigration()

  // console.info(title(`Cleanup contentful-migration\n`))
  // removeDependency()

  console.info('')

})()).catch((error) => {
  console.error(chalk.redBright(error))
  process.exit(1)
})
