// email-service.js - Service partagàpour l'envoi d'emails

function setupEmailButtons() {
    const emailButtons = document.querySelectorAll('.email-button');
    
    emailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const posteTitle = document.querySelector('h1').innerText.replace(/\*+/g, '').trim();
            const fichePosteSection = document.getElementById('fiche-poste');
            
            if (fichePosteSection) {
                const fichePosteClone = fichePosteSection.cloneNode(true);
                const contactSection = fichePosteClone.querySelector('.contact-section');
                if (contactSection) {
                    contactSection.remove();
                }
                
                // Fonction pour créer un séparateur
                const separator = (char = '─', length = 60) => char.repeat(length);
                
                // Récupérer chaque section individuellement
                const getSectionContent = (selector) => {
                    const element = fichePosteClone.querySelector(selector);
                    return element ? element.innerText.trim() : '';
                };
                
                // Récupérer le contenu de chaque section
                const missionDesc = getSectionContent('.mission-description');
                const missionExp = getSectionContent('.mission-expectations');
                const profileReq = getSectionContent('.profile-requirements');
                const rateInfo = getSectionContent('.rate-info');
                
                // Construire le corps de l'email
                let emailBody = '';
                
                // En-tête
                emailBody += `╔${separator('═', 58)}╗\n`;
                emailBody += `║ ${'FICHE DE POSTE'.padEnd(57)}║\n`;
                emailBody += `╚${separator('═', 58)}╝\n\n`;
                
                // Titre du poste
                emailBody += `📌 ${posteTitle.toUpperCase()}\n`;
                emailBody += `${separator('─')}\n\n`;
                
                // Description de la mission
                if (missionDesc) {
                    emailBody += `📋 ${'DESCRIPTION'.padEnd(20, ' ')}${separator(' ', 5)}\n${missionDesc}\n\n`;
                }
                
                // Missions
                if (missionExp) {
                    emailBody += `🎯 ${'MISSIONS'.padEnd(20, ' ')}${separator(' ', 8)}\n${missionExp.replace(/^/gm, '• ').replace(/\n\s*•\s*\n/gm, '\n')}\n\n`;
                }
                
                // Profil recherché
                if (profileReq) {
                    emailBody += `👤 ${'PROFIL RECHERCHÉ'.padEnd(20, ' ')}${separator(' ', 1)}\n${profileReq.replace(/^/gm, '• ').replace(/\n\s*•\s*\n/gm, '\n')}\n\n`;
                }
                
                // Rémunération
                if (rateInfo) {
                    emailBody += `💰 ${'RÉMUNÉRATION'.padEnd(20, ' ')}${separator(' ', 4)}\n${rateInfo}\n\n`;
                }
                
                // Pied de page
                emailBody += `${separator('─')}\n\n`;
                emailBody += `📧 Pour postuler, répondez à cet email en joignant votre CV.\n`;
                emailBody += `⏱️ Nous vous recontacterons dans les plus brefs délais.\n\n`;
                emailBody += `Cordialement,\nL'équipe de recrutement FEA\n`;
                emailBody += `📞 +33 X XX XX XX XX\n`;
                emailBody += `🌐 www.fea-example.com`;
                
                // Encoder et envoyer l'email
                const encodedBody = encodeURIComponent(emailBody);
                const subject = `Candidature - ${posteTitle}`;
                window.location.href = `mailto:recrutement@fea-example.com?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
            }
        });
    });
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', setupEmailButtons);
