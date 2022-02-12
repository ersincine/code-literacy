import Swal from "sweetalert2";
import { SOUND_START, SOUND_ARCADE, SOUND_HELP_OR_EXIT, SOUND_CHANGE } from "./constants";
import { Message } from "./programs";

// TODO: Buradaki sesleri de playSound ile yapmak...

function allowOutsideClick() {
    const popup = Swal.getPopup()
    if (popup != null) {
        popup.classList.remove('swal2-show')
        setTimeout(() => {
            popup.classList.add('animate__animated', 'animate__headShake')
        })
        setTimeout(() => {
            popup.classList.remove('animate__animated', 'animate__headShake')
        }, 500)
    }
    return false
}

export async function helpAlert(text: string) {
    await Swal.fire({
        text: text,
        icon: 'info',
        confirmButtonText: Math.random() < 0.8 ? 'Göreve hazırım!' : 'Yapabilirim!',
        allowOutsideClick: allowOutsideClick
    });
    SOUND_START.play();
}

export async function showStartMessages(messages: Message[]) {
    var counter = 0;
    const length = messages.length;
    for (const message of messages) {
        await Swal.fire({
            title: message.title,
            html: `<div style="padding: 10px 10% 0 10%; font-size: 20px;">${message.text}</div>`,
            iconHtml: counter != length - 1 ? '<i class="fas fa-code"></i>' : '<i class="fas fa-robot"></i>',
            // TODO: This one above doesn't make much sense. Probably leave the decision to json.
            confirmButtonText: counter != length - 1 ? 
            '<div style="font-size: 20px">Tamam <i class="fa fa-thumbs-up"></i></div>' :
            '<div style="font-size: 20px">Başlayalım <i class="fas fa-smile"></i></div>',
            //background: '#ddd',
            //width: 800,
            padding: '50px',
            grow: 'row',
            background: '#fff url(../img/shapes.jpg)',
            allowOutsideClick: allowOutsideClick
        })
        if (counter != length - 1) {
            SOUND_CHANGE.play();
        } else {
            SOUND_ARCADE.play();
        }
    }
}

export async function showEndMessages(messages: Message[]) {
    var counter = 0;
    const length = messages.length;
    for (const message of messages) {
        await Swal.fire({
            title: message.title,
            html: `<div style="background: rgba(255, 255, 255, 0.5); padding: 2rem; font-size: 20px;">${message.text}</div>`,
            confirmButtonText: '<div style="font-size: 20px">Harika <i class="fas fa-grin-hearts"></i></div>',
            width: 800,
            padding: '3em',
            background: message.background,
            backdrop: `
            rgba(0,0,123,0.4)
            url("${message.backdrop}")
            left top
            no-repeat
            `,
            allowOutsideClick: allowOutsideClick
        });
        if (counter != length - 1) {
            SOUND_CHANGE.play();
        } else {
            SOUND_ARCADE.play();
        }
    }
}

export async function canvasAlert() {
    SOUND_HELP_OR_EXIT.play();
    await Swal.fire({
        text: 'Dünyaya yalnızca "eylemler" aracılığıyla müdahale edebilirsin.',
        icon: 'info',
        confirmButtonText: 'Anladım',
        allowOutsideClick: allowOutsideClick
    });
    SOUND_START.play();
};

export function failAlert() {
    Swal.fire({
        title: 'Hata yaptın.',
        icon: 'error',
        confirmButtonText: Math.random() < 0.8 ? 'Tekrar deneyeceğim' : 'Bu sefer başaracağım!',
        allowOutsideClick: allowOutsideClick
    });
};

export function successAlert() {
    Swal.fire({
        title: 'Tebrikler!',
        text: Math.random() < 0.8 ? 'Bir sonraki programa geçebilirsin.' : 'İyi iş!',
        icon: 'success',
        confirmButtonText: Math.random() < 0.8 ? 'İlerleyelim' : 'Güzel!',
        allowOutsideClick: allowOutsideClick
    });
}

export async function askOutput() {

    let result = await Swal.fire({
        title: 'Çıktı',
        input: 'text',
        inputLabel: 'Göstermek istediğin yazıyı gir.',
        inputPlaceholder: '',
        confirmButtonText: 'Yaz',
        cancelButtonText: 'İptal',
        showCancelButton: true
    })

    return result.value as string;
}

export async function askValue() {

    let result = await Swal.fire({
        title: 'Atama',
        input: 'text',
        inputLabel: 'Atamak istediğin değeri gir.',
        inputPlaceholder: '',
        confirmButtonText: 'Ata',
        cancelButtonText: 'İptal',
        showCancelButton: true,
        preConfirm: (value: string) => {
            if (((value.startsWith("'") && value.endsWith("'")) || 
            (value != "" && !isNaN(Number(value)) && !value.includes(".")) )) {
                return value;
            } else {
                Swal.showValidationMessage("Bir dize (örneğin 'mavi', yani tek tırnak içinde) </br>veya bir tamsayı (örneğin 3, yani tırnaksız) girmelisin.")
            }
          }
    })

    return result.value as string;
}

export async function askExit() {

    let result = await Swal.fire({
        iconHtml: '<i class="fas fa-frown" style="color: #c0c0c0"></i>',
        title: 'Çıkış',
        text: 'Uygulamayı kapatmak istediğinden emin misin?',
        confirmButtonText: 'Kapat',
        cancelButtonText: 'İptal',
        showCancelButton: true,
        allowOutsideClick: allowOutsideClick
        /*
        backdrop: `
          rgba(0,0,123,0.4)
          url("img/sad.gif")
          center top
          no-repeat
        `
        */
    })

    return result.value as string;
}