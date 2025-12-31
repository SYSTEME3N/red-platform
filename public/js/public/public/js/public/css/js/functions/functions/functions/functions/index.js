// Validation ou Rejet d'un retrait (Admin)
exports.traiterRetraitAdmin = functions.https.onCall(async (data, context) => {
    // Vérification du rôle admin
    const adminUser = await db.collection('users').doc(context.auth.uid).get();
    if (adminUser.data().role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Accès interdit.');
    }

    const { retraitId, action, motif } = data;
    const retraitRef = db.collection('retraits').doc(retraitId);

    return db.runTransaction(async (transaction) => {
        const retraitDoc = await transaction.get(retraitRef);
        const userId = retraitDoc.data().userId;
        const montant = retraitDoc.data().montant;

        if (retraitDoc.data().statut !== 'en attente') {
            throw new functions.https.HttpsError('failed-precondition', 'Déjà traité.');
        }

        if (action === 'valider') {
            transaction.update(retraitRef, { 
                statut: 'validé', 
                dateValidation: admin.firestore.FieldValue.serverTimestamp() 
            });
            // Log de l'action admin
            transaction.set(db.collection('admin_logs').doc(), {
                adminId: context.auth.uid,
                action: 'validation_retrait',
                target: userId,
                date: new Date()
            });
        } else {
            // REJET : On rend l'argent à l'utilisateur
            transaction.update(db.collection('users').doc(userId), {
                soldeDisponible: admin.firestore.FieldValue.increment(montant)
            });
            transaction.update(retraitRef, { 
                statut: 'rejeté', 
                motif: motif,
                dateRejet: admin.firestore.FieldValue.serverTimestamp() 
            });
        }
    });
});
