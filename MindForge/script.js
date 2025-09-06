// --- Library Setup ---
// This line is required by pdf.js to find its worker script.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

// --- DOM Element References ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileNameEl = document.getElementById('file-name');
const dropZonePrompt = document.getElementById('drop-zone-prompt');
const fileProcessingLoader = document.getElementById('file-processing-loader');

const configOptions = document.getElementById('config-options');
const btnNotes = document.getElementById('btn-notes');
const btnQuestions = document.getElementById('btn-questions');

const notesOptionsContainer = document.getElementById('notes-options-container');
const outputFormatEl = document.getElementById('output-format');

const questionsOptionsContainer = document.getElementById('questions-options-container');
const questionTypeEl = document.getElementById('question-type');
const numQuestionsEl = document.getElementById('num-questions');
const difficultyLevelEl = document.getElementById('difficulty-level');

const generateBtn = document.getElementById('generate-btn');

const placeholder = document.getElementById('placeholder');
const loader = document.getElementById('loader');
const outputContent = document.getElementById('output-content');
const actionButtons = document.getElementById('action-buttons');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');

// --- Application State ---
let fileContent = '';
let currentFileName = '';
let contentType = 'notes';
let lastGeneratedText = '';

// --- Event Listeners ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

btnNotes.addEventListener('click', () => setContentType('notes'));
btnQuestions.addEventListener('click', () => setContentType('questions'));
generateBtn.addEventListener('click', handleGeneration);
downloadBtn.addEventListener('click', downloadContent);
copyBtn.addEventListener('click', copyContent);

// --- Core Functions ---

async function handleFile(file) {
    if (file.type !== 'application/pdf') {
        alert('This application only supports PDF files. Please upload a valid PDF.');
        return;
    }
    
    currentFileName = file.name;
    fileContent = '';
    
    dropZonePrompt.classList.add('hidden');
    fileProcessingLoader.classList.remove('hidden');
    fileNameEl.textContent = ''; 
    configOptions.classList.add('hidden');
    generateBtn.disabled = true;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const typedarray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => item.str).join(' ');
        }

        fileContent = text;
        fileNameEl.textContent = `Ready: ${currentFileName}`;
        showConfig();
        generateBtn.disabled = false;
    } catch (error) {
        console.error("Error processing PDF:", error);
        fileNameEl.textContent = `Error reading PDF.`;
        alert(`Could not read the PDF file. Error: ${error.message}`);
    } finally {
        dropZonePrompt.classList.remove('hidden');
        fileProcessingLoader.classList.add('hidden');
    }
}

function showConfig() {
    configOptions.classList.remove('hidden');
    configOptions.style.animation = 'fadeInUp 0.5s ease-out forwards';
    setContentType('notes');
}

function setContentType(type) {
    contentType = type;
    btnNotes.classList.toggle('active', type === 'notes');
    btnQuestions.classList.toggle('active', type === 'questions');
    
    notesOptionsContainer.classList.toggle('hidden', type !== 'notes');
    questionsOptionsContainer.classList.toggle('hidden', type !== 'questions');

    if (type === 'notes' && !notesOptionsContainer.classList.contains('hidden')) {
        notesOptionsContainer.style.animation = 'fadeInUp 0.5s ease-out forwards';
    }
    if (type === 'questions' && !questionsOptionsContainer.classList.contains('hidden')) {
        questionsOptionsContainer.style.animation = 'fadeInUp 0.5s ease-out forwards';
    }
}

async function handleGeneration() {
    if (!fileContent) {
        alert('Please upload a file first.');
        return;
    }

    placeholder.classList.add('hidden');
    loader.classList.remove('hidden');
    outputContent.classList.add('hidden');
    actionButtons.classList.add('hidden');
    generateBtn.disabled = true;
    generateBtn.querySelector('span').textContent = 'Generating...';

    const apiKey = "AIzaSyBsJeztTmW4zlp8cCEG_sUhlSMmljCmOhQ"; 
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let prompt;
    if (contentType === 'notes') {
        const format = outputFormatEl.value;
        prompt = `You are an expert academic assistant. Analyze the following text from a study document and generate comprehensive notes in the format of "${format}". Focus on key concepts and definitions. Use markdown for clear formatting. The text is:\n\n---\n\n${fileContent}`;
    } else { // Questions
        const difficulty = difficultyLevelEl.value;
        const numQuestions = numQuestionsEl.value;
        const questionType = questionTypeEl.value;
        
        prompt = `You are an expert exam creator. Based on the following study material, create exactly ${numQuestions} unique practice questions of type "${questionType}".
        
        - For "Multiple Choice", provide 4 options (A, B, C, D).
        - For "Short Answer", the answer should be a brief sentence.
        - For "Long Answer", the answer should be a detailed paragraph.
        - For "Fill in the Blanks", replace a key term with "______".
        - For "Mixed Types", generate a variety of the above types.
        
        After all questions, provide a separate "Answer Key" section.
        
        Use markdown for all formatting. The difficulty level should be ${difficulty}. The text is:\n\n---\n\n${fileContent}`;
    }

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API request failed: ${errorBody.error.message}`);
        }
        
        const result = await response.json();
        if (!result.candidates || result.candidates.length === 0) {
            throw new Error("API returned no content, it may have been blocked by safety filters.");
        }
        
        lastGeneratedText = result.candidates[0].content.parts[0].text;
        
        outputContent.innerHTML = marked.parse(lastGeneratedText);
        outputContent.classList.remove('hidden');
        actionButtons.classList.remove('hidden');
        
        outputContent.style.animation = 'fadeInUp 0.5s ease-out forwards';
        actionButtons.style.animation = 'fadeInUp 0.5s 0.2s ease-out forwards';

    } catch (error) {
        console.error("API Error:", error);
        outputContent.classList.remove('hidden');
        outputContent.innerHTML = `<div class="error-box"><strong>Error:</strong> ${error.message}</div>`;
    } finally {
        loader.classList.add('hidden');
        generateBtn.disabled = false;
        generateBtn.querySelector('span').textContent = 'Generate';
    }
}

function downloadContent() {
    if (!lastGeneratedText) return;
    const blob = new Blob([lastGeneratedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileName.split('.').slice(0, -1).join('.') || 'generated'}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function copyContent() {
    if (!lastGeneratedText) return;
    navigator.clipboard.writeText(lastGeneratedText).then(() => {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `<i class="fas fa-check"></i> Copied!`;
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    setContentType('notes');
    generateBtn.disabled = true;
});

