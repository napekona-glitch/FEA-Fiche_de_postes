// Configuration pour l'API Groq via proxy (sécurisée)
const GROQ_CONFIG = {
    // Plus de clé API côté client !
    
    // URL du proxy local (pas d'exposition de clé)
    API_URL: 'http://localhost:3001/api/groq',
    
    // Modèle Groq à utiliser
    MODEL: 'llama-3.1-8b-instant',
    
    // Paramètres de génération
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1024,
    
    // En-têtes de la requête (plus d'Authorization)
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
