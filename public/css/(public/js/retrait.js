function toggleFields() {
    const method = document.getElementById('method').value;
    const detailsInput = document.getElementById('details');
    
    if (method === "mobile_money") {
        detailsInput.placeholder = "Numéro (ex: +229 ...)";
    } else if (method === "card") {
        detailsInput.placeholder = "Numéro de carte ou RIB";
    } else {
        detailsInput.placeholder = "Adresse de portefeuille USDT (TRC20)";
    }
}

function demanderRetrait() {
    const montant = document.getElementById('amount').value;
    const info = document.getElementById('details').value;

    if (montant < 5000) {
        alert("Le montant minimum est de 5000 FCFA");
        return;
    }

    if (info === "") {
        alert("Veuillez remplir vos coordonnées de retrait");
        return;
    }

    // Plus tard, ici on enverra les données à Firebase
    alert("Demande de " + montant + " FCFA envoyée avec succès !");
}
