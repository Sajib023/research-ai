/**
 * Citation Generator Module
 * Handles the generation and formatting of citations
 */

const CitationGenerator = (() => {
    /**
     * Generate a citation in APA format
     * @param {Object} source - The source information
     * @returns {string} - The formatted citation
     */
    function generateApaCitation(source) {
        try {
            switch (source.type) {
                case 'book':
                    return generateBookCitation(source);
                case 'journal':
                    return generateJournalCitation(source);
                case 'website':
                    return generateWebsiteCitation(source);
                case 'conference':
                    return generateConferenceCitation(source);
                default:
                    return generateGenericCitation(source);
            }
        } catch (error) {
            console.error('Error generating citation:', error);
            return `${source.authors || 'Unknown Author'}. (${source.year || 'n.d.'}). ${source.title || 'Untitled'}.`;
        }
    }

    /**
     * Generate a book citation in APA format
     * @param {Object} source - The book information
     * @returns {string} - The formatted citation
     */
    function generateBookCitation(source) {
        const authors = formatAuthors(source.authors);
        const year = source.year ? `(${source.year})` : '(n.d.)';
        const title = source.title ? `${source.title}` : 'Untitled';
        const edition = source.edition ? ` (${source.edition} ed.)` : '';
        const publisher = source.publisher ? `. ${source.publisher}` : '';
        
        return `${authors}. ${year}. <em>${title}</em>${edition}${publisher}.`;
    }

    /**
     * Generate a journal article citation in APA format
     * @param {Object} source - The journal article information
     * @returns {string} - The formatted citation
     */
    function generateJournalCitation(source) {
        const authors = formatAuthors(source.authors);
        const year = source.year ? `(${source.year})` : '(n.d.)';
        const title = source.title ? `${source.title}` : 'Untitled';
        const journal = source.journal ? `<em>${source.journal}</em>` : '<em>Unknown Journal</em>';
        const volume = source.volume ? `, ${source.volume}` : '';
        const issue = source.issue ? `(${source.issue})` : '';
        const pages = source.pages ? `, ${source.pages}` : '';
        const doi = source.doi ? `. https://doi.org/${source.doi}` : '';
        
        return `${authors}. ${year}. ${title}. ${journal}${volume}${issue}${pages}${doi}.`;
    }

    /**
     * Generate a website citation in APA format
     * @param {Object} source - The website information
     * @returns {string} - The formatted citation
     */
    function generateWebsiteCitation(source) {
        const authors = formatAuthors(source.authors);
        const year = source.year ? `(${source.year})` : '(n.d.)';
        const title = source.title ? `${source.title}` : 'Untitled';
        const website = source.website ? `${source.website}` : '';
        const url = source.url ? `. Retrieved from ${source.url}` : '';
        const retrievedDate = source.retrievedDate ? ` on ${source.retrievedDate}` : '';
        
        return `${authors}. ${year}. ${title}. ${website}${url}${retrievedDate}.`;
    }

    /**
     * Generate a conference paper citation in APA format
     * @param {Object} source - The conference paper information
     * @returns {string} - The formatted citation
     */
    function generateConferenceCitation(source) {
        const authors = formatAuthors(source.authors);
        const year = source.year ? `(${source.year})` : '(n.d.)';
        const title = source.title ? `${source.title}` : 'Untitled';
        const conference = source.conference ? `In <em>${source.conference}</em>` : '';
        const pages = source.pages ? ` (pp. ${source.pages})` : '';
        const location = source.location ? `. ${source.location}` : '';
        
        return `${authors}. ${year}. ${title}. ${conference}${pages}${location}.`;
    }

    /**
     * Generate a generic citation when type is unknown
     * @param {Object} source - The source information
     * @returns {string} - The formatted citation
     */
    function generateGenericCitation(source) {
        const authors = formatAuthors(source.authors);
        const year = source.year ? `(${source.year})` : '(n.d.)';
        const title = source.title ? `${source.title}` : 'Untitled';
        const source_info = source.source ? `. ${source.source}` : '';
        
        return `${authors}. ${year}. ${title}${source_info}.`;
    }

    /**
     * Format authors for citation
     * @param {string|Array} authors - Author or authors
     * @returns {string} - Formatted authors
     */
    function formatAuthors(authors) {
        if (!authors) {
            return 'Unknown Author';
        }
        
        if (typeof authors === 'string') {
            return authors;
        }
        
        if (authors.length === 1) {
            return authors[0];
        }
        
        if (authors.length === 2) {
            return `${authors[0]} & ${authors[1]}`;
        }
        
        return `${authors[0]} et al.`;
    }

    /**
     * Parse a citation string to extract information
     * @param {string} citationString - The citation string
     * @returns {Object} - The parsed citation information
     */
    function parseCitation(citationString) {
        try {
            // Basic parsing logic - this is a simplified version
            const result = {
                authors: 'Unknown Author',
                year: 'n.d.',
                title: 'Untitled',
                type: 'generic'
            };
            
            // Try to extract authors (everything before the first period or parenthesis)
            const authorMatch = citationString.match(/^([^\.|\(]+)/);
            if (authorMatch) {
                result.authors = authorMatch[1].trim();
            }
            
            // Try to extract year (content in first parentheses)
            const yearMatch = citationString.match(/\(([^)]+)\)/);
            if (yearMatch) {
                result.year = yearMatch[1].trim();
            }
            
            // Try to extract title (content after year and before the next period)
            const afterYear = citationString.replace(/^[^)]+\)\.?\s*/, '');
            const titleMatch = afterYear.match(/^([^\.]+)/);
            if (titleMatch) {
                result.title = titleMatch[1].trim();
            }
            
            // Determine type based on formatting clues
            if (citationString.includes('doi.org')) {
                result.type = 'journal';
            } else if (citationString.includes('Retrieved from')) {
                result.type = 'website';
            } else if (citationString.includes('ed.)') || citationString.includes('edition')) {
                result.type = 'book';
            } else if (citationString.includes('conference') || citationString.includes('symposium')) {
                result.type = 'conference';
            }
            
            return result;
        } catch (error) {
            console.error('Error parsing citation:', error);
            return {
                authors: 'Unknown Author',
                year: 'n.d.',
                title: 'Untitled',
                type: 'generic'
            };
        }
    }

    /**
     * Format citations for display in the research document
     * @param {Array} citations - Array of citation strings
     * @returns {string} - HTML formatted citations
     */
    function formatCitationsForDisplay(citations) {
        if (!citations || citations.length === 0) {
            return '<p>No citations available.</p>';
        }
        
        let html = '<div class="citations-list">';
        
        citations.forEach((citation, index) => {
            html += `
<div class="citation-item">
    <span class="citation-number">[${index + 1}]</span>
    <span class="citation-text">${citation}</span>
</div>`;
        });
        
        html += '</div>';
        
        return html;
    }

    /**
     * Insert citation references into content
     * @param {string} content - The content to insert citations into
     * @param {Array} citations - Array of citation objects
     * @returns {string} - Content with citation references
     */
    function insertCitationReferences(content, citations) {
        if (!citations || citations.length === 0) {
            return content;
        }
        
        let modifiedContent = content;
        
        citations.forEach((citation, index) => {
            // Create citation reference
            const citationRef = `<sup class="citation" data-citation-id="${index + 1}">[${index + 1}]</sup>`;
            
            // Try to find relevant places to insert citations
            // This is a simplified approach - in a real system, this would be more sophisticated
            if (citation.keywords && citation.keywords.length > 0) {
                citation.keywords.forEach(keyword => {
                    // Only replace the first instance of each keyword to avoid over-citation
                    const regex = new RegExp(`\\b${keyword}\\b(?![^<]*>|[^<>]*<\\/sup>)`, 'i');
                    if (regex.test(modifiedContent)) {
                        modifiedContent = modifiedContent.replace(regex, `$&${citationRef}`);
                    }
                });
            }
        });
        
        return modifiedContent;
    }

    // Public API
    return {
        generateApaCitation,
        parseCitation,
        formatCitationsForDisplay,
        insertCitationReferences
    };
})();