@Library('jenkins-library@duty/remove-results-of-functions' ) _

def pipeline = new org.js.LibPipeline(steps: this,
  buildDockerImage: 'docker.soramitsu.co.jp/build-tools/node:14-ubuntu-cypress',
  packageManager: 'pnpm',
  testCmds: ['pnpm test'],
  buildCmds: ['pnpm run build'],
  pushCmds: ['git status --porcelain','git add .','git reset --hard','git checkout -b workbranch','pnpm publish'],
  npmRegistries: [:],
  sonarProjectName: 'fmt-subs',
  sonarProjectKey: 'jp.co.soramitsu:fmt-subs',
  libPushBranches: ['master', 'duty/remove-CI-artifacts'],
  dockerImageTags: ['master': 'latest', 'duty/remove-CI-artifacts': 'duty'],
  )
pipeline.runPipeline()