

const kenttaCanvas = document.getElementById('kenttaCanvas'); //Pohjacanvas
const kenttaCtx = kenttaCanvas.getContext('2d');
const piirtoCanvas = document.getElementById('piirtoCanvas'); //pintacanvas
const piirtoCtx = piirtoCanvas.getContext('2d');
const kanuuna1 = document.getElementById("tykki1");
const kanuuna2 = document.getElementById("tykki2");
const tykkiCanvas = document.getElementById('tykkiCanvas');
const tykkiCtx = tykkiCanvas.getContext('2d');

const painovoima = 0.7;
const kitka = 0.99;// + Math.random()/10;

// maaston koordinaattipisteet
const terrainPoints = [];

let ammukset = [];

function resizeCanvas(){ //cancaksen koko on sama kuin ikkunan koko
    kenttaCanvas.width = window.innerWidth;
    kenttaCanvas.height = window.innerHeight*0.92; //korkeutta muutettu, syöttökentät mahtuu ruutuun
    piirtoCanvas.width = window.innerWidth;
    piirtoCanvas.height = window.innerHeight*0.92;
    tykkiCanvas.height = window.innerHeight*0.92;
    tykkiCanvas.width = window.innerWidth;
}

// jos ikkunan koko muuttuu päivittyyy myös canvas uutta kokoa vastaavaksi
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.getElementById('kulma').focus();

// Tykki-luokka
class TykinPutki {
    constructor(x, y, angl) { //lisätty putkensuunta *angl*
        this.x = x;
        this.y = y;
        this.angl = angl;
        this.kulma = 45;
        this.ruuti = 0;
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

const tykinPutki1 = new TykinPutki(tykkiCanvas.width*0.05, tykkiCanvas.height*0.97, 60);
const tykinPutki2 = new TykinPutki(tykkiCanvas.width*0.945, tykkiCanvas.height*0.97, -60);

const pelaajat = {
     pelaaja1 : {
        'nimi': sessionStorage.getItem('p1'),
        'lavetti': [piirtoCanvas.width*0.04, piirtoCanvas.height*0.91],
        'putki': tykinPutki1
    },
    pelaaja2 : {
        'nimi': sessionStorage.getItem('p2'),
        'lavetti': [piirtoCanvas.width*0.92, piirtoCanvas.height*0.91],
        'putki': tykinPutki2
    }
}
let pelaajaNyt = pelaajat.pelaaja1;
tykkiCtx.font = "bold 20px Comic sans MS";
tykkiCtx.fillStyle = 'yellow';
tykkiCtx.fillText(pelaajaNyt.nimi+'n vuoro', tykkiCanvas.width*0.45, tykkiCanvas.height*0.95);

// Vuoronvaihtofunktio
function vuoronVaihto() {    
    pelaajaNyt = pelaajaNyt === pelaajat.pelaaja1 ? pelaajat.pelaaja2 : pelaajat.pelaaja1;
    console.log(pelaajaNyt.nimi + "n vuoro.");

    //pelaaja vuoro ruudulla
    tykkiCtx.clearRect(tykkiCanvas.width*0.40, tykkiCanvas.height*0.9, 200, 400)
    tykkiCtx.font = "bold 20px Comic sans MS";
    tykkiCtx.fillStyle = 'yellow';
    tykkiCtx.fillText(pelaajaNyt.nimi+'n vuoro', tykkiCanvas.width*0.45, tykkiCanvas.height*0.95);
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
        if (pelaajaNyt === pelaajat.pelaaja2) {
            this.x += this.vx;
        } else {
            this.x += -this.vx;
        }
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
    
            // Tee reikä maastoon 
            kenttaCtx.globalCompositeOperation = 'destination-out';
            kenttaCtx.beginPath();
            kenttaCtx.arc(this.x, terrainHeight, craterRadius, 0, Math.PI * 2);
            kenttaCtx.fill();
            kenttaCtx.globalCompositeOperation = 'source-over';
    
            //  räjähdyskuva
            const rajahdyskuva = new Image();
            rajahdyskuva.src = '../blast.gif'; 
            rajahdyskuva.onload = () => {
                // räjähdyskuva
                
                tykkiCtx.drawImage(rajahdyskuva, this.x - 40, terrainHeight - 40, 100, 100);
    
                
                setTimeout(() => {
                    tykkiCtx.clearRect(this.x - 40, terrainHeight - 40, 100, 100);
                }, 2000);
            };
    
            // Tarkista osuma toiseen tykkiin
            this.checkCollision_Tykki(pelaajat.pelaaja1.lavetti,pelaajat.pelaaja1.nimi);
            this.checkCollision_Tykki(pelaajat.pelaaja2.lavetti,pelaajat.pelaaja2.nimi);
    
            return true;
        }
        return false;
    }
    checkCollision_Tykki(tykin_sijainti, pelaaja) { //Törmys toiseen tykkiin
        const tykkiX = tykin_sijainti[0];
        const tykkiY = tykin_sijainti[1];
        const tykkiWidth = 100;  // Tykin leveys
        const tykkiHeight = 100; // Tykin korkeus
    
        // Tarkistetaan, osuuko ammus tykkiin 
        if (this.x > tykkiX && this.x < tykkiX + tykkiWidth &&
            this.y > tykkiY && this.y < tykkiY + tykkiHeight) {
            
            tykkiCtx.fillStyle = "red"; //ilmoitus ko. asiasta
            tykkiCtx.fillText(pelaaja + "n tykkiin osui!",tykkiCanvas.width*0.45 ,tykkiCanvas.height *0.3);

            setTimeout(()=>{

            tykkiCtx.clearRect(tykkiCanvas.width*0.45 ,tykkiCanvas.height *0.25,200,100)  ;

            },2000);

            
            
            //
            tykkiCtx.clearRect(tykkiX, tykkiY, tykkiWidth, tykkiHeight);
            //Tähän se romutettu tykki?
        
        }
    }
}

//Syöttökenttien arvot ja tyhjennys
function tallennaArvot() {
    document.getElementById('kulma').focus();
    kulma = document.getElementById('kulma').value;
    ruuti = document.getElementById('ruuti').value;
    document.getElementById('kulma').value = '';
    document.getElementById('ruuti').value = '';
    if (pelaajaNyt === pelaajat.pelaaja1) {
        tykinPutki1.setAngle(kulma);    
        piirtoCtx.clearRect(0,0,kenttaCanvas.width,kenttaCanvas.height);
        tykinPutki1.draw();
    } else {
        tykinPutki2.setAngle(kulma);
        piirtoCtx.clearRect(0,0,kenttaCanvas.width,kenttaCanvas.height);
        tykinPutki2.draw();
    }
    
}

document.addEventListener('keydown', function(event) {
    
    if (event.key === 'Enter') {
        if (pelaajaNyt === pelaajat.pelaaja1) {
            const ammus = new Ammus(tykinPutki1.x, tykinPutki1.y - 10, kulma || tykinPutki1.kulma, ruuti || tykinPutki1.ruuti);
            ammukset.push(ammus);
            vuoronVaihto();
        

        } else if (pelaajaNyt === pelaajat.pelaaja2) {
            const ammus = new Ammus(tykinPutki2.x, tykinPutki2.y - 10, kulma || tykinPutki2.kulma, ruuti || tykinPutki2.ruuti);
            ammukset.push(ammus); 
            vuoronVaihto();       
        }
    }
});



function drawTerrain(){
    
    //rekvisiitta-aurinko, siirretty, ettei tule vuoren tai pilven päälle
    kenttaCtx.beginPath();
    kenttaCtx.arc(Math.random() * kenttaCanvas.width ,100,40,0,2*Math.PI);
    kenttaCtx.fillStyle = "yellow";
    kenttaCtx.fill();
    kenttaCtx.stroke();

    drawCloud(Math.random()*(kenttaCanvas.width-40), 100, 40); //piirrä pilvi parametrien mukaan    

    // koordinaatit
    const pisteet = [
        { x: 0, y: kenttaCanvas.height*0.96 }, // aloituspiste
        { x: kenttaCanvas.width * 0.10, y: kenttaCanvas.height*0.96 },//alussa tasainen tila tykille, onko riittävä
        { x: kenttaCanvas.width * 0.15, y: kenttaCanvas.height - Math.random()*400 }, //random korkeudet tässä välissä
        { x: kenttaCanvas.width * 0.20, y: kenttaCanvas.height - Math.random()*400 },// säätää voi vuorenhuippuja miltä tuntuu
        { x: kenttaCanvas.width * 0.30, y: kenttaCanvas.height - Math.random()*500 },
        { x: kenttaCanvas.width * 0.55, y: kenttaCanvas.height - Math.random()*500},
        { x: kenttaCanvas.width * 0.65, y: kenttaCanvas.height - Math.random()*400 },
        { x: kenttaCanvas.width * 0.75, y: kenttaCanvas.height - Math.random()*400 },
        { x: kenttaCanvas.width * 0.90, y: kenttaCanvas.height*0.96 }, //lopussa myös tykille tila
        { x: kenttaCanvas.width, y: kenttaCanvas.height*0.96 } // Lopetuspiste
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
    kenttaCtx.lineTo(kenttaCanvas.width, kenttaCanvas.height);
    kenttaCtx.lineTo(0, kenttaCanvas.height);
    kenttaCtx.closePath();

    // kentän täyttö
    kenttaCtx.fillStyle = 'green';
    kenttaCtx.fill();
    
    drawCloud(Math.random()*(kenttaCanvas.width-60), 100, 60); //toinenki pilvi
    
    //eka lavetti ja pelaajanimi
    tykkiCtx.font = "bold 20px Comic sans MS";
    tykkiCtx.fillStyle = 'red';
    tykkiCtx.fillText(pelaajat.pelaaja1.nimi, kenttaCanvas.width*0.01, kenttaCanvas.height*0.895);
    tykinPutki1.draw();
    tykkiCtx.drawImage(kanuuna1, pelaajat.pelaaja1.lavetti[0], pelaajat.pelaaja1.lavetti[1], 40, 40);
    
    //toka lavetti (peilikuva)
    tykkiCtx.font = "bold 20px Comic sans MS";
    tykkiCtx.fillText(pelaajat.pelaaja2['nimi'], kenttaCanvas.width*0.95, kenttaCanvas.height*0.895);
    tykinPutki2.draw();
    tykkiCtx.drawImage(kanuuna2, pelaajat.pelaaja2.lavetti[0], pelaajat.pelaaja2.lavetti[1], 40, 40);

    

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

window.addEventListener('DOMContentLoaded', () => {
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

