// Index des fiches de poste
const jobIndex = [
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
        description: 'Expert en sécurité des systèmes d\'information et protection des données.',
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
        title: 'Responsable Continuité d\'Activité',
        description: 'Garant de la disponibilité des systèmes critiques.',
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
        description: 'Ingénieur en fiabilité des sites et applications.',
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

// Fonction de recherche améliorée
function performSearch(query) {
    if (!query || query.trim() === '') {
        return []; // Ne retourne aucun résultat si la recherche est vide
    }
    
    const searchTerm = normalizeText(query).trim();
    const searchTerms = searchTerm.split(/\s+/); // Sépare les termes de recherche
    
    return jobIndex.map(job => {
        // Normalisation des champs de recherche
        const title = normalizeText(job.title);
        const description = normalizeText(job.description);
        const categories = job.categories.map(cat => normalizeText(cat)).join(' ');
        
        // Recherche des termes dans les différents champs
        let score = 0;
        let matches = {
            title: [],
            description: [],
            categories: []
        };

        searchTerms.forEach(term => {
            if (term.length < 2) return; // Ignore les termes trop courts
            
            // Vérifie les correspondances dans le titre
            if (title.includes(term)) {
                score += 3; // Poids plus important pour le titre
                matches.title.push(term);
            }
            
            // Vérifie les correspondances dans la description
            if (description.includes(term)) {
                score += 1;
                matches.description.push(term);
            }
            
            // Vérifie les correspondances dans les catégories
            if (categories.includes(term)) {
                score += 2; // Poids moyen pour les catégories
                matches.categories.push(term);
            }
        });

        return { ...job, score, matches };
    })
    .filter(job => job.score > 0) // Ne garde que les résultats avec au moins une correspondance
    .sort((a, b) => b.score - a.score); // Trie par score décroissant
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
                <p>Aucun résultat trouvé pour votre recherche : <strong>${query}</strong></p>
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

// Gestionnaire d'événement pour la recherche
function handleSearch() {
    const query = searchInput.value.trim();
    console.log('Recherche pour:', query); // Debug
    
    if (query.length < 2) {
        // Si la recherche est trop courte, on efface les résultats
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        return;
    }
    
    const results = performSearch(query);
    console.log('Résultats trouvés:', results); // Debug
    displaySearchResults(results, query);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script de recherche amélioré chargé'); // Debug
    
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