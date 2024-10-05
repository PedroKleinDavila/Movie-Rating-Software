const apiKey = "AIzaSyBjiwtprEpxkJanJzhuvp-bMg5s8d48drQ";
const searchEngineId = "c10191141f4c2496c";
function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}
async function search(query) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${searchEngineId}&searchType=image&imgSize=large`;

    try {
        await sleep(500);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error("Erro ao buscar:", error);
    }
}
async function criaFilme(){
    const name=String(document.getElementById("name").value);
    const synopsis=String(document.getElementById("synopsis").value);
    let dados;
    await fetch("http://localhost:3000/movie/post",{
        method:"POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "name":name,
            "synopsis":synopsis
        })
    }).then(response => response.json())
    .then(data => dados=data)
    .catch(error => console.error('Error:', error));
    if(dados==null){
        console.log("nao deu")
    }else{
        await addPng(name);
    }
}
async function addPng(name) {
    let dados;
    let img=await search(name+" poster").then(results => {
        return results[0].link
    });
    await fetch(`http://localhost:3000/movie/patch`,{
        method:"PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "name":name,
            "img":img
        })
    }).then(response => response.json())
    .then(data => dados=data)
    .catch(error => console.error('Error:', error));
    if(dados==null){
        console.log("erro na img")
    }
}
function irParaLogin(){
    window.location.href ="/LOGIN/login.html"
}