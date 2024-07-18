import * as process from 'process';

import {getArgv} from './runner/commandLineArgumentParser.js';
import { run } from './runner/runner.js';
import logger from './utils/logger.js';

logger.info('Starting test runner')

getArgv(process.argv.slice(2))
.then(async (argv) => run(argv))
.then((exitCodes) => {
    logger.info(`All wdio process exited, exit code were: ${exitCodes.join(', ')}`);
    process.exit(Math.max(...exitCodes.map((code)=>code)));
})
.catch((error: Error)=> {
logger.error('Failed to start test runner, as below error encountered ...');
logger.error(error);
process.exit(1);
});