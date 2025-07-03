/**
 * Markdown Export Module
 * Handles exporting research content to markdown format
 */

const MarkdownExport = (() => {
    /**
     * Download research as a markdown file
     * @param {string} topic - The research topic
     * @param {string} content - The HTML content
     * @param {Array} citations - The citations array
     */
    function downloadResearch(topic, content, citations) {
        try {
            // Convert HTML to markdown
            const markdown = convertToMarkdown(topic, content, citations);
            
            // Create filename
            const filename = createFilename(topic);
            
            // Create download link
            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // Clean up
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading research:', error);
            throw error;
        }
    }

    /**
     * Convert HTML content to markdown
     * @param {string} topic - The research topic
     * @param {string} content - The HTML content
     * @param {Array} citations - The citations array
     * @returns {string} - The markdown content
     */
    function convertToMarkdown(topic, content, citations) {
        try {
            // Create a temporary div to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            
            // Start with the title and metadata
            let markdown = `# ${topic}\n\n`;
            
            // Add date
            const formattedDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            markdown += `*Research conducted on ${formattedDate}*\n\n`;
            
            // Process abstract if present
            const abstract = tempDiv.querySelector('.abstract');
            if (abstract) {
                markdown += `## Abstract\n\n`;
                const abstractContent = abstract.querySelector('p');
                if (abstractContent) {
                    markdown += `${abstractContent.textContent.trim()}\n\n`;
                }
            }
            
            // Process keywords if present
            const keywords = tempDiv.querySelector('.keywords');
            if (keywords) {
                markdown += `## Keywords\n\n`;
                const keywordSpans = keywords.querySelectorAll('.keyword');
                if (keywordSpans.length > 0) {
                    const keywordList = Array.from(keywordSpans).map(span => span.textContent.trim());
                    markdown += `${keywordList.join(', ')}\n\n`;
                }
            }
            
            // Process table of contents
            markdown += `## Table of Contents\n\n`;
            
            // Find all headings for TOC
            const headings = Array.from(tempDiv.querySelectorAll('h2, h3')).filter(heading => {
                // Exclude headings in abstract, keywords, and references
                return !heading.closest('.abstract') && 
                       !heading.closest('.keywords') && 
                       !heading.closest('.references') &&
                       heading.textContent.trim() !== 'Table of Contents' &&
                       heading.textContent.trim() !== 'Abstract' &&
                       heading.textContent.trim() !== 'Keywords' &&
                       heading.textContent.trim() !== 'References';
            });
            
            headings.forEach(heading => {
                const level = parseInt(heading.tagName.substring(1)) - 1; // h2 -> 1, h3 -> 2
                const indent = '  '.repeat(level - 1);
                const headingText = heading.textContent.trim();
                const anchor = headingText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                
                markdown += `${indent}- [${headingText}](#${anchor})\n`;
            });
            
            markdown += '\n';
            
            // Process main content
            // Remove abstract, keywords, and table of contents from processing
            const tocElement = tempDiv.querySelector('.table-of-contents');
            if (tocElement) {
                tocElement.parentNode.removeChild(tocElement);
            }
            
            const abstractElement = tempDiv.querySelector('.abstract');
            if (abstractElement) {
                abstractElement.parentNode.removeChild(abstractElement);
            }
            
            const keywordsElement = tempDiv.querySelector('.keywords');
            if (keywordsElement) {
                keywordsElement.parentNode.removeChild(keywordsElement);
            }
            
            // Process each element
            const contentElements = Array.from(tempDiv.children);
            
            contentElements.forEach(element => {
                markdown += processElementToMarkdown(element);
            });
            
            // Add references section
            if (citations && citations.length > 0) {
                markdown += `\n## References\n\n`;
                
                citations.forEach((citation, index) => {
                    markdown += `[${index + 1}] ${citation.replace(/<[^>]*>/g, '')}\n\n`;
                });
            }
            
            return markdown;
        } catch (error) {
            console.error('Error converting to markdown:', error);
            
            // Return basic markdown in case of error
            return `# ${topic}\n\n*Error converting content to markdown*\n\n`;
        }
    }

    /**
     * Process an HTML element to markdown
     * @param {Element} element - The HTML element
     * @returns {string} - The markdown representation
     */
    function processElementToMarkdown(element) {
        if (!element) {
            return '';
        }
        
        const tagName = element.tagName.toLowerCase();
        const content = element.innerHTML;
        const textContent = element.textContent.trim();
        
        switch (tagName) {
            case 'h1':
                return `# ${textContent}\n\n`;
            case 'h2':
                return `## ${textContent}\n\n`;
            case 'h3':
                return `### ${textContent}\n\n`;
            case 'h4':
                return `#### ${textContent}\n\n`;
            case 'h5':
                return `##### ${textContent}\n\n`;
            case 'h6':
                return `###### ${textContent}\n\n`;
            case 'p':
                // Process paragraph content for inline formatting
                let paragraphContent = content
                    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                    .replace(/<em>(.*?)<\/em>/g, '*$1*')
                    .replace(/<code>(.*?)<\/code>/g, '`$1`')
                    .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
                    .replace(/<sup class="citation"[^>]*>\[(.*?)\]<\/sup>/g, '[$1]')
                    .replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
                
                return `${paragraphContent}\n\n`;
            case 'ul':
                return processListToMarkdown(element, '*');
            case 'ol':
                return processListToMarkdown(element, '1.');
            case 'blockquote':
                // Process blockquote content
                const blockquoteContent = Array.from(element.children)
                    .map(child => processElementToMarkdown(child))
                    .join('')
                    .trim()
                    .split('\n')
                    .map(line => `> ${line}`)
                    .join('\n');
                
                return `${blockquoteContent}\n\n`;
            case 'pre':
                // Process code blocks
                const codeElement = element.querySelector('code');
                const code = codeElement ? codeElement.textContent : element.textContent;
                const language = codeElement && codeElement.className ? codeElement.className.replace('language-', '') : '';
                
                return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
            case 'table':
                return processTableToMarkdown(element);
            case 'figure':
                return processFigureToMarkdown(element);
            case 'div':
                // Process div content recursively
                return Array.from(element.children)
                    .map(child => processElementToMarkdown(child))
                    .join('');
            default:
                // For other elements, process children recursively
                if (element.children.length > 0) {
                    return Array.from(element.children)
                        .map(child => processElementToMarkdown(child))
                        .join('');
                }
                
                // For text nodes or elements without specific handling
                return textContent ? `${textContent}\n\n` : '';
        }
    }

    /**
     * Process a list element to markdown
     * @param {Element} listElement - The list element
     * @param {string} marker - The list item marker (* or 1.)
     * @returns {string} - The markdown representation
     */
    function processListToMarkdown(listElement, marker) {
        const listItems = Array.from(listElement.querySelectorAll('li'));
        
        let markdown = '';
        
        listItems.forEach((item, index) => {
            const itemMarker = marker === '1.' ? `${index + 1}.` : marker;
            const itemContent = item.innerHTML
                .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                .replace(/<em>(.*?)<\/em>/g, '*$1*')
                .replace(/<code>(.*?)<\/code>/g, '`$1`')
                .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
                .replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
            
            markdown += `${itemMarker} ${itemContent}\n`;
            
            // Process nested lists
            const nestedLists = Array.from(item.querySelectorAll('ul, ol'));
            
            nestedLists.forEach(nestedList => {
                const nestedMarker = nestedList.tagName.toLowerCase() === 'ol' ? '1.' : '*';
                const nestedMarkdown = processListToMarkdown(nestedList, nestedMarker);
                
                // Indent nested list
                markdown += nestedMarkdown.split('\n').map(line => `  ${line}`).join('\n');
            });
        });
        
        return `${markdown}\n`;
    }

    /**
     * Process a table element to markdown
     * @param {Element} tableElement - The table element
     * @returns {string} - The markdown representation
     */
    function processTableToMarkdown(tableElement) {
        const rows = Array.from(tableElement.querySelectorAll('tr'));
        
        if (rows.length === 0) {
            return '';
        }
        
        let markdown = '';
        
        // Process header row
        const headerRow = rows[0];
        const headerCells = Array.from(headerRow.querySelectorAll('th, td'));
        
        if (headerCells.length === 0) {
            return '';
        }
        
        // Create header row
        markdown += '| ' + headerCells.map(cell => cell.textContent.trim()).join(' | ') + ' |\n';
        
        // Create separator row
        markdown += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n';
        
        // Process data rows
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = Array.from(row.querySelectorAll('td'));
            
            if (cells.length === 0) {
                continue;
            }
            
            markdown += '| ' + cells.map(cell => cell.textContent.trim()).join(' | ') + ' |\n';
        }
        
        return `${markdown}\n`;
    }

    /**
     * Process a figure element to markdown
     * @param {Element} figureElement - The figure element
     * @returns {string} - The markdown representation
     */
    function processFigureToMarkdown(figureElement) {
        const image = figureElement.querySelector('img');
        const caption = figureElement.querySelector('figcaption');
        
        if (!image) {
            return '';
        }
        
        const src = image.getAttribute('src') || '';
        const alt = image.getAttribute('alt') || '';
        const captionText = caption ? caption.textContent.trim() : '';
        
        let markdown = `![${alt}](${src})`;
        
        if (captionText) {
            markdown += `\n*${captionText}*`;
        }
        
        return `${markdown}\n\n`;
    }

    /**
     * Create a filename for the markdown file
     * @param {string} topic - The research topic
     * @returns {string} - The filename
     */
    function createFilename(topic) {
        // Convert topic to kebab-case
        const baseFilename = topic
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-'); // Replace spaces with hyphens
        
        // Add date
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        return `research-${baseFilename}-${date}.md`;
    }

    // Public API
    return {
        downloadResearch
    };
})();