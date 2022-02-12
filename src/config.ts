import { getNumChapters } from "./programs";

export function shouldSubmitResults() {
    const submitResultsElement = document.getElementById("submit-results")
    if (submitResultsElement != undefined) {
        return parseInt(submitResultsElement.innerText) == 1;
    }
    return false;
}

export function getChapterInfo(): [number, number, boolean] {
    var chapterNo = 1;
    var showAllChapters = false;
    const chapterElement = document.getElementById("chapter")
    if (chapterElement != undefined) {
        chapterNo = parseInt(chapterElement.innerText);
        if (chapterNo == -1) {
            showAllChapters = true;
            chapterNo = 1;
        }
    }
    const numChapters = getNumChapters();
    return [numChapters, chapterNo, showAllChapters];
}

export function getProgramInfo(numPrograms: number): [number, number, number] {
    var lastFinishedProgramNo = 0;
    var programNo = 1;
    var lastFinishedProgramFromPreviousSessions = 0;
    const lastProgramElement = document.getElementById("last-program");
    if (lastProgramElement != undefined) {
        lastFinishedProgramFromPreviousSessions = parseInt(lastProgramElement.innerText);
        lastFinishedProgramNo = lastFinishedProgramFromPreviousSessions;
        if (lastFinishedProgramNo != 0) {
            // -1 özel bir değer. Hepsinin bittiğini göstermek için numProgram'ın değerini bilmeden kolayca kullanılabilir.
            if (lastFinishedProgramNo == -1) {
                lastFinishedProgramNo = numPrograms;
            }

            if (lastFinishedProgramNo == numPrograms) {
                programNo = 1; // Sonuncuyu da bitirdiyse başa dönsün.
            } else {
                programNo = lastFinishedProgramNo + 1 // Aksi halde bir sonraki bölüm açılsın.
            }
        }
    }
    return [programNo, lastFinishedProgramNo, lastFinishedProgramFromPreviousSessions]
}

export function getMainPage() {
    var mainPage = "http://www.computationalwisdom.com/"
    const mainPageElement = document.getElementById("main-page");
    if (mainPageElement != undefined) {
        mainPage = mainPageElement.innerText;
    }
    return mainPage;
}