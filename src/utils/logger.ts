import momnet from 'momnet';
import {createLogger, format, transports} from 'winston';

const {combine, colorize, printf} =  format;
const {pid} = process;

const isTestEnv = process.env.NODE_ENV === 'test';

const levelFormat = format((info) => {
    info.level = info.level.toLowerCase();
    return info;
});

const messageFormat = printf ((info)=> `${pid} ${momnet().toISOString()} ${info.level} ${info.message}`);

const logger = createLogger({
    level: 'info',
    silent: isTestEnv,
    format: combine(levelFormat(), colorize(), messageFormat),
    transports: [new transports.Console()]
});

logger.info('Initialized Logger....');

process.on('unhandledRejection', (error: Error, promise)=> logger.error(`unhandled rejection at ${JSON.stringify(promise)} reason: ${error.message}`));

// Actual one
// process.on('unhandledRejection', (error) => logger.error(`Uncought Exception: ${error.message}`));
process.on('unhandledRejection', (error) => logger.error(`Uncought Exception: ${error}`));



export default logger;