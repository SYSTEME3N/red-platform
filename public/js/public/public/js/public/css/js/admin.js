// --- LOGIQUE ADMIN RED ---

// 1. Sécurité : Vérifier si l'utilisateur est Admin
function verifierStatutAdmin(user) {
    db.collection("users").doc(user.uid).get().then((doc) => {
        if (doc.exists && doc.data().role === "admin") {
            console.log("Accès autorisé : Bienvenue Admin");
            chargerDonneesGlobales();
        } else {
            alert("Accès refusé. Redirection...");
            window.location.href = "dashboard.html";
        }
    });
}

// 2. Fonction pour Valider ou Rejeter un retrait
function traiterDemandeRetrait(idRetrait, action) {
    const statut = action === 'valider' ? 'Validé' : 'Rejeté';
    db.collection("retraits").doc(idRetrait).update({
        statut: statut,
        dateTraitement: new Date()
    }).then(() => {
        alert("Retrait " + statut);
        location.reload(); // Actualise la liste
    });
}

// 3. Fonction pour Bloquer/Débloquer un utilisateur
function modifierAccesUtilisateur(userId, bloquer) {
    db.collection("users").doc(userId).update({
        estBloque: bloquer
    }).then(() => {
        alert(bloquer ? "Utilisateur bloqué" : "Utilisateur débloqué");
    });
}

// 4. Ajouter ou Retirer des fonds manuellement
function ajusterSoldeManuel(userId, montant) {
    // montant peut être positif (ajout) ou négatif (retrait)
    const userRef = db.collection("users").doc(userId);
    userRef.update({
        solde: firebase.firestore.FieldValue.increment(montant)
    }).then(() => {
        alert("Solde mis à jour avec succès");
    });
}
