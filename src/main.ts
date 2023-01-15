import * as core from '@actions/core'
import buildUrl from 'build-url'
import fetch from 'node-fetch'

async function run(): Promise<void> {
  try {
    const url = core.getInput('url')
    if (!url) {
      core.setFailed('Url is required to run Page Speed Insights.')
      return
    }

    const key = core.getInput('key')
    if (!key) {
      core.setFailed('API key is required to run Page Speed Insights.')
      return
    }

    const queryParams = {
      key: core.getInput('key'),
      url: core.getInput('url'),
      strategy: core.getInput('strategy') || 'mobile',
      categories: (core.getMultilineInput('categories') || ['performance']).map(
        x => x.toUpperCase()
      )
    }

    const fullUrl = buildUrl(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      {
        queryParams
      }
    )

    core.info(`Running Page Speed Insights for ${url}`)
    const response = await fetch(fullUrl)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json()

    core.setOutput('lighthouseResult', JSON.stringify(data.lighthouseResult))

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
