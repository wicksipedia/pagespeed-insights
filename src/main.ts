import * as core from '@actions/core'
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

    const url = new URL(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    )
    url.searchParams.append('key', core.getInput('key', {required: true}))
    url.searchParams.append('url', core.getInput('url', {required: true}))
    url.searchParams.append('strategy', core.getInput('strategy'))
    for (const category of core.getMultilineInput('categories')) {
      url.searchParams.append('category', category.toUpperCase())
    }
    core.debug(`URL: ${url.toString()}`)

    core.info(`Running Page Speed Insights for ${queryParams.url}`)
    const response = await fetch(url.toString())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json()

    const lighthouseResult = data.lighthouseResult
    for (const categoryKey of Object.keys(lighthouseResult.categories)) {
      const category = lighthouseResult.categories[categoryKey]
      const score = category.score * 100
      core.setOutput(category, score)
      core.info(`${category}: ${score}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
