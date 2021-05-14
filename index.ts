import yargs from 'yargs'
import { execSync } from 'child_process'

const argv = yargs
  .option('cfmversion', {
    description: 'Contentful Migration library version',
    default: 'latest',
    type: 'string',
  })
  .help().alias('help', 'h')
  .argv;

function installDependency(version: string = 'latest'): void {
  execSync(`yarn add contentful-migration@${ version }`, {
    encoding: 'utf-8',
    stdio: 'ignore'
  })
}

function removeDependency(): void {
  try {
    execSync(`yarn remove contentful-migration`, {
      encoding: 'utf-8',
      stdio: 'ignore'
    })
  } catch {
    console.info('  nothing to remove')
  }
}

function runMigration(): void {
  execSync(`ts-node runner.ts`, {
    encoding: 'utf-8',
    stdio: 'inherit'
  })
}

((async function () {

  console.info(`- Remove contentful-migration`)
  removeDependency()

  console.info(`- Install contentful-migration@${ argv.cfmversion }`)
  installDependency(argv.cfmversion)

  console.info(`- Run migration`)
  runMigration()

  console.info(`- Cleanup contentful-migration`)
  removeDependency()

})()).catch((error) => {
  console.error(error)
  process.exit(1)
})
