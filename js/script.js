let songNames = [];
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  // folder = "cs";

  let songs = await fetch(`http://127.0.0.1:5500/songs/${folder}`);
  let response = await songs.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let links = div.getElementsByTagName("a");
  let Allsongs = [];

  for (let link of links) {
    let href = link.getAttribute("href");

    if (href && href.endsWith("mp3")) {
      Allsongs.push(href);
      songNames.push(href.split(`/songs/${folder}`)[1]);
    }
  }

  //Show all songs  in the playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";

  for (const song of Allsongs) {
    let songName = song.split(`/songs/${currFolder}/`)[1];
    songUl.innerHTML =
      songUl.innerHTML +
      `<li class=""><img class="invert" src="/images/music.svg" alt="music icon">
                            <div class="info">
                                <div class="songName"> ${songName}</div>
                                <div class="songArtist">Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img  id="playbtn" class="invert" src="images/play.svg" alt="">
                            </div>
        </li>`;
  }

  //attach an event listener for each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      // playMusic(e);
      updateIcon(e);
    });
  });
  return Allsongs;
}

//Add event to load all the albums
async function loadAlbums() {
  let folders = await fetch(`http://127.0.0.1:5500/songs/`);
  let alb = await folders.text();
  let div = document.createElement("div");
  div.innerHTML = alb;

  let links = div.getElementsByTagName("a");
  for (let link of links) {
    let href = link.getAttribute("href");
    if (href && href.startsWith("/songs/")) {
      //Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500${href}/info.json`);
      let files = await a.json();
      let folder = href.split("/songs/")[1];

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder=${href.split("/songs/")[1]} class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns:xlink="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"
                                    stroke-linejoin="round" fill="#000" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/cover.jpeg" alt="">
                        <h2>${files.title}</h2>
                        <p>${files.description}<p>
                    </div>`;
    }
  }
  //add a event to Card whenever it is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (ele) => {
      songs = await getSongs(ele.currentTarget.dataset.folder);
    });
  });
}

async function main() {
  songs = await getSongs("cs");
  // playMusic(songs[0], false);

  loadAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/images/play.svg";
    }
  });

  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an event lister for seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".humburgerIcon").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  document.querySelector(".close-left-btn").addEventListener("click", () => {
    document.querySelector(".left").style.left = -120 + "%";
  });

  //attach an event listner to next and previous

  previous.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split(`http://127.0.0.1:5500`)[1]
    );

    if (index > 0) {
      let track = songs[index - 1].split(`/songs/${currFolder}/`)[1];
      playMusic(track);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src.split(`http://127.0.0.1:5500`)[1]
    );
    if (index < songs.length - 1) {
      let track = songs[index + 1].split(`/songs/${currFolder}/`)[1];
      playMusic(track);
    }
  });

  //Add an event to volume
  document.querySelector(".volRange input").addEventListener("change", (e) => {
    let vol = e.target.value / 100;
    currentSong.volume = vol;
  });
}

let currentSong = new Audio();
const playMusic = (track, pause = false) => {
  console.log("Track :", track);

  document.querySelector(".playbar").style.opacity = "1";
  currentSong.src = `/songs/${currFolder}/` + track;
  currentSong.play();

  play.src = "/images/pause.svg";

  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

//Event to mute the volume by click
document.querySelector(".volume>img").addEventListener("click", (e) => {
  let src = e.target.src.split("/images")[1];

  if (src == "/volume.svg") {
    e.target.src = "http://127.0.0.1:5500/images/mute.svg";
    currentSong.volume = 0;
    document
      .querySelector(".volRange")
      .getElementsByTagName("input")[0].value = 0;
  } else {
    e.target.src = "/images/volume.svg";
    currentSong.volume = 0.5;
    document
      .querySelector(".volRange")
      .getElementsByTagName("input")[0].value = 50;
  }
});

let currenttrack;
let previoustrack;
function updateIcon(element) {
  previoustrack = currenttrack;
  currenttrack = element;

  if (
    previoustrack &&
    currenttrack.querySelector(".info").firstElementChild.innerHTML.trim() ==
      previoustrack.querySelector(".info").firstElementChild.innerHTML.trim()
  ) {
    currentSong.pause();
    currenttrack.querySelector(".playnow img").src = "/images/play.svg";
    play.src = "/images/play.svg";
  }

  currenttrack.querySelector(".playnow img").src = "/images/pause.svg";
  if (previoustrack)
    previoustrack.querySelector(".playnow img").src = "/images/play.svg";
}

main();
