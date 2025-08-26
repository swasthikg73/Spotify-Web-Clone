let songNames = [];
async function getSongs() {
  let songs = await fetch("http://127.0.0.1:5500/songs");
  let response = await songs.text();

  let div = document.createElement("div");

  div.innerHTML = response;

  let links = div.getElementsByTagName("a");

  let Allsongs = [];

  for (let link of links) {
    let href = link.getAttribute("href");

    if (href && href.endsWith("mp3")) {
      Allsongs.push(href);
      songNames.push(href.split("/songs/")[1]);
    }
  }

  return Allsongs;
}

let currentSong = new Audio();

const playMusic = (track) => {
  //   let audio = new Audio("/songs/" + track);
  currentSong.src = "/songs/" + track;
  currentSong.play();
  play.src = "/images/pause.svg";
};

async function main() {
  let songs = await getSongs();
  //console.log(songs);

  //Show all songs  in the playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  for (const song of songNames) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li class=""><img class="invert" src="/images/music.svg" alt="music icon">
                            <div class="info">
                                <div class="songName"> ${song.replaceAll(
                                  "%20",
                                  " "
                                )}</div>
                                <div class="songArtist">Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg" alt="">
                            </div>
        </li>`;
  }

  //attach an event listener for each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    //console.log(e.getElementsByTagName("div")[0]);

    e.addEventListener("click", (element) => {
      //   console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  //attach an event listner to play, next and previous

  // Using id we can use direct
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/images/play.svg";
    }
  });

  //Attach an eveny listener for previous and next
}

main();
