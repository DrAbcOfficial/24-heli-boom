let started = false;
bigda.addEventListener('click',()=>{
    let bigda = document.getElementById("bigda");
    let music = document.getElementById("musicda");
    music.play();
    bigda.remove();
    let background = document.getElementById("background");
    background.style.visibility = "visible";
    started = true;
});
let moveflag = false;
let counter=0;
let tracelaoda = (e)=>{
    if(moveflag || !started){
        return;
    }
    let nCon=document.createElement("div");
    nCon.className="conlaoda";
    nCon.style.left=e.pageX+"px";
    nCon.style.top=e.pageY+"px";
    let nDiv=document.createElement('img');
    nDiv.className="moulaoda";
    nDiv.src="./img/laoda.png";
    nDiv.style="filter: drop-shadow(hsl("+(20*counter)+"deg,100%,70%,80%) 200px 0);";
    nCon.appendChild(nDiv);
    document.body.appendChild(nCon);
    moveflag=true;
    counter++;
    counter%=18;
    setTimeout(()=>{nCon.remove();}, 3000);
    setTimeout(()=>{moveflag=false;},100);
};
document.addEventListener("touchmove",(e)=>{
    e[0].preventDefault()
    tracelaoda(e.touches[0]);
})
document.addEventListener("mousemove",(e)=>{
    e.preventDefault()
    tracelaoda(e);
});
document.addEventListener("click",(e)=>{
    if(!started){
        return;
    }
    let nDiv=document.createElement('img');
    nDiv.style="filter:hue-rotate("+(20*counter)+"deg);"
    nDiv.style.left=e.pageX+"px";
    nDiv.className="falllaoda";
    nDiv.src="img/laoda.png";
    document.body.appendChild(nDiv);
    setTimeout(()=>{nDiv.remove();}, 5000);

    let man = new Audio('./audio/man.mp3');
    man.volume = 0.5;
    man.play();
});