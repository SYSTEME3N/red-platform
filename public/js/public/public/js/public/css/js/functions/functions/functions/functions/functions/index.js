// Middleware de vérification de rôle
async function estAdmin(uid) {
    const user = await db.collection('users').doc(uid).get();
    return user.exists && user.data().role === 'admin';
}

// Sécurité : Blocage de compte suspect
exports.bloquerCompteSuspect = functions.https.onCall(async (data, context) => {
    if (!(await estAdmin(context.auth.uid))) {
        throw new functions.https.HttpsError('permission-denied', 'Action non autorisée.');
    }

    const { targetUserId, raison } = data;
    
    await db.collection('users').doc(targetUserId).update({
        statut: 'bloqué',
        motifBlocage: raison
    });

    // Enregistrement dans les logs de sécurité
    await db.collection('security_logs').doc().set({
        type: 'BLOCAGE_COMPTE',
        userId: targetUserId,
        adminId: context.auth.uid,
        raison: raison,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
});
