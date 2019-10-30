import { spawn, ChildProcessWithoutNullStreams, ChildProcess } from 'child_process';
import path from 'path';
import chalk from 'chalk';

import { Runnable } from "./Runnable";

export interface RunnableTaskConfiguration {
  name: string
  root: string
  command: string
  args: string[]
}

export class RunnableTask implements Runnable {

  config: RunnableTaskConfiguration;
  task: ChildProcess;

  constructor(config: RunnableTaskConfiguration) {
    this.config = config;
  }

  start(): void {
    console.info(chalk.greenBright.bold(`*** Starting Task - ${this.config.name} ***`));
    const { command, args, root, name } = this.config;
    const cwd = path.resolve(root);
    const prefix = `[${name}] -`;
    
    const options = { cwd };
    console.log(JSON.stringify({command, args, options}));
    const task = args ? spawn(command, args, options) : spawn(command, options);

    task.on('error', (error) => { console.log(`Error in task '${name}' - ${error.message}.`); });
    
    task.stdout.setEncoding('utf8');
    task.stdout.on('data', createWriter(prefix));

    task.stderr.setEncoding('utf8');
    task.stderr.on('data', createWriter(prefix));

    this.task = task;
    console.info(chalk.greenBright.bold(`*** Started Task - ${this.config.name} ***`));
  }

  stop(): void {
    console.info(chalk.greenBright.bold(`*** Stopping Task - ${this.config.name} ***`));
    this.task.kill();
    console.info(chalk.greenBright.bold(`*** Stopped Task - ${this.config.name} ***`));
  }

}

function createWriter(prefix) {
  return function (data) {
    data.split('\n').forEach(line => {
      if (line.length > 0) {
        console.log(`${prefix}: ${line}.`)
      }
    });
  }
}