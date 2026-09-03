const API_URL =
"https://script.google.com/macros/s/AKfycbx41FYDfjnkruic-t97kALFDMR7tLIcW3FZ5AqSawvtLdUXkh9-blp12QFiVPyr4tjzpw/exec";


const video =
document.getElementById("video");

const canvas =
document.getElementById("canvas");

const startCamera =
document.getElementById("startCamera");

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

const photoPreview =
document.getElementById("photoPreview");

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


/* =========================================
   SAAT WEBSITE DIBUKA
========================================= */

window.addEventListener(
  "load",
  function() {

    startGPS();

    startCameraFunction();

  }
);


/* =========================================
   KAMERA
========================================= */

async function startCameraFunction() {

  try {

    if (stream) {

      stream
        .getTracks()
        .forEach(
          track => track.stop()
        );

    }


    cameraStatus.textContent =
      "Mengaktifkan...";


    cameraStatus.className =
      "status offline";


    cameraOverlay.style.display =
      "flex";


    cameraOverlay.textContent =
      "Menyalakan kamera depan...";


    stream =
      await navigator.mediaDevices.getUserMedia({

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


    startCamera.textContent =
      "✓ KAMERA AKTIF";


    takePhoto.disabled =
      false;


    autoStatus.textContent =
      "🟢 Kamera aktif";


    /*
       FOTO PERTAMA OTOMATIS
       Tunggu sedikit agar
       kamera benar-benar siap.
    */

    if (
      !automaticPhotoTaken
    ) {

      setTimeout(
        captureAutomaticPhoto,
        1500
      );

    }


  } catch (error) {

    console.error(error);


    cameraStatus.textContent =
      "Kamera gagal";


    cameraStatus.className =
      "status offline";


    cameraOverlay.style.display =
      "flex";


    cameraOverlay.textContent =
      "Izin kamera diperlukan";


    showMessage(
      "Kamera tidak dapat diakses. Silakan izinkan kamera.",
      "error"
    );

  }

}


/* =========================================
   TOMBOL AKTIFKAN KAMERA
========================================= */

startCamera.addEventListener(
  "click",
  function() {

    startCameraFunction();

  }
);


/* =========================================
   GANTI KAMERA
========================================= */

switchCamera.addEventListener(
  "click",
  async function() {

    facingMode =
      facingMode === "user"
        ? "environment"
        : "user";


    automaticPhotoTaken =
      true;


    await startCameraFunction();

  }
);


/* =========================================
   FOTO OTOMATIS PERTAMA
========================================= */

function captureAutomaticPhoto() {

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
      captureAutomaticPhoto,
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


  renderPhotos();


  autoStatus.textContent =
    "📸 Foto otomatis berhasil diambil";


  showMessage(
    "Foto otomatis berhasil diambil.",
    "success"
  );

}


/* =========================================
   TOMBOL AMBIL FOTO MANUAL
========================================= */

takePhoto.addEventListener(
  "click",
  function() {

    if (!stream) {

      showMessage(
        "Kamera belum aktif.",
        "error"
      );

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

      showMessage(
        "Kamera belum siap.",
        "error"
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


    renderPhotos();


    showMessage(
      "Foto berhasil diambil.",
      "success"
    );

  }
);


/* =========================================
   TAMPILKAN FOTO
========================================= */

function renderPhotos() {

  photoPreview.innerHTML =
    "";


  const allPhotos = [

    ...capturedPhotos,

    ...galleryPhotos

  ];


  if (
    allPhotos.length === 0
  ) {

    photoPreview.innerHTML =
      `<div class="empty">
        Menunggu foto...
      </div>`;

    return;

  }


  allPhotos.forEach(
    image => {

      const img =
        document.createElement(
          "img"
        );


      img.src =
        image;


      photoPreview.appendChild(
        img
      );

    }
  );

}


/* =========================================
   GALERI
========================================= */

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


      const base64 =
        await resizeImage(
          file,
          1280,
          0.78
        );


      galleryPhotos.push(
        base64
      );


      const img =
        document.createElement(
          "img"
        );


      img.src =
        base64;


      galleryPreview.appendChild(
        img
      );

    }


    renderPhotos();


    showMessage(
      files.length +
      " foto dipilih.",
      "success"
    );

  }
);


/* =========================================
   KOMPRES GAMBAR
========================================= */

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


/* =========================================
   GPS DI BELAKANG LAYAR
========================================= */

function startGPS() {

  if (
    !navigator.geolocation
  ) {

    console.error(
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
        "GPS:",
        latitude,
        longitude
      );

    },


    function(error) {

      console.error(
        "GPS:",
        error
      );

    },


    {

      enableHighAccuracy: true,

      maximumAge: 5000,

      timeout: 15000

    }

  );

}


/* =========================================
   KIRIM SEMUA FOTO
========================================= */

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
        "Lokasi belum tersedia. Tunggu GPS beberapa detik.",
        "error"
      );

      return;

    }


    const nama =
      document
        .getElementById("nama")
        .value
        .trim();


    const keterangan =
      document
        .getElementById("keterangan")
        .value
        .trim();


    sendButton.disabled =
      true;


    progressBox.style.display =
      "block";


    progress.style.width =
      "0%";


    for (
      let i = 0;
      i < allPhotos.length;
      i++
    ) {

      progressText.textContent =
        "Mengirim foto " +
        (i + 1) +
        " dari " +
        allPhotos.length;


      const berhasil =
        await sendToServer(

          allPhotos[i],

          false,

          nama,

          keterangan

        );


      if (!berhasil) {

        sendButton.disabled =
          false;

        return;

      }


      progress.style.width =
        (
          (
            (i + 1) /
            allPhotos.length
          ) * 100
        ) + "%";

    }


    progressText.textContent =
      "✓ Semua foto berhasil dikirim";


    showMessage(
      "Foto dan lokasi berhasil dikirim.",
      "success"
    );


    sendButton.disabled =
      false;

  }
);


/* =========================================
   KIRIM KE GOOGLE APPS SCRIPT
========================================= */

async function sendToServer(
  image,
  automatic = false,
  nama = "",
  keterangan = ""
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
      "Server:",
      result
    );


    if (
      result.status !==
      "success"
    ) {

      showMessage(
        result.message ||
        "Server menolak data.",
        "error"
      );

      return false;

    }


    return true;


  } catch (error) {

    console.error(error);


    showMessage(
      "Gagal mengirim data ke server.",
      "error"
    );


    return false;

  }

}


/* =========================================
   PESAN
========================================= */

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
