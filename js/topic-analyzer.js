/**
 * Topic Analyzer Module
 * Responsible for analyzing research topics and dividing them into subtopics
 */

const TopicAnalyzer = (() => {
    // Default subtopics for common research areas
    const defaultSubtopics = {
        general: [
            {
                title: 'Introduction and Background',
                description: 'Overview of the topic, historical context, and importance'
            },
            {
                title: 'Key Concepts and Definitions',
                description: 'Explanation of fundamental concepts, terminology, and frameworks'
            },
            {
                title: 'Current State and Developments',
                description: 'Recent advancements, current research, and state of the field'
            },
            {
                title: 'Analysis and Implications',
                description: 'Critical analysis, future directions, and broader implications'
            }
        ],
        science: [
            {
                title: 'Theoretical Framework',
                description: 'Underlying theories, principles, and conceptual foundations'
            },
            {
                title: 'Methodologies and Approaches',
                description: 'Research methods, experimental designs, and analytical techniques'
            },
            {
                title: 'Key Findings and Discoveries',
                description: 'Major research outcomes, breakthroughs, and empirical evidence'
            },
            {
                title: 'Applications and Future Directions',
                description: 'Practical applications, implications, and future research avenues'
            }
        ],
        history: [
            {
                title: 'Historical Context and Timeline',
                description: 'Chronological development and contextual background'
            },
            {
                title: 'Key Figures and Influences',
                description: 'Important individuals, groups, and their contributions'
            },
            {
                title: 'Major Events and Developments',
                description: 'Significant occurrences, changes, and their impacts'
            },
            {
                title: 'Legacy and Contemporary Relevance',
                description: 'Long-term effects, modern significance, and ongoing influence'
            }
        ],
        technology: [
            {
                title: 'Technical Foundations',
                description: 'Core technologies, underlying principles, and technical specifications'
            },
            {
                title: 'Development and Evolution',
                description: 'Historical development, major milestones, and technological progress'
            },
            {
                title: 'Current Applications and Use Cases',
                description: 'How the technology is currently being used and implemented'
            },
            {
                title: 'Future Trends and Challenges',
                description: 'Emerging developments, potential obstacles, and future directions'
            }
        ]
    };

    // Keywords for categorizing topics
    const categoryKeywords = {
        science: [
            'physics', 'chemistry', 'biology', 'astronomy', 'neuroscience', 
            'quantum', 'molecular', 'genetic', 'scientific', 'experiment',
            'theory', 'hypothesis', 'laboratory', 'research', 'discovery'
        ],
        history: [
            'history', 'historical', 'ancient', 'medieval', 'renaissance',
            'revolution', 'war', 'empire', 'civilization', 'dynasty',
            'century', 'era', 'period', 'archaeological', 'artifact'
        ],
        technology: [
            'technology', 'computer', 'digital', 'software', 'hardware',
            'internet', 'ai', 'artificial intelligence', 'machine learning', 'algorithm',
            'programming', 'data', 'network', 'cyber', 'electronic'
        ]
    };

    /**
     * Analyze a research topic and divide it into subtopics
     * @param {string} topic - The research topic
     * @returns {Promise<Array>} - Array of subtopics
     */
    async function analyzeAndDivide(topic) {
        try {
            // First try to use the Groq API for custom subtopic generation
            const customSubtopics = await generateCustomSubtopics(topic);
            
            if (customSubtopics && customSubtopics.length > 0) {
                return customSubtopics;
            }
            
            // Fall back to predefined subtopics if API fails
            return getDefaultSubtopics(topic);
        } catch (error) {
            console.error('Error in topic analysis:', error);
            // Fall back to general subtopics in case of error
            return defaultSubtopics.general;
        }
    }

    /**
     * Generate custom subtopics using the Groq API
     * @param {string} topic - The research topic
     * @returns {Promise<Array|null>} - Array of subtopics or null if failed
     */
    async function generateCustomSubtopics(topic) {
        try {
            // Create prompt for subtopic generation
            const prompt = createSubtopicPrompt(topic);
            
            // Call the API service
            const response = await ApiService.callGroqApi(prompt);
            
            // Parse the response to extract subtopics
            return parseSubtopicsFromResponse(response, topic);
        } catch (error) {
            console.error('Error generating custom subtopics:', error);
            return null;
        }
    }

    /**
     * Create a prompt for subtopic generation
     * @param {string} topic - The research topic
     * @returns {string} - The prompt for the API
     */
    function createSubtopicPrompt(topic) {
        return `
You are an academic research planner. Your task is to divide the research topic "${topic}" into 4-5 logical subtopics for comprehensive academic research.

For each subtopic, provide:
1. A clear, concise title (no more than 5-7 words)
2. A brief description (1-2 sentences) explaining what this subtopic covers

Format your response as a JSON array of objects with 'title' and 'description' properties.

Example format:
[
  {
    "title": "Historical Background",
    "description": "Origins and development of the concept through major historical periods."
  },
  {
    "title": "Theoretical Frameworks",
    "description": "Key theories and conceptual models that explain the phenomenon."
  }
]

Ensure the subtopics:
- Follow a logical progression
- Cover the topic comprehensively
- Are appropriate for academic research
- Are specific enough to research independently
- Collectively provide a complete understanding of the topic

Respond with ONLY the JSON array, no additional text.
`;
    }

    /**
     * Parse the API response to extract subtopics
     * @param {string} response - The API response
     * @param {string} topic - The original research topic
     * @returns {Array|null} - Array of subtopics or null if parsing failed
     */
    function parseSubtopicsFromResponse(response, topic) {
        try {
            // Try to parse the response as JSON
            let jsonStart = response.indexOf('[');
            let jsonEnd = response.lastIndexOf(']') + 1;
            
            if (jsonStart === -1 || jsonEnd === 0) {
                throw new Error('No JSON array found in response');
            }
            
            const jsonStr = response.substring(jsonStart, jsonEnd);
            const subtopics = JSON.parse(jsonStr);
            
            // Validate the subtopics
            if (!Array.isArray(subtopics) || subtopics.length === 0) {
                throw new Error('Invalid subtopics format');
            }
            
            // Ensure each subtopic has title and description
            const validSubtopics = subtopics.filter(
                subtopic => subtopic.title && subtopic.description
            );
            
            if (validSubtopics.length === 0) {
                throw new Error('No valid subtopics found');
            }
            
            return validSubtopics;
        } catch (error) {
            console.error('Error parsing subtopics from response:', error);
            return null;
        }
    }

    /**
     * Get default subtopics based on topic category
     * @param {string} topic - The research topic
     * @returns {Array} - Array of subtopics
     */
    function getDefaultSubtopics(topic) {
        const category = detectTopicCategory(topic);
        return defaultSubtopics[category] || defaultSubtopics.general;
    }

    /**
     * Detect the category of a research topic
     * @param {string} topic - The research topic
     * @returns {string} - The detected category
     */
    function detectTopicCategory(topic) {
        const lowerTopic = topic.toLowerCase();
        
        // Check each category's keywords
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            for (const keyword of keywords) {
                if (lowerTopic.includes(keyword)) {
                    return category;
                }
            }
        }
        
        // Default to general if no category is detected
        return 'general';
    }

    // Public API
    return {
        analyzeAndDivide
    };
})();