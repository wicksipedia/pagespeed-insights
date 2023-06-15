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

    let retryCount = 0
    const maxRetries = 3
    const delayDuration = 5000 // 5 seconds
    core.debug(`Query params: ${JSON.stringify(queryParams, null, 2)}`)

    const url = new URL(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed-test'
    )
    url.searchParams.append('key', core.getInput('key', {required: true}))
    url.searchParams.append('url', core.getInput('url', {required: true}))
    url.searchParams.append('strategy', core.getInput('strategy'))
    for (const category of core.getMultilineInput('categories')) {
      url.searchParams.append('category', category.toUpperCase())
    }
    core.debug(`URL: ${url.toString()}`)

    core.info(`Running Page Speed Insights for ${queryParams.url}`)
    while (retryCount < maxRetries) {
      const response = await fetch(url.toString())
      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await response.json()

        const lighthouseResult = data.lighthouseResult
        for (const category of Object.values(lighthouseResult?.categories)) {
          processCategory(category)
        }
        break
      } else {
        core.info(`Something went wrong! Retry ${retryCount + 1}/${maxRetries}`)
      }
      retryCount++
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayDuration))
      } else {
        throw new Error('❌ PagesSpeed Insight - failed to analayze the Website')
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

function snakeCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processCategory(category: any): void {
  const title = snakeCase(category.title)
  const score = category.score * 100
  core.debug(`${title}: ${score}`)
  core.setOutput(title, score)
}
