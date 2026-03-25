import * as scraperService from '../services/scraperService.js';
import * as aiService from '../services/aiService.js';
import Problem from '../models/Problem.js';

export const handleDiscovery = async (req, res) => {
  const { keyword, sources } = req.body;
  
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const selectedSources = sources || ['Reddit'];
    console.log(`Searching for problems in [${selectedSources.join(', ')}] related to: ${keyword}`);
    
    // Concurrently fetch only from selected sources
    const fetchingPromises = [];
    if (selectedSources.includes('Reddit')) fetchingPromises.push(scraperService.scrapeReddit(keyword));
    if (selectedSources.includes('Hacker News')) fetchingPromises.push(scraperService.scrapeHackerNews(keyword));
    if (selectedSources.includes('X')) fetchingPromises.push(scraperService.scrapeX(keyword));
    if (selectedSources.includes('Product Hunt')) fetchingPromises.push(scraperService.scrapeProductHunt(keyword));
    
    const results = await Promise.all(fetchingPromises);
    const rawData = results.flat();
    
    if (rawData.length === 0) {
      return res.json({ clusters: [], message: 'No significant problems found.' });
    }

    // 2. AI Clustering
    const clusters = await aiService.processProblems(rawData, selectedSources);

    // 3. Persist to MongoDB (if connected)
    try {
      const newProblem = new Problem({
        keyword,
        clusters,
        rawData
      });
      await newProblem.save();
      console.log('✅ Discovery saved to database');
    } catch (dbError) {
      console.warn('⚠️ Could not save to database (check MONGODB_URI):', dbError.message);
    }

    res.json({ clusters, rawData });
  } catch (error) {
    console.error('Discovery Error:', error);
    res.status(500).json({ error: 'Failed to process discovery engine' });
  }
};

export const handleDeepDive = async (req, res) => {
  const { cluster } = req.body;
  
  if (!cluster || !cluster.title) {
    return res.status(400).json({ error: 'Cluster data is required' });
  }

  try {
    const deepDive = await aiService.generateDeepDive(cluster);
    if (!deepDive) return res.status(500).json({ error: 'AI failed to generate deep dive' });
    
    res.json(deepDive);
  } catch (error) {
    console.error('Deep Dive Error:', error);
    res.status(500).json({ error: 'Failed to generate deep dive analysis' });
  }
};
