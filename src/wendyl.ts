import Redbird from 'redbird';

import { Config, Applications, Networks, Network, Routes, Route, Profiles, Profile, Parameters, Task, TaskType, ActionType } from "./wendyl-config";
import { Runnable } from './Runnable';
import { RunnableProxy } from './runnable-proxy';
import { RunnableTask } from './runnable-task';

export class Wendyl {
  applications: Applications
  networks: Networks
  routes: Routes
  profiles: Profiles

  runningTasks: Runnable[]

  constructor(config : Config) {
    this.applications = config.applications;
    this.networks = config.networks;
    this.routes = config.routes;
    this.profiles = config.profiles;
    this.runningTasks = [];
  }

  start(profileName: string) : void {
    const profile: Profile = this.profiles[profileName];
    if (!profile) {
      throw new Error(`The profile '${profileName}' is not defined.`);
    }

    const { parameters, tasks, network, routes } = decomposeProfile(profile, this.networks, this.routes);
    
    this.runningTasks.push(createProxy(network, routes, parameters));
    this.runningTasks.push(...createTasks(tasks, this.applications, parameters));
    this.runningTasks.forEach(task => task.start());
  }

  stop() : void {
    this.runningTasks.forEach(task => task.stop());
  }

}

function decomposeProfile(profile: Profile, networks: Networks, routes: Routes) : { parameters: Parameters, tasks: Task[], network: Network, routes: Route[] } {
    const parameters: Parameters = profile.parameters || {};
    const tasks: Task[] = profile.tasks || [];
    const network = profile.network ? networks[profile.network] : null;

    const routeNames: string[] = profile.routes || [];
    const profileRoutes = routeNames.map(routeName => routes[routeName]);

    return { parameters, tasks, network, routes: profileRoutes };
}

function createProxy(network: Network, routes: Route[], parameters):  RunnableProxy {
  const {host, port, ssl} = network;

  const runnableRoutes = routes.map(route => { return { source: route.source, target: substitute(route.target, parameters) }; });

  return new RunnableProxy({
    host,
    port,
    ssl,
    routes: runnableRoutes
  });
}

function createTasks(tasks: Task[], applications: Applications, parameters) : RunnableTask[] {
  return tasks.map(task => {
    if (task.type !== TaskType.APPLICATION) {
      throw new Error(`Unknown task type '${task.type}'.`);
    }
    
    const application = applications[task.name];
    if (!application) {
      throw new Error(`Unknown application '${task.name}.`);
    }

    const { name, root, actions } = application;
    const action = actions[task.action];
    
    let args, command;

    args = action.args ? (Array.isArray(action.args) ? action.args : [ action.args ]) : [];
    
    switch (action.type) {
      case ActionType.NPM:
        command = 'npm';
        args = [ 'run', action.command, '--' ].concat(args);
        break;

      case ActionType.SHELL:
        command = action.command;
        break;

      default:
        throw new Error(`Unknown action type '${action.type}.`);
    }

    args = args.map(arg => substitute(arg, parameters));

    return new RunnableTask({ name, root, command, args })
  })
}

function substitute(source: string, substitutions: Parameters) : string {
  return source.replace(/\$\{(.*?)\}/g, (match, name) => substitutions[name] || '#VALUE#');
}
