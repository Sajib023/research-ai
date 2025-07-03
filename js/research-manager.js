/**
 * Research Manager Module
 * Manages the research process for each subtopic
 */

const ResearchManager = (() => {
    /**
     * Research a specific subtopic
     * @param {string} mainTopic - The main research topic
     * @param {Object} subtopic - The subtopic to research
     * @returns {Promise<Object>} - The research result
     */
    async function researchSubtopic(mainTopic, subtopic) {
        try {
            // Generate research content
            const response = await ApiService.generateResearchContent(mainTopic, subtopic);
            
            // Process the response
            const processedResult = ApiService.processResearchResponse(response);
            
            // Format the content with subtopic header
            const formattedContent = formatSubtopicContent(subtopic, processedResult.content);
            
            return {
                content: formattedContent,
                citations: processedResult.citations,
                visualizationData: processedResult.visualizationData.map(data => {
                    return {
                        ...data,
                        subtopic: subtopic.title
                    };
                })
            };
        } catch (error) {
            console.error(`Error researching subtopic "${subtopic.title}":`, error);
            
            // Return fallback content in case of error
            return createFallbackContent(mainTopic, subtopic);
        }
    }

    /**
     * Format the subtopic content with proper header
     * @param {Object} subtopic - The subtopic
     * @param {string} content - The research content
     * @returns {string} - The formatted content
     */
    function formatSubtopicContent(subtopic, content) {
        // Check if content already has an h2 header
        if (content.includes(`<h2>${subtopic.title}</h2>`) || 
            content.includes(`<h2>${subtopic.title.trim()}</h2>`)) {
            return content;
        }
        
        // Add subtopic header if not present
        return `<h2>${subtopic.title}</h2>\n${content}`;
    }

    /**
     * Create fallback content in case of API error
     * @param {string} mainTopic - The main research topic
     * @param {Object} subtopic - The subtopic
     * @returns {Object} - Fallback research result
     */
    function createFallbackContent(mainTopic, subtopic) {
        const fallbackContent = `
<h2>${subtopic.title}</h2>
<p>We apologize, but we encountered an issue while researching this subtopic. 
The research system was unable to generate comprehensive content for "${subtopic.title}" 
related to "${mainTopic}".</p>

<p>Here are some general points that might be relevant:</p>

<ul>
    <li>This subtopic is an important component of the overall research topic.</li>
    <li>Consider exploring academic databases and journals for more information.</li>
    <li>Key search terms might include: ${mainTopic}, ${subtopic.title}, research, academic.</li>
</ul>

<p>You may want to try researching this topic again later or modify the research parameters.</p>
`;

        const fallbackCitation = [
            "Due to technical limitations, citations could not be generated for this section."
        ];

        const fallbackVisualizationData = [{
            title: `Sample Data for ${subtopic.title}`,
            description: "Placeholder visualization data",
            labels: ["Category A", "Category B", "Category C", "Category D"],
            data: [25, 40, 30, 50],
            type: "bar",
            subtopic: subtopic.title
        }];

        return {
            content: fallbackContent,
            citations: fallbackCitation,
            visualizationData: fallbackVisualizationData
        };
    }

    /**
     * Combine multiple research results into a complete research document
     * @param {string} mainTopic - The main research topic
     * @param {Array} results - Array of research results
     * @returns {Object} - The combined research document
     */
    function combineResearchResults(mainTopic, results) {
        // Create title and abstract
        const titleAndAbstract = createTitleAndAbstract(mainTopic);
        
        // Combine content
        let combinedContent = titleAndAbstract;
        results.forEach(result => {
            combinedContent += result.content;
        });
        
        // Combine citations
        const combinedCitations = [];
        results.forEach(result => {
            result.citations.forEach(citation => {
                if (!combinedCitations.includes(citation)) {
                    combinedCitations.push(citation);
                }
            });
        });
        
        // Add references section
        combinedContent += createReferencesSection(combinedCitations);
        
        // Combine visualization data
        const combinedVisualizationData = [];
        results.forEach(result => {
            result.visualizationData.forEach(data => {
                combinedVisualizationData.push(data);
            });
        });
        
        return {
            content: combinedContent,
            citations: combinedCitations,
            visualizationData: combinedVisualizationData
        };
    }

    /**
     * Create title and abstract for the research document
     * @param {string} mainTopic - The main research topic
     * @returns {string} - The title and abstract HTML
     */
    function createTitleAndAbstract(mainTopic) {
        const formattedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
<h1>${mainTopic}</h1>
<p class="research-date">Research conducted on ${formattedDate}</p>

<div class="abstract">
    <h3>Abstract</h3>
    <p>This research document provides a comprehensive analysis of ${mainTopic}. 
    It explores various aspects of the topic, including historical context, 
    theoretical frameworks, current developments, and future implications. 
    The research is based on academic sources and presents a balanced view of the subject matter.</p>
</div>

<div class="keywords">
    <h3>Keywords</h3>
    <div>
        ${generateKeywords(mainTopic).map(keyword => 
            `<span class="keyword">${keyword}</span>`
        ).join('')}
    </div>
</div>

<h2>Table of Contents</h2>
<div class="table-of-contents">
    <ul id="toc-list">
        <!-- Table of contents will be dynamically generated -->
    </ul>
</div>

`;
    }

    /**
     * Generate keywords based on the main topic
     * @param {string} mainTopic - The main research topic
     * @returns {Array} - Array of keywords
     */
    function generateKeywords(mainTopic) {
        // Split the topic into words
        const words = mainTopic.split(/\s+/);
        
        // Start with the main topic
        const keywords = [mainTopic];
        
        // Add individual words if the topic has multiple words
        if (words.length > 1) {
            words.forEach(word => {
                if (word.length > 3 && !keywords.includes(word)) {
                    keywords.push(word);
                }
            });
        }
        
        // Add some generic research keywords
        keywords.push('research', 'academic', 'analysis');
        
        return keywords;
    }

    /**
     * Create references section for the research document
     * @param {Array} citations - Array of citations
     * @returns {string} - The references section HTML
     */
    function createReferencesSection(citations) {
        if (citations.length === 0) {
            return '';
        }
        
        let referencesHtml = '<h2>References</h2>\n<div class="references">\n';
        
        citations.forEach((citation, index) => {
            referencesHtml += `<p class="reference">[${index + 1}] ${citation}</p>\n`;
        });
        
        referencesHtml += '</div>\n';
        
        return referencesHtml;
    }

    // Public API
    return {
        researchSubtopic,
        combineResearchResults
    };
})();