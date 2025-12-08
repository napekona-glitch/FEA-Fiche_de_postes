// Service pour interagir avec l'API Groq
class GroqService {
    constructor() {
        console.log('Initialisation du service Groq...');
        this.config = window.GROQ_CONFIG || {};
        console.log('Configuration Groq chargée:', this.config.API_URL ? 'Oui' : 'Non');
        console.log('Clé API présente:', this.config.API_KEY ? 'Oui' : 'Non');
        this.conversationHistory = [];
        console.log('Service Groq initialisé');
    }

    /**
     * Initialise l'historique de conversation avec le contexte de l'expert
     * @param {Object} expert - Les informations sur l'expert actuel
     */
    initializeConversation(expert) {
        this.conversationHistory = [
            {
                role: 'system',
                content: `Tu es un assistant expert en ${expert.name.toLowerCase()}. 
                Tu es spécialisé dans: ${expert.expertise.join(', ')}. 
                Tu réponds de manière précise et professionnelle en français. 
                Sois concis et va droit au but.`
            }
        ];
    }

    /**
     * Envoie un message à l'API Groq et récupère la réponse
     * @param {string} message - Le message de l'utilisateur
     * @returns {Promise<string>} La réponse du modèle Groq
     */
    async sendMessage(message) {
        console.log('Envoi du message à Groq:', message);
        // Ajouter le message de l'utilisateur à l'historique
        this.conversationHistory.push({
            role: 'user',
            content: message
        });
        console.log('Historique de la conversation:', JSON.stringify(this.conversationHistory, null, 2));

        try {
            console.log('Envoi de la requête à:', this.config.API_URL);
            console.log('En-têtes:', this.config.HEADERS);
            const response = await fetch(this.config.API_URL, {
                method: 'POST',
                headers: this.config.HEADERS,
                body: JSON.stringify({
                    model: this.config.MODEL,
                    messages: this.conversationHistory,
                    temperature: this.config.TEMPERATURE,
                    max_tokens: this.config.MAX_TOKENS,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;
            
            // Ajouter la réponse à l'historique
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            return assistantMessage;

        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API Groq:', error);
            throw new Error('Désolé, une erreur est survenue lors de la communication avec le service.');
        }
    }

    /**
     * Réinitialise l'historique de conversation
     */
    resetConversation(expert) {
        this.initializeConversation(expert);
    }
}

// Créer une instance unique du service
try {
    module.exports = new GroqService();
} catch (e) {
    // Si module.exports n'est pas disponible (navigateur)
    window.groqService = new GroqService();
}
