let currentSong = new Audio;
let songs;
let currFolder;

// seconds to minute function 
function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0){
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2,'0');
    const formattedSeconds = String(remainingSeconds).padStart(2,'0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }  
    }
    



      // show all the song in playlist 
      let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
      songUL.innerHTML = ""
      for (const song of songs) {
          songUL.innerHTML = songUL.innerHTML + `<li class="song-preview">
                                  <img src="svg/songs.svg" alt="">
  
                                  <div class="songlist-info">
                                      <div class="song-name">${song.replaceAll("%20", " ")}</div>
                                      <div class="song-artist">Anuv Jain</div>
                                  </div>
                                  
  
                                  <img src="/svg/play.svg" class="invert" alt="">
  
                              </li>`;}
  // attach an event listner to each song 
          Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
              e.addEventListener("click", element =>{

                  console.log(e.querySelector(".songlist-info").firstElementChild.innerHTML)

                  playMusic(e.querySelector(".songlist-info").firstElementChild.innerHTML.trim())
              })
          });
          return songs


}

// f code to play music 

const playMusic = (track, pause =false)=>{

    currentSong.src = `/${currFolder}/` + track
    if (!pause){
        currentSong.play()
        // for changing play icon on startup 
        play.src = "svg/pause.svg"
    }
  
    

    // song info 
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if(e.href.includes("/songs")){
            let folder = e.href.split('/').slice(-2)[0]
            // Get the metadata of the folder 
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="artist-card-1">

                            <img src="/songs/${folder}/cover.jpg" alt="">
                            <h4>${response.title}</h4>
                            <p>${response.description}</p>

                            <!-- play icon  --> 
                                 <div class="play-icon">
                                     <img src="/svg/play.svg" alt="">
                                    </div>
                            
                        </div>`
        }
    }

        

      // load the playlist whenever card is clicked 
      Array.from(document.getElementsByClassName("artist-card-1")).forEach(e => {
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
        
  })

}

async function main(){
    
    // will play first song
await getSongs("songs")     // error
    playMusic(songs[0], true)

    // Display allt he albums on the page 
    displayAlbums();
  

            // for playing next and previous song 
            play.addEventListener("click", ()=>{
                if(currentSong.paused){
                    currentSong.play()
                    play.src = "svg/pause.svg"
                }
                else{
                    currentSong.pause()
                    play.src = "svg/playsong.svg"
                    }
            })
            // listen for timeupdate event 
            currentSong.addEventListener("timeupdate", ()=>{
                // console.log(currentSong.currentTime, currentSong.duration);
                // update the time
                document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`

                // to change the placement of seekbar circle automatically
                document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
            })

            // to change placement of seekbar circle manually by user 
            document.querySelector(".seekbar").addEventListener("click", (e)=>{
                let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
                document.querySelector(".circle").style.left = percent + "%";
                currentSong.currentTime = (currentSong.duration * percent)/100;
            })

            // adding eventListner for hamburger 

            document.querySelector(".hamburger").addEventListener("click", () =>{
                document.querySelector(".left").style.left = "0";
            })

            // adding event listner for closing hamburger using cross 

            document.querySelector(".cross").addEventListener("click", () =>{
                document.querySelector(".left").style.left = "-100%";
            })

            // adding eventListner for previous song
            previous.addEventListener("click", ()=>{
                let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
                if((index-1)>= 0){
                    playMusic(songs[index-1])
                }
            })

            // adding eventListner for next song
            next.addEventListener("click", ()=>{
                let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
                if((index+1) < songs.length){
                    playMusic(songs[index+1])
                }
            })

            // adding functionality for volume button 
            document.querySelector(".slider").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
                currentSong.volume = parseInt(e.target.value)/100
            })

            
            
            


}

main()