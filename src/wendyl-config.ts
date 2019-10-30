
export interface Config {

  applications: Applications,

  networks: Networks

  routes: Routes

  profiles: Profiles

};

export interface Applications {
  [key: string]: Application
}

export interface Application {
  name: string
  root: string
  actions: Actions
}

export interface Actions {
  [key: string]: Action
}

export interface Action {
  type: ActionType
  command: string
  args?: string | string[]
}

export enum ActionType {
  NPM = 'npm',
  SHELL = 'shell'
}

export interface Networks {
  [key: string]: Network
}

export interface Network {
  host: string
  port: string
  ssl?: NetworkSSL
}

export interface NetworkSSL {
  port: string
  cert: string
  key: string
}

export interface Routes {
  [key: string]: Route
}

export interface Route {
  source: string
  target: string
}

export interface Profiles {
  [key: string]: Profile
}

export interface Profile {
  parameters?: Parameters
  network?: string
  routes?: [string]
  tasks?: [Task]
}

export interface Parameters {
  [key: string]: string
}

export interface Task {
  type: TaskType
  name: string
  action: string
}

export enum TaskType {
  APPLICATION = 'application'
}