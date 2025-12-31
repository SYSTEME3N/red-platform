// /functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.webhookPaiement = functions.https.onRequest(async (req, res) => {
    const paiement = req.body;
    const paymentId = paiement.id; // L'ID unique de la transaction envoyé par l'agrégateur

    try {
        // --- 1. PROTECTION CONTRE DOUBLE PAIEMENT ---
        const paymentCheck = await db.collection('transactions').doc(paymentId).get();
        if (paymentCheck.exists) {
            return res.status(200).send('Déjà traité');
        }

        if (paiement.status === 'approved' || paiement.status === 'ACCEPTED') {
            const userId = paiement.customer_id;
            const montantPaye = paiement.amount; // Ex: 10 000 FCFA

            // --- 2. CALCUL DE LA COMMISSION (25%) ---
            const montantCommission = montantPaye * 0.25;

            // --- 3. ATTRIBUTION À L'AFFILIÉ ---
            // On cherche qui a parrainé cet utilisateur
            const userDoc = await db.collection('users').doc(userId).get();
            const parrainId = userDoc.data().parrainId;

            const batch = db.batch();

            // Enregistrer la transaction pour éviter le double paiement
            batch.set(db.collection('transactions').doc(paymentId), {
                userId: userId,
                montant: montantPaye,
                date: admin.firestore.FieldValue.serverTimestamp()
            });

            // Activer le compte de l'acheteur
            batch.update(db.collection('users').doc(userId), {
                statut: 'client',
                accesFormation: true
            });

            // Créditer le parrain si il existe
            if (parrainId) {
                const parrainRef = db.collection('users').doc(parrainId);
                batch.update(parrainRef, {
                    commissionsEnAttente: admin.firestore.FieldValue.increment(montantCommission)
                });

                // Créer l'historique de la commission
                const commRef = db.collection('commissions').doc();
                batch.set(commRef, {
                    beneficiaireId: parrainId,
                    filleulId: userId,
                    montant: montantCommission,
                    statut: 'en attente', // Deviendra 'validée' après 24h ou vérification
                    date: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            await batch.commit();
            res.status(200).send('Paiement et Commission traités');
        }
    } catch (error) {
        console.error("Erreur Backend:", error);
        res.status(500).send('Erreur interne');
    }
});
