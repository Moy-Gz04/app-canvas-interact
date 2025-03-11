// Seleccionamos el canvas y su contexto 2D
const canvas = document.getElementById("gameCanvas"); // Obtiene el elemento canvas del HTML
const ctx = canvas.getContext("2d"); // Obtiene el contexto 2D para dibujar
// Detecta el clic en el canvas y elimina el asteroide si fue clickeado
canvas.addEventListener("click", handleClick);
canvas.width = 500; // Establece el ancho del canvas
canvas.height = 500; // Establece el alto del canvas

const backgroundImage = new Image();
backgroundImage.src = './img/3.jpg'; // Asegúrate de que la ruta es correcta

//imagen eart
const planetImage = new Image();
planetImage.src = "./img/a4.png"; // Asegúrate de colocar la ruta correcta de la imagen

//imagen saturno
const specialPlanetImage = new Image();
specialPlanetImage.src = "./img/a5.png"; // Asegúrate de colocar la ruta correcta

backgroundImage.onload = function () {
    console.log("Imagen de fondo cargada correctamente");
};
backgroundImage.onerror = function () {
    console.error("Error al cargar la imagen de fondo");
};


// Lista de asteroides
let specialPlanets = [];
let planets = [];
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
    // Mover asteroides, planetas y planetas especiales hacia arriba
    asteroids.forEach(asteroid => asteroid.y -= asteroid.speed);
    planets.forEach(planet => planet.y -= planet.speed);
    specialPlanets.forEach(specialPlanet => specialPlanet.y -= specialPlanet.speed);

    // Generar nuevos asteroides si no hemos alcanzado el límite
    if (asteroids.length < maxAsteroidsInScreen && generatedAsteroids < maxGeneratedAsteroids) {
        if (Math.random() < 0.02) {
            let size = 80 + Math.random() * 80;
            asteroids.push({
                x: Math.random() * (canvas.width - size),
                y: canvas.height,
                width: size,
                height: size,
                speed: 2 + Math.random() * 3
            });
            generatedAsteroids++;

            // Generar planetas después del asteroide 50, cada 5 asteroides
            if (generatedAsteroids > 50 && generatedAsteroids % 5 === 0) {
                let planetSize = 100 + Math.random() * 50;
                planets.push({
                    x: Math.random() * (canvas.width - planetSize),
                    y: canvas.height,
                    width: planetSize,
                    height: planetSize,
                    speed: 1.5 + Math.random() * 2
                });
            }

            // Generar planetas especiales después del asteroide 50, cada 10 asteroides
            if (generatedAsteroids > 50 && generatedAsteroids % 10 === 0) {
                let specialPlanetSize = 120 + Math.random() * 50;
                specialPlanets.push({
                    x: Math.random() * (canvas.width - specialPlanetSize),
                    y: canvas.height,
                    width: specialPlanetSize,
                    height: specialPlanetSize,
                    speed: 1.5 + Math.random() * 2
                });
            }
        }
    }

    // Eliminar asteroides que salen de la pantalla
    asteroids = asteroids.filter(asteroid => {
        if (asteroid.y + asteroid.height > 0) return true;
        asteroidCount++;
        return false;
    });

    // Eliminar planetas que salen de la pantalla
    planets = planets.filter(planet => planet.y + planet.height > 0);
    specialPlanets = specialPlanets.filter(specialPlanet => specialPlanet.y + specialPlanet.height > 0);
}


//-------------Dibujo---------------------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar fondo
    if (backgroundImage.complete) ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Dibujar asteroides
    if (asteroidImage.complete) {
        asteroids.forEach(asteroid => {
            ctx.drawImage(asteroidImage, asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        });
    }

    // Dibujar planetas normales
    if (planetImage.complete) {
        planets.forEach(planet => {
            ctx.drawImage(planetImage, planet.x, planet.y, planet.width, planet.height);
        });
    }

    // Dibujar planetas especiales
    if (specialPlanetImage.complete) {
        specialPlanets.forEach(specialPlanet => {
            ctx.drawImage(specialPlanetImage, specialPlanet.x, specialPlanet.y, specialPlanet.width, specialPlanet.height);
        });
    }

    // Dibujar explosiones
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

    // Dibujar estadísticas
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
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Verificar si se hizo clic en un asteroide
    asteroids = asteroids.filter(asteroid => {
        const isClicked =
            clickX >= asteroid.x &&
            clickX <= asteroid.x + asteroid.width &&
            clickY >= asteroid.y &&
            clickY <= asteroid.y + asteroid.height;

        if (isClicked) {
            removedAsteroids++;
            explosions.push({
                x: asteroid.x + asteroid.width / 2,
                y: asteroid.y + asteroid.height / 2,
                radius: 5,
                maxRadius: 40 + Math.random() * 10,
                alpha: 1
            });
        }
        return !isClicked;
    });

    // Verificar si se hizo clic en un planeta normal (termina el juego con recarga)
    planets.forEach(planet => {
        const isClicked =
            clickX >= planet.x &&
            clickX <= planet.x + planet.width &&
            clickY >= planet.y &&
            clickY <= planet.y + planet.height;
    
        if (isClicked) {
            let nombre = document.getElementById("playerName").value.trim();
            if (nombre !== "") {
                guardarJugador(nombre, removedAsteroids); // 🔹 Guardar puntuación en Firebase
            }
            mostrarMensajeFinal(nombre, removedAsteroids);
        }
    });
    

    // Verificar si se hizo clic en un planeta especial (muestra puntuación)
    specialPlanets.forEach(specialPlanet => {
        const isClicked =
            clickX >= specialPlanet.x &&
            clickX <= specialPlanet.x + specialPlanet.width &&
            clickY >= specialPlanet.y &&
            clickY <= specialPlanet.y + specialPlanet.height;

        if (isClicked) {
            mostrarMensajeFinal("Jugador", removedAsteroids);
        }
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
        let duration = Math.random() * 12 + 1;
        star.style.animationDuration = `${duration}s`;

        starsContainer.appendChild(star);
    }
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", createStars);


//---------- Ventana de Reglas-----------------------
document.addEventListener("DOMContentLoaded", () => {
    const rulesIcon = document.getElementById("rulesIcon");
    const rulesContainer = document.getElementById("rulesContainer");

    if (!rulesIcon) {
        console.error("❌ Error: El icono de reglas no se encontró en el DOM.");
        return;
    }
    if (!rulesContainer) {
        console.error("❌ Error: El contenedor de reglas no se encontró en el DOM.");
        return;
    }

    rulesIcon.addEventListener("click", (event) => {
        event.stopPropagation(); // 🚨 Evita que el clic se propague y cierre el contenedor inmediatamente
        console.log("📜 Icono de reglas clickeado");

        if (rulesContainer.style.display === "none" || rulesContainer.style.display === "") {
            rulesContainer.style.display = "block"; // Asegura que sea visible
            rulesContainer.style.opacity = "1";
            rulesContainer.style.visibility = "visible";
            console.log("✅ Mostrando reglas");
        } else {
            rulesContainer.style.display = "none";
            rulesContainer.style.opacity = "0";
            rulesContainer.style.visibility = "hidden";
            console.log("❌ Ocultando reglas");
        }
    });

    // Asegurar que el clic en rulesContainer no lo oculte inmediatamente
    rulesContainer.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    // Cerrar las reglas si el usuario hace clic fuera del cuadro
    document.addEventListener("click", (event) => {
        if (event.target !== rulesIcon && !rulesContainer.contains(event.target)) {
            console.log("🔒 Ocultando reglas");
            rulesContainer.style.display = "none";
            rulesContainer.style.opacity = "0";
            rulesContainer.style.visibility = "hidden";
        }
    });

    // Asegurar que las reglas están ocultas al inicio
    rulesContainer.style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
    let menu = document.getElementById("menu");

    if (menu) {
        // 🔹 Forzamos el width y height con el método más fuerte posible
        menu.style.setProperty("width", "120px", "important");
        menu.style.setProperty("max-width", "120px", "important");
        menu.style.setProperty("height", "80px", "important");
        menu.style.setProperty("max-height", "80px", "important");

        // 🔹 Ajustar los elementos internos
        let playerName = document.getElementById("playerName");
        let startGame = document.getElementById("startGame");

        if (playerName) {
            playerName.style.setProperty("width", "90%", "important");
            playerName.style.setProperty("font-size", "8px", "important");
            playerName.style.setProperty("height", "14px", "important");
        }

        if (startGame) {
            startGame.style.setProperty("width", "90%", "important");
            startGame.style.setProperty("font-size", "8px", "important");
            startGame.style.setProperty("height", "16px", "important");
            startGame.style.setProperty("padding", "3px", "important");
        }

        console.log("✅ Forzando tamaño de #menu a 120px x 80px");
    } else {
        console.error("❌ No se encontró el elemento #menu");
    }
});









