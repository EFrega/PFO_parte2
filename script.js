const cardContainer = document.getElementById('card-container');
const searchInput = document.getElementById('search');
const loadMoreButton = document.getElementById('load-more');

let launches = [];
let filteredLaunches = [];
let page = 1;
const limit = 5;
let isLoading = false;

// Función para obtener los lanzamientos de la API de SpaceX
async function fetchLaunches() {
    if (isLoading) return; // Evitar múltiples peticiones a la vez

    isLoading = true;
    loadMoreButton.textContent = 'Cargando...';  // Cambiar texto del botón mientras se cargan los datos

    try {
        const response = await fetch(`https://api.spacexdata.com/v4/launches/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: {},
                options: { limit, page }
            })
        });
        const data = await response.json();
        const newLaunches = data.docs;
        launches = [...launches, ...newLaunches]; // Agregar los lanzamientos nuevos al listado existente
        filteredLaunches = launches;  // Al cargar nuevos datos, los resultados filtrados son todos los lanzamientos

        renderCards();
        loadMoreButton.textContent = 'Cargar más'; // Restaurar el texto del botón
    } catch (error) {
        console.error("Error al cargar los datos: ", error);
        loadMoreButton.textContent = 'Cargar más'; // En caso de error, restaurar el texto del botón
    } finally {
        isLoading = false; // Terminar el estado de carga
    }
}

// Función para renderizar las tarjetas
function renderCards() {
    cardContainer.innerHTML = ''; // Limpiar las tarjetas actuales

    if (filteredLaunches.length === 0) {
        const noResults = document.createElement('p');
        noResults.textContent = 'No se encontraron lanzamientos que coincidan con la búsqueda.';
        cardContainer.appendChild(noResults);
    } else {
        filteredLaunches.forEach(launch => {
            const card = document.createElement('div');
            card.classList.add('card');
            
            // Imagen (usamos el patch de imagen si está disponible)
            const imgUrl = launch.links.patch.small || 'https://via.placeholder.com/280x160';
            const img = document.createElement('img');
            img.src = imgUrl;

            // Nombre del lanzamiento
            const title = document.createElement('h2');
            title.textContent = launch.name || 'Sin nombre';

            // Descripción
            const description = document.createElement('p');
            description.textContent = launch.details || 'Sin descripción disponible';

            // Fecha del lanzamiento (en formato legible)
            const launchDate = document.createElement('p');
            launchDate.textContent = `Fecha: ${new Date(launch.date_utc).toLocaleDateString('es-ES')}`;

            card.appendChild(img);
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(launchDate);
            cardContainer.appendChild(card);
        });
    }
}

// Función para manejar la búsqueda
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    filteredLaunches = launches.filter(launch =>
        launch.name.toLowerCase().includes(query) || 
        (launch.details && launch.details.toLowerCase().includes(query))
    );
    renderCards();  // Volver a renderizar las tarjetas con los resultados filtrados
});

// Función para cargar más lanzamientos
loadMoreButton.addEventListener('click', () => {
    page++;
    fetchLaunches();
});

// Cargar los lanzamientos al cargar la página
fetchLaunches();
