async function getUsers() {
    let dados;
    await fetch("http://localhost:3000/user/getAll", {
        method: "GET"
    }).then(response => response.json())
        .then(data => dados = data)
        .catch(error => console.error('Error:', error));
    console.log(dados)
    dados.forEach(element => {
        document.getElementById("info").innerHTML += "User:&emsp;" + element.login + "&emsp; &emsp; Email:&emsp; " + element.email + "<br>"
    });
}
async function getMovies() {
    let dados;
    await fetch("http://localhost:3000/movie/getAll", {
        method: "GET"
    })
        .then(response => response.json())
        .then(data => dados = data)
        .catch(error => console.log('Error:', error));
    console.log(dados);
    if (dados.length != 0) {
        await dados.map(async dado => {
            let soma = 0;
            let i = 0;
            dado.evaluations.map(eval => {
                i++;
                soma += eval.stars;
            });
            let nota = 0;
            if (i != 0) {
                nota = soma / i;
            }
            nota = parseInt(nota);
            var div = document.createElement("div");
            div.classList.add("div");
            let stars = '';
            for (let j = 0; j < 5; j++) {
                if (j < nota) {
                    stars += '★';
                } else {
                    stars += '☆';
                }
            }
            div.innerHTML = `
                <img class="imagem" src="${dado.img}">
                <div class="infoFilme">
                    <h2>${dado.name}</h2>
                    <p>${dado.synopsis}</p>
                </div>
                <div class="mediaEval">
                    <span class="nota">${nota}/5</span>
                    <div class="stars">${stars}</div>
                </div>`;
            //div.onclick=await movie(dado.name);
            document.getElementById("info").appendChild(div);
        });
    }
}
async function setSettings() {
    const container = document.getElementById('info');
    container.innerHTML = `<div>
            <label for="oldPassword">Password:</label>
            <input type="text" id="oldPassword" name="oldPassword" autocomplete="off" required>
        </div>
    
        <div>
            <label for="newlogin">New Login:</label>
            <input type="text" id="newlogin" name="newlogin" autocomplete="off" required><br>
            <button class="buttons" id="updateLogin" onclick="settings('login')">Change Login</button>
        </div>
    
        <div>
            <label for="newpassword">New Password:</label>
            <input type="text" id="newpassword" name="newpassword" autocomplete="off" required><br>
            <button class="buttons" id="updatePassword" onclick="settings('password')">Change Password</button>
        </div>`;
}
async function settings(teste) {
    const passwordInput = document.getElementById("oldPassword");
    passwordInput.addEventListener('focus', () => {
    passwordInput.classList.remove('vermelho');
    passwordInput.placeholder = '';
    });
    let dados;
    const login = localStorage.getItem("login");
    const oldPasswordValue = document.getElementById("oldPassword").value;
    const newLorP = document.getElementById("new" + teste).value;

    try {
        const response = await fetch(`http://localhost:3000/user/get/${login}&${oldPasswordValue}`, {
            method: "GET"
        });
        dados = await response.json();
        if (dados) {
            const updateResponse = await fetch(`http://localhost:3000/user/put/${login}&${oldPasswordValue}&${teste}&${newLorP}`, {
                method: "PUT"
            });
            const updateData = await updateResponse.json();
            if (updateData && teste === "login") {
                localStorage.setItem("login", newLorP);
            }
            passwordInput.value = ""; 

        } else {
            passwordInput.classList.add('vermelho');
            passwordInput.value = "";
            passwordInput.placeholder = "Wrong pass";
        }

    } catch (error) {
        console.error('Error:', error);
        passwordInput.classList.add('vermelho');
        passwordInput.value = "";
        passwordInput.placeholder = "Wrong pass";
    }
}
/* async function myEvals(name) {
    const password=localStorage.getItem("password")
    const response = await fetch(`http://localhost:3000/evaluation/getAll`, {
        method: "GET"
    });
    dados = await response.json();

} */
async function movie() {

}
async function evaluate() {

}
function change(change) {
    switch (change) {
        case "settings":
            document.getElementById("h1").innerHTML = "Settings"
            document.getElementById("info").innerHTML = ""
            setSettings()
            break;
        case "comunity":
            document.getElementById("h1").innerHTML = "Comunity"
            document.getElementById("info").innerHTML = ""
            getUsers()
            break;
        case "ranking":
            document.getElementById("h1").innerHTML = "Movie Ranking"
            document.getElementById("info").innerHTML = ""
            getMovies()
            break;
        case "evals":
            document.getElementById("h1").innerHTML = "My Evaluations"
            document.getElementById("info").innerHTML = ""
            break;
        case "logout":
            window.location.href = "/LOGIN/login.html"
            break;
        default:
            break;
    }
}