console.log('Chargement du fichier chatbot.js');

// Configuration du backend Cloudflare
const BACKEND_URL = 'https://groq-api-proxy-public.napekona.workers.dev'; // Mode production
// const BACKEND_URL = 'http://localhost:8787'; // Mode développement local

// Configuration des experts par page
const experts = {
    'architecte-entreprise': {
        name: 'Expert en Architecture d\'Entreprise',
        description: 'Je suis spécialisàen architecture d\'entreprise, avec une expertise en alignement stratégique des systèmes d\'information sur les objectifs métier.',
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
        description: 'Je suis spécialisàdans la cybersécuritàet la protection des systèmes d\'information.',
        expertise: [
            'Sécuritàdes applications',
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
        
        // Utiliser le backend Cloudflare
        this.backendUrl = BACKEND_URL;
        console.log('URL du backend:', this.backendUrl);
        
        this.initialize();
        console.log('Chatbot initialisàavec le backend Cloudflare');
    }

    detectExpert() {
        const path = window.location.pathname.split('/').pop().replace('.html', '');
        return experts[path] || {
            name: 'Expert Wekey',
            description: 'Je suis un expert Wekey spécialisàdans les métiers de l\'architecture et des technologies de l\'information.',
            expertise: ['Architecture SI', 'Technologies Cloud', 'Développement', 'Sécurité', 'Gestion de projet']
        };
    }

    initialize() {
        console.log('Initialisation du chatbot...');
        try {
            this.setupEventListeners();
            console.log('Écouteurs d\'événements configurés');
            // Ne pas ajouter de message de bienvenue supplémentaire
            // car il est déjà défini dans le HTML
            console.log('Utilisation du message de bienvenue du HTML');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du chatbot:', error);
        }
    }

    // La méthode addWelcomeMessage a étàsupprimée car le message de bienvenue
    // est maintenant défini directement dans le HTML

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
        
        // Forcer le scroll vers le bas avec un petit délai pour l'animation
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
        
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
            
            // Utiliser le backend Cloudflare
            console.log('Tentative d\'envoi du message au backend Cloudflare...');
            try {
                response = await this.sendMessageToBackend(userMessage);
                console.log('Réponse reçue du backend:', response);
            } catch (error) {
                console.error('Erreur avec le backend:', error);
                // En cas d'erreur, basculer sur la réponse par défaut
                console.log('Utilisation de la réponse par défaut');
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
        } finally {
            // Réactiver l'input après le traitement
            input.disabled = false;
            sendButton.disabled = false;
            input.focus();
        }
    }

    async sendMessageToBackend(message) {
        try {
            const response = await fetch(`${this.backendUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    expert: this.currentExpert,
                    context: 'chatbot FEA'
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data.response || this.generateResponse(message);
        } catch (error) {
            console.error('Erreur lors de la communication avec le backend:', error);
            throw error;
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) {
            console.error('Conteneur de messages non trouvàpour l\'indicateur de frappe');
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
        
        // Scroll vers le bas pour l'indicateur de typing
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
        
        return typingElement;
    }

    generateResponse(userMessage) {
        // Ici, vous pourriez intégrer une API d'IA comme OpenAI
        // Pour l'instant, nous allons utiliser des réponses prédéfinies
        const lowerMessage = userMessage.toLowerCase();
        
        // Pas de réponse supplémentaire pour "bonjour" car le message de bienvenue est déjà affiché
        
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
        
        // Gérer la fermeture et la minimisation (ancien code à supprimer car dupliqué)
        // Ces gestionnaires sont maintenant définis plus bas dans la fonction setupEventListeners principale

        // Gérer le bouton toggle
        const chatbotToggle = document.getElementById('chatbot-toggle');
        const chatbotContainer = document.getElementById('chatbot-container');
        const chatNotification = document.getElementById('chat-notification');
        const minimizeChat = document.getElementById('minimize-chat');
        
        console.log('Éléments trouvés:', {
            chatbotToggle: !!chatbotToggle,
            chatbotContainer: !!chatbotContainer,
            minimizeChat: !!minimizeChat,
            chatNotification: !!chatNotification
        });
        
        let isFirstInteraction = true;

        if (chatbotToggle && chatbotContainer && minimizeChat) {
            // Fonction pour ouvrir le chat
            function openChat() {
                console.log('Ouverture du chatbot...');
                
                // Forcer les styles pour l'ouverture
                chatbotContainer.style.height = '70vh';
                chatbotContainer.style.minHeight = '500px';
                chatbotContainer.style.maxHeight = '700px';
                chatbotContainer.style.overflow = '';
                chatbotContainer.style.transform = 'translateY(0)';
                chatbotContainer.style.opacity = '1';
                chatbotContainer.style.visibility = 'visible';
                
                // Afficher le contenu
                const messages = chatbotContainer.querySelector('.chatbot-messages');
                const input = chatbotContainer.querySelector('.chatbot-input');
                if (messages) messages.style.display = 'flex';
                if (input) input.style.display = 'flex';
                
                chatbotContainer.classList.add('active');
                chatbotContainer.classList.remove('minimized');
                chatbotToggle.style.display = 'none';
                
                console.log('Chatbot ouvert, classes:', chatbotContainer.className);
                console.log('Style forcé:', chatbotContainer.style.cssText);
                
                // Masquer la notification si c'est la première interaction
                if (isFirstInteraction) {
                    if (chatNotification) {
                        chatNotification.style.display = 'none';
                    }
                    isFirstInteraction = false;
                }
            }

            // Fonction pour minimiser le chat
            function minimizeChatFunc() {
                console.log('Minimisation du chatbot...');
                console.log('État avant:', chatbotContainer.className);
                
                // Forcer la minimisation avec style inline
                chatbotContainer.style.height = '60px';
                chatbotContainer.style.minHeight = '60px';
                chatbotContainer.style.maxHeight = '60px';
                chatbotContainer.style.overflow = 'hidden';
                
                // Cacher le contenu
                const messages = chatbotContainer.querySelector('.chatbot-messages');
                const input = chatbotContainer.querySelector('.chatbot-input');
                if (messages) messages.style.display = 'none';
                if (input) input.style.display = 'none';
                
                // Retirer active et ajouter minimized
                chatbotContainer.classList.remove('active');
                chatbotContainer.classList.add('minimized');
                chatbotToggle.style.display = 'flex';
                
                console.log('État après:', chatbotContainer.className);
                console.log('Style forcé:', chatbotContainer.style.cssText);
                
                // Afficher une notification pour indiquer qu'il y a eu une activité
                if (chatNotification) {
                    chatNotification.style.display = 'block';
                }
            }

            // Événements (déplacés à l'intérieur du if)
            chatbotToggle.addEventListener('click', openChat);
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
        } else {
            console.error('Certains éléments du chatbot n\'ont pas été trouvés');
        }
    }
}

// Démarrer le chatbot quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, démarrage du chatbot');
    
    // Attendre un peu que les scripts se chargent
    setTimeout(() => {
        console.log('URL du backend:', BACKEND_URL);
        window.chatbot = new Chatbot();
        console.log('Chatbot démarràavec succès');
    }, 500); // Attendre 500ms que les scripts se chargent
});
