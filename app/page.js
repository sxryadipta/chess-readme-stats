'use client'

import { useState } from 'react'

export default function Home() {
  const [username, setUsername] = useState('')
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError(null)
    setStory(null)

    const res = await fetch(`/api/story/${username.trim()}`)

    if (!res.ok) {
      setError('Could not find that Chess.com username. Double check and try again.')
      setLoading(false)
      return
    }

    const text = await res.text()
    setStory(text)
    setLoading(false)
  }

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const workflowYaml = `name: Update Chess Story
on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Fetch chess story
        run: |
          curl -s "https://chess-readme-stats.vercel.app/api/story/${username}" > /tmp/chess.md

      - name: Inject into README
        run: |
          node -e "
            const fs = require('fs');
            let readme = fs.readFileSync('README.md', 'utf8');
            const story = fs.readFileSync('/tmp/chess.md', 'utf8');
            readme = readme.replace(
              /(<!-- CHESS_STORY -->)[\\s\\S]*?(<!-- \\/CHESS_STORY -->)/,
              \\\`<!-- CHESS_STORY -->\\n\\\${story}\\n<!-- /CHESS_STORY -->\\\`
            );
            fs.writeFileSync('README.md', readme);
          "

      - name: Commit changes
        run: |
          git config user.name "chess-bot"
          git config user.email "bot@users.noreply.github.com"
          git add README.md
          git diff --staged --quiet || git commit -m "update chess story"
          git push`

  const readmeToken = `<!-- CHESS_STORY -->
<!-- /CHESS_STORY -->`

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl font-medium text-white">
            Chess README Stats
          </h1>
          <p className="text-gray-400 text-lg">
            Automatically show your latest Chess.com game in your GitHub profile README.
            Updates every 6 hours, no maintenance needed.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Your Chess.com username"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-gray-950 font-medium px-6 py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Preview'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Story preview + instructions */}
        {story && (
          <div className="space-y-10">

            {/* Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">Your story preview</h2>
                <button
                  onClick={() => copyToClipboard(story, 'story')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {copied === 'story' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {story}
              </pre>
            </div>

            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <span className="text-gray-600 font-mono text-sm mt-1">01</span>
                <div className="flex-1 space-y-3">
                  <h2 className="text-lg font-medium text-white">
                    Add this to your README
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Open your GitHub profile README and paste these tokens wherever you want the story to appear.
                  </p>
                  <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-5 py-4">
                    <pre className="text-sm text-gray-300 font-mono">{readmeToken}</pre>
                    <button
                      onClick={() => copyToClipboard(readmeToken, 'token')}
                      className="text-sm text-gray-400 hover:text-white transition-colors ml-4 shrink-0"
                    >
                      {copied === 'token' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <span className="text-gray-600 font-mono text-sm mt-1">02</span>
                <div className="flex-1 space-y-3">
                  <h2 className="text-lg font-medium text-white">
                    Add the GitHub Actions workflow
                  </h2>
                  <p className="text-gray-400 text-sm">
                    In your profile repo create the file{' '}
                    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">
                      .github/workflows/chess.yml
                    </code>{' '}
                    and paste this inside it.
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-sm text-gray-300 overflow-x-auto">
                      {workflowYaml}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(workflowYaml, 'yaml')}
                      className="absolute top-3 right-3 text-sm text-gray-400 hover:text-white transition-colors bg-gray-900 px-2 py-1 rounded"
                    >
                      {copied === 'yaml' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <span className="text-gray-600 font-mono text-sm mt-1">03</span>
              <div className="space-y-2">
                <h2 className="text-lg font-medium text-white">
                  Run the workflow
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Go to your profile repo on GitHub, click the{' '}
                  <span className="text-gray-300">Actions</span> tab, select{' '}
                  <span className="text-gray-300">Update Chess Story</span>, and click{' '}
                  <span className="text-gray-300">Run workflow</span>.
                  Your README updates immediately. After that it runs automatically every 6 hours.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  )
}