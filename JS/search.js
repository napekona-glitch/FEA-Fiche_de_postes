// Configuration du backend
const SEARCH_BACKEND_URL = 'https://groq-api-proxy-public.napekona.workers.dev'; // Mode production
// const SEARCH_BACKEND_URL = 'http://localhost:8787'; // Mode développement local

// Index local des fiches de poste (backup si le backend est indisponible)
const localJobIndex = [
    {
        id: 'urbaniste-si',
        title: 'Urbaniste SI',
        description: 'Expert en alignement stratégique du système d\'information avec les objectifs métiers.',
        categories: ['Architecture', 'Gouvernance']
    },
    {
        id: 'lead-tech',
        title: 'Lead Technique',
        description: 'Responsable de la cohérence technique et de l\'encadrement des équipes de développement.',
        categories: ['Architecture', 'Développement']
    },
    {
        id: 'ingenieur-reseau-cloud',
        title: 'Ingénieur Réseau et Cloud',
        description: 'Expert en infrastructure réseau et solutions cloud.',
        categories: ['Cloud', 'Réseau']
    },
    {
        id: 'ingenieur-securite',
        title: 'Ingénieur Sécurité',
        description: 'Expert en securité des systèmes d\'information et protection des données.',
        categories: ['Sécurité', 'Conformité']
    },
    {
        id: 'responsable-gouvernance',
        title: 'Responsable Gouvernance SI',
        description: 'Responsable de la mise en place des bonnes pratiques et de la conformité.',
        categories: ['Gouvernance', 'Conformité']
    },
    {
        id: 'responsable-continuite',
        title: 'Responsable Continuitàd\'Activité',
        description: 'Garant de la disponibilitàdes systèmes critiques.',
        categories: ['Sécurité', 'Infrastructure']
    },
    {
        id: 'specialiste-iam',
        title: 'Spécialiste IAM',
        description: 'Expert en gestion des identités et des accès.',
        categories: ['Sécurité', 'Authentification']
    },
    {
        id: 'sre',
        title: 'Site Reliability Engineer',
        description: 'Ingénieur en fiabilitàdes sites et applications.',
        categories: ['DevOps', 'Cloud']
    },
    {
        id: 'architecte-data',
        title: 'Architecte Data',
        description: 'Conçoit et met en œuvre des solutions de gestion des données à l\'échelle de l\'entreprise.',
        categories: ['Data', 'Architecture']
    },
    {
        id: 'ingenieur-data',
        title: 'Ingénieur Data',
        description: 'Développe et maintient les infrastructures de données et les pipelines ETL.',
        categories: ['Data', 'Développement']
    },
    {
        id: 'data-scientist',
        title: 'Data Scientist',
        description: 'Analyse des données complexes pour en extraire des informations exploitables.',
        categories: ['Data', 'IA']
    },
    {
        id: 'ml-engineer',
        title: 'Machine Learning Engineer',
        description: 'Conçoit et déploie des modèles de machine learning en production.',
        categories: ['Data', 'IA', 'Développement']
    }
];

// Fonction pour normaliser le texte (enlever les accents, mettre en minuscules)
function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Fonction pour appeler le backend Cloudflare avec Groq
async function searchWithBackend(query) {
    try {
        const response = await fetch(`${SEARCH_BACKEND_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                context: 'fiches de poste architecture IT'
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Erreur lors de la communication avec le backend:', error);
        // Fallback sur la recherche locale si le backend est indisponible
        return performLocalSearch(query);
    }
}

// Fonction de recherche locale (fallback)
function performLocalSearch(query) {
    if (!query || query.trim() === '') {
        return [];
    }
    
    const searchTerm = normalizeText(query).trim();
    const searchTerms = searchTerm.split(/\s+/);
    
    return localJobIndex.map(job => {
        const title = normalizeText(job.title);
        const description = normalizeText(job.description);
        const categories = job.categories.map(cat => normalizeText(cat)).join(' ');
        
        let score = 0;
        let matches = {
            title: [],
            description: [],
            categories: []
        };

        searchTerms.forEach(term => {
            if (term.length < 2) return;
            
            if (title.includes(term)) {
                score += 3;
                matches.title.push(term);
            }
            
            if (description.includes(term)) {
                score += 1;
                matches.description.push(term);
            }
            
            if (categories.includes(term)) {
                score += 2;
                matches.categories.push(term);
            }
        });

        return { ...job, score, matches };
    })
    .filter(job => job.score > 0)
    .sort((a, b) => b.score - a.score);
}

// Fonction de recherche améliorée
async function performSearch(query) {
    const results = await searchWithBackend(query);
    return results;
}

// Fonction pour mettre en surbrillance les correspondances
function highlightMatches(text, matches) {
    if (!matches || matches.length === 0) return text;
    
    // Crée une expression régulière avec tous les termes à mettre en surbrillance
    const regex = new RegExp(`(${matches.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Fonction d'affichage des résultats améliorée
function displaySearchResults(results, query) {
    const main = document.querySelector('main');
    if (!main) return;
    
    let resultsContainer = document.getElementById('searchResults');
    
    // Créer ou mettre à jour le conteneur de résultats
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'search-results';
        main.insertBefore(resultsContainer, main.firstChild);
    }
    
    // Vider les résultats précédents
    resultsContainer.innerHTML = '';
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>Aucun résultat trouvàpour votre recherche : <strong>${query}</strong></p>
                <p>Essayez avec des termes différents ou consultez la liste complète ci-dessous.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="search-results-header">
            <h2>Résultats de la recherche pour : <span class="search-query">${query}</span></h2>
            <p class="results-count">${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}</p>
        </div>
        <div class="search-results-list">
    `;
    
    results.forEach(job => {
        // Met en surbrillance les correspondances dans le titre
        let highlightedTitle = job.title;
        if (job.matches.title.length > 0) {
            highlightedTitle = highlightMatches(job.title, job.matches.title);
        }
        
        // Met en surbrillance les correspondances dans la description (limitées aux 200 premiers caractères)
        let snippet = job.description.substring(0, 200) + (job.description.length > 200 ? '...' : '');
        if (job.matches.description.length > 0) {
            snippet = highlightMatches(snippet, job.matches.description);
        }
        
        html += `
            <div class="search-result-item" data-score="${job.score}">
                <h3><a href="${job.id}.html" class="search-result-link">${highlightedTitle}</a></h3>
                <div class="search-snippet">${snippet}</div>
                <div class="search-meta">
                    <div class="categories">
                        ${job.categories.map(cat => {
                            const isMatched = job.matches.categories.some(term => 
                                normalizeText(cat).includes(term)
                            );
                            return `<span class="category-tag ${isMatched ? 'matched' : ''}">${cat}</span>`;
                        }).join('')}
                    </div>
                    <div class="relevance">Pertinence: <span class="relevance-score">${Math.round((job.score / (job.matches.title.length * 3 + job.matches.description.length + job.matches.categories.length * 2)) * 100)}%</span></div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
}

// Gestionnaire d'événement pour la recherche (async)
async function handleSearch() {
    const query = searchInput.value.trim();
    console.log('Recherche pour:', query);
    
    if (query.length < 2) {
        // Si la recherche est trop courte, on efface les résultats
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        return;
    }
    
    // Afficher un indicateur de chargement
    const main = document.querySelector('main');
    let resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'searchResults';
        resultsContainer.className = 'search-results';
        main.insertBefore(resultsContainer, main.firstChild);
    }
    
    resultsContainer.innerHTML = `
        <div class="search-loading">
            <p>Recherche en cours...</p>
        </div>
    `;
    
    try {
        const results = await performSearch(query);
        console.log('Résultats trouvés:', results);
        displaySearchResults(results, query);
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        resultsContainer.innerHTML = `
            <div class="search-error">
                <p>Une erreur est survenue lors de la recherche. Veuillez réessayer.</p>
            </div>
        `;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script de recherche amélioràchargé'); // Debug
    
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (!searchInput) {
        console.error('Élément searchInput non trouvé');
        return;
    }
    
    // Recherche au clic sur le bouton
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    
    // Recherche lors de la frappe avec délai
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearch, 300); // Délai de 300ms
    });
    
    // Recherche avec la touche Entrée
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            clearTimeout(searchTimeout);
            handleSearch();
        }
    });
});