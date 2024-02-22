class App {
    constructor() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x000000,
            resizeTo: window
        });

        document.body.appendChild(this.app.view);

        this.textStyle = new PIXI.TextStyle({
            fontFamily: 'Josefin Sans',
            fontSize: 240,
            fill: 0xFFFFFF,
        });

        this.pressText = new PIXI.Text('PRESS KEYBOARD', new PIXI.TextStyle({
            fontFamily: 'Josefin Sans',
            fontSize: 50,
            fill: 0xFFFFFF,
        }));
        
        this.pressText.x = this.app.renderer.width / 2 - this.pressText.width / 2;
        this.pressText.y = this.app.renderer.height / 2 - this.pressText.height / 2;
        this.app.stage.addChild(this.pressText);

        this.textArray = []; // Array to store text objects
        this.keyDownSound = [new Audio('sound/tap_01.wav'), new Audio('sound/tap_02.wav'), new Audio('sound/tap_03.wav'),new Audio('sound/tap_04.wav'),new Audio('sound/tap_05.wav')]
        this.outSound = [new Audio('sound/type_01.wav'), new Audio('sound/type_02.wav'), new Audio('sound/type_03.wav'),new Audio('sound/type_04.wav'),new Audio('sound/type_05.wav')]

        document.addEventListener('keydown', (event) => {
            const char = event.key;
            this.createText(char);
            this.audioContext.resume();
            this.playSound();
            let r = Math.floor(Math.random() * this.keyDownSound.length);
            this.audioKeyDown.push( this.keyDownSound[r]);
            for(let i = 0; i < this.audioKeyDown.length; i++){
                this.audioKeyDown[i].play();
            }
        });

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.audioBackground = new Audio('sound/bg.mp3');


        this.audioKeyDown = [];
        this.audioOut = [];

        this.audioSource = this.audioContext.createMediaElementSource(this.audioBackground);
        this.analyser = this.audioContext.createAnalyser();

        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.app.renderer.render(this.app.stage);

        // Listen for animate update
        this.app.ticker.add((delta) => {
            if (this.textArray.length === 0) {
                this.app.stage.addChild(this.pressText);
            } else {
                this.app.stage.removeChild(this.pressText);
            }
            this.drawWaveform(delta);
            this.updateTextLife(delta); // Update text life
            
        });
    }

    createText(char) {
        const newText = new PIXI.Text(char, this.textStyle);
        newText.x = Math.random() * this.app.renderer.width;
        newText.y = Math.random() * this.app.renderer.height;
        newText.rotation = Math.random() * Math.PI * 2;
        newText.life = this.getRandom(100, 300); // Set initial life value
        this.app.stage.addChild(newText);
        this.textArray.push(newText); // Add text object to the array
    }

    drawWaveform(delta) {
        this.analyser.getByteFrequencyData(this.dataArray);
        for (let i = 0; i < this.textArray.length; i++) {
            const scale = this.dataArray[i] / 256;
            let angle = 0;
            angle ++;
            this.textArray[i].scale.set(scale);
            // Calculate position based on arc animation
            let radius = 0; // Set the radius of the circle
            let x = this.textArray[i].position.x + Math.cos(angle) * radius;
            let y = this.textArray[i].position.y + Math.sin(angle) * radius;
            if(i%13 == 0){
                x += Math.sin(angle) * 10;
                y -= Math.cos(angle) * 10;
            }
            if(i%9 == 0){
                x -= Math.sin(angle) * 10;
                y += Math.cos(angle) * 10;
            }
            this.textArray[i].position.set(x, y);
            this.textArray[i].rotation +=  Math.cos(this.dataArray[i])* Math.sin(this.dataArray[i])*0.1;
            this.textArray[i].life -= delta;

            if (this.textArray[i].life < 10) {
                this.textArray[i].scale.set(scale*3);
            }else if (this.textArray[i].life <= 0){
                this.app.stage.removeChild(this.textArray[i]);
                this.textArray.splice(i, 1);
                i--;
            }
        }
    }



    updateTextLife(delta) {
        for (let i = 0; i < this.textArray.length; i++) {
            const text = this.textArray[i];
            text.life -= delta; // Decrease life value
            if (text.life <= 0) {
                this.app.stage.removeChild(text); // Remove text from stage
                this.textArray.splice(i, 1); // Remove text from array
                //console.log(this.textArray[i].style.fill);
                //this.textArray[i].style.fill = 0x0000FF;
                i--; // Adjust index after removing element
                let r = Math.floor(Math.random() * this.outSound.length);
                this.audioOut[i] = this.outSound[r];
                this.audioOut[i].play();
                this.audioOut.splice(i, 1);
                this.audioKeyDown.splice(i, 1);
            }
        }
    }

    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    playSound() {
        this.audioBackground.play();
                this.audioBackground.loop = true;
        this.audioBackground.volume = 0.5;
    }
}

const app = new App();
