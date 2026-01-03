<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

<script>
const firebaseConfig = {
  apiKey: "AIzaSyAXdPQBTqDHNoskOyx7xJFiIzvDrf1iZfM",
  authDomain: "red-digital-eab79.firebaseapp.com",
  databaseURL: "https://red-digital-eab79-default-rtdb.firebaseio.com/",
  projectId: "red-digital-eab79",
  storageBucket: "red-digital-eab79.appspot.com",
  messagingSenderId: "548545414230",
  appId: "1:548545414230:web:07586c989b972c623227f7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function submitForm() {
  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const email = document.getElementById("email").value;
  const tel = document.getElementById("tel").value;
  const parrain = document.getElementById("parrain").value;

  if (!nom || !prenom || !email || !tel) {
    alert("Tous les champs sont obligatoires");
    return;
  }

  db.ref("inscriptions").push({
    nom,
    prenom,
    email,
    telephone: tel,
    parrain,
    date: new Date().toLocaleString()
  });

  document.getElementById("result").style.display = "block";
}
</script>
