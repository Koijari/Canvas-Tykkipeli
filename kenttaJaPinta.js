const kenttaCanvas = document.getElementById('kenttaCanvas'); //Pohjacanvas
const kenttaCtx = kenttaCanvas.getContext('2d');
const piirtoCanvas = document.getElementById('piirtoCanvas'); //pintacanvas
const piirtoCtx = piirtoCanvas.getContext('2d');
const kanuuna1 = document.getElementById("tykki1");
const kanuuna2 = document.getElementById("tykki2");
const tykkiCanvas = document.getElementById('tykkiCanvas');
const tykkiCtx = tykkiCanvas.getContext('2d');

pelaaja1 = sessionStorage.getItem('p1');
pelaaja2 = sessionStorage.getItem('p2');

const painovoima = 0.7;
const kitka = 0.99;

// maaston koordinaattipisteet
const terrainPoints = [];

let ammukset = [];

function resizeCanvas(){ //cancaksen koko on sama kuin ikkunan koko
    kenttaCanvas.width = window.innerWidth*0.99;
    kenttaCanvas.height = window.innerHeight*0.92; //korkeutta muutettu, syöttökentät mahtuu ruutuun
    piirtoCanvas.width = window.innerWidth*0.99;
    piirtoCanvas.height = window.innerHeight*0.92;
    tykkiCanvas.height = window.innerHeight*0.92;
    tykkiCanvas.width = window.innerWidth*0.99;
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
        piirtoCtx.lineWidth = 10;
        piirtoCtx.beginPath();
        piirtoCtx.moveTo(this.x, this.y);
        const tykin_putkiX = this.x + Math.cos(this.kulma * Math.PI / 180) * this.angl;
        const tykin_putkiY = this.y - Math.sin(this.kulma * Math.PI / 180) * 40;
        piirtoCtx.lineTo(tykin_putkiX, tykin_putkiY);
        piirtoCtx.stroke();
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
        piirtoCtx.beginPath();
        piirtoCtx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        piirtoCtx.fillStyle = 'black';
        piirtoCtx.fill();
    }
    checkCollision() {
        const terrainHeight = getTerrainHeightAt(this.x); // Haetaan maaston korkeus tässä x-koordinaatissa
        if (this.y > terrainHeight) { // Tarkistetaan osuma maastoon
            const craterRadius = 25; // Kolon säde
            kenttaCtx.globalCompositeOperation = 'destination-out';
            kenttaCtx.beginPath();
            kenttaCtx.arc(this.x, terrainHeight, craterRadius, 0, Math.PI * 2);
            //kenttaCtx.fillRect(this.x,terrainHeight,Math.random()*50,Math.random()*50);

            kenttaCtx.arc(this.x, terrainHeight, craterRadius, 0, Math.PI * 2);
            kenttaCtx.arc(this.x, terrainHeight, Math.random()*50, 0, Math.PI * 2);
            kenttaCtx.fill();
            kenttaCtx.globalCompositeOperation = 'source-over';

            return true;
        }
        return false;
    }

}





//Syöttökenttien arvot ja tyhjennys
function tallennaArvot() {
    kulma = document.getElementById('kulma').value;
    ruuti = document.getElementById('ruuti').value;
    document.getElementById('kulma').value = '';
    document.getElementById('ruuti').value = '';
    tykinPutki1.setAngle(kulma);
    
    piirtoCtx.clearRect(0,0,kenttaCanvas.width,kenttaCanvas.height);
    tykinPutki1.draw();
}







document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        
        const ammus = new Ammus(tykinPutki1.x, tykinPutki1.y - 10, kulma || tykinPutki1.kulma, ruuti || tykinPutki1.ruuti);
        ammukset.push(ammus);
        
    }
});


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

    for (let i = 1; i < pisteet.length; i++) {
        kenttaCtx.lineTo(pisteet[i].x, pisteet[i].y);
        terrainPoints.push(pisteet[i]); // maaston pisteet tallennetaan
    }




    // viivan piirto pisteestä toiseen
    for (let i = 1; i < pisteet.length; i++) {
        kenttaCtx.lineTo(pisteet[i].x, pisteet[i].y);
    }

    // piirretään maaston alareuna takaisin oikeaan alakulmaan ja alas
    kenttaCtx.lineTo(kenttaLeveys, kenttaKorkeus);
    kenttaCtx.lineTo(0, kenttaKorkeus);
    kenttaCtx.closePath();

    // kentän täyttö
    kenttaCtx.fillStyle = 'green';
    kenttaCtx.fill();
    
    drawCloud(Math.random()*(kenttaLeveys-60), 100, 60); //toinenki pilvi
    
    //eka lavetti ja pelaajanimi
    tykkiCtx.font = "bold 20px Comic sans MS";
    tykkiCtx.fillStyle = 'red';
    tykkiCtx.fillText(pelaaja1, kenttaLeveys*0.01, kenttaKorkeus*0.895);
    tykinPutki1.draw();
    tykkiCtx.drawImage(kanuuna1, kenttaLeveys*0.04, kenttaKorkeus*0.925, 40, 40);
    
    //toka lavetti (peilikuva)
    tykkiCtx.font = "bold 20px Comic sans MS";
    tykkiCtx.fillText(pelaaja2, kenttaLeveys*0.95, kenttaKorkeus*0.895);
    tykinPutki2.draw();
    tykkiCtx.drawImage(kanuuna2, kenttaLeveys*0.94, kenttaKorkeus*0.925, 40, 40);
}

function getTerrainHeightAt(x) {
    for (let i = 0; i < terrainPoints.length - 1; i++) {
        if (x >= terrainPoints[i].x && x <= terrainPoints[i + 1].x) {
            // Interpoloi korkeus pisteiden välillä
            const dx = terrainPoints[i + 1].x - terrainPoints[i].x;
            const dy = terrainPoints[i + 1].y - terrainPoints[i].y;
            const ratio = (x - terrainPoints[i].x) / dx;
            return terrainPoints[i].y + ratio * dy;
        }
    }
    return piirtoCanvas.height; // Oletuskorkeus, jos x-koordinaatti on kentän ulkopuolella
}












//piirretään pilvi
function drawCloud(x, y, koko) {
    const pilvenvarit = ['white','#8e8e94','#67676b'];

    kenttaCtx.fillStyle = pilvenvarit[Math.floor(Math.random()*pilvenvarit.length)]; // pilven väri
    kenttaCtx.beginPath();
    
    //pilvet
    kenttaCtx.arc(x, y, koko, Math.PI * 0.5, Math.PI * 1.6);
    kenttaCtx.arc(x + koko, y - koko, koko, Math.PI * 1, Math.PI * 2);
    kenttaCtx.arc(x + koko * 2, y, koko, Math.PI * 1.5, Math.PI * 0.5);
    

    kenttaCtx.closePath();
    kenttaCtx.fill();
}
const tykinPutki1 = new TykinPutki(tykkiCanvas.width*0.05, tykkiCanvas.height*0.95, 60);
const tykinPutki2 = new TykinPutki(tykkiCanvas.width*0.95, tykkiCanvas.height*0.95, -60);

document.addEventListener('DOMContentLoaded', (event) => {
    drawTerrain();  // tee uusi kenttä
});


// loop
function gameLoop() {
    piirtoCtx.clearRect(0, 0, piirtoCanvas.width, piirtoCanvas.height);
    
    // Piirretään tykin putket
    tykinPutki1.draw();
    tykinPutki2.draw();

    // Päivitetään ja piirretään ammukset
    ammukset.forEach((ammus, index) => {
        ammus.update();
        ammus.draw();

        if (ammus.checkCollision()) {
            ammukset.splice(index, 1);
            tykinPutki1.setAngle(45);
        }
    });

    requestAnimationFrame(gameLoop);
}



document.getElementById('paluu').addEventListener('click', () => {
    sessionStorage.clear('p1', 'p2');
    window.location.href = 'index.html';
});





gameLoop();
