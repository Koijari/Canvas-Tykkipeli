// tykkipeli
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.body.innerHTML = '';
    var peliAlue = {
        canvas : document.createElement("canvas"),
        aloita : function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.context = this.canvas.getContext("2d");
            document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        }
    }
    peliAlue.aloita();
})