// Script pour le site FEA - Fiches de Poste

document.addEventListener('DOMContentLoaded', function() {
    // Navigation smooth
    const navLinks = document.querySelectorAll('.navigation a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Vérifier si le lien est un lien d'ancrage (commence par #)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // Pour les autres liens (comme index.html), laisser le comportement par défaut
        });
    });

    // Animation au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer les cartes
    const cards = document.querySelectorAll('.evaluation-card, .fiche-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Header sticky avec effet
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        
        lastScroll = currentScroll;
    });

    // Animation des liens de l'index - REMOVED to allow normal link navigation

    // Fonction pour imprimer une section spécifique
    window.printSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const printWindow = window.open('', '_blank');
        const sectionContent = section.outerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Impression - ${section.querySelector('h2').textContent}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1, h2, h3 { color: #2c3e50; }
                    .fiche-card, .evaluation-card { 
                        page-break-inside: avoid; 
                        margin-bottom: 20px; 
                        border: 1px solid #ddd; 
                        padding: 15px; 
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${section.querySelector('h2').textContent}</h1>
                ${sectionContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    };

        // Fonction pour envoyer la fiche de poste par email
    function setupPublishButton() {
        const publishBtn = document.getElementById('publishBtn');
        
        if (publishBtn) {
            publishBtn.addEventListener('click', function() {
                // Récupérer le titre du poste
                const posteTitle = document.querySelector('h1') ? document.querySelector('h1').innerText : 'Fiche de Poste';
                
                // Récupérer les sections de la fiche de poste
                const missionDescription = document.querySelector('.mission-description') ? 
                    document.querySelector('.mission-description').innerText : '';
                    
                const missionExpectations = document.querySelector('.mission-expectations') ? 
                    document.querySelector('.mission-expectations').innerHTML : '';
                    
                const profileRequirements = document.querySelector('.profile-requirements') ? 
                    document.querySelector('.profile-requirements').innerHTML : '';
                    
                const rateInfo = document.querySelector('.rate-info') ? 
                    document.querySelector('.rate-info').innerText : '';
                
                // Formater le contenu pour l'email
                let emailBody = `FICHE DE POSTE\n${'='.repeat(50)}\n\n`;
                emailBody += `POSTE : ${posteTitle}\n\n`;
                
                emailBody += `DESCRIPTION DE LA MISSION\n${'-'.repeat(30)}\n${missionDescription}\n\n`;
                
                emailBody += `MISSIONS PRINCIPALES\n${'-'.repeat(30)}\n${missionExpectations.replace(/<[^>]*>/g, '')}\n\n`;
                
                emailBody += `PROFIL RECHERCHÉ\n${'-'.repeat(30)}\n${profileRequirements.replace(/<[^>]*>/g, '')}\n\n`;
                
                emailBody += `RÉMUNÉRATION\n${'-'.repeat(30)}\n${rateInfo}\n\n`;
                
                emailBody += `${'='.repeat(50)}\n`;
                emailBody += `Pour plus d'informations, contactez-nous à l'adresse suivante : contact@fea-example.com\n`;
                emailBody += `Site web : www.fea-example.com`;
                
                // Encoder le corps du mail pour l'URL
                const encodedBody = encodeURIComponent(emailBody);
                const subject = `Candidature - ${posteTitle}`;
                
                // Ouvrir le client mail par défaut avec les informations pré-remplies
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;
            });
        }
    }
    
    // Initialiser le bouton de publication
    setupPublishButton();

    // Bouton retour en haut
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(45deg, #3498db, #2ecc71);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
 
    console.log('Site FEA - Fiches de Poste chargé avec succès !');
});
