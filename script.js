window.onload = function () {
    const userEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");

    if (userEmail && storedName) {
        document.getElementById("butonSecret").style.display = "inline-block";
        document.getElementById("butonLogout").style.display = "inline-block";
        document.getElementById("googleSignIn").style.display = "none";
        document.getElementById("numeUser").textContent = "Salut, " + storedName + "!";
    } else {
        document.getElementById("butonSecret").style.display = "none";
        document.getElementById("butonLogout").style.display = "none";
        document.getElementById("googleSignIn").style.display = "block";
        document.getElementById("numeUser").textContent = "Loghează-te cu contul tău Google ca să accesezi zona de administrare.";
    }
};

function handleCredentialResponse(response) {
    const token = response.credential;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email;

    alert("Bine ai venit, " + payload.name + "!");

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", payload.name);

    document.getElementById("butonSecret").style.display = "inline-block";
    document.getElementById("butonLogout").style.display = "inline-block";
    document.getElementById("googleSignIn").style.display = "none";
    document.getElementById("numeUser").textContent = "Salut, " + payload.name + "!";
}

document.getElementById("butonLogout").addEventListener("click", function () {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    document.getElementById("butonSecret").style.display = "none";
    document.getElementById("butonLogout").style.display = "none";
    document.getElementById("googleSignIn").style.display = "block";
    document.getElementById("numeUser").textContent = "Loghează-te cu contul tău Google ca să accesezi zona de administrare.";
});
