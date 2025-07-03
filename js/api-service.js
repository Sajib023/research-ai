/**
 * API Service Module
 * Handles communication with the Groq API
 */

const ApiService = (() => {
    // API configuration
    const config = {
        model: 'llama-4-maverick-17b-128e-instruct',
        maxTokens: 4000,
        temperature: 0.7,
        topP: 0.9,
        apiEndpoint: '/.netlify/functions/groq-proxy'
    };

    /**
     * Call the Groq API with a prompt
     * @param {string} prompt - The prompt to send to the API
     * @returns {Promise<string>} - The API response
     */
    async function callGroqApi(prompt) {
        try {
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: config.maxTokens,
                    temperature: config.temperature,
                    top_p: config.topP
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error calling Groq API:', error);
            throw error;
        }
    }

    /**
     * Generate research content for a subtopic
     * @param {string} topic - The main research topic
     * @param {Object} subtopic - The subtopic to research
     * @returns {Promise<string>} - The research content
     */
    async function generateResearchContent(topic, subtopic) {
        const prompt = createResearchPrompt(topic, subtopic);
        return callGroqApi(prompt);
    }

    /**
     * Create a research prompt for a subtopic
     * @param {string} topic - The main research topic
     * @param {Object} subtopic - The subtopic to research
     * @returns {string} - The research prompt
     */
    function createResearchPrompt(topic, subtopic) {
        return `
You are an academic research assistant analyzing the topic: "${topic}".
Focus on the subtopic: "${subtopic.title}".

Provide comprehensive, well-researched information including:
1. Key concepts and definitions
2. Historical context and development
3. Current state of research
4. Major theories and perspectives
5. Supporting evidence and data
6. Counterarguments or limitations
7. Implications and applications
8. Citations for all sources in APA format

Format your response as a well-structured academic section with proper headings, 
paragraphs, and citations. Include numerical data that could be visualized.

Your response should be:
- Academically rigorous with proper citations
- Well-structured with clear headings and subheadings
- Comprehensive but focused on the specific subtopic
- Include at least 5-7 citations to academic sources
- Include at least one set of numerical data that could be visualized (with clear labels)

Format the citations as [1], [2], etc. in the text, and provide the full citations at the end.

For the visualization data, include a section called "VISUALIZATION_DATA_JSON" at the very end of your response, 
formatted as follows:

VISUALIZATION_DATA_JSON
{
  "title": "Title for the visualization",
  "description": "Brief description of what this data represents",
  "labels": ["Label1", "Label2", "Label3"],
  "data": [value1, value2, value3],
  "type": "bar" or "line" or "pie"
}
END_VISUALIZATION_DATA_JSON

Ensure your response is formatted in HTML for proper display, using <h2>, <h3>, <p>, <ul>, <li> tags appropriately.
`;
    }

    /**
     * Extract visualization data from API response
     * @param {string} response - The API response
     * @returns {Array} - Array of visualization data objects
     */
    function extractVisualizationData(response) {
        try {
            const visualizationDataRegex = /VISUALIZATION_DATA_JSON\s*({[\s\S]*?})\s*END_VISUALIZATION_DATA_JSON/g;
            const matches = [...response.matchAll(visualizationDataRegex)];
            
            if (matches.length === 0) {
                return [];
            }
            
            const visualizationData = matches.map(match => {
                try {
                    return JSON.parse(match[1]);
                } catch (error) {
                    console.error('Error parsing visualization data JSON:', error);
                    return null;
                }
            }).filter(data => data !== null);
            
            return visualizationData;
        } catch (error) {
            console.error('Error extracting visualization data:', error);
            return [];
        }
    }

    /**
     * Extract citations from API response
     * @param {string} response - The API response
     * @returns {Array} - Array of citation strings
     */
    function extractCitations(response) {
        try {
            // Look for citations section at the end of the response
            const citationSectionRegex = /<h[23]>(?:References|Citations|Bibliography)<\/h[23]>([\s\S]*?)(?:<h[23]>|$)/i;
            const citationMatch = response.match(citationSectionRegex);
            
            if (!citationMatch) {
                return [];
            }
            
            const citationSection = citationMatch[1];
            
            // Extract individual citations
            const citations = [];
            
            // Try to extract numbered citations [1], [2], etc.
            const numberedCitationRegex = /<p>\s*\[\d+\](.*?)<\/p>/g;
            const numberedMatches = [...citationSection.matchAll(numberedCitationRegex)];
            
            if (numberedMatches.length > 0) {
                numberedMatches.forEach(match => {
                    citations.push(match[1].trim());
                });
                return citations;
            }
            
            // If no numbered citations, try to extract paragraph-based citations
            const paragraphRegex = /<p>(.*?)<\/p>/g;
            const paragraphMatches = [...citationSection.matchAll(paragraphRegex)];
            
            if (paragraphMatches.length > 0) {
                paragraphMatches.forEach(match => {
                    citations.push(match[1].trim());
                });
                return citations;
            }
            
            // If still no citations, just split by line breaks
            return citationSection
                .split(/<br\s*\/?>|\n/)
                .map(line => line.replace(/<[^>]*>/g, '').trim())
                .filter(line => line.length > 0);
        } catch (error) {
            console.error('Error extracting citations:', error);
            return [];
        }
    }

    /**
     * Clean up the API response by removing visualization data section
     * @param {string} response - The API response
     * @returns {string} - The cleaned response
     */
    function cleanResponse(response) {
        // Remove visualization data section
        return response.replace(/VISUALIZATION_DATA_JSON[\s\S]*?END_VISUALIZATION_DATA_JSON/g, '');
    }

    /**
     * Process the API response for a research subtopic
     * @param {string} response - The API response
     * @returns {Object} - Processed research data
     */
    function processResearchResponse(response) {
        // Extract visualization data
        const visualizationData = extractVisualizationData(response);
        
        // Extract citations
        const citations = extractCitations(response);
        
        // Clean response
        const cleanedResponse = cleanResponse(response);
        
        return {
            content: cleanedResponse,
            citations: citations,
            visualizationData: visualizationData
        };
    }

    // Public API
    return {
        callGroqApi,
        generateResearchContent,
        processResearchResponse
    };
})();