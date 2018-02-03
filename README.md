# Swarm City Installer

## Introduction
The installer will allow Swarm City to be installed on any platform via the command  `npm install SwarmCity` The user will be prompted to answer a number of questions leading to a fully working version of the project whether it be locally for development, or general use or to be deployed on the server for production or testing.

## Pre-requisites

- nodejs

   Install [nodejs](https://nodejs.org/en/download/package-manager/) v6.X.X LTS version.

- npm

   Make sure you have installed latest npm. You can run `sudo npm install -g npm`.

- git

   Install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) commandline tool.

(UBUNTU)
```
sudo apt-get install build-essential
````

## Install dependencies

- docker

   Install [docker](https://docs.docker.com/engine/installation). The community edition (docker-ce) will work. In Linux make sure you grant permissions to the current user to use docker by adding current user to docker group, `sudo usermod -aG docker $USER`. Once you update the users group, exit from the current terminal and open a new one to make effect.

- docker-compose

   Install [docker-compose](https://docs.docker.com/compose/install)
   
**Note**:- Make sure you can run `git`, `docker ps`, `docker-compose` without any issue and without sudo command.

## Installation
```
$ npm install -g swarmcity_installer
```

## Initialization
```
$ sudo swarm init
$ swarm build
```

## Start
```
$ swarm start
```
## Stop
```
$ swarm stop
```
## Status
```
$ swarm ps
```
## Logs
```
# All
$ swarm logs
# Chain
$ swarm logs chain
# API
$ swarm logs api
# Store
$ swarm logs store
```