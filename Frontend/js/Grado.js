const apiUrl = "http://localhost:5069/api/grado";
console.log('Grado.js cargado correctamente');

// Cargar los grados al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarGrados();
});

// Función para eliminar un grado
async function Eliminar(idGrado) {
    console.log('Intentando eliminar grado con ID:', idGrado);
    
    // Mostrar diálogo de confirmación
    const confirmacion = confirm('¿Está seguro que desea eliminar este grado?');
    if (!confirmacion) {
        console.log('Eliminación cancelada por el usuario');
        return;
    }

    try {
        console.log('Enviando solicitud DELETE a:', `${apiUrl}/${idGrado}`);
        const response = await fetch(`${apiUrl}/${idGrado}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error en la respuesta:', errorData);
            throw new Error(`Error al eliminar el grado: ${response.status} ${response.statusText}`);
        }

        // Si la eliminación fue exitosa, recargar la tabla
        console.log('Eliminación exitosa, recargando tabla...');
        await cargarGrados();
        alert('Grado eliminado correctamente');
    } catch (error) {
        console.error('Error en la función Eliminar:', error);
        alert(`Error al eliminar el grado: ${error.message}`);
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(icono, titulo, mensaje) {
    return Swal.fire({
        icon: icono,
        title: titulo,
        text: mensaje,
        showConfirmButton: true
    });
}

// Función para eliminar un grado
async function Eliminar(idGrado, button) {
    console.log('Intentando eliminar grado con ID:', idGrado);
    
    try {
        // Mostrar diálogo de confirmación
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Esta acción eliminará el grado y todas sus referencias!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) {
            console.log('Eliminación cancelada por el usuario');
            return;
        }

        // Mostrar carga
        Swal.fire({
            title: 'Eliminando...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`${apiUrl}/${idGrado}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar el grado');
        }

        // Cerrar diálogo de carga
        Swal.close();

        // Eliminar la fila visualmente
        const row = button.closest('tr');
        row.style.transition = 'opacity 0.3s ease-out';
        row.style.opacity = '0';
        
        setTimeout(() => {
            row.remove();
            // Mostrar mensaje de éxito
            mostrarNotificacion('success', '¡Eliminado!', 'El grado ha sido eliminado correctamente');
        }, 300);

    } catch (error) {
        console.error('Error en la función Eliminar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Ocurrió un error al intentar eliminar el grado',
            confirmButtonText: 'Entendido'
        });
    }
}

// Función para guardar un nuevo grado
async function guardarGrado(abreviatura, descripcion) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                descripcion: abreviatura,
                gradoCompleto: descripcion,
                activo: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar el grado');
        }

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('agregarGradoModal'));
        modal.hide();

        // Mostrar mensaje de éxito
        await Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Grado guardado correctamente',
            confirmButtonColor: '#198754',
            timer: 2000,
            timerProgressBar: true
        });

        // Recargar la tabla
        await cargarGrados();
        
        // Limpiar el formulario
        document.getElementById('formAgregarGrado').reset();
        
        return await response.json();
    } catch (error) {
        console.error('Error al guardar el grado:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Ocurrió un error al guardar el grado',
            confirmButtonColor: '#dc3545'
        });
        throw error;
    }
}

// Función para cargar los grados
function cargarGrados() {
    // Mostrar indicador de carga
    const tableBody = document.getElementById("grado-table");
    tableBody.innerHTML = `
        <tr>
            <td colspan="3" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 mb-0">Cargando grados...</p>
            </td>
        </tr>`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los grados');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="3" class="text-center py-4 text-muted">
                            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                            No hay grados registrados
                        </td>
                    </tr>`;
                return;
            }

            tableBody.innerHTML = '';
            data.forEach(grado => {
                const row = document.createElement('tr');
                row.className = 'align-middle';
                row.innerHTML = `
                    <td class="text-center fw-bold">${grado.descripcion || ''}</td>
                    <td>${grado.gradoCompleto || ''}</td>
                    <td class="text-center">
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-danger btn-sm cambio-btn" 
                                    onclick="Eliminar(${grado.id}, this)" 
                                    title="Eliminar">
                                <i class="bi bi-trash"></i> <span class="d-none d-md-inline">Eliminar</span>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al cargar grados:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-4 text-danger">
                        <i class="bi bi-exclamation-triangle-fill d-block mb-2"></i>
                        Error al cargar los grados. Intente recargar la página.
                    </td>
                </tr>`;
            mostrarNotificacion('error', 'Error', 'No se pudieron cargar los grados');
        });
}
