// Ta configuration Firebase spécifique
const firebaseConfig = {
    apiKey: "AIzaSyAXdPQBTqDHNoskOyx7xJFiIzvDrf1iZfM",
    authDomain: "red-digital-eab79.firebaseapp.com",
    databaseURL: "https://red-digital-eab79-default-rtdb.firebaseio.com",
    projectId: "red-digital-eab79",
    storageBucket: "red-digital-eab79.firebasestorage.app",
    messagingSenderId: "548545414230",
    appId: "1:548545414230:web:07586c989b972c623227f7"
};

// Initialisation
firebase.initializeApp(firebaseConfig);
const rdb = firebase.database();
let allUsers = [];

// Badge de vérification
const FB_ICON = `<span class="fb-verify">✔</span>`;

// Charger les données
rdb.ref('users').on('value', (snapshot) => {
    allUsers = [];
    snapshot.forEach(child => {
        allUsers.push({ id: child.key, ...child.val() });
    });
});

function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById('view-' + id).classList.add('active-view');
}

function toggleAuthMode() {
    const isLogin = document.getElementById('auth-title').innerText === 'Connexion';
    document.getElementById('auth-title').innerText = isLogin ? 'Inscription' : 'Connexion';
    document.getElementById('reg-fields').style.display = isLogin ? 'block' : 'none';
    document.getElementById('auth-toggle').innerText = isLogin ? 'Déjà inscrit ? Connexion' : 'Pas de compte ? S\'inscrire';
}

function handleAuth() {
    const email = document.getElementById('f-email').value.trim();
    const pass = document.getElementById('f-pass').value.trim();
    const mode = document.getElementById('auth-title').innerText;

    if(!email || !pass) return alert("Champs vides !");

    if(mode === 'Connexion') {
        const user = allUsers.find(u => u.email === email && u.pass === pass);
        if(user) loginUser(user);
        else alert("Identifiants incorrects.");
    } else {
        const name = document.getElementById('f-name').value.trim();
        const ref = document.getElementById('f-ref').value.trim();
        if(!name || !ref) return alert("Complétez l'inscription !");

        const myCode = "RED-" + Math.floor(1000 + Math.random() * 9000);
        
        rdb.ref('users').push({
            name, email, pass, refCode: ref, myCode, balance: 0
        }).then(() => {
            alert("Compte créé !");
            location.reload();
        });
    }
}

function loginUser(user) {
    document.getElementById('u-name-display').innerHTML = user.name + FB_ICON;
    document.getElementById('u-balance').innerText = user.balance + " FCFA";
    document.getElementById('u-mycode-badge').innerText = "Mon Code: " + user.myCode;
    showView('user');
}

function logout() { location.reload(); }
