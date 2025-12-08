console.log('Chargement du fichier chatbot.js');

// Configuration des experts par page
const experts = {
    'architecte-entreprise': {
        name: 'Expert en Architecture d\'Entreprise',
        description: 'Je suis spécialisé en architecture d\'entreprise, avec une expertise en alignement stratégique des systèmes d\'information sur les objectifs métier.',
        expertise: [
            'Gouvernance SI',
            'Urbanisation des SI',
            'Transformation numérique',
            'Architecture cible',
            'Cartographie applicative'
        ]
    },
    'architecte-applicatif': {
        name: 'Expert en Architecture Applicative',
        description: 'Je me spécialise dans la conception et l\'optimisation des architectures logicielles.',
        expertise: [
            'Conception logicielle',
            'Patterns d\'architecture',
            'Microservices',
            'APIs',
            'Performance applicative'
        ]
    },
    'architecte-securite': {
        name: 'Expert en Sécurité',
        description: 'Je suis spécialisé dans la cybersécurité et la protection des systèmes d\'information.',
        expertise: [
            'Sécurité des applications',
            'Conformité',
            'Tests d\'intrusion',
            'Politiques de sécurité',
            'Gestion des identités'
        ]
    }
    // Ajoutez d'autres profils d'experts ici
};

class Chatbot {
    constructor() {
        console.log('Initialisation du Chatbot...');
        this.messages = [];
        this.currentExpert = this.detectExpert();
        console.log('Expert détecté:', this.currentExpert);
        
        // Vérifier si le service Groq est disponible
        this.groqService = window.groqService || null;
        console.log('Service Groq disponible:', !!this.groqService);
        
        this.initialize();
        
        // Initialiser le service Groq si disponible
        if (this.groqService) {
            console.log('Initialisation de la conversation Groq...');
            this.groqService.initializeConversation(this.currentExpert);
            console.log('Conversation Groq initialisée');
        }
    }

    detectExpert() {
        const path = window.location.pathname.split('/').pop().replace('.html', '');
        return experts[path] || {
            name: 'Expert Wekey',
            description: 'Je suis un expert Wekey spécialisé dans les métiers de l\'architecture et des technologies de l\'information.',
            expertise: ['Architecture SI', 'Technologies Cloud', 'Développement', 'Sécurité', 'Gestion de projet']
        };
    }

    initialize() {
        console.log('Initialisation du chatbot...');
        try {
            this.setupEventListeners();
            console.log('Écouteurs d\'événements configurés');
            this.addWelcomeMessage();
            console.log('Message de bienvenue ajouté');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du chatbot:', error);
        }
    }

    addWelcomeMessage() {
        const welcomeMessage = `Bonjour ! Je suis ${this.currentExpert.name}. ${this.currentExpert.description} Comment puis-je vous aider aujourd'hui ?`;
        this.addMessage('assistant', welcomeMessage);
    }

    addMessage(role, content) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) {
            console.error('Conteneur de messages non trouvé');
            return;
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        messageElement.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', 'minute': '2-digit'})}</div>
        `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Ajouter au tableau des messages pour l'historique
        this.messages.push({ role, content });
    }

    async processUserInput() {
        console.log('Traitement de l\'entrée utilisateur...');
        const input = document.getElementById('user-input');
        const userMessage = input.value.trim();
        
        if (!userMessage) {
            console.log('Message vide, sortie');
            return;
        }
        
        console.log('Message utilisateur:', userMessage);
        // Afficher le message de l'utilisateur
        this.addMessage('user', userMessage);
        input.value = '';
        
        // Désactiver l'input pendant le traitement
        input.disabled = true;
        const sendButton = document.getElementById('send-message');
        sendButton.disabled = true;
        
        // Afficher un indicateur de frappe
        const typingIndicator = this.showTypingIndicator();
        
        try {
            let response;
            
            // Utiliser Groq si disponible, sinon utiliser la réponse par défaut
            if (this.groqService) {
                console.log('Tentative d\'envoi du message à Groq...');
                try {
                    response = await this.groqService.sendMessage(userMessage);
                    console.log('Réponse reçue de Groq:', response);
                } catch (error) {
                    console.error('Erreur avec le service Groq:', error);
                    // En cas d'erreur avec Groq, basculer sur la réponse par défaut
                    console.log('Utilisation de la réponse par défaut');
                    response = this.generateResponse(userMessage);
                }
            } else {
                console.log('Service Groq non disponible, utilisation de la réponse par défaut');
                // Simulation de délai pour l'expérience utilisateur
                await new Promise(resolve => setTimeout(resolve, 1000));
                response = this.generateResponse(userMessage);
            }
            
            // Remplacer l'indicateur de frappe par la réponse
            if (typingIndicator) {
                typingIndicator.remove();
            }
            this.addMessage('assistant', response);
            
        } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
            if (typingIndicator) {
                typingIndicator.remove();
            }
            this.addMessage('assistant', 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.');
            
            // En cas d'erreur, réinitialiser la conversation
            if (this.groqService) {
                try {
                    this.groqService.resetConversation(this.currentExpert);
                } catch (e) {
                    console.error('Erreur lors de la réinitialisation de la conversation:', e);
                }
            }
        } finally {
            // Réactiver l'input après le traitement
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) {
            console.error('Conteneur de messages non trouvé pour l\'indicateur de frappe');
            return null;
        }

        const typingElement = document.createElement('div');
        typingElement.className = 'message assistant-message typing-indicator';
        typingElement.innerHTML = `
            <div class="message-content">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `;
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingElement;
    }

    generateResponse(userMessage) {
        // Ici, vous pourriez intégrer une API d'IA comme OpenAI
        // Pour l'instant, nous allons utiliser des réponses prédéfinies
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('coucou')) {
            return `Bonjour ! Comment puis-je vous aider avec ${this.currentExpert.expertise[0].toLowerCase()} aujourd'hui ?`;
        } 
        
        if (lowerMessage.includes('merci') || lowerMessage.includes('au revoir')) {
            return 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.';
        }
        
        if (lowerMessage.includes('compétences') || lowerMessage.includes('expertise')) {
            return `En tant que ${this.currentExpert.name}, je peux vous aider avec :\n- ${this.currentExpert.expertise.join('\n- ')}`;
        }
        
        // Réponse par défaut
        return `En tant que ${this.currentExpert.name}, je peux vous fournir des informations sur ce sujet. 
        Pour une réponse plus précise, vous pourriez préciser votre question concernant ${this.currentExpert.expertise[0].toLowerCase()}.`;
    }

    setupEventListeners() {
        // Envoyer un message avec le bouton
        const sendButton = document.getElementById('send-message');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.processUserInput());
        }
        
        // Ou avec la touche Entrée
        const userInput = document.getElementById('user-input');
        if (userInput) {
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.processUserInput();
                }
            });
        }
        
        // Gérer la fermeture et la minimisation
        const minimizeChat = document.getElementById('minimize-chat');
        if (minimizeChat) {
            minimizeChat.addEventListener('click', () => {
                const container = document.getElementById('chatbot-container');
                if (container) {
                    container.classList.toggle('minimized');
                }
            });
        }
        
        const closeChat = document.getElementById('close-chat');
        if (closeChat) {
            closeChat.addEventListener('click', () => {
                const container = document.getElementById('chatbot-container');
                if (container) {
                    container.style.display = 'none';
                }
            });
        }

        // Gérer le bouton toggle
        const chatbotToggle = document.getElementById('chatbot-toggle');
        const chatbotContainer = document.getElementById('chatbot-container');
        const chatNotification = document.getElementById('chat-notification');
        let isFirstInteraction = true;

        if (chatbotToggle && chatbotContainer) {
            // Fonction pour ouvrir le chat
            function openChat() {
                chatbotContainer.classList.add('active');
                chatbotToggle.style.display = 'none';
                
                // Masquer la notification si c'est la première interaction
                if (isFirstInteraction) {
                    if (chatNotification) {
                        chatNotification.style.display = 'none';
                    }
                    isFirstInteraction = false;
                }
            }

            // Fonction pour fermer le chat
            function closeChatFunc() {
                chatbotContainer.classList.remove('active');
                chatbotToggle.style.display = 'flex';
            }

            // Fonction pour minimiser le chat
            function minimizeChatFunc() {
                chatbotContainer.classList.remove('active');
                chatbotToggle.style.display = 'flex';
                
                // Afficher une notification pour indiquer qu'il y a eu une activité
                if (chatNotification) {
                    chatNotification.style.display = 'block';
                }
            }

            // Événements
            chatbotToggle.addEventListener('click', openChat);
            closeChat.addEventListener('click', closeChatFunc);
            minimizeChat.addEventListener('click', minimizeChatFunc);

            // Fermer le chat en cliquant à l'extérieur
            document.addEventListener('click', function(event) {
                if (!chatbotContainer.contains(event.target) && 
                    !chatbotToggle.contains(event.target) && 
                    chatbotContainer.classList.contains('active')) {
                    minimizeChatFunc();
                }
            });

            // Empêcher la propagation des clics à l'intérieur du chat
            chatbotContainer.addEventListener('click', function(event) {
                event.stopPropagation();
            });

            // Afficher une notification après 10 secondes si l'utilisateur n'a pas encore interagi
            setTimeout(() => {
                if (isFirstInteraction && chatNotification) {
                    chatNotification.style.display = 'block';
                }
            }, 10000);
        }
    }
}

// Démarrer le chatbot quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, démarrage du chatbot');
    
    // Attendre un peu que les scripts se chargent
    setTimeout(() => {
        console.log('Configuration Groq:', window.GROQ_CONFIG || 'Non chargée');
        console.log('Service Groq:', window.groqService ? 'Disponible' : 'Non disponible');
        
        if (!window.groqService && window.GROQ_CONFIG) {
            console.log('Tentative de création manuelle du service Groq...');
            try {
                // Créer manuellement le service si nécessaire
                class GroqService {
                    constructor() {
                        console.log('Initialisation du service Groq...');
                        this.config = window.GROQ_CONFIG || {};
                        console.log('Configuration Groq chargée:', this.config.API_URL ? 'Oui' : 'Non');
                        console.log('Clé API présente:', this.config.API_KEY ? 'Oui' : 'Non');
                        
                        // Validation de la clé API
                        if (this.config.API_KEY) {
                            console.log('Longueur de la clé API:', this.config.API_KEY.length);
                            console.log('Début de la clé API:', this.config.API_KEY.substring(0, 10) + '...');
                            
                            if (!this.config.API_KEY.startsWith('gsk_')) {
                                console.error('La clé API ne commence pas par "gsk_"');
                            }
                            if (this.config.API_KEY.length < 20) {
                                console.error('La clé API semble trop courte');
                            }
                        } else {
                            console.error('Aucune clé API trouvée');
                        }
                        
                        this.conversationHistory = [];
                        console.log('Service Groq initialisé');
                    }

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

                    async sendMessage(message) {
                        console.log('Envoi du message à Groq:', message);
                        this.conversationHistory.push({
                            role: 'user',
                            content: message
                        });

                        try {
                            // Debug: afficher les détails de la requête
                            console.log('URL de l\'API:', this.config.API_URL);
                            console.log('Modèle:', this.config.MODEL);
                            console.log('Authorization header:', this.config.HEADERS.Authorization);
                            
                            const response = await fetch(this.config.API_URL, {
                                method: 'POST',
                                headers: this.config.HEADERS,
                                body: JSON.stringify({
                                    model: this.config.MODEL,
                                    messages: this.conversationHistory,
                                    temperature: this.config.TEMPERATURE,
                                    max_tokens: this.config.MAX_TOKENS
                                })
                            });

                            console.log('Statut de la réponse:', response.status);
                            console.log('Headers de la réponse:', response.headers);

                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error('Détail de l\'erreur:', errorText);
                                throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
                            }

                            const data = await response.json();
                            console.log('Réponse de l\'API:', data);
                            
                            if (!data.choices || data.choices.length === 0) {
                                throw new Error('Aucune réponse générée par l\'API');
                            }
                            
                            const botResponse = data.choices[0].message.content;
                            
                            this.conversationHistory.push({
                                role: 'assistant',
                                content: botResponse
                            });

                            return botResponse;
                        } catch (error) {
                            console.error('Erreur lors de l\'appel à l\'API Groq:', error);
                            throw error;
                        }
                    }

                    resetConversation(expert) {
                        this.initializeConversation(expert);
                    }
                }
                
                window.groqService = new GroqService();
                console.log('Service Groq créé manuellement');
            } catch (error) {
                console.error('Erreur lors de la création manuelle du service Groq:', error);
            }
        }
        
        window.chatbot = new Chatbot();
    }, 500); // Attendre 500ms que les scripts se chargent
});
