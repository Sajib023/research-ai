/**
 * Visualizer Module
 * Handles data visualization using Chart.js
 */

const Visualizer = (() => {
    // Chart configuration defaults
    const chartDefaults = {
        bar: {
            backgroundColor: [
                'rgba(98, 0, 234, 0.7)',
                'rgba(3, 218, 198, 0.7)',
                'rgba(255, 171, 0, 0.7)',
                'rgba(33, 150, 243, 0.7)',
                'rgba(156, 39, 176, 0.7)',
                'rgba(0, 200, 83, 0.7)',
                'rgba(255, 87, 34, 0.7)',
                'rgba(0, 188, 212, 0.7)'
            ],
            borderColor: [
                'rgba(98, 0, 234, 1)',
                'rgba(3, 218, 198, 1)',
                'rgba(255, 171, 0, 1)',
                'rgba(33, 150, 243, 1)',
                'rgba(156, 39, 176, 1)',
                'rgba(0, 200, 83, 1)',
                'rgba(255, 87, 34, 1)',
                'rgba(0, 188, 212, 1)'
            ],
            borderWidth: 1
        },
        line: {
            borderColor: 'rgba(98, 0, 234, 1)',
            backgroundColor: 'rgba(98, 0, 234, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
        },
        pie: {
            backgroundColor: [
                'rgba(98, 0, 234, 0.7)',
                'rgba(3, 218, 198, 0.7)',
                'rgba(255, 171, 0, 0.7)',
                'rgba(33, 150, 243, 0.7)',
                'rgba(156, 39, 176, 0.7)',
                'rgba(0, 200, 83, 0.7)',
                'rgba(255, 87, 34, 0.7)',
                'rgba(0, 188, 212, 0.7)'
            ],
            borderColor: 'rgba(30, 30, 30, 1)',
            borderWidth: 1
        }
    };

    /**
     * Create a chart based on data and type
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {Object} data - The data to visualize
     * @param {string} type - The chart type (bar, line, pie)
     * @returns {Chart} - The created chart
     */
    function createChart(canvas, data, type = 'bar') {
        // Validate inputs
        if (!canvas || !data) {
            console.error('Invalid canvas or data for chart creation');
            return null;
        }
        
        // Default to bar chart if type is invalid
        if (!['bar', 'line', 'pie'].includes(type)) {
            console.warn(`Invalid chart type: ${type}. Defaulting to bar chart.`);
            type = 'bar';
        }
        
        // If data specifies a type, use that instead
        if (data.type && ['bar', 'line', 'pie'].includes(data.type)) {
            type = data.type;
        }
        
        // Create chart configuration
        const config = createChartConfig(data, type);
        
        // Create and return the chart
        return new Chart(canvas, config);
    }

    /**
     * Create chart configuration
     * @param {Object} data - The data to visualize
     * @param {string} type - The chart type
     * @returns {Object} - Chart configuration
     */
    function createChartConfig(data, type) {
        // Base configuration
        const config = {
            type: type,
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: data.title || 'Data',
                    data: data.data || [],
                    ...chartDefaults[type]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: type === 'pie',
                        position: 'top',
                        labels: {
                            color: '#e0e0e0'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 30, 0.9)',
                        titleColor: '#e0e0e0',
                        bodyColor: '#e0e0e0',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: true
                    },
                    title: {
                        display: true,
                        text: data.title || 'Data Visualization',
                        color: '#e0e0e0',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    subtitle: {
                        display: !!data.description,
                        text: data.description || '',
                        color: '#b0b0b0',
                        font: {
                            size: 14,
                            style: 'italic'
                        },
                        padding: {
                            bottom: 10
                        }
                    }
                }
            }
        };
        
        // Type-specific configurations
        if (type === 'bar') {
            config.options.scales = {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                }
            };
        } else if (type === 'line') {
            config.options.scales = {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                }
            };
            
            // For line charts, we can use a single color
            config.data.datasets[0].borderColor = 'rgba(98, 0, 234, 1)';
            config.data.datasets[0].backgroundColor = 'rgba(98, 0, 234, 0.1)';
        } else if (type === 'pie') {
            // For pie charts, we need to ensure we have enough colors
            const backgroundColors = [];
            const borderColors = [];
            
            for (let i = 0; i < data.data.length; i++) {
                const colorIndex = i % chartDefaults.pie.backgroundColor.length;
                backgroundColors.push(chartDefaults.pie.backgroundColor[colorIndex]);
                borderColors.push(chartDefaults.pie.borderColor);
            }
            
            config.data.datasets[0].backgroundColor = backgroundColors;
            config.data.datasets[0].borderColor = borderColors;
        }
        
        return config;
    }

    /**
     * Extract visualization data from research content
     * @param {string} content - The research content
     * @returns {Array} - Array of visualization data objects
     */
    function extractVisualizationData(content) {
        try {
            // Look for tables in the content
            const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/g;
            const tables = [...content.matchAll(tableRegex)];
            
            if (tables.length === 0) {
                return [];
            }
            
            const visualizationData = [];
            
            tables.forEach((tableMatch, index) => {
                const tableHtml = tableMatch[0];
                const tableData = parseTableData(tableHtml);
                
                if (tableData && tableData.data.length > 0) {
                    visualizationData.push({
                        title: tableData.title || `Data Set ${index + 1}`,
                        description: tableData.description || 'Extracted from research content',
                        labels: tableData.labels,
                        data: tableData.data,
                        type: determineChartType(tableData)
                    });
                }
            });
            
            return visualizationData;
        } catch (error) {
            console.error('Error extracting visualization data:', error);
            return [];
        }
    }

    /**
     * Parse table data from HTML
     * @param {string} tableHtml - The HTML table
     * @returns {Object|null} - Parsed table data or null if invalid
     */
    function parseTableData(tableHtml) {
        try {
            // Create a temporary element to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tableHtml;
            
            const table = tempDiv.querySelector('table');
            
            if (!table) {
                return null;
            }
            
            // Try to find a caption or preceding h3/h4 as title
            let title = '';
            const caption = table.querySelector('caption');
            
            if (caption) {
                title = caption.textContent.trim();
            } else {
                // Look for preceding heading
                let prevElement = table.previousElementSibling;
                while (prevElement && !title) {
                    if (prevElement.tagName === 'H3' || prevElement.tagName === 'H4') {
                        title = prevElement.textContent.trim();
                        break;
                    }
                    prevElement = prevElement.previousElementSibling;
                }
            }
            
            // Get table rows
            const rows = Array.from(table.querySelectorAll('tr'));
            
            if (rows.length < 2) {
                // Need at least header and one data row
                return null;
            }
            
            // Get headers (first row)
            const headerRow = rows[0];
            const headers = Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent.trim());
            
            // If no th elements, try td elements
            if (headers.length === 0) {
                const firstRowCells = Array.from(headerRow.querySelectorAll('td')).map(td => td.textContent.trim());
                if (firstRowCells.length > 0) {
                    headers.push(...firstRowCells);
                }
            }
            
            // Get data rows
            const dataRows = rows.slice(1);
            
            // Determine if the first column is labels
            const firstColumnIsLabels = dataRows.every(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return cells.length > 0 && isNaN(parseFloat(cells[0].textContent.trim()));
            });
            
            let labels = [];
            let data = [];
            
            if (firstColumnIsLabels) {
                // First column is labels, second column is data
                labels = dataRows.map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    return cells[0].textContent.trim();
                });
                
                data = dataRows.map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    if (cells.length > 1) {
                        const value = parseFloat(cells[1].textContent.trim().replace(/[^\d.-]/g, ''));
                        return isNaN(value) ? 0 : value;
                    }
                    return 0;
                });
            } else {
                // First row is labels, first column is data
                labels = headers.slice(1);
                
                // Get the first data column
                data = labels.map((_, i) => {
                    const values = dataRows.map(row => {
                        const cells = Array.from(row.querySelectorAll('td'));
                        if (cells.length > i + 1) {
                            const value = parseFloat(cells[i + 1].textContent.trim().replace(/[^\d.-]/g, ''));
                            return isNaN(value) ? 0 : value;
                        }
                        return 0;
                    });
                    
                    // Return the average of values for this label
                    return values.reduce((sum, val) => sum + val, 0) / values.length;
                });
            }
            
            return {
                title: title,
                description: '',
                labels: labels,
                data: data
            };
        } catch (error) {
            console.error('Error parsing table data:', error);
            return null;
        }
    }

    /**
     * Determine the best chart type for the data
     * @param {Object} tableData - The parsed table data
     * @returns {string} - The recommended chart type
     */
    function determineChartType(tableData) {
        // If few categories, pie chart might be good
        if (tableData.labels.length <= 5) {
            return 'pie';
        }
        
        // If labels look like time periods or sequential, line chart might be good
        const timePatterns = [
            /year/i, /month/i, /day/i, /date/i, /time/i, /period/i,
            /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i,
            /^\d{4}$/, // Year format
            /^\d{1,2}\/\d{1,2}$/ // Date format
        ];
        
        const sequentialPatterns = [
            /phase/i, /stage/i, /step/i, /level/i, /generation/i
        ];
        
        const isTimeSeries = tableData.labels.some(label => 
            timePatterns.some(pattern => pattern.test(label))
        );
        
        const isSequential = tableData.labels.some(label => 
            sequentialPatterns.some(pattern => pattern.test(label))
        );
        
        if (isTimeSeries || isSequential) {
            return 'line';
        }
        
        // Default to bar chart
        return 'bar';
    }

    // Public API
    return {
        createChart,
        extractVisualizationData
    };
})();