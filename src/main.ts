import * as core from '@actions/core'
import fetch from 'node-fetch'
import {LighthouseResultScore} from './lighthouseResultScore'

async function run(): Promise<void> {
  try {
    const url = getPagespeedInsightAPIUrl()

    const maximumNumberOfRetries = +core.getInput('maximumNumberOfRetries')
    const delayBetweenRetries = +core.getInput('delayBetweenRetries')
    let retryCount = 0

    while (retryCount < maximumNumberOfRetries) {
      if (await getLighthouseResult(url)) {
        core.info(
          `✅ PageSpeed Insights - Website has been analayzed successfully!`
        )
        break
      }

      core.info(
        `⚠️ Something went wrong! Retry ${
          retryCount + 1
        }/${maximumNumberOfRetries} - Reattempting it in ${
          delayBetweenRetries / 1000
        } secs`
      )
      retryCount++

      if (retryCount < maximumNumberOfRetries) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRetries))
      } else {
        throw new Error(
          '❌ PageSpeed Insights - failed to analayze the Website'
        )
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

type PagespeedUrl = URL

function getPagespeedInsightAPIUrl(): PagespeedUrl {
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

  return url
}

async function getLighthouseResult(url: URL): Promise<boolean> {
  const response = await fetch(url.toString())
  if (response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json()

    const lighthouseResult = data.lighthouseResult
    for (const category of Object.values(
      lighthouseResult?.categories as LighthouseResultScore[]
    )) {
      const title = snakeCase(category.title)
      const score = Math.round(category.score * 100)
      core.debug(`${title}: ${score}`)
      core.setOutput(title, score)
    }

    return true
  }

  return false
}

function snakeCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase()
}
