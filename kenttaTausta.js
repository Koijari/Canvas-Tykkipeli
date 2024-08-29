const kenttaCanvas = document.getElementById('kenttaCanvas'); //canvas
const kenttaCtx = kenttaCanvas.getContext('2d');


function resizeCanvas(){ //cancaksen koko on sama kuin ikkunan koko
    kenttaCanvas.width = window.innerWidth;
    kenttaCanvas.height = window.innerHeight;

    
    drawTerrain();  // tee uusi kenttä
}

// jos ikkunan koko muuttuu päivittyyy myös canvas uutta kokoa vastaavaksi
window.addEventListener('resize', resizeCanvas);


resizeCanvas();


function drawTerrain(){

    const kenttaLeveys = kenttaCanvas.width; //
    const kenttaKorkeus = kenttaCanvas.height;

    
    

    // koordinaatit
    const pisteet = [
        { x: 0, y: kenttaKorkeus - 50 }, // aloituspiste
        { x: kenttaLeveys * 0.10, y: kenttaKorkeus - 50},//alussa tasainen tila tykille, onko riittävä
        { x: kenttaLeveys * 0.15, y: kenttaKorkeus - Math.random()*400 }, //random korkeudet tässä välissä
        { x: kenttaLeveys * 0.20, y: kenttaKorkeus - Math.random()*400 },// säätää voi vuorenhuippuja miltä tuntuu
        { x: kenttaLeveys * 0.30, y: kenttaKorkeus - Math.random()*500 },
        { x: kenttaLeveys * 0.55, y: kenttaKorkeus - Math.random()*500},
        { x: kenttaLeveys * 0.65, y: kenttaKorkeus - Math.random()*400 },
        { x: kenttaLeveys * 0.75, y: kenttaKorkeus - Math.random()*400 },
        { x: kenttaLeveys * 0.90, y: kenttaKorkeus - 50 }, //lopussa myös tykille tila
        { x: kenttaLeveys, y: kenttaKorkeus - 50 } // Lopetuspiste
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
    //rekvisiitta-aurinko
    kenttaCtx.beginPath();
    kenttaCtx.arc(Math.random() * kenttaLeveys ,100,40,0,2*Math.PI);
    kenttaCtx.fillStyle = "yellow";
    kenttaCtx.fill();
    kenttaCtx.stroke();

    drawCloud(Math.random()*(kenttaLeveys-40), 100, 40); //piirrä pilvi parametrien mukaan
    drawCloud(Math.random()*(kenttaLeveys-60), 100, 60); //toinenki
    





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


