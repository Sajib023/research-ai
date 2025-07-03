/**
 * Academic Research Assistant
 * Main Application Logic
 */

// Global state object
const state = {
    currentSection: 'research-input-section',
    researchTopic: '',
    researchPlan: [],
    currentSubtopicIndex: 0,
    researchResults: {
        content: '',
        citations: [],
        visualizationData: []
    },
    isResearching: false
};

// DOM Elements
const elements = {
    // Sections
    sections: {
        researchInput: document.getElementById('research-input-section'),
        researchPlan: document.getElementById('research-plan-section'),
        researchProgress: document.getElementById('research-progress-section'),
        researchResults: document.getElementById('research-results-section'),
        comparison: document.getElementById('comparison-section')
    },
    // Forms
    researchForm: document.getElementById('research-form'),
    researchTopicInput: document.getElementById('research-topic'),
    // Buttons
    modifyPlanBtn: document.getElementById('modify-plan-btn'),
    startResearchBtn: document.getElementById('start-research-btn'),
    newResearchBtn: document.getElementById('new-research-btn'),
    downloadBtn: document.getElementById('download-btn'),
    helpBtn: document.getElementById('help-btn'),
    // Progress Elements
    progressBar: document.getElementById('progress-bar'),
    progressStatus: document.getElementById('progress-status'),
    currentSubtopicTitle: document.getElementById('current-subtopic-title'),
    // Results Elements
    researchContent: document.getElementById('research-content'),
    citationsContainer: document.getElementById('citations-container'),
    visualizationContainer: document.getElementById('visualization-container'),
    visualizationType: document.getElementById('visualization-type'),
    visualizationData: document.getElementById('visualization-data'),
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    // Modal
    helpModal: document.getElementById('help-modal'),
    closeModal: document.querySelector('.close-modal'),
    // Loading
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingMessage: document.getElementById('loading-message')
};

// Initialize the application
function init() {
    // Add event listeners
    addEventListeners();
    
    // Initialize Chart.js with dark mode settings
    Chart.defaults.color = '#e0e0e0';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
}

// Add event listeners
function addEventListeners() {
    // Research form submission
    elements.researchForm.addEventListener('submit', handleResearchFormSubmit);
    
    // Button clicks
    elements.modifyPlanBtn.addEventListener('click', handleModifyPlan);
    elements.startResearchBtn.addEventListener('click', handleStartResearch);
    elements.newResearchBtn.addEventListener('click', handleNewResearch);
    elements.downloadBtn.addEventListener('click', handleDownloadResearch);
    elements.helpBtn.addEventListener('click', handleOpenHelp);
    elements.closeModal.addEventListener('click', handleCloseHelp);
    
    // Tab switching
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', handleTabSwitch);
    });
    
    // Visualization type change
    elements.visualizationType.addEventListener('change', handleVisualizationTypeChange);
    elements.visualizationData.addEventListener('change', handleVisualizationDataChange);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.helpModal) {
            handleCloseHelp();
        }
    });
}

// Handle research form submission
async function handleResearchFormSubmit(e) {
    e.preventDefault();
    
    // Get research topic
    const topic = elements.researchTopicInput.value.trim();
    
    if (!topic) {
        showError('Please enter a research topic');
        return;
    }
    
    // Update state
    state.researchTopic = topic;
    
    // Show loading
    showLoading('Analyzing research topic...');
    
    try {
        // Generate research plan
        const researchPlan = await TopicAnalyzer.analyzeAndDivide(topic);
        
        // Update state
        state.researchPlan = researchPlan;
        
        // Display research plan
        displayResearchPlan(researchPlan);
        
        // Switch to research plan section
        switchSection('research-plan-section');
    } catch (error) {
        console.error('Error generating research plan:', error);
        showError('Failed to generate research plan. Please try again.');
    } finally {
        // Hide loading
        hideLoading();
    }
}

// Display research plan
function displayResearchPlan(plan) {
    const planContainer = document.getElementById('research-plan-container');
    planContainer.innerHTML = '';
    
    // Create plan items
    plan.forEach((item, index) => {
        const planItem = document.createElement('div');
        planItem.className = 'research-plan-item';
        
        const planItemHeader = document.createElement('div');
        planItemHeader.className = 'research-plan-item-header';
        
        const planItemTitle = document.createElement('div');
        planItemTitle.className = 'research-plan-item-title';
        planItemTitle.textContent = `${index + 1}. ${item.title}`;
        
        planItemHeader.appendChild(planItemTitle);
        
        const planItemDescription = document.createElement('div');
        planItemDescription.className = 'research-plan-item-description';
        planItemDescription.textContent = item.description;
        
        planItem.appendChild(planItemHeader);
        planItem.appendChild(planItemDescription);
        
        planContainer.appendChild(planItem);
    });
}

// Handle modify plan button click
function handleModifyPlan() {
    // Go back to research input section
    switchSection('research-input-section');
}

// Handle start research button click
async function handleStartResearch() {
    // Update state
    state.isResearching = true;
    state.currentSubtopicIndex = 0;
    
    // Switch to research progress section
    switchSection('research-progress-section');
    
    // Reset progress
    elements.progressBar.style.width = '0%';
    elements.progressStatus.textContent = `Researching subtopic 1 of ${state.researchPlan.length}...`;
    
    // Start research process
    await conductResearch();
}

// Conduct research
async function conductResearch() {
    try {
        // Reset research results
        state.researchResults = {
            content: '',
            citations: [],
            visualizationData: []
        };
        
        // Research each subtopic
        for (let i = 0; i < state.researchPlan.length; i++) {
            // Update state
            state.currentSubtopicIndex = i;
            
            // Update progress
            updateResearchProgress(i, state.researchPlan.length);
            
            // Get subtopic
            const subtopic = state.researchPlan[i];
            
            // Update current subtopic title
            elements.currentSubtopicTitle.textContent = `Current Subtopic: ${subtopic.title}`;
            
            // Research subtopic
            const result = await ResearchManager.researchSubtopic(state.researchTopic, subtopic);
            
            // Process result
            processSubtopicResult(result);
        }
        
        // Complete research
        completeResearch();
    } catch (error) {
        console.error('Error conducting research:', error);
        showError('Failed to complete research. Please try again.');
        
        // Reset state
        state.isResearching = false;
        
        // Go back to research plan section
        switchSection('research-plan-section');
    }
}

// Update research progress
function updateResearchProgress(currentIndex, total) {
    const progress = Math.round(((currentIndex) / total) * 100);
    elements.progressBar.style.width = `${progress}%`;
    elements.progressStatus.textContent = `Researching subtopic ${currentIndex + 1} of ${total}...`;
}

// Process subtopic result
function processSubtopicResult(result) {
    // Add content
    state.researchResults.content += result.content;
    
    // Add citations
    state.researchResults.citations = [
        ...state.researchResults.citations,
        ...result.citations
    ];
    
    // Add visualization data
    state.researchResults.visualizationData = [
        ...state.researchResults.visualizationData,
        ...result.visualizationData
    ];
}

// Complete research
function completeResearch() {
    // Update state
    state.isResearching = false;
    
    // Display research results
    displayResearchResults();
    
    // Switch to research results section
    switchSection('research-results-section');
}

// Display research results
function displayResearchResults() {
    // Display content
    elements.researchContent.innerHTML = state.researchResults.content;
    
    // Display citations
    displayCitations();
    
    // Setup visualization options
    setupVisualizationOptions();
    
    // Display default visualization if available
    if (state.researchResults.visualizationData.length > 0) {
        displayVisualization(
            state.researchResults.visualizationData[0],
            elements.visualizationType.value
        );
    }
}

// Display citations
function displayCitations() {
    const citationsContainer = elements.citationsContainer;
    citationsContainer.innerHTML = '';
    
    // Create citation items
    state.researchResults.citations.forEach((citation, index) => {
        const citationItem = document.createElement('div');
        citationItem.className = 'citation-item';
        
        const citationNumber = document.createElement('span');
        citationNumber.className = 'citation-number';
        citationNumber.textContent = `[${index + 1}]`;
        
        const citationText = document.createElement('div');
        citationText.className = 'citation-text';
        citationText.innerHTML = citation;
        
        citationItem.appendChild(citationNumber);
        citationItem.appendChild(citationText);
        
        citationsContainer.appendChild(citationItem);
    });
}

// Setup visualization options
function setupVisualizationOptions() {
    const visualizationData = elements.visualizationData;
    visualizationData.innerHTML = '<option value="default">Select Data</option>';
    
    // Add options for each visualization data
    state.researchResults.visualizationData.forEach((data, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = data.title;
        visualizationData.appendChild(option);
    });
}

// Handle visualization type change
function handleVisualizationTypeChange() {
    const dataIndex = elements.visualizationData.value;
    
    if (dataIndex !== 'default') {
        const data = state.researchResults.visualizationData[dataIndex];
        displayVisualization(data, elements.visualizationType.value);
    }
}

// Handle visualization data change
function handleVisualizationDataChange() {
    const dataIndex = elements.visualizationData.value;
    
    if (dataIndex !== 'default') {
        const data = state.researchResults.visualizationData[dataIndex];
        displayVisualization(data, elements.visualizationType.value);
    }
}

// Display visualization
function displayVisualization(data, type) {
    // Get canvas
    const canvas = document.getElementById('main-chart');
    
    // Destroy existing chart if it exists
    if (window.mainChart) {
        window.mainChart.destroy();
    }
    
    // Create new chart
    window.mainChart = Visualizer.createChart(canvas, data, type);
}

// Handle new research button click
function handleNewResearch() {
    // Reset form
    elements.researchForm.reset();
    
    // Switch to research input section
    switchSection('research-input-section');
}

// Handle download research button click
function handleDownloadResearch() {
    try {
        MarkdownExport.downloadResearch(
            state.researchTopic,
            state.researchResults.content,
            state.researchResults.citations
        );
    } catch (error) {
        console.error('Error downloading research:', error);
        showError('Failed to download research. Please try again.');
    }
}

// Handle tab switch
function handleTabSwitch(e) {
    const tabId = e.target.getAttribute('data-tab');
    
    // Update active tab button
    elements.tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update active tab content
    elements.tabContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Handle open help modal
function handleOpenHelp() {
    elements.helpModal.style.display = 'block';
}

// Handle close help modal
function handleCloseHelp() {
    elements.helpModal.style.display = 'none';
}

// Switch section
function switchSection(sectionId) {
    // Hide all sections
    Object.values(elements.sections).forEach(section => {
        section.classList.add('hidden-section');
        section.classList.remove('active-section');
    });
    
    // Show target section
    document.getElementById(sectionId).classList.remove('hidden-section');
    document.getElementById(sectionId).classList.add('active-section');
    
    // Update state
    state.currentSection = sectionId;
}

// Show loading overlay
function showLoading(message = 'Processing your request...') {
    elements.loadingMessage.textContent = message;
    elements.loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

// Show error message
function showError(message) {
    alert(message);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);