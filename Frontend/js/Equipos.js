// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const ENDPOINTS = {
    EQUIPOS: `${API_BASE_URL}/equipos`,
    INVENTARIO: `${API_BASE_URL}/inventario`
};

// Estado global
let equipos = [];
let inventario = [];

// Elementos del DOM
const tablaEquipos = document.getElementById('tablaEquipos');
const btnAgregar = document.querySelector('.btn-agregar');
const modalInventario = new bootstrap.Modal(document.getElementById('modalInventario'));
const contenidoInventario = document.getElementById('contenidoInventario');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarEquipos();
    configurarEventListeners();
});

// Funciones principales
async function cargarEquipos() {
    try {
        const response = await fetch(ENDPOINTS.EQUIPOS);
        if (!response.ok) throw new Error('Error al cargar equipos');
        
        equipos = await response.json();
        mostrarEquipos(equipos);
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar los equipos', 'error');
    }
}

function mostrarEquipos(equipos) {
    const tbody = document.querySelector('#tablaEquipos tbody');
    tbody.innerHTML = '';

    equipos.forEach((equipo, index) => {
        const fila = document.createElement('tr');
        fila.style.cursor = 'pointer';
        
        fila.innerHTML = `
            <td>${index + 1}</td>
            <td>${equipo.descripcion || '-'}</td>
            <td>
                ${equipo.nne || '-'}
                <i class="fas fa-circle-info text-primary ms-2" 
                   style="cursor:pointer; font-size:1.1em;" 
                   onclick="event.stopPropagation(); mostrarInventario('${equipo.id}')" 
                   title="Ver inventario"></i>
            </td>
            <td>${equipo.numero_serie || '-'}</td>
            <td>
                <span class="badge ${equipo.estado === 'E/S' ? 'bg-success' : 'bg-danger'}">
                    ${equipo.estado || 'N/A'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group" aria-label="Acciones de equipo">
                    <button type="button" class="btn btn-detalle" onclick="verDetalle('${equipo.id}')">
                        <i class="fas fa-eye"></i> Detalle
                    </button>
                    <button type="button" class="btn btn-editar" onclick="editarEquipo('${equipo.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button type="button" class="btn btn-eliminar" onclick="confirmarEliminar('${equipo.id}')">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
}

// Funciones de inventario
async function cargarInventario(equipoId) {
    try {
        const response = await fetch(`${ENDPOINTS.INVENTARIO}?equipoId=${equipoId}`);
        if (!response.ok) throw new Error('Error al cargar inventario');
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al cargar el inventario', 'error');
        return null;
    }
}

window.mostrarInventario = async function(equipoId) {
    try {
        const inventario = await cargarInventario(equipoId);
        if (!inventario) return;
        
        const equipo = equipos.find(e => e.id === equipoId);
        
        contenidoInventario.innerHTML = `
            <div class="mb-3">
                <h6 class="fw-bold">${equipo.descripcion}</h6>
                <p class="mb-1">NNE: ${equipo.nne || 'N/A'}</p>
                <p class="mb-1">N° de Serie: ${equipo.numero_serie || 'N/A'}</p>
            </div>
            <div class="inventario-details">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Total en stock:</span>
                    <span class="badge bg-primary">${inventario.cantidad_total || 0}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>En servicio:</span>
                    <span class="badge bg-success">${inventario.cantidad_en_servicio || 0}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span>Fuera de servicio:</span>
                    <span class="badge bg-danger">${inventario.cantidad_fuera_servicio || 0}</span>
                </div>
            </div>
        `;
        
        modalInventario.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al mostrar el inventario', 'error');
    }
};

// Funciones CRUD
function abrirFormulario(equipoId = null) {
    // Implementar lógica para abrir el formulario de edición/creación
    const equipo = equipoId ? equipos.find(e => e.id === equipoId) : null;
    // Mostrar el modal con el formulario correspondiente
    console.log('Abrir formulario para:', equipo || 'nuevo equipo');
}

async function guardarEquipo(equipoData) {
    try {
        const url = equipoData.id ? 
            `${ENDPOINTS.EQUIPOS}/${equipoData.id}` : 
            ENDPOINTS.EQUIPOS;
            
        const method = equipoData.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(equipoData)
        });
        
        if (!response.ok) throw new Error('Error al guardar el equipo');
        
        mostrarAlerta('Equipo guardado correctamente', 'success');
        cargarEquipos();
        return true;
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al guardar el equipo', 'error');
        return false;
    }
}

async function eliminarEquipo(equipoId) {
    try {
        const response = await fetch(`${ENDPOINTS.EQUIPOS}/${equipoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar el equipo');
        
        mostrarAlerta('Equipo eliminado correctamente', 'success');
        cargarEquipos();
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error al eliminar el equipo', 'error');
    }
}

// Funciones auxiliares
function configurarEventListeners() {
    // Configurar evento de búsqueda
    const inputBusqueda = document.querySelector('.buscador input');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            const equiposFiltrados = equipos.filter(equipo => 
                equipo.descripcion.toLowerCase().includes(termino) ||
                (equipo.nne && equipo.nne.toLowerCase().includes(termino)) ||
                (equipo.numero_serie && equipo.numero_serie.toLowerCase().includes(termino))
            );
            mostrarEquipos(equiposFiltrados);
        });
    }
    
    // Configurar botón de agregar
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => abrirFormulario());
    }
}

function mostrarAlerta(mensaje, tipo = 'info') {
    // Implementar lógica para mostrar alertas (puede ser con SweetAlert2 o similar)
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    // Ejemplo con SweetAlert2:
    // Swal.fire({
    //     icon: tipo,
    //     title: mensaje,
    //     showConfirmButton: false,
    //     timer: 3000
    // });
}

// Funciones globales (accesibles desde el HTML)
window.verDetalle = function(equipoId) {
    // Implementar lógica para ver detalles completos
    window.location.href = `detalles.html?equipoId=${equipoId}`;
};

window.editarEquipo = function(equipoId) {
    abrirFormulario(equipoId);
};

window.confirmarEliminar = function(equipoId) {
    // Implementar confirmación antes de eliminar
    if (confirm('¿Está seguro de que desea eliminar este equipo?')) {
        eliminarEquipo(equipoId);
    }
};