
export function submit(chapterNo: number, programNo: number) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open('POST', 'https://www.derslab.com/ogrenci/includes/post/kodokuryazarligi.php', true);
    httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    httpRequest.send(`bolum=${chapterNo}&program=${programNo}`);
}
