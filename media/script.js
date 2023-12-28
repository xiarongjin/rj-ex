const vscode = acquireVsCodeApi()
const sendMessageButton = document.getElementById('submit')
const preset = document.querySelector('#preset-repo')
const newRepo = document.querySelector('#new-repo')
const repoName = document.querySelector('#repo-name')
sendMessageButton.addEventListener('click', () => {
  const message = {
    command: 'init',
    data: {
      preset: preset.value
        ? preset.value
        : 'git@git.daguchuangyi.com:prometheus/preset-app.git',
      new: newRepo.value,
      name: repoName.value ? repoName.value : 'preset-app',
    },
  }
  vscode.postMessage(message)
})
