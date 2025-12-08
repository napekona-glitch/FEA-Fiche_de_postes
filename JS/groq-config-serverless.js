// Configuration pour l'API Groq via serverless (sécurisée)
const GROQ_CONFIG = {
    // URL du serveur proxy Netlify
    API_URL: '/api/groq-proxy',
    
    // Modèle Groq à utiliser
    MODEL: 'llama-3.1-8b-instant',
    
    // Paramètres de génération
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1024,
    
    // En-têtes de la requête (pas de clé API côté client !)
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Exporter la configuration
try {
    module.exports = GROQ_CONFIG;
} catch (e) {
    // Si module.exports n'est pas disponible (navigateur)
    window.GROQ_CONFIG = GROQ_CONFIG;
}
