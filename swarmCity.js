#!/usr/bin/env node

const cmd = require('commander')
const figlet = require('figlet')
const chalk = require('chalk')
const inquirer = require('inquirer')
const shell = require('shelljs')
const validator = require('validator')
const path = require('path')
const os = require('os')
const logger = require('winston')
var properties = require('properties')

// var apiKey = '12345678901234567890'
var homeDir = os.homedir() + '/.swarmcity_installer'
var workspace = os.homedir() + '/Swarmdev'
var debug = 'Enable'
var installationType = 'Development'
var site = 'www.example.com'
var siteRepo = ''
var apiRepo = ''
var swarmCityInstallerVersion = 'v0.2.0'
var logFile = path.join(homeDir, 'swarmCity.log')
var confFile = path.join(homeDir, '.env')
var platformFile = path.join(homeDir, 'platform.env')
var composeFile = path.join(homeDir, 'docker-compose.yaml')

logger.add(logger.transports.File, { filename: logFile })
logger.remove(logger.transports.Console)
shell.config.silent = true

cmd.option('ps', 'Show running status')
  .option('init', 'initialize configurations')
  .option('start', 'Start swarmCity system.')
  .option('build', 'Build repos and docker images')
  .option('logs [name]', 'Get docker logs', /^(site|api|store|proxy|certs|chain)$/i)
  .option('stop', 'Stop all running dockers')
  .option('kill', 'Forcefully stop all running dockers')
  .option('rm', 'Clear all stopped docker containers')
  .option('pull', 'Pull all docker images from a docker registries')
  .version('v0.2.0', '-v, --version', 'Output the version number')
  .parse(process.argv)

/**
 * It shows the header of the installer
 * @return {Promise}
 */
function getInterface () {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      figlet.text('    Swarm.city    ', {
        font: 'Ogre',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      }, function (err, data) {
        if (err) {
          console.log('Error', err)
          logger.log('Error', err)
          return
        }
        console.log(chalk.bold.hex('#EFD90B')(data))
        console.log(chalk.hex('#C8C420')('\t\t\t\t\t\t\t\t\t\t\t' +
          swarmCityInstallerVersion))
        resolve({ data: '200' })
      })
    }, 200)
  })
  return promise
}

/**
 * Validate the docker, docker-compose and git installation
 * @return {Promise}
 */
function validateDocker () {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      shell.exec('docker -v', function (code, stdout, stderr) {
        if (code !== 0) {
          logger.log('Error', 'docker command not found,\nmsg: ' + code + ', ' +
            stderr)
          console.log('Error', 'docker command not found,\nmsg: ' + code + ', ' +
            stderr)
          console.log('Use this guide to ' + chalk.bold('install docker') +
            ' in the system:\n\t' +
            chalk.italic('https://docs.docker.com/engine/installation/'))
          console.log('And this guide to install ' +
            chalk.bold('docker-compose') +
            ' in the system:\n\t' +
            chalk.italic('https://docs.docker.com/compose/install/'))
          process.exit(0)
        } else {
          shell.exec('docker-compose -v', function (code, stdout, stderr) {
            if (code !== 0) {
              logger.log('Error', 'docker-compose command not found,\nmsg: ' +
                code + ', ' + stderr)
              console.log('Error', 'docker-compose command not found,\nmsg: ' +
                code + ', ' + stderr)
              console.log('Use this guide to install ' +
                chalk.bold('docker-compose') +
                ' in the system:\n\t' +
                chalk.italic('https://docs.docker.com/compose/install/'))
              process.exit(0)
            } else {
              shell.exec('git --version', function (code, stdout, stderr) {
                if (code !== 0) {
                  logger.log('Error', 'git command not found,\nmsg: ' + code +
                    ', ' + stderr)
                  console.log('Error', 'git command not found,\nmsg: ' + code +
                    ', ' + stderr)
                  console.log('Use this guide to install ' + chalk.bold('git') +
                    ' in the system:\n\t' +
                    chalk.italic('https://git-scm.com/book/en/v2/' +
                      'Getting-Started-Installing-Git'))
                  process.exit(0)
                } else {
                  resolve({ data: '200' })
                }
              })
            }
          })
        }
      })
    }, 200)
  })
  return promise
}

/**
 * Clone the Site repo and the API repo
 * @return {Promise}
 */
function getSource () {
  var promise = new Promise(function (resolve, reject) {
    shell.mkdir('-p', workspace)
    shell.cd(workspace)
    console.log('Cloning Site repo...')
    setTimeout(function () {
      shell.exec('git clone ' + siteRepo, function (code, stdout, stderr) {
        if (code !== 0) {
          logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
          console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
        } else {
          console.log('Cloning API repo...')
          shell.exec('git clone ' + apiRepo, function (code, stdout, stderr) {
            if (code !== 0) {
              logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
              console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
            } else {
              resolve({ data: '200' })
            }
          })
        }
      })
    }, 5000)
  })
  return promise
}

/**
 * Load environment variables
 * @return {Promise}
 */
function loadEnv () {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (shell.test('-f', confFile)) {
        properties.parse(confFile, { path: true }, function (error, data) {
          if (error) {
            console.log('Error', error)
            logger.log('Error', error)
            return
          }
          workspace = data.WORKSPACE
          siteRepo = data.SITE_REPO
          apiRepo = data.API_REPO
          resolve({ data: '200' })
        })
      } else {
        console.log('ERROR: ' + chalk.red(confFile + ' file not found!'))
      }
    }, 200)
  })
  return promise
}

/**
 * Load platform variables
 * @return {Promise}
 */
function loadPlatform () {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (shell.test('-f', platformFile)) {
        properties.parse(platformFile, { path: true }, function (error, data) {
          if (error) {
            console.log('Error', error)
            logger.log('Error', error)
            return
          }
          debug = data.DEBUG
          // apiKey = data.SSL_API_KEY.toString()
          site = data.SITE_HOSTNAME
          resolve({ data: '200' })
        })
      } else {
        console.log('ERROR: ' + chalk.red(platformFile + ' file not found!'))
      }
    }, 200)
  })
  return promise
}

/**
 * It asks the user to obtain the data necessary to initialize the platform:
 * workpath, siteHostname, installationType
 * @return {Promise}
 */
function getUserInputs () {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      inquirer.prompt([
        {
          type: 'input',
          name: 'workpath',
          message: 'Workpath:',
          default: os.homedir() + '/Swarmdev',
          validate: function (str) {
            var ret = path.parse(str)
            if (ret.root !== '') {
              return true
            }
            return 'Please enter a absolute path.'
          }
        },
        {
          type: 'input',
          name: 'siteHostname',
          message: 'Site domain name:',
          default: site,
          validate: function (str) {
            if (validator.isFQDN(str) || str === 'localhost') {
              return true
            }
            return 'Please enter a fully qualified domain name.'
          }
        },
        {
          type: 'list',
          message: 'Type of installation',
          name: 'installationType',
          default: installationType,
          choices: [
            // {
            //   name: 'Production'
            // },
            {
              name: 'Development'
            }
          ]
        }
      ]).then(function (answers) {
        validateUserInputs(answers)
        resolve({ data: '200' })
      })
    }, 2000)
  })
  return promise
}

/**
 * It is confirmed that the installation must proceed
 * @return {Promise}
 */
function validateUserInputs (answers) {
  site = answers.siteHostname
  workspace = answers.workpath
  installationType = answers.installationType
  inquirer.prompt([
    {
      type: 'list',
      message: 'Continue on installation?',
      name: 'install',
      choices: [
        {
          name: 'No'
        },
        {
          name: 'Yes'
        }
      ]
    }
  ]).then(function (answers) {
    if (answers.install === 'Yes') {
      console.log('Starting installation...')
      logger.log('info', 'Starting installation')
      if (installationType === 'Development') {
        debug = 'Enable'
        updateConfigFiles().then(getSource)
      } else if (installationType === 'Production') {
        debug = 'Disable'
      }
    } else {
      process.exit(0)
    }
  })
}

/**
 * Update the files based on the data input by the user
 * @return {Promise}
 */
function updateConfigFiles () {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('Updating configurations... ')
      logger.log('info', 'Updating configurations')

      shell.cp(path.join(__dirname, 'platform.env.example'), platformFile)
      shell.cp(path.join(__dirname, '.env-dist'), confFile)
      shell.sed('-i', 'DEBUG=.*', 'DEBUG=' + debug, platformFile)
      shell.sed('-i', 'SITE_HOSTNAME=.*', 'SITE_HOSTNAME=' + site, platformFile)
      shell.sed('-i', 'WORKSPACE=.*', 'WORKSPACE=' + workspace, confFile)
      if (installationType === 'Development') {
        shell.cp(path.join(__dirname, 'docker-compose.dev.yaml'), composeFile)
      } else {
        shell.cp(path.join(__dirname, 'docker-compose.prod.yaml'), composeFile)
      }

      resolve({ data: '200' })
    })
  }, 200)
  return promise
}

/**
 * Build API and Site
 * @return {Promise}
 */
function sourceBuild () {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      // build site
      shell.cd(workspace + '/SwarmCitySite')
      shell.config.silent = false
      console.log('Building SwarmCitySite code base')
      shell.exec('npm install --verbose && node_modules/bower/bin/bower install && NODE_ENV=dev node_modules/webpack/bin/webpack.js', function (code, stdout, stderr) {
        console.log(stdout)
        logger.log('info', 'Building source of SwarmCitySite.\n' + stdout)
        if (code !== 0) {
          logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
          console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
          shell.cd(workspace)
        } else {
          // build api
          shell.cd(workspace + '/SwarmCityAPI')
          shell.config.silent = false
          console.log('Building SwarmCityAPI code base')
          shell.exec('npm install --verbose', function (code, stdout, stderr) {
            console.log(stdout)
            logger.log('info', 'Building source of SwarmCityAPI.\n' + stdout)
            if (code !== 0) {
              logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
              console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
              shell.cd(workspace)
            } else {
              shell.cd(homeDir)
              shell.exec('docker-compose build', function (code, stdout, stderr) {
                console.log(stdout)
                logger.log('info', 'Building docker-compose images\n' + stdout)
                if (code !== 0) {
                  logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
                  console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
                  shell.cd(workspace)
                }
              })
            }
          })
        }
      })
      resolve({ data: '200' })
    })
  }, 200)
  return promise
}

/**
 * Initialize the docker containers
 */
function composeUp () {
  console.log('Starting up docker containers... ')
  logger.log('info', 'Starting up docker containers')
  shell.cd(homeDir)
  shell.config.silent = false
  shell.exec('docker-compose up -d', function (code, stdout, stderr) {
    console.log(stdout)
    logger.log('info', 'docker-compose up -d\n' + stdout)
    if (code !== 0) {
      logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
      console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
    } else {
      console.log(chalk.blue('Now you can access to the web on this address:'))
      console.log(chalk.underline.bgBlue(chalk.white('http://localhost:8081')))
    }
  })
}

/**
 * Get the latest images from the repository
 */
function composePull () {
  shell.cd(homeDir)
  shell.config.silent = false
  console.log('Pulling docker images... ')
  logger.log('info', 'Pulling docker images')
  shell.exec('docker-compose pull', function (code, stdout, stderr) {
    console.log(stdout)
    logger.log('info', 'docker-compose pull\n' + stdout)
    if (code !== 0) {
      logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
      console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
    }
  })
}

/**
 * Returns the current state of the system
 */
function composePs () {
  shell.cd(homeDir)
  shell.exec('docker-compose ps', function (code, stdout, stderr) {
    console.log(stdout)
    logger.log('info', 'docker-compose ps\n ' + stdout)
    if (code !== 0) {
      logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
      console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
    }
  })
}

/**
 * Stop all instances of the SwarmCity
 */
function composeStop () {
  shell.cd(homeDir)
  shell.exec('docker-compose stop', function (code, stdout, stderr) {
    console.log(stdout)
    logger.log('info', 'docker-compose stop\n' + stdout)
    if (code !== 0) {
      logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
      console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
    }
  })
}

/**
 * Kill all instances of the SwarmCity
 */
function composeKill () {
  shell.cd(homeDir)
  shell.exec('docker-compose kill', function (code, stdout, stderr) {
    logger.log('info', 'docker-compose kill\n' + stdout)
    if (code !== 0) {
      logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
      console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
    }
  })
}

/**
 * Kill all instances of the SwarmCity. If it fails, it does it by force
 */
function composeRm () {
  shell.cd(homeDir)
  shell.exec('docker-compose kill', function (code, stdout, stderr) {
    logger.log('info', 'docker-compose kill\n' + stdout)
    if (code !== 0) {
      logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
      console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
    } else {
      shell.exec('docker-compose rm -f', function (code, stdout, stderr) {
        logger.log('info', 'docker-compose rm -f\n' + stdout)
        if (code !== 0) {
          logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
          console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
        }
      })
    }
  })
}

/**
 * Show the last 500 lines of the indicated log and follow the log.
 * If no container is indicated, the log of all is displayed
 * @param {String} log - the name of the log to show.
 */
function composeLogs (log) {
  shell.cd(homeDir)
  shell.config.silent = false
  if (log === true) {
    shell.exec('docker-compose logs -f --tail=500',
      function (code, stdout, stderr) {
        console.log(stdout)
        if (code !== 0) {
          logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
          console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
        }
      })
  } else {
    shell.exec('docker-compose logs -f --tail=500 ' + log,
      function (code, stdout, stderr) {
        console.log(stdout)
        if (code !== 0) {
          logger.log('Error', 'Code: ' + code + ', msg: ' + stderr)
          console.log('Error', 'Code: ' + code + ', msg: ' + stderr)
        }
      })
  }
}

/**
 * Initialize the system
 */
function swarmCityInit () {
  shell.mkdir('-p', homeDir)
  shell.cd(homeDir)
  shell.cp(path.join(__dirname, 'platform.env.example'), platformFile)
  shell.cp(path.join(__dirname, '.env-dist'), confFile)
  shell.cp(path.join(__dirname, 'docker-compose.yaml'), composeFile)

  validateDocker()
    .then(loadEnv)
    .then(loadPlatform)
    .then(getInterface)
    .then(getUserInputs)
}

/**
 * Check the existence of the configuration file
 */
function validateConfigs () {
  if (shell.test('-f', confFile)) {
    return true
  }
  console.log('Run ' + chalk.red('swarmCity init') +
    ' to initialize the system')
  return false
}

/*
 * Script Entry point
 */
// It checks if there are input parameters
// If it's arguments, load the environment, otherwise show the help
if (process.argv.length === 2) {
  getInterface().then(function () {
    var promise = new Promise(function (resolve, reject) {
      setTimeout(function () {
        console.log('Usage: ' + chalk.red('swarmCity [option]'))
        console.log('       ' + chalk.red('swarmCity --help') +
          '\t to view available options\n')
        resolve({ data: '200' })
      }, 200)
    })
    return promise
  })
}

/*
 * Init command (swarmCity.js init)
 */
if (cmd.init) {
  swarmCityInit()
}

/*
 * Build command (swarmCity.js build)
 */
if (cmd.build) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(sourceBuild)
  }
}

/*
 * Start command (swarmCity.js start)
 */
if (cmd.start) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(composeUp)
  }
}

/*
 * Ps command (swarmCity.js ps)
 */
if (cmd.ps) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(composePs)
  }
}

/*
 * Stop command (swarmCity.js stop)
 */
if (cmd.stop) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(composeStop)
  }
}

/*
 * Kill command (swarmCity.js kill)
 */
if (cmd.kill) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(composeKill)
  }
}

/*
 * Rm command (swarmCity.js rm)
 */
if (cmd.rm) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(composeRm)
  }
}

/*
 * Logs command (swarmCity.js logs {name})
 */
if (cmd.logs) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(function () {
        composeLogs(cmd.logs)
      })
  }
}

/*
 * Pull command (swarmCity.js pull)
 */
if (cmd.pull) {
  if (validateConfigs()) {
    loadEnv()
      .then(loadPlatform)
      .then(composePull)
  }
}
