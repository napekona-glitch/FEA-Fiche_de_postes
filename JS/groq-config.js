// Configuration pour l'API Groq
const GROQ_CONFIG = {
    // Vous devrez remplacer cette clé par votre clé d'API Groq
    API_KEY: ''.trim(),
    
    // Modèle Groq à utiliser (par exemple: 'mixtral-8x7b-32768' ou 'llama3-70b-8192')
    MODEL: 'llama-3.1-8b-instant',
    
    // Paramètres de génération
    TEMPERATURE: 0.7,
    MAX_TOKENS: 1024,
    
    // URL de l'API Groq
    API_URL: 'https://api.groq.com/openai/v1/chat/completions',
    
    // En-têtes de la requête
    get HEADERS() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`
        };
    }
};

// Exporter la configuration
try {
    module.exports = GROQ_CONFIG;
} catch (e) {
    // Si module.exports n'est pas disponible (navigateur)
    window.GROQ_CONFIG = GROQ_CONFIG;
}
