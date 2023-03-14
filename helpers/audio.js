export class Sound{
    constructor(path){
        this.audioContext = new AudioContext();
        this.song = new Audio(path);
        this.source = this.audioContext.createMediaElementSource(this.song)
        this.source.connect(this.audioContext.destination);
    }
    play(){
        if(this.audioContext.state === "suspended"){
            this.audioContext.resume();
        }
        this.song.play();
    }
    pause(){
        this.song.pause();
    }
    stop(){
        this.song.pause();
        this.song.currentTime = 0;
    }
}


