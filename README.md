# Pagespeed Insights

This project is a wrapper for Google's PageSpeed Insights. It allows you to easily analyze the content of a web page, then gives you a score based off page performance.

## Usage

Add a job to your workflow (after your site has been deployed)

```
    pagespeedInsights:
      name: Run PageSpeed Insights
      runs-on: ubuntu-latest
      permissions:
        pull-requests: write # required to comment on the pr

      steps:

        - uses: wicksipedia/pagespeed-insights@main
          id: pagespeed-insights
          with:
            url: https://wicksipedia.com
            categories: |
              accessibility
              best_practices
              performance
              SEO
            strategy: mobile
            delayBetweenRetries: 30000
            maximumNumberOfRetries: 4
            key: ${{ secrets.PAGESPEED_INSIGHTS_API_KEY }} # get this from https://developers.google.com/speed/docs/insights/v5/get-started

        - name: Comment on PR with insights
          uses: mshick/add-pr-comment@v2
          with:
            message: |
              ## PageSpeed Insights
              | Category        | Score                                                   |
              | ---             | ---                                                     |
              | Accessibility   | ${{ steps.pagespeed-insights.outputs.accessibility }}   |
              | Best practices  | ${{ steps.pagespeed-insights.outputs.best_practices }}  |
              | Performance     | ${{ steps.pagespeed-insights.outputs.performance }}     |
              | SEO             | ${{ steps.pagespeed-insights.outputs.seo }}             |
              View the full report <https://pagespeed.web.dev/report?url=${{ needs.pr-deploy.outputs.url }}>
            repo-token: ${{ secrets.GITHUB_TOKEN }}
            repo-token-user-login: "github-actions[bot]"
            allow-repeats: true
```