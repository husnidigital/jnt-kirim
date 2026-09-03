const API_URL =
"https://script.google.com/macros/s/AKfycbx41FYDfjnkruic-t97kALFDMR7tLIcW3FZ5AqSawvtLdUXkh9-blp12QFiVPyr4tjzpw/exec";


const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

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

const latitudeElement =
document.getElementById("latitude");

const longitudeElement =
document.getElementById("longitude");

const gpsStatus =
document.getElementById("gpsStatus");

const mapsLink =
document.getElementById("mapsLink");

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

const autoPreview =
document.getElementById("autoPreview");

const autoStatus =
document.getElementById("autoStatus");


let stream = null;

let facingMode = "environment";

let latitude = "";

let longitude = "";

let capturedPhotos = [];

let galleryPhotos = [];

let autoTimer = null;


/* =====================================
   KAMERA
===================================== */

async function startCameraFunction() {

  try {

    if (stream) {

      stream
        .getTracks()
        .forEach(track => track.stop());

    }


    stream =
      await navigator.mediaDevices.getUserMedia({

        video: {

          facingMode: facingMode,

          width: {
            ideal: 1280
          },

          height: {
            ideal: 720
          }

        },

        audio: false

      });


    video.srcObject = stream;


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


    showMessage(
      "Kamera berhasil diaktifkan.",
      "success"
    );


  } catch (error) {

    console.error(error);


    showMessage(
      "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.",
      "error"
    );

  }

}


startCamera.addEventListener(
  "click",
  startCameraFunction
);


/* =====================================
   GANTI KAMERA DEPAN / BELAKANG
===================================== */

switchCamera.addEventListener(
  "click",
  async function() {

    facingMode =
      facingMode === "environment"
        ? "user"
        : "environment";


    if (stream) {

      await startCameraFunction();

    }

  }
);


/* =====================================
   AMBIL FOTO
===================================== */

takePhoto.addEventListener(
  "click",
  function() {

    if (!stream) {

      showMessage(
        "Aktifkan kamera terlebih dahulu.",
        "error"
      );

      return;

    }


    const width =
      video.videoWidth;

    const height =
      video.videoHeight;


    if (!width || !height) {

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


/* =====================================
   TAMPILKAN FOTO
===================================== */

function renderPhotos() {

  photoPreview.innerHTML = "";


  if (
    capturedPhotos.length === 0 &&
    galleryPhotos.length === 0
  ) {

    photoPreview.innerHTML =
      `<div class="empty">
        Belum ada foto
      </div>`;

    return;

  }


  const allPhotos = [

    ...capturedPhotos,

    ...galleryPhotos

  ];


  allPhotos.forEach(
    image => {

      const img =
        document.createElement("img");

      img.src =
        image;

      photoPreview.appendChild(
        img
      );

    }
  );

}


/* =====================================
   PILIH GALERI
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
        document.createElement("img");


      img.src =
        base64;


      galleryPreview.appendChild(
        img
      );

    }


    renderPhotos();


    if (files.length > 0) {

      showMessage(
        files.length +
        " foto dipilih dari galeri.",
        "success"
      );

    }

  }
);


/* =====================================
   KOMPRES FOTO
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
   GPS
===================================== */

function startGPS() {

  if (
    !navigator.geolocation
  ) {

    gpsStatus.textContent =
      "GPS tidak didukung perangkat.";

    return;

  }


  gpsStatus.textContent =
    "📡 Mengambil lokasi GPS...";


  navigator.geolocation.watchPosition(

    function(position) {

      latitude =
        position.coords.latitude;

      longitude =
        position.coords.longitude;


      latitudeElement.textContent =
        latitude.toFixed(6);

      longitudeElement.textContent =
        longitude.toFixed(6);


      gpsStatus.textContent =
        "✓ Lokasi GPS berhasil diperoleh";


      const maps =
        "https://www.google.com/maps?q=" +
        latitude +
        "," +
        longitude;


      mapsLink.href =
        maps;

    },


    function(error) {

      console.error(error);


      gpsStatus.textContent =
        "⚠️ Izin lokasi belum diberikan atau GPS tidak tersedia.";

    },


    {

      enableHighAccuracy: true,

      maximumAge: 5000,

      timeout: 15000

    }

  );

}


startGPS();


/* =====================================
   PREVIEW OTOMATIS
===================================== */

autoPreview.addEventListener(
  "change",
  function() {

    if (this.checked) {

      if (!stream) {

        this.checked =
          false;


        showMessage(
          "Aktifkan kamera terlebih dahulu.",
          "error"
        );

        return;

      }


      autoStatus.textContent =
        "🟢 Preview otomatis aktif — snapshot setiap 5 detik.";


      autoStatus.style.background =
        "#e1f7e5";


      autoTimer =
        setInterval(
          captureAutoPreview,
          5000
        );


      captureAutoPreview();

    }

    else {

      stopAutoPreview();

    }

  }
);


/* =====================================
   FOTO OTOMATIS
===================================== */

async function captureAutoPreview() {

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

    return;

  }


  canvas.width =
    width;

  canvas.height =
    height;


  const ctx =
    canvas.getContext(
      "2d"
    );


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
      0.60
    );


  await sendToServer(
    image,
    true
  );

}


/* =====================================
   MATIKAN PREVIEW OTOMATIS
===================================== */

function stopAutoPreview() {

  if (autoTimer) {

    clearInterval(
      autoTimer
    );

    autoTimer =
      null;

  }


  autoStatus.textContent =
    "Preview otomatis tidak aktif";


  autoStatus.style.background =
    "#f4f4f4";

}


/* =====================================
   TOMBOL KIRIM
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
        "Belum ada foto untuk dikirim.",
        "error"
      );

      return;

    }


    if (
      latitude === "" ||
      longitude === ""
    ) {

      showMessage(
        "Lokasi GPS belum tersedia.",
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
      "✓ Semua foto berhasil dikirim";


    showMessage(
      "Foto dan lokasi berhasil dikirim ke sistem.",
      "success"
    );


    sendButton.disabled =
      false;

  }
);


/* =====================================
   KIRIM KE GOOGLE APPS SCRIPT
===================================== */

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
      "Gagal mengirim data ke Google Apps Script.",
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
    () => {

      message.className =
        "message";

    },
    5000
  );

}
