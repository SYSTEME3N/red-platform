// /functions/index.js (Ajout de la partie Retraits)

// Fonction déclenchée quand un utilisateur crée une demande de retrait
exports.creerDemandeRetrait = functions.https.onCall(async (data, context) => {
    // 1. Vérification de l'authentification
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté.');
    }

    const userId = context.auth.uid;
    const montantDemande = parseFloat(data.montant);
    const methodeRetrait = data.methode; // ex: Mobile Money, Crypto
    const infosRetrait = data.infos;    // ex: Numéro de téléphone

    if (montantDemande < 5000) {
        throw new functions.https.HttpsError('invalid-argument', 'Le minimum est de 5000 FCFA.');
    }

    const userRef = db.collection('users').doc(userId);

    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const soldeActuel = userDoc.data().soldeDisponible || 0;

        // 2. VÉRIFICATION DU SOLDE
        if (soldeActuel < montantDemande) {
            throw new functions.https.HttpsError('failed-precondition', 'Solde insuffisant.');
        }

        // 3. BLOCAGE DES DOUBLONS (Vérifier si une demande est déjà en cours)
        const demandesEnCours = await db.collection('retraits')
            .where('userId', '==', userId)
            .where('statut', '==', 'en attente')
            .get();

        if (!demandesEnCours.empty) {
            throw new functions.https.HttpsError('already-exists', 'Vous avez déjà une demande en attente.');
        }

        // 4. CRÉATION DE LA DEMANDE ET MISE À JOUR DU SOLDE
        const nouvelleDemandeRef = db.collection('retraits').doc();
        
        // On déduit l'argent immédiatement du solde disponible (sécurité)
        transaction.update(userRef, {
            soldeDisponible: admin.firestore.FieldValue.increment(-montantDemande)
        });

        transaction.set(nouvelleDemandeRef, {
            userId: userId,
            email: userDoc.data().email,
            montant: montantDemande,
            methode: methodeRetrait,
            infos: infosRetrait,
            statut: 'en attente',
            dateDemande: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, message: "Demande envoyée à l'admin." };
    });
});
