const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios'); // Pour appeler l'API KKiaPay
admin.initializeApp();

const KKIA_SECRET_KEY = "sk_ae9947c5d9e2d793c2778e134f115e397de8da4097176a012fd0b9550d06895d";

exports.webhookKkiapay = functions.https.onRequest(async (req, res) => {
    // KKiaPay envoie l'ID de transaction dans le corps de la requête
    const { transactionId } = req.body;

    try {
        // 1. VÉRIFICATION SÉCURISÉE auprès de KKiaPay
        const response = await axios.post('https://api.kkiapay.me/api/v0/verify/transaction', 
            { transactionId: transactionId },
            { headers: { 'x-api-key': KKIA_SECRET_KEY } }
        );

        const data = response.data;

        if (data.status === 'SUCCESS') {
            const userId = data.externalId; // L'ID utilisateur qu'on aura passé au widget
            const montant = data.amount;

            // 2. MISE À JOUR FIREBASE (Activation + Commission 25%)
            const userRef = admin.firestore().collection('users').doc(userId);
            const userDoc = await userRef.get();
            const parrainId = userDoc.data().parrainId;

            const batch = admin.firestore().batch();

            // Activer le compte client
            batch.update(userRef, { statut: 'client', accesFormation: true });

            // Si parrain, donner 25% de commission
            if (parrainId) {
                const commission = montant * 0.25;
                const parrainRef = admin.firestore().collection('users').doc(parrainId);
                batch.update(parrainRef, { 
                    soldeDisponible: admin.firestore.FieldValue.increment(commission) 
                });
            }

            await batch.commit();
            return res.status(200).send("Paiement validé avec succès");
        }

        res.status(400).send("Échec de vérification");

    } catch (error) {
        console.error("Erreur Webhook:", error);
        res.status(500).send("Erreur interne");
    }
});
