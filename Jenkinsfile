@Library('jenkins-library' ) _

def pipeline = new org.js.LibPipeline(steps: this,
  buildDockerImage: 'docker.soramitsu.co.jp/build-tools/node:14-ubuntu-cypress',
  packageManager: 'pnpm',
  testCmds: ['pnpm test'],
  buildCmds: ['pnpm run build'],
  pushCmds: ['git add .','git commit -m temporary','pnpm publish'],
  npmRegistries: [:],
  sonarProjectName: 'fmt-subs',
  sonarProjectKey: 'jp.co.soramitsu:fmt-subs',
  )
pipeline.runPipeline()