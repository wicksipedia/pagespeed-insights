import * as core from '@actions/core'
import buildUrl from 'build-url'
import fetch from 'node-fetch'

async function run(): Promise<void> {
  try {
    const queryParams = {
      key: core.getInput('key', {required: true}),
      url: core.getInput('url', {required: true}),
      strategy: core.getInput('strategy'),
      categories: core.getMultilineInput('categories').map(x => x.toUpperCase())
    }
    core.debug(`Query params: ${JSON.stringify(queryParams, null, 2)}`)

    const fullUrl = buildUrl(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      {
        queryParams
      }
    )
    core.debug(`Full URL: ${fullUrl}`)

    core.info(`Running Page Speed Insights for ${queryParams.url}`)
    const response = await fetch(fullUrl)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json()

    for (const categoryKey of Object.keys(data.categories)) {
      const category = data.categories[categoryKey]
      const score = data.lighthouseResult.categories[category].score * 100
      core.setOutput(category, score)
      core.info(`${category}: ${score}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
