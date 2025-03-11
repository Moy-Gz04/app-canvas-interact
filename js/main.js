// Seleccionamos el canvas y su contexto 2D
const canvas = document.getElementById("gameCanvas"); // Obtiene el elemento canvas del HTML
const ctx = canvas.getContext("2d"); // Obtiene el contexto 2D para dibujar
// Detecta el clic en el canvas y elimina el asteroide si fue clickeado
canvas.addEventListener("click", handleClick);
canvas.width = 500; // Establece el ancho del canvas
canvas.height = 500; // Establece el alto del canvas

const backgroundImage = new Image();
backgroundImage.src = './img/3.jpg'; // Asegúrate de que la ruta es correcta

backgroundImage.onload = function () {
    console.log("Imagen de fondo cargada correctamente");
};
backgroundImage.onerror = function () {
    console.error("Error al cargar la imagen de fondo");
};


// Lista de asteroides
let asteroids = []; // Array para almacenar los asteroides
let explosions = []; // Array para almacenar las explosiones
let asteroidCount = 0; // Contador de asteroides que han salido de la pantalla
const maxGeneratedAsteroids = 100; // Límite de asteroides que pueden generarse
let generatedAsteroids = 0; // Contador de asteroides generados
const maxAsteroidsInScreen = 5; // Máximo de asteroides simultáneos en pantalla
let removedAsteroids = 0; // Contador de asteroides eliminados manualmente

// Imagen del asteroide
const asteroidImage = new Image(); // Crea un objeto de imagen
asteroidImage.src = "./img/a3.png"; // Asigna la ruta de la imagen del asteroide

//----------------No borrar-------------------------------------------------
// Cuando la imagen se carga, inicia el bucle del juego
asteroidImage.onload = () => {
    console.log("Imagen de asteroide cargada correctamente"); // Mensaje en la consola cuando la imagen está lista
};

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
}


// Maneja errores si la imagen no se carga correctamente
asteroidImage.onerror = () => {
    console.error("Error al cargar la imagen del asteroide"); // Muestra un error en la consola
};

//-------Animacion de erxplosion--------------
function updateExplosions() {
  explosions.forEach((explosion, index) => {
      explosion.radius += 4; // Aumenta el tamaño del destello
      explosion.alpha -= 0.05; // Reduce la opacidad para el desvanecimiento

      // Eliminar la explosión cuando desaparezca
      if (explosion.alpha <= 0 || explosion.radius >= explosion.maxRadius) {
        explosions.splice(index, 1);
    }
  });
}
//------------------------------------

function update() {
    // Mover asteroides hacia arriba
    asteroids.forEach(asteroid => {
        asteroid.y -= asteroid.speed; // Reduce la posición Y para hacer que suban
    });

    // Solo genera un nuevo asteroide si la cantidad en pantalla es menor al límite y no hemos llegado al total de 100
    if (asteroids.length < maxAsteroidsInScreen && generatedAsteroids < maxGeneratedAsteroids) {
        if (Math.random() < 0.02) { // Ajustar la frecuencia con la que aparecen
            let size = 100 + Math.random() * 60; // Genera un tamaño aleatorio entre 10 y 30 píxeles

            asteroids.push({
                x: Math.random() * (canvas.width - size), // Posición aleatoria dentro del canvas
                y: canvas.height, // Aparece en la parte inferior del canvas
                width: size,  // Tamaño aleatorio del asteroide
                height: size, // Tamaño aleatorio del asteroide
                speed: 2 + Math.random() * 3 // Velocidad entre 2 y 5
            });

            generatedAsteroids++; // Incrementar el contador de asteroides generados
        }
    }

    // Eliminar asteroides que salen del canvas y contar cuántos han salido
    asteroids = asteroids.filter(asteroid => {
        if (asteroid.y + asteroid.height > 0) {
            return true; // Mantiene los asteroides dentro del canvas
        } else {
            asteroidCount++; // Incrementa el contador si el asteroide sale del canvas
            return false; // Elimina el asteroide del array
        }
    });
}

//-------------Dibujo---------------------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas

    // 🔹 Dibujar la imagen de fondo siempre
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // 🔹 Dibujar los asteroides si el juego ha comenzado
    if (asteroidImage.complete) {
        asteroids.forEach(asteroid => {
            ctx.drawImage(asteroidImage, asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        });
    }

    // 🔹 Dibujar explosiones
    explosions.forEach(explosion => {
        const gradient = ctx.createRadialGradient(
            explosion.x, explosion.y, explosion.radius * 0.3,
            explosion.x, explosion.y, explosion.radius
        );
        gradient.addColorStop(0, `rgba(255, 69, 0, ${explosion.alpha})`);
        gradient.addColorStop(1, `rgba(255, 140, 0, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // 🔹 Dibujar estadísticas
    ctx.fillStyle = "white";
    ctx.font = "20px Arial"; 
    let removalPercentage = ((removedAsteroids / maxGeneratedAsteroids) * 100).toFixed(2);
    ctx.fillText("% " + removalPercentage + "%", 10, 70);
    ctx.fillText("Eliminados: " + removedAsteroids, 10, 45);
    ctx.fillText("Perdidos: " + asteroidCount, 10, 20);
}


//-----------------------------------------------------------------------
function gameLoop() {
    if (generatedAsteroids >= maxGeneratedAsteroids && asteroids.length === 0) {
        console.log("Se han generado los 100 asteroides, juego finalizado.");

        let nombre = document.getElementById("playerName").value.trim();
        if (nombre !== "") {
            guardarJugador(nombre, removedAsteroids); // 🔹 Guardar puntuación en Firebase
            setTimeout(() => {
                mostrarMensajeFinal(nombre, removedAsteroids); // 🔹 Mostrar modal con los datos correctos
            }, 1000);
        } else {
            console.warn("El nombre del jugador está vacío. No se mostrará el modal.");
        }

        return; // 🔹 Detener el juego
    }

    updateExplosions();
    update();
    draw();
    requestAnimationFrame(gameLoop);
}



// ELIMINACION DESPUES DE CLICK
//------------------------------------------------------------
function handleClick(event) {
  // Obtener coordenadas del clic dentro del canvas
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Filtrar la lista de asteroides eliminando el que fue clickeado
  asteroids = asteroids.filter(asteroid => {
      const isClicked =
          clickX >= asteroid.x &&
          clickX <= asteroid.x + asteroid.width &&
          clickY >= asteroid.y &&
          clickY <= asteroid.y + asteroid.height;

          if (isClicked) {
            removedAsteroids++; // Incrementa el contador de eliminados
        
            // Agregar una explosión en la posición del asteroide eliminado
            explosions.push({
                x: asteroid.x + asteroid.width / 2, // Centro del asteroide
                y: asteroid.y + asteroid.height / 2, // Centro del asteroide
                radius: 5, // Tamaño inicial de la explosión
                maxRadius: 40 + Math.random() * 10, // Tamaño máximo aleatorio
                alpha: 1 // Opacidad inicial
            });
        }

      return !isClicked; // Mantiene los asteroides que NO fueron clickeados
  });
}
//---------------------------------------------

//------------------Iniciar el juego al dar iniciar------------
function startGame() {
  // Obtener el nombre del jugador y validarlo
  let playerName = document.getElementById("playerName").value.trim();
  if (playerName === "") {
      alert("Ingresa tu nombre antes de empezar!");
      return; // Detiene la ejecución si no hay nombre
  }

  // Verificar si el ranking existe antes de aplicar la clase
  let rankingCard = document.getElementById("scoreCard");
  if (rankingCard) {
      rankingCard.classList.add("activerank"); // Aplica la clase correcta al ranking
  } else {
      console.error("Error: No se encontró el elemento #scoreCard");
  }

  // Ocultar el campo de ingreso de nombre y el botón de iniciar
  document.getElementById("startGame").style.display = "none"; 
  document.getElementById("player").style.display = "none"; 

  // Iniciar el juego
  if (!backgroundImage.complete || backgroundImage.naturalWidth === 0) {
    console.warn("⏳ Esperando a que la imagen de fondo cargue antes de iniciar el juego.");
    return;
}

console.log("🚀 Iniciando juego...");
gameLoop();
}

function mostrarMensajeFinal(nombre, puntuacion) {
    let modal = document.getElementById("gameOverModal");
    let modalContent = document.querySelector(".modal-content");
    let mensaje = document.getElementById("gameOverMessage");
    let botonReiniciar = document.getElementById("restartButton");

    console.log("Mostrando modal con:", nombre, puntuacion);

    // 🔹 Asegurar que el mensaje se asigna correctamente
    mensaje.innerHTML = `🎉 ¡Felicidades, <b>${nombre}</b>! <br>🔥 Obtuviste <b>${puntuacion} puntos</b>.`;

    // 🔥 Asegurar que el modal está visible y aplicando animación correctamente
    modal.style.display = "flex";
    modal.style.opacity = "1";
    modal.style.visibility = "visible";

    setTimeout(() => {
        modal.classList.add("show");
        modalContent.classList.add("show");
    }, 100);

    // 🔹 Evento para reiniciar el juego
    botonReiniciar.onclick = function () {
        obtenerRanking();
        setTimeout(() => {
            location.reload();
        }, 1000);
    };
}

window.onload = function () {
    drawBackground(); // 🔹 Dibujar el fondo inmediatamente al cargar la página
};

// Función para generar estrellas en el body
function createStars() {
    const numStars = 100; // Cantidad de estrellas
    const starsContainer = document.getElementById("stars");

    for (let i = 0; i < numStars; i++) {
        let star = document.createElement("div");
        star.classList.add("star");

        // Posición aleatoria
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = Math.random() * 100 + "vh";

        // Tamaño aleatorio
        let size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Velocidad de parpadeo diferente para cada estrella
        let duration = Math.random() * 3 + 1;
        star.style.animationDuration = `${duration}s`;

        starsContainer.appendChild(star);
    }
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", createStars);





//---------------------------------
