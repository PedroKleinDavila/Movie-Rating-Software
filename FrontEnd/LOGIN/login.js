function irParaCadastro(){
    window.location.href ="/NEWACCOUNT/newAccount.html"
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
async function realizaLogin(){
    login1=String(document.getElementById("login").value);
    password1=String(document.getElementById("password").value);
    let dados;
    await fetch(`http://localhost:3000/user/get/${login1}&${password1}`,{
        method:"GET"
    }).then(response => response.json())
    .then(data => dados=data)
    .catch(error => console.error('Error:', error));
    if(dados!=null){
        localStorage.setItem("login",dados.login)
        localStorage.setItem("password",dados.password)
        window.location.href="/USER/user.html";
    }else{
        password.classList.add('vermelho');
        password.value = "";
        password.placeholder= "Something is wrong";
        login.classList.add('vermelho');
        login.value = "";
        login.placeholder= "Something is wrong";
    }
}