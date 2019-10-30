import yargs from 'yargs';
import path from 'path';
import fs from 'fs-extra';

import { Wendyl } from './wendyl'
import { WendylConfig } from './wendyl-config';

const options = yargs
  .usage('Usage: $0 <command> [options]')
  .command('run <profile>', 'Execute the specified profile.',
    (cmd) => {
      return cmd
        .positional('profile', {
          description: 'The profile to run.',
          type: 'string'
        })
        .option('config', {
          description: 'the location of the configuration file',
          default: 'wendyl.config.json',
          alias: 'c',
          type: 'string'
        })
    },
        
    (args) => {
      const cwd = process.cwd();

      const configFile = path.resolve(cwd, args.config);
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

      const wendyl = new Wendyl(config);
      
      process.on('SIGINT', () => { wendyl.stop(); });
      wendyl.start(args.profile);
    }
  )
.argv;