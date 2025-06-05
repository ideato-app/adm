/**
 * Prismic Admin Dashboard - Main Script
 * Handles interaction with Prismic CMA (Content Management API)
 */

// DOM Elements
const elements = {
    statusMessage: document.getElementById('status-message'),
    contentTypeSelect: document.getElementById('content-type'),
    fetchDocumentsBtn: document.getElementById('fetch-documents'),
    createDocumentBtn: document.getElementById('create-document'),
    documentsList: document.getElementById('documents-list'),
    documentFormContainer: document.getElementById('document-form-container'),
    documentForm: document.getElementById('document-form'),
    formTitle: document.getElementById('form-title'),
    documentId: document.getElementById('document-id'),
    documentRef: document.getElementById('document-ref'),
    documentTitle: document.getElementById('document-title'),
    documentContent: document.getElementById('document-content'),
    cancelEditBtn: document.getElementById('cancel-edit')
};

// Current state
let currentMasterRef = null;
let currentDocuments = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Setup event listeners
    elements.fetchDocumentsBtn.addEventListener('click', fetchDocuments);
    elements.createDocumentBtn.addEventListener('click', showCreateForm);
    elements.documentForm.addEventListener('submit', handleFormSubmit);
    elements.cancelEditBtn.addEventListener('click', hideForm);

    // Initial API call to get master ref
    getMasterRef()
        .then(ref => {
            currentMasterRef = ref;
            showStatusMessage('Connected to Prismic repository', 'success');
            fetchDocuments();
        })
        .catch(error => {
            console.error('Failed to connect to Prismic:', error);
            showStatusMessage('Failed to connect to Prismic repository. Check your API configuration.', 'error');
        });
});

/**
 * API Interaction Functions
 */

// Get the master reference for the repository
async function getMasterRef() {
    try {
        const response = await fetch(PRISMIC_CONFIG.endpoints.repository, {
            method: 'GET',
            headers: {
                ...PRISMIC_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${PRISMIC_CONFIG.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.refs.find(ref => ref.isMasterRef).ref;
    } catch (error) {
        console.error('Error fetching master ref:', error);
        showStatusMessage('Failed to connect to Prismic API', 'error');
        throw error;
    }
}

// Fetch documents of the selected content type
async function fetchDocuments() {
    const contentType = elements.contentTypeSelect.value;

    // Show loading state
    elements.documentsList.innerHTML = '<div class="loading">Loading documents...</div>';

    try {
        if (!currentMasterRef) {
            currentMasterRef = await getMasterRef();
        }

        const url = `${PRISMIC_CONFIG.endpoints.documents}?ref=${currentMasterRef}&q=[[at(document.type,"${contentType}")]]`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...PRISMIC_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${PRISMIC_CONFIG.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        currentDocuments = data.results;

        renderDocumentsList(currentDocuments);
        showStatusMessage(`${currentDocuments.length} documents loaded`, 'success');
    } catch (error) {
        console.error('Error fetching documents:', error);
        elements.documentsList.innerHTML = '<div class="error">Failed to load documents. Check console for details.</div>';
        showStatusMessage('Failed to fetch documents from Prismic', 'error');
    }
}

// Create a new document
async function createDocument(documentData) {
    try {
        const contentType = elements.contentTypeSelect.value;

        // Prepare document data
        const newDocument = {
            id: crypto.randomUUID(), // Client-side generated ID
            type: contentType,
            lang: PRISMIC_CONFIG.defaultLanguage,
            data: {
                title: [{ type: 'heading1', text: documentData.title }],
                content: [{ type: 'paragraph', text: documentData.content }]
            }
        };

        const response = await fetch(`${PRISMIC_CONFIG.endpoints.cma.documents}`, {
            method: 'POST',
            headers: {
                ...PRISMIC_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${PRISMIC_CONFIG.accessToken}`
            },
            body: JSON.stringify(newDocument)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        showStatusMessage('Document created successfully', 'success');
        fetchDocuments(); // Refresh the list
        return result;
    } catch (error) {
        console.error('Error creating document:', error);
        showStatusMessage('Error creating document. See console for details.', 'error');
        throw error;
    }
}

// Update an existing document
async function updateDocument(id, ref, documentData) {
    try {
        // Prepare update data
        const updateData = {
            id: id,
            ref: ref,
            data: {
                title: [{ type: 'heading1', text: documentData.title }],
                content: [{ type: 'paragraph', text: documentData.content }]
            }
        };

        const response = await fetch(`${PRISMIC_CONFIG.endpoints.cma.documents}/${id}`, {
            method: 'PATCH',
            headers: {
                ...PRISMIC_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${PRISMIC_CONFIG.accessToken}`
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        showStatusMessage('Document updated successfully', 'success');
        fetchDocuments(); // Refresh the list
        return result;
    } catch (error) {
        console.error('Error updating document:', error);
        showStatusMessage('Error updating document. See console for details.', 'error');
        throw error;
    }
}

// Delete a document
async function deleteDocument(id) {
    try {
        const response = await fetch(`${PRISMIC_CONFIG.endpoints.cma.documents}/${id}`, {
            method: 'DELETE',
            headers: {
                ...PRISMIC_CONFIG.defaultHeaders,
                'Authorization': `Bearer ${PRISMIC_CONFIG.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        showStatusMessage('Document deleted successfully', 'success');
        fetchDocuments(); // Refresh the list
    } catch (error) {
        console.error('Error deleting document:', error);
        showStatusMessage('Error deleting document. See console for details.', 'error');
        throw error;
    }
}

/**
 * UI Interaction Functions
 */

// Render the list of documents
function renderDocumentsList(documents) {
    if (!documents || documents.length === 0) {
        elements.documentsList.innerHTML = '<div class="no-documents">No documents found. Create a new one to get started.</div>';
        return;
    }

    // Clear existing content
    elements.documentsList.innerHTML = '';

    // Clone the template for each document
    const template = document.getElementById('document-item-template');

    documents.forEach(doc => {
        const clone = template.content.cloneNode(true);

        // Set document data
        const title = clone.querySelector('.document-title');
        title.textContent = doc.data.title?.[0]?.text || 'Untitled Document';

        const date = clone.querySelector('.document-date');
        date.textContent = new Date(doc.last_publication_date || doc.first_publication_date).toLocaleString();

        // Set up action buttons
        const editBtn = clone.querySelector('.edit-document');
        editBtn.addEventListener('click', () => showEditForm(doc));

        const deleteBtn = clone.querySelector('.delete-document');
        deleteBtn.addEventListener('click', () => confirmDelete(doc));

        // Add to list
        elements.documentsList.appendChild(clone);
    });
}

// Show the form for creating a new document
function showCreateForm() {
    elements.formTitle.textContent = 'Create New Document';
    elements.documentId.value = '';
    elements.documentRef.value = '';
    elements.documentTitle.value = '';
    elements.documentContent.value = '';
    elements.documentFormContainer.classList.remove('hidden');
}

// Show the form for editing a document
function showEditForm(document) {
    elements.formTitle.textContent = 'Edit Document';
    elements.documentId.value = document.id;
    elements.documentRef.value = document.ref || '';
    elements.documentTitle.value = document.data.title?.[0]?.text || '';

    // For simplicity, we're just joining the content paragraphs
    const contentText = document.data.content?.map(item => item.text).join('\n\n') || '';
    elements.documentContent.value = contentText;

    elements.documentFormContainer.classList.remove('hidden');
}

// Hide the document form
function hideForm() {
    elements.documentFormContainer.classList.add('hidden');
    elements.documentForm.reset();
}

// Handle form submission (create or update)
async function handleFormSubmit(event) {
    event.preventDefault();

    const id = elements.documentId.value;
    const ref = elements.documentRef.value;
    const title = elements.documentTitle.value;
    const content = elements.documentContent.value;

    if (!title) {
        showStatusMessage('Title is required', 'error');
        return;
    }

    try {
        if (id) {
            // Update existing document
            await updateDocument(id, ref, { title, content });
        } else {
            // Create new document
            await createDocument({ title, content });
        }

        hideForm();
    } catch (error) {
        console.error('Form submission error:', error);
        // Error messages are handled in the create/update functions
    }
}

// Confirm before deleting a document
function confirmDelete(document) {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${document.data.title?.[0]?.text || 'Untitled Document'}"?`);

    if (confirmDelete) {
        deleteDocument(document.id);
    }
}

// Display status message
function showStatusMessage(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = type; // Reset classes
    elements.statusMessage.classList.add(type);
    elements.statusMessage.classList.remove('hidden');

    // Automatically hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            elements.statusMessage.classList.add('hidden');
        }, 5000);
    }
} 