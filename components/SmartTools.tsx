'use client'

import { useState } from 'react'

interface SmartToolsProps {
  onInsert?: (text: string) => void
}

export default function SmartTools({ onInsert }: SmartToolsProps) {
  const [activeTab, setActiveTab] = useState<'headline' | 'grammar' | 'tone'>('headline')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toneLevel, setToneLevel] = useState(50) // 0=formal, 100=casual

  const generateHeadline = () => {
    if (!input.trim()) {
      alert('Please enter a topic first.')
      return
    }

    const templates = [
      `${input}: What You Need to Know`,
      `The Ultimate Guide to ${input}`,
      `5 Things You Didn't Know About ${input}`,
      `How ${input} Is Changing Everything`,
      `${input} Explained: A Deep Dive`,
      `Why Everyone's Talking About ${input}`,
      `The Future of ${input}`,
      `${input}: Trends and Insights`,
      `Breaking Down ${input} for Beginners`,
      `Master ${input} in 5 Minutes`
    ]

    const randomHeadline = templates[Math.floor(Math.random() * templates.length)]
    setOutput(randomHeadline)
  }

  const checkGrammar = async () => {
    if (!input.trim()) {
      alert('Please enter text to check.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: input,
          language: 'en-US',
        }),
      })

      const data = await response.json()

      if (data.matches && data.matches.length > 0) {
        let result = `Found ${data.matches.length} issue(s):\n\n`
        data.matches.slice(0, 5).forEach((match: any, idx: number) => {
          result += `${idx + 1}. ${match.message}\n`
          if (match.replacements && match.replacements.length > 0) {
            result += `   Suggestion: ${match.replacements[0].value}\n\n`
          }
        })
        setOutput(result)
      } else {
        setOutput('No grammar issues found!')
      }
    } catch (error) {
      console.error('Grammar check error:', error)
      setOutput('Error checking grammar. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const adjustTone = () => {
    if (!input.trim()) {
      alert('Please enter text to adjust.')
      return
    }

    let adjusted = input

    if (toneLevel < 30) {
      // Formal
      adjusted = adjusted
        .replace(/\bcan't\b/gi, 'cannot')
        .replace(/\bwon't\b/gi, 'will not')
        .replace(/\bdon't\b/gi, 'do not')
        .replace(/\bdidn't\b/gi, 'did not')
        .replace(/\bisn't\b/gi, 'is not')
        .replace(/\baren't\b/gi, 'are not')
        .replace(/\bI'm\b/gi, 'I am')
        .replace(/\byou're\b/gi, 'you are')
        .replace(/\bthey're\b/gi, 'they are')
        .replace(/\bit's\b/gi, 'it is')
        .replace(/\bthat's\b/gi, 'that is')
        .replace(/!/g, '.')
        .replace(/\bhi\b/gi, 'Greetings')
        .replace(/\bhey\b/gi, 'Hello')
        .replace(/\bawesome\b/gi, 'excellent')
        .replace(/\bcool\b/gi, 'interesting')
        .replace(/\bstuff\b/gi, 'matters')
        .replace(/\bthings\b/gi, 'items')
        .replace(/\bkinda\b/gi, 'somewhat')
        .replace(/\bgonna\b/gi, 'going to')
    } else if (toneLevel > 70) {
      // Casual
      adjusted = adjusted
        .replace(/\bcannot\b/gi, "can't")
        .replace(/\bwill not\b/gi, "won't")
        .replace(/\bdo not\b/gi, "don't")
        .replace(/\bdid not\b/gi, "didn't")
        .replace(/\bis not\b/gi, "isn't")
        .replace(/\bare not\b/gi, "aren't")
        .replace(/\bI am\b/gi, "I'm")
        .replace(/\byou are\b/gi, "you're")
        .replace(/\bthey are\b/gi, "they're")
        .replace(/\bit is\b/gi, "it's")
        .replace(/\bthat is\b/gi, "that's")
        .replace(/\bGreetings\b/gi, 'Hey')
        .replace(/\bHello\b/gi, 'Hi')
        .replace(/\bexcellent\b/gi, 'awesome')
        .replace(/\binteresting\b/gi, 'cool')
        .replace(/\bmatters\b/gi, 'stuff')
        .replace(/\bitems\b/gi, 'things')
        .replace(/\bsomewhat\b/gi, 'kinda')
        .replace(/\bgoing to\b/gi, 'gonna')
    }

    setOutput(adjusted)
  }

  const insertOutput = () => {
    if (onInsert && output) {
      onInsert(output)
      alert('Text inserted!')
    } else {
      navigator.clipboard.writeText(output)
      alert('Copied to clipboard!')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-black mb-4">Smart Writing Tools</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('headline')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'headline'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Headline Generator
        </button>
        <button
          onClick={() => setActiveTab('grammar')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'grammar'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Grammar Check
        </button>
        <button
          onClick={() => setActiveTab('tone')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'tone'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tone Adjuster
        </button>
      </div>

      {/* Headline Generator */}
      {activeTab === 'headline' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Enter Your Topic
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., AI in Healthcare, Remote Work"
            />
          </div>
          <button
            onClick={generateHeadline}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
          >
            Generate Headline
          </button>
          {output && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-lg font-semibold text-black mb-2">{output}</p>
              <button
                onClick={insertOutput}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                {onInsert ? 'Insert' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grammar Check */}
      {activeTab === 'grammar' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Enter Text to Check
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={6}
              placeholder="Paste your text here..."
            />
          </div>
          <button
            onClick={checkGrammar}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Grammar'}
          </button>
          {output && (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-black whitespace-pre-wrap">{output}</pre>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Powered by LanguageTool free API
          </p>
        </div>
      )}

      {/* Tone Adjuster */}
      {activeTab === 'tone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Enter Text to Adjust
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={6}
              placeholder="Paste your text here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tone: {toneLevel < 30 ? 'Formal' : toneLevel > 70 ? 'Casual' : 'Balanced'}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={toneLevel}
              onChange={(e) => setToneLevel(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Formal</span>
              <span>Balanced</span>
              <span>Casual</span>
            </div>
          </div>
          <button
            onClick={adjustTone}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
          >
            Adjust Tone
          </button>
          {output && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-black whitespace-pre-wrap mb-2">{output}</p>
              <button
                onClick={insertOutput}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                {onInsert ? 'Insert' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
