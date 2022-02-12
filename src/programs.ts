import chapters from "../programs/chapters.json";

export enum ProgramState {
    fail,
    ongoing,
    success
}

export class Message {

    constructor(public title: string, public text: string, public background: string, public backdrop: string) { }

}

export class Program {

    activeLineIdx: number;
    state: ProgramState;
    variables: string[];

    constructor(public programNo: number, public problem: string[], public solution: string[], public actives: (number | number[])[],
        public colors: (string | null)[][], public texts: (string | null)[][], public hint: string,
        public startMessages: Message[], public endMessages: Message[]) {
        
            // programNo starts from 1.

            this.activeLineIdx = 0;
            this.state = ProgramState.ongoing;

            this.variables = [];
            for (const solutionLine of solution) {
                if (solutionLine.startsWith("$")) {
                    const variableName = solutionLine.substring(1, solutionLine.indexOf("="));
                    if (!this.variables.includes(variableName)) {
                        this.variables.push(variableName);
                    }
                }
            }
            this.variables.sort();


            this.reset();
    }

    reset() {
        this.activeLineIdx = 0;
        this.state = ProgramState.ongoing;
    }

    proceed(action: string) {
        // this.state === PuzzleState.ongoing olmalı!

        if (action === this.solution[this.activeLineIdx]) {
            this.activeLineIdx++;
            if (this.activeLineIdx == this.solution.length) {
                this.state = ProgramState.success;
                return ProgramState.success;
            }
            return ProgramState.ongoing;
        }
        this.reset();
        return ProgramState.fail;
    }

}

export function loadProgram(chapterNo: number, programNo: number) {
    const currentProgram = chapters[chapterNo - 1][programNo - 1];
    console.log(chapterNo);
    console.log(programNo);
    console.log(chapters);

    return new Program(programNo, currentProgram.problem, currentProgram.solution, currentProgram.actives,
        currentProgram.colors, currentProgram.texts, currentProgram.hint, 
        currentProgram["start-messages"], currentProgram["end-messages"]); // 1'den fazla kelime oldukları için
}

export function getNumPrograms(chapterNo: number) {
    return chapters[chapterNo - 1].length;
}

export function getNumChapters() {
    return chapters.length;
}