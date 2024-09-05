const kenttaCanvas = document.getElementById('kenttaCanvas'); //Pohjacanvas
const kenttaCtx = kenttaCanvas.getContext('2d');
const piirtoCanvas = document.getElementById('piirtoCanvas'); //pintacanvas
const piirtoCtx = kenttaCanvas.getContext('2d');
const kanuuna1 = document.getElementById("tykki1");
const kanuuna2 = document.getElementById("tykki2");

pelaaja1 = sessionStorage.getItem('p1');
pelaaja2 = sessionStorage.getItem('p2');

function resizeCanvas(){ //cancaksen koko on sama kuin ikkunan koko
    kenttaCanvas.width = window.innerWidth*0.99;
    kenttaCanvas.height = window.innerHeight*0.92; //korkeutta muutettu, syöttökentät mahtuu ruutuun
    piirtoCanvas.width = window.innerWidth*0.99;
    piirtoCanvas.height = window.innerHeight*0.92;
}

// jos ikkunan koko muuttuu päivittyyy myös canvas uutta kokoa vastaavaksi
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Tykki-luokka
class TykinPutki {
    constructor(x, y, angl) { //lisätty ampumasuunta *len*
        this.x = x;
        this.y = y;
        this.angl = angl;
        this.kulma = 60;
        this.ruuti = 20;
    }
    //tykin putken piirto
    draw() {
        kenttaCtx.lineWidth = 10;
        kenttaCtx.beginPath();
        kenttaCtx.moveTo(this.x, this.y);
        const tykin_putkiX = this.x + Math.cos(this.kulma * Math.PI / 180) * this.angl;
        const tykin_putkiY = this.y - Math.sin(this.kulma * Math.PI / 180) * 40;
        kenttaCtx.lineTo(tykin_putkiX, tykin_putkiY);
        kenttaCtx.stroke();
    }
    //uusi kulma säätöä varten
    setAngle(uusiKulma) {
        this.kulma = uusiKulma;
    }
    //uusi ruuti
    setPower(uusiRuuti){
        this.ruuti = uusiRuuti;
    }
}

// Ammus-luokka
class Ammus {
    constructor(x, y, kulma, ruuti) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(kulma * Math.PI / 180) * ruuti;
        this.vy = -Math.sin(kulma * Math.PI / 180) * ruuti;
    }

    update() {
        this.vy += painovoima;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= kitka;
        this.vy *= kitka;
        this.checkCollision();
    }

    draw() {
        ammusCtx.beginPath();
        ammusCtx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ammusCtx.fillStyle = 'black';
        ammusCtx.fill();
    }
}

//Syöttökenttien arvot ja tyhjennys
function tallennaArvot() {
    kulma = document.getElementById('kulma').value;
    ruuti = document.getElementById('ruuti').value;
    document.getElementById('kulma').value = '';
    document.getElementById('ruuti').value = '';
}



function drawTerrain(){

    const kenttaLeveys = kenttaCanvas.width;
    const kenttaKorkeus = kenttaCanvas.height;
    

    //rekvisiitta-aurinko, siirretty, ettei tule vuoren tai pilven päälle
    kenttaCtx.beginPath();
    kenttaCtx.arc(Math.random() * kenttaLeveys ,100,40,0,2*Math.PI);
    kenttaCtx.fillStyle = "yellow";
    kenttaCtx.fill();
    kenttaCtx.stroke();

    drawCloud(Math.random()*(kenttaLeveys-40), 100, 40); //piirrä pilvi parametrien mukaan    

    // koordinaatit
    const pisteet = [
        { x: 0, y: kenttaKorkeus*0.97 }, // aloituspiste
        { x: kenttaLeveys * 0.10, y: kenttaKorkeus*0.97 },//alussa tasainen tila tykille, onko riittävä
        { x: kenttaLeveys * 0.15, y: kenttaKorkeus - Math.random()*400 }, //random korkeudet tässä välissä
        { x: kenttaLeveys * 0.20, y: kenttaKorkeus - Math.random()*400 },// säätää voi vuorenhuippuja miltä tuntuu
        { x: kenttaLeveys * 0.30, y: kenttaKorkeus - Math.random()*500 },
        { x: kenttaLeveys * 0.55, y: kenttaKorkeus - Math.random()*500},
        { x: kenttaLeveys * 0.65, y: kenttaKorkeus - Math.random()*400 },
        { x: kenttaLeveys * 0.75, y: kenttaKorkeus - Math.random()*400 },
        { x: kenttaLeveys * 0.90, y: kenttaKorkeus*0.97 }, //lopussa myös tykille tila
        { x: kenttaLeveys, y: kenttaKorkeus*0.97 } // Lopetuspiste
    ];

    kenttaCtx.beginPath();
    kenttaCtx.moveTo(pisteet[0].x, pisteet[0].y); // aloituspiste

    // viivan piirto pisteestä toiseen
    for (let i = 1; i < pisteet.length; i++) {
        kenttaCtx.lineTo(pisteet[i].x, pisteet[i].y);
    }

    // piirretään maaston alareuna takaisin oikeaan alakulmaan ja alas
    kenttaCtx.lineTo(kenttaLeveys, kenttaKorkeus);
    kenttaCtx.lineTo(0, kenttaKorkeus);
    kenttaCtx.closePath();

    // kentän täyttö, voisiko tässä olla jotain tekstuuriakin jos keksii tai kuvana miten on?
    kenttaCtx.fillStyle = 'green';
    kenttaCtx.fill();
    
    drawCloud(Math.random()*(kenttaLeveys-60), 100, 60); //toinenki pilvi
    
    //eka lavetti ja pelaajanimi
    piirtoCtx.font = "bold 20px Comic sans MS";
    piirtoCtx.fillStyle = 'red';
    piirtoCtx.fillText(pelaaja1, kenttaLeveys*0.01, kenttaKorkeus*0.895);
    tykinPutki1.draw();
    piirtoCtx.drawImage(kanuuna1, kenttaLeveys*0.04, kenttaKorkeus*0.895, 40, 40);
    
    //toka lavetti (peilikuva)
    piirtoCtx.font = "bold 20px Comic sans MS";
    piirtoCtx.fillText(pelaaja2, kenttaLeveys*0.95, kenttaKorkeus*0.895);
    tykinPutki2.draw();
    piirtoCtx.drawImage(kanuuna2, kenttaLeveys*0.93, kenttaKorkeus*0.895, 40, 40);
}

//piirretään pilvi
function drawCloud(x, y, koko) {
    const pilvenvarit = ['white','#8e8e94','#67676b'];

    kenttaCtx.fillStyle = pilvenvarit[Math.floor(Math.random()*pilvenvarit.length)]; // pilven väri, tätä ei oo pakko laittaa kunhan kokeilin miltä näyttää
    kenttaCtx.beginPath();
    
    //pilvet
    kenttaCtx.arc(x, y, koko, Math.PI * 0.5, Math.PI * 1.6);
    kenttaCtx.arc(x + koko, y - koko, koko, Math.PI * 1, Math.PI * 2);
    kenttaCtx.arc(x + koko * 2, y, koko, Math.PI * 1.5, Math.PI * 0.5);
    

    kenttaCtx.closePath();
    kenttaCtx.fill();
}
const tykinPutki1 = new TykinPutki(piirtoCanvas.width*0.05, piirtoCanvas.height*0.95, 60);
const tykinPutki2 = new TykinPutki(piirtoCanvas.width*0.95, piirtoCanvas.height*0.95, -60);

document.addEventListener('DOMContentLoaded', (event) => {
    drawTerrain();  // tee uusi kenttä
});
document.getElementById('paluu').addEventListener('click', () => {
    sessionStorage.clear('p1', 'p2');
    window.location.href = 'index.html';
});
