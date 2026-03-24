import axios from 'axios';

export const scrapeReddit = async (keyword) => {
  try {
    // We search across all, but filter for frustration-based keywords
    const query = `${keyword} AND (frustrated OR "why is it so" OR hate OR "is there a way" OR problem)`;
    const response = await axios.get(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=25`);
    
    // Filter out NSFW and extremely short posts (probably memes)
    return response.data.data.children
      .filter(child => !child.data.over_18 && child.data.selftext.length > 50)
      .map(child => ({
        title: child.data.title,
        text: child.data.selftext,
        url: `https://reddit.com${child.data.permalink}`,
        author: child.data.author,
        ups: child.data.ups,
        num_comments: child.data.num_comments
      }));
  } catch (error) {
    console.error('Reddit Scraping Error:', error);
    return [];
  }
};
