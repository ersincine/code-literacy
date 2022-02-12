import { GridWorld, clearCanvas } from "./grid";
import { loadProgram, getNumPrograms, ProgramState, Program } from "./programs";
import { successAlert, failAlert, askOutput, askValue, canvasAlert, helpAlert, askExit, showStartMessages, showEndMessages } from "./alerts";
import { ROWS, COLS, TILE_SIZE, TILE_PADDING, INIT_ROW_IDX, INIT_COL_IDX, TEXT_SIZE, ICON_SIZE, TILE_COLOR, CANVAS_COLOR,
    SOUND_BAD, SOUND_GOOD, SOUND_SUCCESS, SOUND_FINISHED, SOUND_CHANGE, SOUND_HELP_OR_EXIT, SOUND_START, getColor, SOUND_ARCADE } from "./constants";
import { Audio, addClickListener } from "./utils";

import '../style/style.scss';
import Swal from "sweetalert2";
import { getChapterInfo, getMainPage, getProgramInfo, shouldSubmitResults } from "./config";
import { submit } from "./requests";

function playSound(sound: Audio) {
    lastSound.stop();   // Bir faydası olabilir ama olmayabilir de.
    sound.play();
    lastSound = sound;
}

function setActionButtons(enable: Boolean) {
    // "Eylem" panelindeki ve "Hafıza" panelindeki düğmeleri etkinleştirelim.
    for (const className of ["action-button", "variable-value"]) {
        const actionButtons = Array.from(document.getElementsByClassName(className));
        for (const actionButton of actionButtons) {
            if (actionButton !== null) {
                (actionButton as HTMLButtonElement).disabled = !enable;
            }
        }
    }
}

function letUserChooseBranch(codeLines: HTMLElement, newActiveLineNo: number, isCorrect: boolean) {
    function wrongBranchChosen() {
        // Bir hata yapılırsa...
        setActionButtons(true);
    
        playSound(SOUND_BAD);
        failAlert();
        resetEnvironment(true);
    }

    function correctBranchChosen() {
        setActionButtons(true);
    
        playSound(SOUND_GOOD);
    
        if (codeLinesElement !== null) {
            let activeLineNos = program.actives[program.activeLineIdx];
            if (typeof activeLineNos == "number") {
                console.log("Error :(");
            } else {
                for (const activeLineNo of activeLineNos) {
                    codeLinesElement.children[activeLineNo].classList.remove("multi-active");
                    const button = codeLinesElement.children[activeLineNo].children[0];
                    codeLinesElement.children[activeLineNo].removeChild(button); // Böyle bir şey gerekli mi? Çünkü DOM'la ilgili bir mesela. Eventleri falan takip ediliyor.
                    const lineContent = button.innerHTML;
                    codeLinesElement.children[activeLineNo].innerHTML += lineContent;
                }
                codeLinesElement.children[activeLineNos[0]].classList.add("single-active");
            }
    
        }
    }

    const lineHtml = codeLines.children[newActiveLineNo].innerHTML;                     // &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;sağ()
    const lineContentPrefix = lineHtml.substring(0, lineHtml.lastIndexOf(";") + 1);     // sağ()
    const actualLineContent = lineHtml.substring(lineHtml.lastIndexOf(";") + 1);        // &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

    const button = document.createElement("button");
    button.classList.add("code-selection");
    
    button.innerHTML = actualLineContent;

    button.addEventListener("click", isCorrect ? correctBranchChosen : wrongBranchChosen);

    codeLines.children[newActiveLineNo].innerHTML = lineContentPrefix;
    codeLines.children[newActiveLineNo].appendChild(button);

    setActionButtons(false);
}

function updateCodeLines() {
    if (codeLinesElement == null) return;

    const oldActiveLineNos = program.actives[program.activeLineIdx - 1];
    if (typeof oldActiveLineNos == "number") {
        codeLinesElement.children[oldActiveLineNos].classList.remove("single-active");
        codeLinesElement.children[oldActiveLineNos].classList.remove("multi-active");
        codeLinesElement.children[oldActiveLineNos].classList.add("done");
    }  else {
        for (const oldActiveLineNo of oldActiveLineNos) {
            codeLinesElement.children[oldActiveLineNo].classList.remove("single-active");
            codeLinesElement.children[oldActiveLineNo].classList.remove("multi-active");
        }
        codeLinesElement.children[oldActiveLineNos[0]].classList.add("done");  // Çoklu seçenek olunca ilki doğru olan olmalı (puzzles.json bu şekilde!)
    }
    const newActiveLineNos = program.actives[program.activeLineIdx];

    if (typeof newActiveLineNos == "number") {
        codeLinesElement.children[newActiveLineNos].classList.remove("done");
        codeLinesElement.children[newActiveLineNos].classList.add("single-active");
    }  else {
        let counter = 0;

        for (const newActiveLineNo of newActiveLineNos) {
            codeLinesElement.children[newActiveLineNo].classList.remove("done");
            codeLinesElement.children[newActiveLineNo].classList.add("multi-active");
            letUserChooseBranch(codeLinesElement, newActiveLineNo, counter==0);
            counter++;
        }
    }
}

function loadGridWorld() {

    const grid = new GridWorld(TILE_SIZE, TILE_PADDING, ROWS, COLS, TEXT_SIZE, ICON_SIZE, TILE_COLOR, "black", "🤖");
    if (programNoElement == null || programNoIconElement == null || codeLinesElement == null || variableLinesElement == null) return grid;
    
    programNoElement.innerText = "" + (programNo + numProgramsFromPreviousChapters);
    if (submitResults) {
        if (programNo <= lastFinishedProgramNo) {
            programNoIconElement.classList.remove("fa-times-circle");
            programNoIconElement.classList.add("fa-check-circle");
            programNoIconElement.style.color = "green";
        } else {
            programNoIconElement.classList.remove("fa-check-circle");
            programNoIconElement.classList.add("fa-times-circle");
            programNoIconElement.style.color = "red";
        }
    }

    codeLinesElement.innerHTML = ""; // remove children

    for (const command of program.problem) {
        const codeLine = document.createElement("li");
        const codeLineWithSpaces = command.split("\t").join("&nbsp;".repeat(5)); // replace every \t with 5 spaces.
        codeLine.innerHTML = codeLineWithSpaces;
        codeLinesElement.appendChild(codeLine);
    }

    const newActiveLineNos = program.actives[0];
    if (typeof newActiveLineNos == "number") {
        codeLinesElement.children[newActiveLineNos].classList.add("single-active");
    } else {
        let counter = 0;
        for (const newActiveLineNo of newActiveLineNos) {
            codeLinesElement.children[newActiveLineNo].classList.add("multi-active");
            letUserChooseBranch(codeLinesElement, newActiveLineNo, counter==0);
            counter++;
        }
    }

    variableLinesElement.innerHTML = ""; // remove children

    if (program.variables.length == 0) {
        variableLinesElement.innerText = "Bu programda robotun hiçbir şeyi hatırlaması gerekmiyor.";
        variableLinesElement.style.textAlign = "center";
    } else {
        variableLinesElement.style.textAlign = "left";
    }

    for (const variableName of program.variables) {

        const variableLine = document.createElement("li");
        variableLine.innerText = variableName + " = ";
    
        const button = document.createElement("button");
        button.classList.add("variable-value");
        button.innerHTML = "&nbsp;"
        button.addEventListener("click", () => {
            assignment(variableName, button);
        });
        
        variableLine.appendChild(button);
        variableLinesElement.appendChild(variableLine);
    }

    grid.setTileColors(program.colors);
    grid.setTexts(program.texts);

    return grid;
}

function processActionNow(action: string) {
    function correctActionChosenAndProgramFinished() {
        
        if (submitResults) {
            if (programNo > lastFinishedProgramFromPreviousSessions && programNo > lastFinishedProgramNo) {
                submit(chapterNo, programNo);
            }
        }

        if (program.endMessages.length > 0) {
            playSound(SOUND_FINISHED);  // Yani sadece bölümler bitince değil, sonunda mesaj gelen programlar bitince geliyor bu ses aslında.
            // Ama o mesajları sadece bölüm sonlarında koyacağız zaten.
            showEndMessages(program.endMessages);
        } else {
            playSound(SOUND_SUCCESS);
            successAlert();
        }

        if (programNo < numPrograms) {                
            if (programNo > lastFinishedProgramNo) {
                lastFinishedProgramNo = programNo;
            }
            goToNextProgram();
            resetEnvironment();
        } else {
            // Mevcut "chapter"daki tüm "program"lar bitti.

            // FIXME: TODO: Burada da lastFinishedProgramNo güncellenmeli (gerekiyorsa).

            if (showAllChapters) {
                if (chapterNo < numChapters) {
                    // Gösterecek başka "chapter"lar var.
                    goToNextProgram();
                    resetEnvironment();
                    // TODO: FIXME: lastFinishedProgramNo ve lastFinishedProgramFromPreviousSessions güncellenmeli
                } else {
                    // Gösterecek başka "chapter" kalmadı.
                    window.location.href = mainPage;
                }
            } else {
                window.location.href = mainPage;
            }
        }

    }

    function correctActionChosenButProgramNotFinished() {
        playSound(SOUND_GOOD);
        updateCodeLines();
    }

    function wrongActionChosen() {
        playSound(SOUND_BAD);
        failAlert();
        resetEnvironment(true);
    }

    const status = program.proceed(action);

    if (status === ProgramState.ongoing) {
        correctActionChosenButProgramNotFinished();
    } else {
        if (status === ProgramState.fail) {
            wrongActionChosen();
        } else {
            correctActionChosenAndProgramFinished();
        }
        
    }
}

function processAction(action: string) {
    //playSound(SOUND_ACTION);

    lock = true;
    setTimeout( () => processActionNow(action), 250);
    lock = false;
}

function updateCanvas() {
    if (context === null) return;
    context.fillStyle = CANVAS_COLOR;    
    clearCanvas(canvasElement, context);
    grid.drawGrid(context, rowIdx, colIdx);
}

function down() {
    if (lock) return;

    rowIdx = (rowIdx + 1) % ROWS;
    updateCanvas();
    processAction("down");
}

function up() {
    if (lock) return;

    rowIdx--;
    if (rowIdx < 0) {
        rowIdx = ROWS - 1;
    }
    updateCanvas();
    processAction("up");
}

function right() {
    if (lock) return;

    colIdx = (colIdx + 1) % COLS;
    updateCanvas();
    processAction("right");
}

function left() {
    if (lock) return;

    colIdx--;
    if (colIdx < 0) {
        colIdx = COLS - 1;
    }
    updateCanvas();
    processAction("left");
}

function keyPressed(e: KeyboardEvent) {
    switch (e.key) {
        case "ArrowLeft": 
            left(); 
            break;
        case "ArrowUp": 
            up(); 
            break;
        case "ArrowRight": 
            right(); 
            break;
        case "ArrowDown": 
            down(); 
            break;
        // TODO: Yön tuşlarına basarak yönlendirebilirsiniz diye de yazalım.
        // TODO: Mesela x'e basılırsa x'e atama yapılsın. y, z, vb.
        // 1, 2, 3, 4 sayılarına basılırsa sıralı boyamalar olacak.
        // Çıktı vermek için de - falan mı yapsak? Veya boşluk?
        // case "KeyA":  A harfi...
    }
}

function applyColor(color: string) {
    if (lock) return;

    grid.setTileColor(rowIdx, colIdx, getColor(color) as string);
    updateCanvas();
    processAction(color);
}

async function textButton() {
    if (lock) return;

    const text = await askOutput();
    if (typeof text !== "undefined") {
        grid.setText(rowIdx, colIdx, text);
        updateCanvas();
        processAction("'" + text + "'");
    }
}

async function exitButton() {
    playSound(SOUND_HELP_OR_EXIT);

    const text = await askExit();
    if (typeof text !== "undefined") {
        window.location.href = mainPage;
    } else {
        playSound(SOUND_START);
    }
}

async function assignment(variable: string, button: HTMLButtonElement) {
    if (lock) return;

    const text = await askValue();
    if (typeof text !== "undefined" && text !== "") {
        button.innerText = text;
        updateCanvas();
        processAction("$" + variable + "=" + text);
    }    
}

function resetEnvironment(justReset: boolean = false) {
    if (justReset) {
        // Level (puzzle) is the same
        program.reset();
    } else {
        // Level (puzzle) is changed
        program = loadProgram(chapterNo, programNo);
        if (program.startMessages.length > 0) {
            showStartMessages(program.startMessages);
        }
    }

    if (showAllChapters) {
        buttonPrevElement.disabled = chapterNo == 1 && programNo == 1;
        buttonNextElement.disabled = chapterNo == numChapters && programNo == numPrograms;
    } else {
        buttonPrevElement.disabled = programNo == 1;
        buttonNextElement.disabled = programNo == numPrograms || programNo > lastFinishedProgramNo;
    }

    rowIdx = INIT_ROW_IDX;
    colIdx = INIT_COL_IDX;
    grid = loadGridWorld();
    updateCanvas();
}

function goToPrevProgram() {
    if (programNo > 1) {
        programNo--;
    } else {
        if (showAllChapters) {
            if (chapterNo > 1) {
                chapterNo--;
                numPrograms = getNumPrograms(chapterNo);
                numProgramsFromPreviousChapters -= numPrograms;
                programNo = numPrograms;
            } else {
                console.log("Error :(");
            }
        } else {
            console.log("Error :(");
        }
    }   
}

function goToNextProgram() {
    if (programNo < numPrograms) {
        programNo++;
    } else {
        if (showAllChapters) {
            if (chapterNo < numChapters) {
                chapterNo++;
                numPrograms = getNumPrograms(chapterNo);
                numProgramsFromPreviousChapters += programNo;
                programNo = 1;
            } else {
                console.log("Error :(");
            }
        } else {
            console.log("Error :(");
        }
    }
}

var lock = false;
var lastSound = SOUND_ARCADE;   // Başka bir değer de olabilir, önemi yok.
var numProgramsFromPreviousChapters = 0; // showAllChapters true ise önceki program numaralarını sayacak.
var program: Program;
var rowIdx: number;
var colIdx: number;
var grid: GridWorld;

const codeLinesElement = document.getElementById("code-lines");
const programNoElement = document.getElementById("program-no");
const programNoIconElement = document.getElementById("program-no-icon");
const variableLinesElement = document.getElementById("variable-lines");
const buttonPrevElement = document.getElementById("button-prev") as HTMLButtonElement;
const buttonNextElement = document.getElementById("button-next") as HTMLButtonElement;
const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

const context = canvasElement.getContext("2d");

// Program paneli
addClickListener("button-prev", () => { goToPrevProgram(); playSound(SOUND_CHANGE); resetEnvironment(); });
addClickListener("button-next", () => { goToNextProgram(); playSound(SOUND_CHANGE); resetEnvironment(); });
addClickListener("button-help", () => { playSound(SOUND_HELP_OR_EXIT); helpAlert(program.hint); });
addClickListener("button-exit", exitButton);

// Canvas
addClickListener("canvas", canvasAlert);

// Eylem paneli
addClickListener("button-up", up);
addClickListener("button-left", left);
addClickListener("button-right", right);
addClickListener("button-down", down);
addClickListener("button-yellow", () => applyColor("yellow"));
addClickListener("button-red", () => applyColor("red"));
addClickListener("button-blue", () => applyColor("blue"));
addClickListener("button-green", () => applyColor("green"));
addClickListener("button-text", textButton);

window.addEventListener("keydown", keyPressed, false);

const submitResults = shouldSubmitResults(); 
var [numChapters, chapterNo, showAllChapters] = getChapterInfo();
var numPrograms = getNumPrograms(chapterNo);
var [programNo, lastFinishedProgramNo, lastFinishedProgramFromPreviousSessions] = getProgramInfo(numPrograms);
const mainPage = getMainPage();

resetEnvironment();

// TODO: Welcome screen de daha önce bölüm bitirdiyse çıkmasın...?
// en son askOutput veya askValue olursa bitti + documentation diye 3 tane arka arkaya swal gelmeli.
// test et!!!
// Dışarıya tıklayınca kuyruktaki alarmlar kayboluyor
// TODO: Bu sayfa açılınca fullscreen olsun.
