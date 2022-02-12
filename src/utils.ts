export function addClickListener(id: string, func: () => void) {
    (document.getElementById(id) as HTMLInputElement).addEventListener("click", func);
}

export class Audio {

    sound: HTMLAudioElement;

    constructor(path: string) {
        this.sound = document.createElement("audio") as HTMLAudioElement;
        this.sound.src = path;
        this.sound.style.display = "none";
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        document.body.appendChild(this.sound);
    }

    play() {
        this.sound.play();
    }

    stop() {
        this.sound.pause();
    }

}
