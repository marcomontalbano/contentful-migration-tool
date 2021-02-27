import path from 'path'
import { runMigration } from './src/migration';

(async function() {
    await runMigration({ filePath: path.join(__dirname, 'migrations', '1-sample.js') })
}())
