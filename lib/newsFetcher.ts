// Real-time news and data fetching utilities
// This file contains functions to fetch data from various news APIs

// News API (free tier: 100 requests/day)
export async function fetchNewsAPI(category: string = 'technology', pageSize: number = 10) {
  const API_KEY = process.env.NEWS_API_KEY
  if (!API_KEY) {
    console.warn('NEWS_API_KEY not found, using mock data')
    return getMockNewsData()
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=${pageSize}&apiKey=${API_KEY}`
    )
    const data = await response.json()
    
    return data.articles?.map((article: any) => ({
      title: article.title,
      summary: article.description || article.content?.substring(0, 200) + '...',
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      category: category
    })) || []
  } catch (error) {
    console.error('News API error:', error)
    return getMockNewsData()
  }
}

// Reddit API (free, no key required)
export async function fetchRedditTrends(subreddit: string = 'technology', limit: number = 10) {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`
    )
    const data = await response.json()
    
    return data.data?.children?.map((post: any) => ({
      title: post.data.title,
      summary: post.data.selftext?.substring(0, 200) + '...' || 'Reddit discussion',
      url: `https://reddit.com${post.data.permalink}`,
      source: 'Reddit',
      score: post.data.score,
      comments: post.data.num_comments,
      publishedAt: new Date(post.data.created_utc * 1000).toISOString()
    })) || []
  } catch (error) {
    console.error('Reddit API error:', error)
    return []
  }
}

// Hacker News API (free, no key required)
export async function fetchHackerNews(limit: number = 10) {
  try {
    // Get top stories
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    const topStories = await topStoriesResponse.json()
    
    // Get details for top stories
    const stories = await Promise.all(
      topStories.slice(0, limit).map(async (id: number) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        return response.json()
      })
    )
    
    return stories.map((story: any) => ({
      title: story.title,
      summary: story.text?.substring(0, 200) + '...' || 'Hacker News discussion',
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      source: 'Hacker News',
      score: story.score,
      comments: story.descendants,
      publishedAt: new Date(story.time * 1000).toISOString()
    }))
  } catch (error) {
    console.error('Hacker News API error:', error)
    return []
  }
}

// GitHub Trending API (free, no key required)
export async function fetchGitHubTrending(language: string = 'javascript', since: string = 'daily') {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=10`
    )
    const data = await response.json()
    
    return data.items?.map((repo: any) => ({
      title: repo.name,
      summary: repo.description || 'GitHub repository',
      url: repo.html_url,
      source: 'GitHub',
      stars: repo.stargazers_count,
      language: repo.language,
      publishedAt: repo.updated_at
    })) || []
  } catch (error) {
    console.error('GitHub API error:', error)
    return []
  }
}

// RSS Feed Parser (for various news sources)
export async function fetchRSSFeed(url: string) {
  try {
    // Using a CORS proxy for RSS feeds
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    const data = await response.json()
    
    return data.items?.map((item: any) => ({
      title: item.title,
      summary: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      url: item.link,
      source: data.feed?.title || 'RSS Feed',
      publishedAt: item.pubDate
    })) || []
  } catch (error) {
    console.error('RSS Feed error:', error)
    return []
  }
}

// Mock data fallback
function getMockNewsData() {
  return [
    {
      title: "AI Breakthrough in Natural Language Processing",
      summary: "Researchers have developed a new AI model that can understand context better than previous systems, potentially revolutionizing how we interact with technology.",
      source: "TechCrunch",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Sustainable Energy Solutions Gain Momentum",
      summary: "New solar panel technology shows 40% efficiency improvement, making renewable energy more accessible for residential and commercial use.",
      source: "GreenTech",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Remote Work Tools Evolution",
      summary: "Latest collaboration platforms integrate AI-powered features for better team productivity and seamless virtual meetings.",
      source: "WorkTech",
      publishedAt: new Date().toISOString()
    }
  ]
}

// Aggregate all news sources
export async function fetchAllNewsSources() {
  const [newsAPI, redditTech, hackerNews, githubTrending] = await Promise.all([
    fetchNewsAPI('technology', 5),
    fetchRedditTrends('technology', 5),
    fetchHackerNews(5),
    fetchGitHubTrending('javascript', 'daily')
  ])

  return {
    newsAPI,
    redditTech,
    hackerNews,
    githubTrending,
    allSources: [...newsAPI, ...redditTech, ...hackerNews, ...githubTrending]
  }
}

