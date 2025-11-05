// Template-based newsletter generation (no OpenAI required)

export interface VoiceProfile {
  topics?: string
  tone?: string
  feeling?: string
  analysis?: any
}

export interface NewsItem {
  title: string
  summary: string
  url?: string
  source?: string
  publishedAt?: string
}

export function generateNewsletterWithTemplate(
  voiceProfile: VoiceProfile | null | undefined,
  newsItems: NewsItem[]
): string {
  // Handle empty news items
  if (!newsItems || newsItems.length === 0) {
    return generateEmptyNewsletter(voiceProfile?.topics)
  }

  const topics = voiceProfile?.topics || 'technology'
  const tone = voiceProfile?.tone || 'professional'
  const feeling = voiceProfile?.feeling || 'informed'

  // Get greeting based on tone
  const greeting = getGreeting(tone)
  const closing = getClosing(tone)

  // Generate subject line
  const mainTopic = newsItems[0]?.title || 'Latest Updates'
  const subjectLine = `📰 ${mainTopic.split(':')[0].substring(0, 50)}`

  // Build newsletter sections
  const intro = generateIntro(topics, tone, feeling)
  const contentSections = generateContentSections(newsItems, tone)
  const commentary = generateCommentary(newsItems, topics, tone)
  const callToAction = generateCallToAction(tone)

  // Assemble newsletter
  return `# ${subjectLine}

${greeting}

${intro}

---

${contentSections}

${commentary}

---

${callToAction}

${closing}

---

**📧 Newsletter Info**
- Generated: ${new Date().toLocaleDateString()}
- Topics: ${topics}
- Items: ${newsItems.length}
- Powered by SoulThread 🧵

*This newsletter was created based on your voice profile and latest trends.*
`
}

function getGreeting(tone: string): string {
  const greetings: { [key: string]: string[] } = {
    casual: [
      'Hey there! 👋',
      'What\'s up! 🙌',
      'Hi friend! 😊',
    ],
    professional: [
      'Good day,',
      'Hello,',
      'Greetings,',
    ],
    friendly: [
      'Hello there! 😊',
      'Hi friend! 👋',
      'Hey! Hope you\'re doing well! 🌟',
    ],
  }

  const options = greetings[tone] || greetings.professional
  return options[Math.floor(Math.random() * options.length)]
}

function getClosing(tone: string): string {
  const closings: { [key: string]: string } = {
    casual: 'Catch you later! ✌️\n\nYour friendly newsletter curator',
    professional: 'Best regards,\n\nYour Newsletter Team',
    friendly: 'Have a great day! 🌟\n\nWarm regards,\nYour Newsletter Friend',
  }

  return closings[tone] || closings.professional
}

function generateIntro(topics: string, tone: string, feeling: string): string {
  const intros: { [key: string]: string } = {
    casual: `Welcome to your personalized ${topics} newsletter! I've rounded up the most interesting stories that'll keep you ${feeling} and in-the-know. Let's dive in! 🚀`,
    professional: `Welcome to this edition of your ${topics} newsletter. I've curated the most relevant developments to keep you ${feeling} about the latest industry trends.`,
    friendly: `I'm excited to share this week's ${topics} highlights with you! I've handpicked these stories to help you feel ${feeling} and stay ahead of the curve. 📚`,
  }

  return intros[tone] || intros.professional
}

function generateContentSections(newsItems: NewsItem[], tone: string): string {
  return newsItems.map((item, index) => {
    const emoji = getEmoji(index)
    const commentary = generateItemCommentary(item, tone)

    return `## ${emoji} ${item.title}

${item.summary}

${commentary}

${item.url ? `**🔗 [Read the full story](${item.url})**` : ''}
${item.source ? `*Source: ${item.source}*` : ''}
`
  }).join('\n\n')
}

function getEmoji(index: number): string {
  const emojis = ['🔥', '💡', '🚀', '⚡', '🎯', '🌟', '💻', '🔮', '📊', '🎨']
  return emojis[index % emojis.length]
}

function generateItemCommentary(item: NewsItem, tone: string): string {
  const commentaries: { [key: string]: string[] } = {
    casual: [
      '**My take:** This is huge! This could really shake things up in the industry.',
      '**Quick thoughts:** Pretty interesting development here. Definitely worth keeping an eye on.',
      '**Why it matters:** This trend is picking up steam and could be a game-changer.',
    ],
    professional: [
      '**Analysis:** This represents a significant development in the field that warrants attention.',
      '**Key takeaway:** Organizations should consider the implications of this trend.',
      '**Industry impact:** This development may influence strategic planning across the sector.',
    ],
    friendly: [
      '**Here\'s what I think:** This is really exciting and could open up new possibilities!',
      '**My perspective:** I find this development particularly interesting because of its potential impact.',
      '**Worth noting:** This is something that could benefit many people in our community.',
    ],
  }

  const options = commentaries[tone] || commentaries.professional
  return options[Math.floor(Math.random() * options.length)]
}

function generateCommentary(newsItems: NewsItem[], topics: string, tone: string): string {
  const commentaries: { [key: string]: string } = {
    casual: `## 🤔 Final Thoughts

So there you have it - some pretty cool stuff happening in ${topics}! The big theme I'm seeing here is rapid innovation and change. Whether you're a pro or just getting started, these trends are definitely worth following.

What do you think about these developments? Hit reply and let me know! I love hearing your thoughts. 💬`,

    professional: `## 📈 Executive Summary

The developments highlighted in this newsletter underscore the continued evolution in ${topics}. Key themes include technological advancement, market disruption, and emerging opportunities for strategic positioning.

**Recommended Actions:**
- Monitor these trends for potential organizational impact
- Consider strategic implications for your operations
- Stay informed on further developments in this space`,

    friendly: `## 💭 My Personal Take

I've been following ${topics} for a while now, and I have to say - these stories really show how fast things are moving! It's exciting to see all this innovation happening.

I hope you found these insights valuable. If any of these topics resonated with you, I'd love to hear about it! Feel free to reach out anytime. 😊`,
  }

  return commentaries[tone] || commentaries.professional
}

function generateCallToAction(tone: string): string {
  const ctas: { [key: string]: string } = {
    casual: `## 🎯 What's Next?

Want more content like this? Here's how to stay in the loop:
- ⭐ Share this newsletter with friends
- 💬 Reply with topics you'd like to see covered
- 🔔 Make sure you're subscribed for the next edition!`,

    professional: `## 📬 Stay Connected

**Maximize your industry insights:**
- Forward this newsletter to colleagues who may benefit
- Provide feedback on topics of interest
- Subscribe for regular updates on industry developments`,

    friendly: `## 💌 Let's Stay in Touch!

I'd love to hear from you! Here are some ways to connect:
- ✨ Share this with someone who might find it helpful
- 💭 Tell me what topics you'd like to explore next
- 🎉 Join our community for more great content!`,
  }

  return ctas[tone] || ctas.professional
}

export function generateQuickNewsletter(newsItems: NewsItem[], topic?: string): string {
  if (newsItems.length === 0) {
    return generateEmptyNewsletter(topic)
  }

  return `# 📰 ${topic || 'Latest Updates'}

Hello!

Here's your curated newsletter with the latest developments:

${newsItems.map((item, i) => `
## ${i + 1}. ${item.title}

${item.summary}

${item.url ? `[Read more](${item.url})` : ''}
${item.source ? `*Source: ${item.source}*` : ''}
`).join('\n---\n')}

---

**Newsletter Details**
- Generated: ${new Date().toLocaleString()}
- Items: ${newsItems.length}
- Topic: ${topic || 'General'}

*Powered by SoulThread 🧵*
`
}

function generateEmptyNewsletter(topic?: string): string {
  return `# 📰 ${topic || 'Newsletter'}

Hello!

We couldn't find any news items for this edition, but here are some suggestions:

## 🔍 Try These Topics:
- AI and Machine Learning
- Technology Trends
- Business Innovation
- Startup News

## 💡 Tips:
1. Select a specific topic from the dropdown
2. Enable "Use Real-Time Data" to fetch live news
3. Try different topics to find interesting content

---

**Generated:** ${new Date().toLocaleString()}

*Powered by SoulThread 🧵*
`
}
