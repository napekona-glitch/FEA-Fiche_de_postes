# Intégration de Groq avec le Chatbot Wekey

Ce guide explique comment configurer et utiliser l'intégration de Groq avec votre chatbot existant.

## Prérequis

1. Une clàd'API Groq valide
2. Un serveur web local (comme Live Server de VS Code) pour tester en local

## Installation

1. **Ajoutez les fichiers suivants** à votre projet :
   - `JS/groq-config.js` - Configuration de l'API Groq
   - `JS/groq-service.js` - Service pour interagir avec l'API Groq

2. **Mettez à jour** votre fichier `chatbot.js` avec les modifications fournies.

3. **Configurez votre clàAPI** dans `groq-config.js` :
   ```javascript
   const GROQ_CONFIG = {
       API_KEY: 'votre_cle_api_groq_ici',
       // ...
   };
   ```

## Utilisation

### Test local

1. Ouvrez le fichier `test-chatbot.html` dans votre navigateur.
2. Le chatbot devrait apparaître en bas à droite de l'écran.
3. Cliquez sur "Ouvrir le chat" pour commencer à discuter.

### Intégration dans votre application

1. Assurez-vous que les fichiers JavaScript sont correctement inclus dans votre HTML :
   ```html
   <script src="JS/groq-config.js"></script>
   <script src="JS/groq-service.js"></script>
   <script src="JS/chatbot.js"></script>
   ```

2. Le chatbot utilisera automatiquement Groq s'il est correctement configuré.

## Fonctionnalités

- **Réponses intelligentes** : Le chatbot utilise Groq pour générer des réponses pertinentes.
- **Gestion des erreurs** : En cas d'indisponibilitàde Groq, le chatbot bascule sur des réponses prédéfinies.
- **Interface utilisateur** : Interface moderne avec indicateur de frappe et gestion des états.

## Personnalisation

### Modifier l'apparence

Vous pouvez personnaliser l'apparence du chatbot en modifiant les styles CSS dans votre fichier CSS principal ou dans la balise `<style>` du fichier de test.

### Changer le modèle Groq

Modifiez la constante `MODEL` dans `groq-config.js` pour utiliser un autre modèle Groq :
```javascript
MODEL: 'mixtral-8x7b-32768', // ou 'llama3-70b-8192'
```

### Ajouter des fonctionnalités

Vous pouvez étendre les fonctionnalités en modifiant :
- `groq-service.js` pour ajouter des appels API personnalisés
- `chatbot.js` pour ajouter de nouvelles commandes ou comportements

## Dépannage

### Le chatbot n'utilise pas Groq
- Vérifiez que votre clàAPI est correctement configurée
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que `groq-service.js` est correctement chargé

### Les réponses sont lentes
- Vérifiez votre connexion Internet
- Réduisez la valeur de `MAX_TOKENS` dans `groq-config.js`

## Sécurité

⚠️ **Important** : Ne partagez jamais votre clàAPI Groq publiquement. En production, utilisez un backend pour sécuriser vos appels API.
