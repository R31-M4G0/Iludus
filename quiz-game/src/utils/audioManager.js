import ajudaRespostaCerta from "../assets/sounds/AjudaRespostaCerta.mp3"
import gameOver from "../assets/sounds/GameOver.mp3"
import levelUp from "../assets/sounds/LevelUp.mp3"
import poucoTempo from "../assets/sounds/PoucoTempo.mp3"
import respostaErrada from "../assets/sounds/RespostaErrada.mp3"
import respostaCerta from "../assets/sounds/RespostaCerta.mp3"
import somDeFundo from "../assets/sounds/SomDeFundo.mp3"

const sounds = {

  click: new Audio(ajudaRespostaCerta),

  ajuda: new Audio(ajudaRespostaCerta),

  gameOver: new Audio(gameOver),

  levelUp: new Audio(levelUp),

  poucoTempo: new Audio(poucoTempo),

  errada: new Audio(respostaErrada),

  certa: new Audio(respostaCerta),

  fundo: new Audio(somDeFundo)
}

/* LOOP */
sounds.fundo.loop = true

/* VOLUME */
sounds.fundo.volume = 0.25

sounds.certa.volume = 0.6
sounds.errada.volume = 0.6

sounds.click.volume = 0.4

sounds.levelUp.volume = 0.7

sounds.poucoTempo.volume = 0.5

/* PLAY SOUND */
export function playSound(name) {

  const sound = sounds[name]

  if (!sound) return

  sound.currentTime = 0

  sound.play()
}

/* PLAY MUSIC */
export function playMusic(name) {

  stopMusic()

  const music = sounds[name]

  if (!music) return

  music.play()
}

/* STOP MUSIC */
export function stopMusic() {

  sounds.fundo.pause()
  sounds.fundo.currentTime = 0
}