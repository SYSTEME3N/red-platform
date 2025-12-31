// /backend/payments/index.js (Firebase Cloud Functions)

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Cette fonction reçoit la confirmation de l'agrégateur (ex: FedaPay ou CinetPay)
exports.webhookPaiement = functions.https.onRequest(async (req, res) => {
    const paiement = req.body; // Données envoyées par l'agrégateur

    // 1. Vérifier si le paiement est réussi
    if (paiement.status === 'approved' || paiement.status === 'ACCEPTED') {
        const userId = paiement.customer_id; // L'ID que tu as envoyé lors du paiement

        // 2. Mettre à jour l'utilisateur dans Firestore
        await admin.firestore().collection('users').doc(userId).update({
            statut: 'client',
            dateAchat: admin.firestore.FieldValue.serverTimestamp(),
            accesFormation: true
        });

        console.log(`Paiement validé pour l'utilisateur : ${userId}`);
        res.status(200).send('Succès');
    } else {
        res.status(400).send('Échec du paiement');
    }
});
