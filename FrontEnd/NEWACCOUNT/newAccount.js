function irParaLogin(){
    window.location.href ="/LOGIN/login.html"
}
const login = document.getElementById("login");
login.addEventListener('focus', () => {
    login.classList.remove('vermelho');
    login.placeholder='';
});
const password = document.getElementById("password");
password.addEventListener('focus', () => {
    password.classList.remove('vermelho');
    password.placeholder='';
});
const email = document.getElementById("email");
email.addEventListener('focus', () => {
    email.classList.remove('vermelho');
    email.placeholder='';
});
async function realizaCadastro(){
    login1=String(document.getElementById("login").value);
    email1=String(document.getElementById("email").value);
    password1=String(document.getElementById("password").value);
    let dados;
    await fetch("http://localhost:3000/user/post",{
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "login": login1,
            "password": password1,
            "email":email1
        })
    }).then(response => response.json())
    .then(data => dados=data)
    .catch(error => console.error('Error:', error));
    if(dados==null){
        login.classList.add('vermelho');
        login.value = "";
        login.placeholder = "Something is wrong";
        password.classList.add('vermelho');
        password.value = "";
        password.placeholder = "Something is wrong";
        email.classList.add('vermelho');
        email.value = "";
        email.placeholder = "Something is wrong";
    }else{
        window.location.href="/LOGIN/login.html";
    }
}