// Newsletter template system
export interface NewsletterTemplate {
  id: string
  name: string
  description: string
  category: 'tech' | 'business' | 'casual' | 'professional' | 'creative'
  structure: TemplateSection[]
  variables: TemplateVariable[]
  preview: string
}

export interface TemplateSection {
  id: string
  name: string
  required: boolean
  placeholder: string
  maxLength?: number
  format: 'text' | 'markdown' | 'html'
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'date' | 'url' | 'email'
  required: boolean
  defaultValue?: string
  description: string
}

export const DEFAULT_TEMPLATES: NewsletterTemplate[] = [
  {
    id: 'tech-weekly',
    name: 'Tech Weekly',
    description: 'Professional technology newsletter with industry insights',
    category: 'tech',
    structure: [
      {
        id: 'greeting',
        name: 'Greeting',
        required: true,
        placeholder: 'Hello Tech Enthusiasts!',
        format: 'text'
      },
      {
        id: 'intro',
        name: 'Introduction',
        required: true,
        placeholder: 'This week in technology...',
        format: 'markdown'
      },
      {
        id: 'main-story',
        name: 'Main Story',
        required: true,
        placeholder: 'The biggest tech story of the week...',
        format: 'markdown'
      },
      {
        id: 'trending',
        name: 'Trending Topics',
        required: false,
        placeholder: 'What\'s trending this week...',
        format: 'markdown'
      },
      {
        id: 'insights',
        name: 'Personal Insights',
        required: false,
        placeholder: 'My take on these developments...',
        format: 'markdown'
      },
      {
        id: 'closing',
        name: 'Closing',
        required: true,
        placeholder: 'Until next week...',
        format: 'text'
      }
    ],
    variables: [
      {
        name: 'author_name',
        type: 'text',
        required: true,
        defaultValue: 'Tech Editor',
        description: 'Name of the newsletter author'
      },
      {
        name: 'company_name',
        type: 'text',
        required: false,
        description: 'Company or organization name'
      }
    ],
    preview: `# Tech Weekly

Hello Tech Enthusiasts!

Welcome to this week's edition of Tech Weekly! This week has been absolutely packed with groundbreaking announcements, from quantum computing milestones to AI breakthroughs that are reshaping entire industries.

## Main Story

**Quantum Computing Reaches Commercial Viability**

The tech world is buzzing after IBM and Google simultaneously announced commercial quantum processors exceeding 1000 qubits. This isn't just an incremental improvement—it's a watershed moment that marks the transition from experimental quantum computing to practical, real-world applications.

What makes this particularly exciting is the range of problems these systems can now tackle. We're talking about drug discovery simulations that would take classical supercomputers millennia, completed in minutes. Financial institutions are already lining up to use quantum algorithms for portfolio optimization and risk analysis.

The implications extend far beyond number crunching. Quantum computers could revolutionize materials science, helping us design better batteries, more efficient solar panels, and revolutionary new materials we can't even imagine yet. Climate scientists are eager to use these systems for more accurate weather prediction and climate modeling.

## Trending Topics

**1. Open Source AI Models Outperform Proprietary Alternatives**
The AI landscape is shifting dramatically as open-source models like Llama 3, Mistral, and Falcon match or exceed GPT-4's capabilities. This democratization means startups and researchers worldwide can build cutting-edge AI applications without expensive API costs.

**2. Brain-Computer Interfaces Hit 90 Words Per Minute**
Neuralink and Synchron reported breakthrough results with paralyzed patients typing at near-natural conversation speeds using only neural signals. This technology is restoring communication and independence to people with severe disabilities.

**3. Vertical Farms Powered by AI Show 400% Productivity Gains**
AI-optimized vertical farms are producing 400% more food per square foot while using 95% less water than traditional farming. Companies like Plenty and AeroFarms are scaling rapidly in urban centers worldwide.

## Personal Insights

The quantum computing announcement really drives home how we're entering an era where problems previously considered "unsolvable" are becoming tractable. But I'm equally excited about the open-source AI movement—it's proving that innovation doesn't require massive corporate budgets.

What concerns me is the widening gap between organizations that can leverage these technologies and those that can't. As these tools become more powerful, we need to ensure they're accessible and that we're training people to use them effectively.

The BCI advances are particularly moving. When technology can restore someone's ability to communicate with loved ones, it reminds us why we do this work in the first place.

Until next week, stay curious and keep building!

Tech Editor`
  },
  {
    id: 'business-brief',
    name: 'Business Brief',
    description: 'Concise business newsletter for professionals',
    category: 'business',
    structure: [
      {
        id: 'greeting',
        name: 'Greeting',
        required: true,
        placeholder: 'Good morning,',
        format: 'text'
      },
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        required: true,
        placeholder: 'Key business highlights this week...',
        format: 'markdown'
      },
      {
        id: 'market_update',
        name: 'Market Update',
        required: true,
        placeholder: 'Market movements and analysis...',
        format: 'markdown'
      },
      {
        id: 'startup_spotlight',
        name: 'Startup Spotlight',
        required: false,
        placeholder: 'Notable startup news...',
        format: 'markdown'
      },
      {
        id: 'closing',
        name: 'Closing',
        required: true,
        placeholder: 'Best regards,',
        format: 'text'
      }
    ],
    variables: [
      {
        name: 'author_name',
        type: 'text',
        required: true,
        defaultValue: 'Business Analyst',
        description: 'Name of the newsletter author'
      }
    ],
    preview: `# Business Brief

Good morning,

I hope this message finds you well. This week's business landscape has been marked by significant market movements, strategic acquisitions, and emerging trends that every business leader should be tracking.

## Executive Summary

**Key Business Highlights This Week:**

• **Tech M&A Activity Surges**: Three major acquisitions announced totaling $47B, signaling renewed confidence in strategic consolidation despite economic headwinds

• **Federal Reserve Holds Rates Steady**: The Fed maintained interest rates at 5.25-5.50%, indicating potential rate cuts in Q3 2025 if inflation continues moderating

• **AI Investment Reaches $156B YTD**: Enterprise AI spending accelerates as companies race to implement productivity-enhancing automation

• **Supply Chain Resilience Improves**: Global shipping times normalize to pre-pandemic levels, reducing costs and improving inventory management

## Market Update

**Equity Markets**
The S&P 500 gained 2.3% this week, driven primarily by technology and healthcare sectors. Tech giants reported better-than-expected earnings, with cloud computing and AI services showing particularly strong growth. The Nasdaq composite surged 3.1%, reaching new highs for 2025.

**Bond Markets**
Treasury yields declined modestly as investors anticipate potential rate cuts. The 10-year Treasury yield dropped to 4.12%, while the 2-year yield fell to 4.45%, maintaining a normalized yield curve that suggests economic stability.

**Commodities**
Oil prices stabilized around $78/barrel as OPEC+ production cuts balanced against increased U.S. shale output. Gold reached $2,150/oz as investors sought safe-haven assets amid geopolitical tensions in Eastern Europe.

**Currency Markets**
The dollar weakened against major currencies, with the euro climbing to $1.12 and the yen strengthening to ¥142. This reflects shifting expectations around central bank policies globally.

## Startup Spotlight

**Quantum Therapeutics Raises $380M Series C**
The biotech startup leveraging quantum computing for drug discovery secured one of the largest Series C rounds this year. Lead investor Sequoia Capital cited the company's breakthrough platform that reduces drug development timelines from 10 years to 3 years.

**FinTech Unicorn Expands to Latin America**
PayFlow, the B2B payment automation platform, announced expansion into Brazil and Mexico after processing $12B in transactions across North America. The company's AI-powered cash flow forecasting tool has attracted 15,000 SMB customers.

**Sustainability Tech Gets Boost**
Carbon capture startup AtmosClean secured contracts with five Fortune 500 manufacturers. Their modular carbon capture units can be retrofitted to existing facilities, removing CO2 at $50/ton—a breakthrough price point making adoption economically viable.

## Risk Factors to Monitor

• Geopolitical tensions affecting semiconductor supply chains
• Commercial real estate market showing continued stress in major metros
• Consumer spending showing signs of fatigue despite strong employment

Best regards,
Business Analyst`
  },
  {
    id: 'casual-chat',
    name: 'Casual Chat',
    description: 'Friendly, conversational newsletter',
    category: 'casual',
    structure: [
      {
        id: 'greeting',
        name: 'Greeting',
        required: true,
        placeholder: 'Hey there! 👋',
        format: 'text'
      },
      {
        id: 'personal_update',
        name: 'Personal Update',
        required: false,
        placeholder: 'What I\'ve been up to...',
        format: 'markdown'
      },
      {
        id: 'cool_finds',
        name: 'Cool Finds',
        required: true,
        placeholder: 'Cool things I discovered this week...',
        format: 'markdown'
      },
      {
        id: 'thoughts',
        name: 'Random Thoughts',
        required: false,
        placeholder: 'Random thoughts and musings...',
        format: 'markdown'
      },
      {
        id: 'closing',
        name: 'Closing',
        required: true,
        placeholder: 'Talk soon!',
        format: 'text'
      }
    ],
    variables: [
      {
        name: 'author_name',
        type: 'text',
        required: true,
        defaultValue: 'Your Friend',
        description: 'Name of the newsletter author'
      }
    ],
    preview: `# Casual Chat

Hey there! 👋

Hope your week has been treating you well! Mine's been a rollercoaster of productivity, procrastination, and plenty of coffee. You know, the usual.

## Personal Update

So I finally finished that home office makeover I've been putting off for literal months. Turns out, assembling IKEA furniture really does test the limits of human patience and relationships. But it's done, and I'm now typing this from my "ergonomic workspace" (translation: I have a standing desk I'll probably use twice before going back to slouching).

I also picked up rock climbing again after a two-year hiatus. My arms are absolutely screaming, but there's something incredibly satisfying about solving physical puzzles on a wall. Plus, it's nice to have a hobby that doesn't involve staring at a screen, you know?

Oh, and I finally watched that show everyone's been raving about—you know the one. No spoilers, but WOW, that plot twist in episode 6 completely blew my mind. Worth the hype.

## Cool Finds

**1. Notion AI for Daily Planning**
I know, I know, I'm late to the party. But seriously, having AI help structure my daily tasks and break down big projects into manageable chunks has been a game-changer. It's like having a personal assistant who doesn't judge my questionable productivity habits.

**2. This Amazing Coffee Shop Playlist**
Found this Spotify playlist called "Cozy Coffee Shop Vibes" and it's been my coding soundtrack all week. Perfect background music that's interesting enough to be pleasant but not distracting enough to kill focus. Here's the link: [spotify.com/playlist/example]

**3. The Pomodoro Technique (Finally Works for Me!)**
After years of trying and failing, I tweaked the classic 25-min work / 5-min break ratio to 50/10, and suddenly it clicks. Turns out I just needed longer deep work sessions. Who knew?

**4. Overnight Oats Recipe Perfection**
After 15 failed attempts, I've cracked the code: 1/2 cup oats, 1/2 cup milk, 1 tbsp chia seeds, 1 tbsp honey, berries. Refrigerate overnight. Breakfast solved forever.

**5. Browser Extension: "OneTab"**
This thing is a lifesaver for tab hoarders like me. Condenses all your tabs into a list with one click. I went from 67 tabs to 1. My laptop's fan has never been quieter.

## Random Thoughts

Been thinking a lot about how we romanticize "hustle culture" while simultaneously burning out. Maybe the real productivity hack is just... doing less? Saying no to things that don't matter? Revolutionary concept, I know.

Also, why do the best ideas always come right when you're falling asleep or in the shower? Is there a way to bottle that state of relaxed creativity and apply it during actual work hours?

And one more thing: people who reply to emails within 5 minutes—are you okay? How are you so on top of things? Teach me your ways.

Talk soon! (And by soon, I mean whenever we both remember to send that next email we've been putting off.)

Your Friend`
  },
  {
    id: 'creative-spark',
    name: 'Creative Spark',
    description: 'Inspirational newsletter for creatives',
    category: 'creative',
    structure: [
      {
        id: 'greeting',
        name: 'Greeting',
        required: true,
        placeholder: 'Hello Creative Soul! ✨',
        format: 'text'
      },
      {
        id: 'inspiration',
        name: 'Inspiration Corner',
        required: true,
        placeholder: 'This week\'s inspiration...',
        format: 'markdown'
      },
      {
        id: 'creative_tools',
        name: 'Creative Tools',
        required: false,
        placeholder: 'Tools and resources I love...',
        format: 'markdown'
      },
      {
        id: 'community_spotlight',
        name: 'Community Spotlight',
        required: false,
        placeholder: 'Amazing creators to follow...',
        format: 'markdown'
      },
      {
        id: 'closing',
        name: 'Closing',
        required: true,
        placeholder: 'Keep creating!',
        format: 'text'
      }
    ],
    variables: [
      {
        name: 'author_name',
        type: 'text',
        required: true,
        defaultValue: 'Creative Guide',
        description: 'Name of the newsletter author'
      }
    ],
    preview: `# Creative Spark

Hello Creative Soul! ✨

Welcome to this week's dose of creative inspiration! Whether you're painting, writing, designing, or building something entirely new, I hope this edition sparks that creative fire within you.

## Inspiration Corner

**Finding Magic in Constraints**

This week, I've been completely captivated by the work of photographer Vivian Maier, whose incredible street photography wasn't discovered until after her death. What strikes me most isn't just the quality of her work, but how she created masterpieces while working as a nanny—squeezing art into the margins of everyday life.

It's a beautiful reminder that we don't need perfect conditions to create. Sometimes our constraints—limited time, basic tools, small budgets—actually push us toward more innovative solutions. The pressure to work within boundaries can crystallize our vision rather than dilute it.

I've been applying this mindset to my own creative projects. Instead of waiting for the "right moment" or the "perfect setup," I'm embracing the messy middle. That novel you're writing? It doesn't need a cabin in the woods. Those sketches? They're valid even if done on your lunch break with a ballpoint pen.

**Quote of the Week:**
*"Creativity is allowing yourself to make mistakes. Art is knowing which ones to keep."* — Scott Adams

## Creative Tools

**1. Midjourney v6 for Visual Brainstorming**
AI image generation has reached a point where it's genuinely useful for mood boarding and concept exploration. I've been using Midjourney v6 to rapidly prototype visual ideas before committing to time-intensive work. It's like having an infinitely patient collaborator who never judges your weird ideas.

**2. Notion Templates for Creative Projects**
I finally organized my chaotic creative process using Notion's project templates. Having dedicated spaces for research, drafts, feedback, and final versions has reduced my "where did I save that idea?" moments by about 90%.

**3. Epidemic Sound for Royalty-Free Music**
For video creators, this subscription service has been a game-changer. High-quality music across every genre, all cleared for commercial use. Finally stopped stress-sweating about copyright claims.

**4. Procreate Dreams for Animation**
iPad animation just got seriously powerful. Procreate Dreams brings the intuitive feel of Procreate to motion graphics and animation. The learning curve is surprisingly gentle for such capable software.

**5. Hemingway Editor for Writing Clarity**
This free writing tool highlights complex sentences and suggests simplifications. It's like having an editor who keeps you honest about readability without stifling your voice.

## Community Spotlight

**@aartistic.adventures (Instagram)**
Digital artist creating the most mesmerizing abstract animations. Every piece feels like watching thoughts take physical form. Highly recommend if you're into generative art.

**The Illustrators Lounge (Discord)**
Joined this community last month and the supportive vibe is incredible. Daily sketch challenges, portfolio reviews, and actually helpful feedback. No gatekeeping, just genuine encouragement.

**Creative Pep Talk Podcast**
Andy J. Pizza's podcast has been my Monday morning ritual. Each episode tackles creative blocks, imposter syndrome, and the business side of creative work with humor and honesty.

## This Week's Creative Challenge

Try the "10-Minute Daily" approach: Set a timer for 10 minutes and create something—anything—without overthinking. A sketch, a paragraph, a melody, a photo. The goal isn't perfection; it's showing up. By Friday, you'll have five small creations you wouldn't have had otherwise.

Keep creating, keep experimenting, and remember: your creative voice matters.

Keep creating!
Creative Guide`
  }
]

export function getTemplateById(id: string): NewsletterTemplate | undefined {
  return DEFAULT_TEMPLATES.find(template => template.id === id)
}

export function getTemplatesByCategory(category: string): NewsletterTemplate[] {
  return DEFAULT_TEMPLATES.filter(template => template.category === category)
}

export function getAllTemplates(): NewsletterTemplate[] {
  return DEFAULT_TEMPLATES
}

export function generateNewsletterFromTemplate(
  template: NewsletterTemplate,
  content: { [key: string]: string },
  variables: { [key: string]: string } = {}
): string {
  let newsletter = ''
  
  // Apply template structure
  for (const section of template.structure) {
    const sectionContent = content[section.id]
    if (sectionContent) {
      if (section.format === 'markdown') {
        newsletter += `## ${section.name}\n\n${sectionContent}\n\n`
      } else {
        newsletter += `${sectionContent}\n\n`
      }
    } else if (section.required) {
      newsletter += `## ${section.name}\n\n${section.placeholder}\n\n`
    }
  }
  
  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    newsletter = newsletter.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  
  // Apply default variables
  for (const variable of template.variables) {
    if (variable.defaultValue && !variables[variable.name]) {
      newsletter = newsletter.replace(
        new RegExp(`{{${variable.name}}}`, 'g'), 
        variable.defaultValue
      )
    }
  }
  
  return newsletter.trim()
}

export function validateTemplateContent(
  template: NewsletterTemplate,
  content: { [key: string]: string }
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check required sections
  for (const section of template.structure) {
    if (section.required && (!content[section.id] || content[section.id].trim().length === 0)) {
      errors.push(`${section.name} is required`)
    }
  }
  
  // Check required variables
  for (const variable of template.variables) {
    if (variable.required && !content[variable.name]) {
      errors.push(`${variable.name} is required`)
    }
  }
  
  // Check section length limits
  for (const section of template.structure) {
    if (section.maxLength && content[section.id] && content[section.id].length > section.maxLength) {
      errors.push(`${section.name} exceeds maximum length of ${section.maxLength} characters`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function createCustomTemplate(
  name: string,
  description: string,
  category: string,
  structure: TemplateSection[],
  variables: TemplateVariable[] = []
): NewsletterTemplate {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    category: category as any,
    structure,
    variables,
    preview: `Custom template: ${name}\n\n${description}`
  }
}

export function exportTemplate(template: NewsletterTemplate): string {
  return JSON.stringify(template, null, 2)
}

export function importTemplate(templateJson: string): NewsletterTemplate | null {
  try {
    const template = JSON.parse(templateJson)
    
    // Validate template structure
    if (!template.id || !template.name || !template.structure) {
      return null
    }
    
    return template
  } catch (error) {
    console.error('Failed to import template:', error)
    return null
  }
}

