// Fonctions de gestion des retraits
function gererRetrait(idDemande, action) {
    if(action === 'valider') {
        alert("Retrait " + idDemande + " validé ! L'argent est déduit du solde.");
        // Logique Firebase : Update statut 'validé'
    } else {
        alert("Retrait " + idDemande + " rejeté.");
        // Logique Firebase : Update statut 'rejeté'
    }
}

// Gestion des utilisateurs
function modifierStatutUser(userId, action) {
    if(action === 'bloquer') {
        alert("Utilisateur " + userId + " bloqué.");
    } else {
        alert("Statut de " + userId + " mis à jour.");
    }
}

// Fonction pour ajouter/retirer manuellement des fonds
function ajusterSolde(userId) {
    const montant = prompt("Entrez le montant à ajouter (positif) ou retirer (négatif) :");
    if(montant) {
        alert("Solde de l'utilisateur mis à jour de : " + montant + " FCFA");
    }
}
