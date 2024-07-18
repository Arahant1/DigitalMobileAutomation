// By default, webdriver.io does not allow the level of parallelzation that we require to do. So we launch many instances
// of wdio from here, each running the tests for one configuration (platform, device, server, etc..).



import { EventEmitter} from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';

import { Launcher, RunCommandArguments } from '@wdio/cli';
import { inspect } from 'util';

import logger from '../utils/logger.js'
import { getAllFilesInDir, resetTemDir} from '../utils/utils.js';
import { CommandLineArguments } from './commandLineArgumentParser.js';
import {BaseCucumberOpts, generateCucumberOpts } from './cucumberOptsGenerator.js';


// When large test runs, we have to await on a lot of child process. this cuase node to complain, about too many SIGINT listners
EventEmitter.defaultMaxListeners = 128;

const iniliazeReporting = async () => {
    const files = await getAllFilesInDir(path.resolve('./reports/'),'.json');
    return await Promise.all(files.map(async (file)=> await fs.unlink(file)));
};

const getfeatureFiles = async () => await getAllFilesInDir(path.resolve('./src/features/'), '.feature');

const runWdio =async (argv:CommandLineArguments, cucumberOpts: BaseCucumberOpts[]) => {
    if(cucumberOpts.length === 0){
        throw new Error("Failing because there are no tests to run which match the creteria, perhaps you speified an invalid tag combination?");
    }

    const configFile = `./src/wdio_config/${argv.provider}.config.ts`

    const resolveAfter =  async (delay: number)=> 
        new Promise((resolve) => {
            setTimeout(() => resolve(true), delay * 15000);
        });

    const launch =async (opts: Partial<RunCommandArguments>, index: number): Promise<number> => {
        logger.info(`Launching ${argv.provider} WDIO process with options: ${inspect(opts)}`);

        if (argv.dryRun){
            logger.warn('Skipping wdio process as this is a dry run')
            return 0;
        } 

        try {
            await resolveAfter(index);
            const exitCode = await new Launcher(configFile, opts).run();
            return exitCode || 0;
        } catch (error) {
            logger.error(`Failed to launch ${argv.provider} WDIO process with options: ${inspect(opts)}`, error);
            return error.code || 1;
        }
    };

   // Before we start execution, we make sure that the tmp directory is empty
   await resetTemDir();

    const exitCodes: number[] = await Promise.all(cucumberOpts.map(async (opts, index)=> await launch(opts, index)));

    return exitCodes;
};

export const run = async (argv:CommandLineArguments)=>
iniliazeReporting()
.then(async () => await getfeatureFiles())
.then(async (featureFiles)=> await generateCucumberOpts (argv, featureFiles))
.then(async (cucumberOpts)=> await runWdio(argv, cucumberOpts))
.then (async (exitCodes) => {
    await resetTemDir();
    return exitCodes;
});