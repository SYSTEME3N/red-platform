// Fonction pour générer le lien
function genererAffiliation(userId) {
    const lien = "https://red-platform.web.app/?ref=" + userId;
    document.getElementById('aff-link').value = lien;
    
    // On vérifie le statut dans Firestore
    const userDoc = doc(db, "users", userId);
    onSnapshot(userDoc, (doc) => {
        const data = doc.data();
        const badge = document.getElementById('status-badge');
        badge.textContent = data.statut === "client" ? "ACTIF" : "INACTIF";
        badge.style.backgroundColor = data.statut === "client" ? "#27ae60" : "#e74c3c";
    });
}

function copierLien() {
    const copyText = document.getElementById("aff-link");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Lien copié !");
}
