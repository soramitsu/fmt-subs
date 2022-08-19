@Library('jenkins-library' ) _

def pipeline = new org.js.LibPipeline(steps: this,
  buildDockerImage: 'docker.soramitsu.co.jp/build-tools/node:14-ubuntu-cypress',
  packageManager: 'pnpm',
  testCmds: ['pnpm test'],
  buildCmds: ['pnpm run build'],
  pushCmds: ['git add .','git stash','pnpm publish', 'git stash pop stash@{0}'],
  npmRegistries: [:],
  sonarProjectName: 'fmt-subs',
  sonarProjectKey: 'jp.co.soramitsu:fmt-subs',
  )
pipeline.runPipeline()