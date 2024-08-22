const felder = document.querySelectorAll(".feld");
const text_status = document.querySelector("#text_status");
const restart_button = document.querySelector("#restart_button");
const win_möglichkeiten = [];//gewinnmöglichkeiten aus den for-schleifen
let row, col; 
// Horizontale 
for (let row = 0; row < 8; row++) {//durchläuft alle Zeilen von 0-7 (von oben nach unten || oder unten anch oben)
    for (let col = 0; col < 4; col++) {//durchläuft 4 spalten von 0-3, um zu gucken ob 4 in einer reihe sind
        win_möglichkeiten.push([row * 7 + col, row * 7 + col + 1, row * 7 + col + 2, row * 7 + col + 3]);//bspw. row=2*7+col(=4)=18, also Feld i.d.3 zeile u. 5 spalte(Feld 19 wenn man von 1 zählt)
    }
}
// Vertikale 
for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 8; row++) {//durchläuft alle Zeilen von 0-7 
        win_möglichkeiten.push([row * 7 + col, (row + 1) * 7 + col, (row + 2) * 7 + col, (row + 3) * 7 + col]);
    }
}
// Diagonale (von rechts oben nach links unten)
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
        win_möglichkeiten.push([row * 7 + col, (row + 1) * 7 + col + 1, (row + 2) * 7 + col + 2, (row + 3) * 7 + col + 3]);
    }
}
// Diagonale (von links oben nach rechts unten)
for (let row = 0; row <8; row++) {
    for (let col = 3; col < 7; col++) {
        win_möglichkeiten.push([row * 7 + col, (row + 1) * 7 + col - 1, (row + 2) * 7 + col - 2, (row + 3) * 7 + col - 3]);
    }
}
// Diagonale (von links unten nach rechts oben)
for (let row = 3; row < 8; row++) {
    for (let col = 3; col < 7; col++) {
        win_möglichkeiten.push([row * 7 + col, (row - 1) * 7 + col - 1, (row - 2) * 7 + col - 2, (row - 3) * 7 + col - 3]);
    }
}
// Diagonale (von rechts unten nach links oben)
for (let row = 3; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
        win_möglichkeiten.push([row * 7 + col, (row - 1) * 7 + col + 1, (row - 2) * 7 + col + 2, (row - 3) * 7 + col + 3]);
    }
}

let zustand = Array(56).fill("");//chat gpt -> info, bedeutet 55*""(leere felder)
let spieler = "X";
let runing = false;
let sound_enable=true;

function spiel_laden() {
    felder.forEach(feld => feld.addEventListener("click", feld_geklickt));
    restart_button.addEventListener("click", restarte_das_game);
    text_status.textContent = `${spieler} ist an der Reihe`;
    runing = true;
}

function feld_geklickt(e) {
    if(!runing){
        return;
    }
    
    const feld_index = parseInt(this.getAttribute("feld_index")); // Feldindex als Zahl parsen
    let nextIndex = feld_index; // Starten mit dem aktuellen Feldindex
    
    // Findet das nächste verfügbare Feld von unten nach oben
    while (nextIndex < zustand.length && zustand[nextIndex] === "") {
        nextIndex += 7; // Bewegen Sie sich um 7 Felder nach oben (da 7 Spalten)
    }
    
    // Überprüfen, ob das Feld gültig ist (nicht über den obersten Rand hinaus)
    if (nextIndex - 7 >= 0) {
        nextIndex -= 7; // Bewegen sich zum ersten verfügbaren Feld von unten
        
        // Aktualisiere das Feld und den Zustand
        update_feld(felder[nextIndex], nextIndex);
        gewinner_ermitteln();
        
    }
}

function update_feld(feld, index,) {
    zustand[index] = spieler;
    feld.textContent = spieler;
    sound_1(spieler);
}

function spieler_wechsel() {
    spieler = (spieler === "X" ? "O" : "X"); //geprüft "X", dann -> "O"
    text_status.textContent = `${spieler} ist an der Reihe`;
}
document.getElementById("sound").addEventListener("click", an_aus_sound);
spiel_laden();

function an_aus_sound() {
    sound_enable=!sound_enable;
    console.log("Sound ist jetzt", sound_enable ? "an" : "aus");

    let icon=document.getElementById("sound_icon");
    if(sound_enable){
        icon.src="img/sound_an.png"
        icon.alt="Sound AN"
    }else{
        icon.src="img/sound_aus.png"
        icon.alt="Sound Aus"
        stop_sound(); 
    }
}

function stop_sound(){
    let alles_audio=document.querySelectorAll("audio");
    alles_audio.forEach(audio=>{
        audio.pause();
        
    })
}

function play_sound(audio_file) {
    if (sound_enable) {
        let audio = new Audio(audio_file);
        audio.play();
    }
}

function sound_1(spieler){
    if(sound_enable){
    let audio;
    if(spieler === "X"){
        audio = new Audio("soundtrack/laser.wav");

    }else if(spieler === "O"){
        audio = new Audio("soundtrack/fart_sound.wav");
    }
    audio.play();
    }
}

function spieler_punkte(spieler) {
    const punkte_stand = document.getElementById(`score_${spieler}`);
    let aktuelle_punkte = parseInt(punkte_stand.textContent);//string wird in Zahl umgewandelt
    aktuelle_punkte++;
    punkte_stand.textContent = aktuelle_punkte;
}

function gewinner_ermitteln() {
    let runde_gewonnen = false;         //gibt die Länge des Arrays wieder
    for (let i = 0; i < win_möglichkeiten.length; i++) {
        const bedingungen = win_möglichkeiten[i];
        const feldA = zustand[bedingungen[0]];//zustan=9xfelder
        const feldB = zustand[bedingungen[1]];//bedingung=alle win-möglichkeiten
        const feldC = zustand[bedingungen[2]];//Felder A-C stehen für die Kombination, die man braucht um zu gewinnen
        const feldD = zustand[bedingungen[3]];
        if (feldA === "" || feldB === "" || feldC === "" || feldD === "") {
            continue;
        }
        if (feldA === feldB && feldB === feldC && feldC === feldD) {
            runde_gewonnen = true;
            break;
        }
    }
    
    if (runde_gewonnen) {
        text_status.textContent = `Der Spieler ${spieler} hat gewonnen`;
        spieler_punkte(spieler);
        if (sound_enable) {
            audio = new Audio("soundtrack/winner.wav");
            audio.play();
        }
        runing = false;
    } else if (!zustand.includes("")) {//alle felder belegt? dann Unentschieden
        text_status.textContent = `Unentschieden`;
        if (sound_enable) {
            audio = new Audio("soundtrack/unentschieden.wav");
            audio.play();
        }
        runing = false;
    } else {
        spieler_wechsel();//solange kein win/unentschieden -> spielerwechsel
    } 
}

function restarte_das_game(e) {
    spieler = "X";
    zustand = Array(56).fill("");
    text_status.textContent = `${spieler} ist an der Reihe`;
    felder.forEach(feld => feld.textContent = "");
    runing = true;
}





//andere MEthoden, dann verwenden wenn es im HTML zu unübersichtlich wird
/*const felder = document.getElementById("feld_container");
for (let i = 0; i < 56; i++) {
    const feld = document.createElement("div");
    feld.setAttribute("feld_index", i);
    feld.classList.add("feld");
    felder.appendChild(feld);
}*/