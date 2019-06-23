import inquirer from 'inquirer'
import PrettyError = require('pretty-error')
import { findSteamUsers, findArchives } from '../share/files'

export const selectUser = (folder: string) => {
  return findSteamUsers(folder).then((users) => {
    const prompt = inquirer.createPromptModule()
    const promptOptions: inquirer.Questions = {
      type: 'list',
      name: 'user',
      message: 'What\'s your user id?',
      choices: users.map((user) => ({
        name: user.nickname,
        value: user.id
      }))
    }

    return prompt(promptOptions).then((selected) => {
      const id = selected.user
      return users.find((user) => user.id === id)
    })
  })
}

export const selectArchive = (folder: string) => {
  return findArchives(folder).then((archives) => {
    const prompt = inquirer.createPromptModule()
    const promptOptions: inquirer.Questions = {
      type: 'list',
      name: 'archive',
      message: 'which archive do you want to load',
      choices: archives.map((archive) => archive.name)
    }

    return prompt(promptOptions).then((selected) => {
      const archive = selected.archive
      return archives.find((item) => item.name === archive)
    })
  })
}

export const inputArchive = (defaultFile: string) => {
  const prompt = inquirer.createPromptModule()
  const promptOptions: inquirer.Questions = {
    type: 'input',
    name: 'archive',
    message: 'Please enter a archive name.',
    default: defaultFile
  }
  
  return prompt(promptOptions).then((result) => {
    const archive = result.archive
    return `${archive || defaultFile}.zip`
  })
}

export const confirm = (message: string) => {
  const prompt = inquirer.createPromptModule()
  const promptOptions: inquirer.Questions = {
    type: 'confirm',
    name: 'confirm',
    message: message
  }

  return prompt(promptOptions).then((result) => {
    return result.confirm ? Promise.resolve() : Promise.reject(new Error('User have been canceled'))
  })
}

export const wrapAction = (action: (...args: any[]) => any) => {
  return async (options: any) => {
    try {
      return await action(options)

    } catch (error) {
      const pe = new PrettyError()
      const message = pe.render(error)
      console.log(message)
    }
  }
}
