const apiUrl = "http://localhost:5069/api/Personal";
const apiGrados = "http://localhost:5069/api/Grado";
const apiArmEsp = "http://localhost:5069/api/ArmEsp";

// Variables globales
let grados = [];
let armesp = [];
let modoEdicion = false;
let datosOriginales = null;

// Función para formatear nombre (primera letra mayúscula, resto minúsculas)
function formatearNombre(texto) {
    if (!texto) return '';
    return texto.toLowerCase()
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ')
        .trim();
}

// Función para formatear apellido (todo mayúsculas)
function formatearApellido(texto) {
    if (!texto) return '';
    return texto.toUpperCase().trim();
}

console.log('Personal.js cargado correctamente');

// Función para formatear el nombre del grado
function formatearGrado(gradoId) {
    // Esta función debería ser reemplazada por una llamada a la API que obtenga el nombre del grado
    // Por ahora, devolvemos el ID como string
    return `Grado ${gradoId}`;
}

// Función para formatear el arma/especialidad
function formatearArmEsp(armEspId) {
    // Esta función debería ser reemplazada por una llamada a la API que obtenga el nombre del arma/especialidad
    // Por ahora, devolvemos el ID como string
    return `Arma/Esp ${armEspId}`;
}

// Cargar los datos al iniciar la página
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Cargar datos en paralelo
        await Promise.all([
            cargarGrados(),
            cargarArmEsp(),
            cargarPersonal()
        ]);
        
        // Configurar eventos del modal
        configurarEventosModal();
        
        // Configurar eventos del modal de agregar persona
        configurarModalAgregarPersona();
    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        mostrarNotificacion('error', 'Error', 'No se pudieron cargar los datos iniciales');
    }
});

// Configurar el modal de agregar persona
function configurarModalAgregarPersona() {
    const modal = document.getElementById('agregarPersonaModal');
    if (!modal) return;
    
    // Función para cargar los grados en el select
    const cargarGradosEnSelect = () => {
        const selectGrado = modal.querySelector('#nuevoGrado');
        if (selectGrado && window.grados && Array.isArray(window.grados)) {
            // Limpiar opciones existentes excepto la primera
            selectGrado.innerHTML = '<option value="">Seleccione un grado</option>';
            
            // Ordenar grados por ID
            const gradosOrdenados = [...window.grados].sort((a, b) => a.id - b.id);
            
            // Agregar opciones al select
            gradosOrdenados.forEach(grado => {
                const option = document.createElement('option');
                option.value = grado.id;
                const textoMostrar = grado.descripcion 
                    ? `${grado.descripcion} - ${grado.gradoCompleto}`
                    : grado.gradoCompleto || `Grado ${grado.id}`;
                option.textContent = textoMostrar;
                selectGrado.appendChild(option);
            });
        }
    };
    
    // Función para cargar las armas/especialidades en el select
    const cargarArmasEnSelect = () => {
        const selectArmEsp = modal.querySelector('#nuevoArmEsp');
        if (selectArmEsp && window.armEsp && Array.isArray(window.armEsp)) {
            // Limpiar opciones existentes excepto la primera
            selectArmEsp.innerHTML = '<option value="">Seleccione un arma/especialidad</option>';
            
            // Ordenar armas/especialidades por descripción
            const armEspOrdenadas = [...window.armEsp].sort((a, b) => 
                (a.descripcion || '').localeCompare(b.descripcion || '')
            );
            
            // Agregar opciones al select
            armEspOrdenadas.forEach(arma => {
                const option = document.createElement('option');
                option.value = arma.id;
                
                const abreviatura = arma.descripcion;
                const nombreCompleto = arma.armEspCompleto || '';
                const textoMostrar = abreviatura 
                    ? `${abreviatura} - ${nombreCompleto}`
                    : nombreCompleto || `Arma/Esp ${arma.id}`;
                    
                option.textContent = textoMostrar;
                selectArmEsp.appendChild(option);
            });
        }
    };
    
    // Aplicar formato al perder el foco en el modal de agregar
    const nombreInput = document.getElementById('nuevoNombre');
    const apellidoInput = document.getElementById('nuevoApellido');
    const nombreEditarInput = document.getElementById('nombre');
    const apellidoEditarInput = document.getElementById('apellido');

    // Configurar eventos para el modal de agregar
    if (nombreInput) {
        nombreInput.addEventListener('blur', (e) => {
            e.target.value = formatearNombre(e.target.value);
        });
    }

    if (apellidoInput) {
        apellidoInput.addEventListener('blur', (e) => {
            e.target.value = formatearApellido(e.target.value);
        });
    }

    // Configurar eventos para el modal de editar
    if (nombreEditarInput) {
        nombreEditarInput.addEventListener('blur', (e) => {
            e.target.value = formatearNombre(e.target.value);
        });
    }

    if (apellidoEditarInput) {
        apellidoEditarInput.addEventListener('blur', (e) => {
            e.target.value = formatearApellido(e.target.value);
        });
    }

    // Cargar los datos cuando se muestre el modal
    modal.addEventListener('show.bs.modal', () => {
        cargarGradosEnSelect();
        cargarArmasEnSelect();
        
        // Limpiar y resetear los campos del formulario
        if (form) {
            form.reset();
        }
    });
    
    // Manejar el envío del formulario
    const form = modal.querySelector('#formNuevaPersona');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            // Obtener los valores seleccionados de los selects
            const gradoId = parseInt(formData.get('gradoId'));
            const armEspId = parseInt(formData.get('armEspId'));
            
            // Buscar el grado y arma/especialidad seleccionados
            const gradoSeleccionado = window.grados.find(g => g.id === gradoId);
            const armEspSeleccionada = window.armEsp.find(a => a.id === armEspId);
            
            if (!gradoSeleccionado || !armEspSeleccionada) {
                mostrarNotificacion('error', 'Error', 'No se encontró el grado o arma/especialidad seleccionado');
                return;
            }
            
            const persona = {
                Nombre: formData.get('nombre').trim(),
                Apellido: formData.get('apellido').trim(),
                Dni: formData.get('dni').trim(),
                GradoId: gradoId,
                NombreGrado: gradoSeleccionado.descripcion || '',
                NombreGradoCompleto: gradoSeleccionado.gradoCompleto || '',
                ArmEspId: armEspId,
                NombreArmEsp: armEspSeleccionada.descripcion || '',
                NombreArmEspCompleto: armEspSeleccionada.armEspCompleto || ''
            };
            
            // Validaciones
            if (!persona.Nombre || !persona.Apellido || !persona.Dni || isNaN(persona.GradoId) || isNaN(persona.ArmEspId)) {
                mostrarNotificacion('error', 'Error', 'Todos los campos son obligatorios');
                return;
            }
            
            // Validar formato del nombre (solo letras, espacios y acentos)
            if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(persona.Nombre)) {
                mostrarNotificacion('error', 'Error', 'El nombre solo puede contener letras y espacios');
                return;
            }
            
            // Validar formato del apellido (solo letras, espacios y acentos)
            if (!/^[A-ZÁÉÍÓÚÑ\s]+$/.test(persona.Apellido)) {
                mostrarNotificacion('error', 'Error', 'El apellido solo puede contener letras mayúsculas y espacios');
                return;
            }
            
            if (!/^\d{7,8}$/.test(persona.Dni)) {
                mostrarNotificacion('error', 'Error', 'El DNI debe contener 7 u 8 dígitos');
                return;
            }
            
            // Obtener el botón de envío y guardar su texto original
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            
            try {
                // Mostrar indicador de carga
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
                }
                
                console.log('Enviando datos:', persona); // Debug
                
                // Enviar datos al servidor
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(persona)
                });
                
                let responseData;
                try {
                    // Intentar parsear la respuesta como JSON
                    responseData = await response.json();
                } catch (jsonError) {
                    console.error('Error al parsear la respuesta:', jsonError);
                    throw new Error('La respuesta del servidor no es un JSON válido');
                }
                
                if (!response.ok) {
                    console.error('Error en la respuesta:', {
                        status: response.status,
                        statusText: response.statusText,
                        response: responseData
                    });
                    
                    // Mostrar el mensaje de error del servidor si está disponible
                    const errorMessage = responseData?.message || 
                                        responseData?.title || 
                                        'Error al guardar la persona';
                    
                    // Si hay errores de validación, mostrarlos
                    if (responseData?.errors) {
                        const validationErrors = Object.entries(responseData.errors)
                            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                            .join('\n');
                        throw new Error(`Errores de validación:\n${validationErrors}`);
                    }
                    
                    throw new Error(errorMessage);
                }
                
                // Cerrar el modal
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
                
                // Mostrar mensaje de éxito
                mostrarNotificacion('success', '¡Éxito!', 'La persona se ha guardado correctamente');
                
                // Recargar la tabla
                await cargarPersonal();
                
            } catch (error) {
                console.error('Error al guardar la persona:', error);
                mostrarNotificacion('error', 'Error', error.message || 'Ocurrió un error al guardar la persona');
            } finally {
                // Restaurar el botón
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            }
        });
    }
    
    // Limpiar el formulario cuando se cierre el modal
    modal.addEventListener('hidden.bs.modal', () => {
        if (form) form.reset();
    });
}

// Función para formatear el texto (primera letra mayúscula)
function formatearTexto(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para mostrar notificaciones
function mostrarNotificacion(icono, titulo, mensaje) {
    Swal.fire({
        icon: icono,
        title: titulo,
        text: mensaje,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

// Cargar lista de grados desde la API
async function cargarGrados() {
    try {
        const response = await fetch(apiGrados);
        if (!response.ok) {
            throw new Error(`Error al cargar grados: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos de grados recibidos:', data);
        
        // Almacenar los grados para uso posterior
        window.grados = data;
        
        // Actualizar el select de grados
        const selectGrado = document.getElementById('grado');
        if (selectGrado) {
            // Limpiar opciones existentes excepto la primera
            selectGrado.innerHTML = '<option value="">Seleccionar Grado</option>';
            
            // Ordenar grados por ID para mostrarlos en orden jerárquico
            const gradosOrdenados = [...data].sort((a, b) => a.id - b.id);
            
            // Agregar opciones al select
            gradosOrdenados.forEach(grado => {
                const option = document.createElement('option');
                option.value = grado.id; // Usar id en lugar de id_grado
                // Mostrar abreviatura y nombre completo: "ABREV - Nombre Completo"
                const textoMostrar = grado.descripcion 
                    ? `${grado.descripcion} - ${grado.gradoCompleto}`
                    : grado.gradoCompleto;
                option.textContent = textoMostrar;
                option.dataset.abreviatura = grado.descripcion || ''; // Guardar abreviatura para referencia
                selectGrado.appendChild(option);
            });
        }
        
        return data;
    } catch (error) {
        console.error('Error al cargar los grados:', error);
        mostrarNotificacion('error', 'Error', 'No se pudieron cargar los grados');
        throw error;
    }
}

// Cargar lista de armas/especialidades desde la API
async function cargarArmEsp() {
    try {
        console.log('Cargando armas/especialidades...');
        const response = await fetch(apiArmEsp);
        if (!response.ok) {
            throw new Error(`Error al cargar armas/especialidades: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos de armas/especialidades recibidos:', data);
        
        // Almacenar las armas/especialidades para uso posterior
        window.armEsp = data;
        
        // Actualizar el select de armas/especialidades
        const selectArmEsp = document.getElementById('armesp');
        if (selectArmEsp) {
            // Limpiar opciones existentes excepto la primera
            selectArmEsp.innerHTML = '<option value="">Seleccionar Arma/Especialidad</option>';
            
            // Ordenar armas/especialidades por descripción
            const armEspOrdenadas = [...data].sort((a, b) => 
                a.descripcion.localeCompare(b.descripcion)
            );
            
            console.log('Armas/Especialidades ordenadas:', armEspOrdenadas);
            
            // Agregar opciones al select
            armEspOrdenadas.forEach(armEsp => {
                const option = document.createElement('option');
                option.value = armEsp.id;
                
                // Usar la abreviatura y la descripción completa
                // El backend devuelve: id, descripcion (que es la abreviatura) y armEspCompleto
                const abreviatura = armEsp.descripcion; // La abreviatura está en el campo 'descripcion'
                const nombreCompleto = armEsp.armEspCompleto || ''; // El nombre completo está en 'armEspCompleto'
                
                // Mostrar: "ABREV - Nombre Completo" o solo "Nombre Completo" si no hay abreviatura
                const textoMostrar = abreviatura 
                    ? `${abreviatura} - ${nombreCompleto}`
                    : nombreCompleto;
                    
                option.textContent = textoMostrar;
                
                // Guardar la abreviatura en un data attribute para referencia
                if (abreviatura) {
                    option.dataset.abreviatura = abreviatura;
                }
                
                selectArmEsp.appendChild(option);
            });
            
            console.log('Select de arma/especialidad actualizado');
        }
        
        return data;
    } catch (error) {
        console.error('Error al cargar las armas/especialidades:', error);
        mostrarNotificacion('error', 'Error', 'No se pudieron cargar las armas/especialidades');
        throw error;
    }
}

// Configurar eventos del formulario del modal
function configurarEventosModal() {
    const form = document.getElementById('formPersonal');
    const modal = new bootstrap.Modal(document.getElementById('personalModal'));
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    let datosOriginales = null;
    
    // Configurar botón de cancelar edición
    if (btnCancelarEdicion) {
        btnCancelarEdicion.addEventListener('click', () => {
            // Cerrar el modal directamente sin restaurar datos
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('personalModal'));
            if (modalInstance) {
                modalInstance.hide();
            } else {
                // Si no hay instancia, usar la API de Bootstrap
                const modalElement = document.getElementById('personalModal');
                const bsModal = new bootstrap.Modal(modalElement);
                bsModal.hide();
            }
            
            // Limpiar el formulario
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
        });
    }

    const selectGrado = document.getElementById('grado');
    const selectArmEsp = document.getElementById('armesp');

    // Actualizar campos de texto completo al seleccionar una opción
    // Los selects ya muestran el texto completo directamente, no se necesita actualizar elementos adicionales

    // Manejar envío del formulario
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!form.checkValidity()) {
                e.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            // Obtener referencia al botón guardar
            const btnGuardar = document.getElementById('btnGuardar');
            const originalText = btnGuardar.innerHTML;
            
            try {
                // Mostrar estado de carga
                btnGuardar.disabled = true;
                btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Guardando...';
                
                // Obtener los valores del formulario
                const formData = new FormData(form);
                const id = formData.get('id') ? parseInt(formData.get('id')) : 0;
                const gradoId = formData.get('gradoId') ? parseInt(formData.get('gradoId')) : null;
                const armEspId = formData.get('armEspId') ? parseInt(formData.get('armEspId')) : null;
                
                console.log('Valores del formulario - gradoId:', gradoId, 'armEspId:', armEspId);
                
                const personaData = {
                    id: id,
                    nombre: formData.get('nombre'),
                    apellido: formData.get('apellido'),
                    dni: formData.get('dni'),
                    gradoId: gradoId,
                    armEspId: armEspId
                };
                
                console.log('Enviando datos:', personaData);
                
                let response;
                
                if (id > 0) {
                    // Actualizar existente
                    response = await fetch(`${apiUrl}/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(personaData)
                    });
                } else {
                    // Crear nuevo
                    response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(personaData)
                    });
                }
                
                if (!response.ok) {
                    let errorMessage = 'Error al guardar los datos';
                    try {
                        const errorData = await response.json();
                        console.error('Error del servidor:', errorData);
                        errorMessage = errorData.message || errorMessage;
                        if (errorData.errors) {
                            errorMessage += ' ' + Object.values(errorData.errors).join(' ');
                        }
                    } catch (e) {
                        console.error('Error al procesar la respuesta de error:', e);
                        errorMessage = `Error ${response.status}: ${response.statusText}`;
                    }
                    throw new Error(errorMessage);
                }
                
                // Mostrar notificación de éxito
                mostrarNotificacion('success', '¡Éxito!', 'Los datos se guardaron correctamente');
                
                // Cerrar el modal
                const modalElement = document.getElementById('personalModal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    const bsModal = new bootstrap.Modal(modalElement);
                    bsModal.hide();
                }
                
                // Limpiar y actualizar la tabla
                form.reset();
                form.classList.remove('was-validated');
                await cargarPersonal();
                
            } catch (error) {
                console.error('Error al guardar:', error);
                mostrarNotificacion('error', 'Error', error.message || 'Ocurrió un error al guardar los datos');
            } finally {
                btnGuardar.disabled = false;
                btnGuardar.innerHTML = originalText;
            }
        });
    }
}

// Función para eliminar una persona
async function eliminarPersona(id, row) {
    console.log('Intentando eliminar persona con ID:', id);
    
    // Si no se proporcionó la fila, intentar encontrarla
    if (!row && id) {
        row = document.querySelector(`tr[data-id="${id}"]`);
    }
    
    try {
        // Mostrar diálogo de confirmación
        const result = await Swal.fire({
            title: '¿Está seguro que desea eliminar este registro?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        // Si el usuario confirma la eliminación
        if (result.isConfirmed) {
            // Mostrar indicador de carga
            const loadingSwal = Swal.fire({
                title: 'Eliminando...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                // Realizar la petición DELETE al backend
                const response = await fetch(`${apiUrl}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Cerrar el diálogo de carga
                await loadingSwal.close();

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Error al eliminar el registro');
                }

                // Eliminar la fila de la tabla si existe
                if (row && row.nodeType === 1) {
                    // Agregar animación de desvanecimiento
                    row.style.transition = 'opacity 0.3s ease';
                    row.style.opacity = '0.5';
                    
                    setTimeout(() => {
                        row.remove();
                        
                        // Verificar si la tabla quedó vacía
                        const tableBody = document.getElementById('personal-table');
                        if (tableBody && tableBody.rows.length === 0) {
                            tableBody.innerHTML = `
                                <tr>
                                    <td colspan="5" class="text-center py-4">
                                        <i class="bi bi-people-slash fs-1 text-muted d-block mb-2"></i>
                                        <p class="mb-0">No hay personal registrado</p>
                                        <button class="btn btn-primary mt-3" id="btnAgregarPersonal">
                                            <i class="bi bi-plus-circle me-1"></i> Agregar Personal
                                        </button>
                                    </td>
                                </tr>`;
                            
                            // Configurar evento para el botón de agregar
                            document.getElementById('btnAgregarPersonal')?.addEventListener('click', () => {
                                mostrarDatosEnModal({}, true);
                            });
                        }
                    }, 300);
                }
                
                // Mostrar notificación de éxito
                await Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El registro ha sido eliminado correctamente',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                });

            } catch (error) {
                console.error('Error al eliminar el registro:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Ocurrió un error al intentar eliminar el registro',
                    confirmButtonText: 'Entendido'
                });
            }
        }
    } catch (error) {
        console.error('Error en el proceso de eliminación:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error inesperado al intentar eliminar el registro',
            confirmButtonText: 'Entendido'
        });
    }
}

// Función para cargar la lista de personal
async function cargarPersonal() {
    const tableBody = document.getElementById('personal-table');
    if (!tableBody) return;

    try {
        // Mostrar indicador de carga
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 mb-0">Cargando personal...</p>
                </td>
            </tr>`;

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error('Error al cargar el personal');
        }

        const data = await response.json();
        console.log('Datos recibidos de la API:', JSON.stringify(data, null, 2));
        
        // Verificar la estructura de la primera persona (si existe)
        if (data.length > 0) {
            console.log('Estructura de la primera persona:', {
                id: data[0].id,
                nombre: data[0].nombre,
                apellido: data[0].apellido,
                dni: data[0].dni,
                gradoId: data[0].gradoId,
                nombreGrado: data[0].nombreGrado,
                nombreGradoCompleto: data[0].nombreGradoCompleto,
                armEspId: data[0].armEspId,
                nombreArmEsp: data[0].nombreArmEsp,
                nombreArmEspCompleto: data[0].nombreArmEspCompleto
            });
        }

        // Limpiar la tabla
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="bi bi-people-slash fs-1 text-muted d-block mb-2"></i>
                        <p class="mb-0">No se encontró personal registrado</p>
                        <button class="btn btn-primary mt-3" id="btnAgregarPersonal">
                            <i class="bi bi-plus-circle me-1"></i> Agregar Personal
                        </button>
                    </td>
                </tr>`;
                
            // Configurar evento para el botón de agregar
            document.getElementById('btnAgregarPersonal')?.addEventListener('click', () => {
                mostrarDatosEnModal({}, true);
            });
            
            return;
        }

        // Llenar la tabla con los datos
        data.forEach(persona => {
            const row = document.createElement('tr');
            row.className = 'align-middle';
            
            // Almacenar datos en atributos para fácil acceso
            row.dataset.id = persona.id;
            row.dataset.nombre = persona.nombre || '';
            row.dataset.apellido = persona.apellido || '';
            row.dataset.dni = persona.dni || '';
            row.dataset.gradoId = persona.gradoId || '';
            row.dataset.armEspId = persona.armEspId || '';
            
            // Solo mostrar abreviaturas en la tabla
            row.innerHTML = `
                <td>${persona.nombreGrado || 'Sin asignar'}</td>
                <td>${formatearTexto(persona.apellido) || '-'}</td>
                <td>${formatearTexto(persona.nombre) || '-'}</td>
                <td>${persona.nombreArmEsp || 'Sin asignar'}</td>
                <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-info btn-sm flex-grow-0 btn-ver-detalles" 
                                data-id="${persona.id}"
                                title="Ver detalles">
                            <i class="bi bi-eye"></i> <span class="d-none d-md-inline">Detalle</span>
                        </button>
                        <button class="btn btn-warning btn-sm flex-grow-0 btn-editar-persona"
                                data-id="${persona.id}"
                                title="Editar">
                            <i class="bi bi-pencil"></i> <span class="d-none d-md-inline">Editar</span>
                        </button>
                        <button class="btn btn-danger btn-sm flex-grow-0 btn-eliminar" 
                                data-id="${persona.id}"
                                title="Eliminar">
                            <i class="bi bi-trash"></i> <span class="d-none d-md-inline">Eliminar</span>
                        </button>
                    </div>
                </td>`;
            
            tableBody.appendChild(row);
        });
        
        // Configurar eventos de los botones
        configurarEventosTabla();

    } catch (error) {
        console.error('Error en cargarPersonal:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle-fill d-block fs-1 mb-2"></i>
                    <p class="mb-0">Error al cargar el personal. Por favor, intente nuevamente.</p>
                    <button class="btn btn-outline-danger mt-3" onclick="cargarPersonal()">
                        <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
                    </button>
                </td>
            </tr>`;
    }
}

// Configurar eventos de la tabla
function configurarEventosTabla() {
    // Evento para ver detalles
    document.querySelectorAll('.btn-ver-detalles').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const persona = {
                id: parseInt(row.dataset.id),
                nombre: row.dataset.nombre,
                apellido: row.dataset.apellido,
                dni: row.dataset.dni,
                gradoId: parseInt(row.dataset.gradoId) || null,
                armEspId: parseInt(row.dataset.armEspId) || null
            };
            mostrarDatosEnModal(persona, false);
        });
    });
    
    // Evento para eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('button').dataset.id);
            eliminarPersona(id, e.target.closest('tr'));
        });
    });
}

// Función para mostrar los detalles de una persona en el modal
function mostrarDetallesPersona(persona) {
    try {
        console.log('Mostrando detalles de la persona:', persona); 
        
        // Actualizar los elementos del modal con los datos de la persona
        document.getElementById('detalleGrado').textContent = persona.nombreGrado || '-';
        document.getElementById('detalleGradoCompleto').textContent = persona.nombreGradoCompleto || '';
        document.getElementById('detalleApellido').textContent = formatearTexto(persona.apellido) || '-';
        document.getElementById('detalleNombre').textContent = formatearTexto(persona.nombre) || '-';
        document.getElementById('detalleDni').textContent = persona.dni || '-';
        document.getElementById('detalleArmEsp').textContent = persona.nombreArmEsp || '-';
        document.getElementById('detalleArmEspCompleto').textContent = persona.nombreArmEspCompleto || '';
        
        // Configurar el botón de editar para que apunte al ID correcto
        const btnEditar = document.getElementById('btnEditarDesdeModal');
        if (btnEditar) {
            btnEditar.href = `editar.html?id=${persona.id}`;
            
            // Si no hay ID, deshabilitar el botón de editar
            if (!persona.id) {
                btnEditar.classList.add('disabled');
                btnEditar.setAttribute('aria-disabled', 'true');
            } else {
                btnEditar.classList.remove('disabled');
                btnEditar.removeAttribute('aria-disabled');
            }
        }
        
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('detallesPersonalModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error al mostrar los detalles de la persona:', error);
        mostrarNotificacion('error', 'Error', 'No se pudieron cargar los detalles del personal');
    }
}

// Función para mostrar los datos en el modal
function mostrarDatosEnModal(persona, editar = false) {
    console.log('Datos de la persona en mostrarDatosEnModal:', persona);
    const modal = new bootstrap.Modal(document.getElementById('personalModal'));
    const form = document.getElementById('formPersonal');
    const titulo = document.getElementById('modalTitulo');
    
    // Función para cargar los datos completos de la persona
    const cargarDatosCompletos = async (personaId) => {
        try {
            const response = await fetch(`${apiUrl}/${personaId}`);
            if (!response.ok) throw new Error('Error al cargar los datos completos');
            return await response.json();
        } catch (error) {
            console.error('Error al cargar datos completos:', error);
            return persona; // Devolver los datos originales si hay error
        }
    };
    
    // Cargar los datos completos de la persona
    (async () => {
        try {
            // Si no tenemos los datos completos, los cargamos
            if (!persona.nombreGradoCompleto || !persona.nombreArmEspCompleto) {
                const datosCompletos = await cargarDatosCompletos(persona.id);
                if (datosCompletos) {
                    // Actualizar los datos de la persona con la información completa
                    persona = { ...persona, ...datosCompletos };
                    console.log('Datos completos cargados:', persona);
                }
            }
            
            // Guardar datos originales para posible cancelación
            if (editar) {
                datosOriginales = { ...persona };
                titulo.textContent = 'Editar Personal';
            } else {
                datosOriginales = null;
                titulo.textContent = 'Detalles del Personal';
                
                // Mostrar datos en modo solo lectura
                document.getElementById('detalleNombre').textContent = persona.nombre || '-';
                document.getElementById('detalleApellido').textContent = persona.apellido || '-';
                document.getElementById('detalleDni').textContent = persona.dni || '-';
                
                // Mostrar grado con abreviatura y nombre completo
                const gradoCompleto = persona.nombreGradoCompleto ? 
                    `${persona.nombreGrado || ''} ${persona.nombreGradoCompleto ? `- ${persona.nombreGradoCompleto}` : ''}`.trim() : 
                    'Sin asignar';
                document.getElementById('detalleGrado').textContent = gradoCompleto || 'Sin asignar';
                
                // Mostrar arma/especialidad con abreviatura y nombre completo
                const armEspCompleto = persona.nombreArmEspCompleto ? 
                    `${persona.nombreArmEsp || ''} ${persona.nombreArmEspCompleto ? `- ${persona.nombreArmEspCompleto}` : ''}`.trim() : 
                    'Sin asignar';
                document.getElementById('detalleArmEsp').textContent = armEspCompleto || 'Sin asignar';
            }
            
            // Llenar el formulario con los datos para edición
            if (persona) {
                document.getElementById('personaId').value = persona.id || '';
                // Aplicar formato a los valores al cargar en el formulario de edición
                document.getElementById('nombre').value = formatearNombre(persona.nombre || '');
                document.getElementById('apellido').value = formatearApellido(persona.apellido || '');
                document.getElementById('dni').value = persona.dni || '';
                
                // Cargar grados en el select
                const cargarGradosEnSelect = async () => {
                    try {
                        const response = await fetch(apiGrados);
                        if (!response.ok) throw new Error('Error al cargar grados');
                        const grados = await response.json();
                        
                        const selectGrado = document.getElementById('grado');
                        selectGrado.innerHTML = '<option value="">Seleccionar Grado</option>';
                        
                        grados.forEach(grado => {
                            const option = document.createElement('option');
                            option.value = grado.id_grado;
                            option.textContent = grado.gradocompleto; // Mostrar solo el nombre completo
                            option.dataset.abreviatura = grado.abreviatura;
                            selectGrado.appendChild(option);
                        });
                        
                        return grados;
                    } catch (error) {
                        console.error('Error al cargar grados:', error);
                        return [];
                    }
                };
                
                // Cargar armas/especialidades en el select
                const cargarArmEspEnSelect = async () => {
                    try {
                        const response = await fetch(apiArmEsp);
                        if (!response.ok) throw new Error('Error al cargar armas/especialidades');
                        const armEsp = await response.json();
                        
                        const selectArmEsp = document.getElementById('armesp');
                        selectArmEsp.innerHTML = '<option value="">Seleccionar Arma/Especialidad</option>';
                        
                        armEsp.forEach(arm => {
                            const option = document.createElement('option');
                            option.value = arm.id_armesp;
                            option.textContent = arm.armesp_completo; // Mostrar solo el nombre completo
                            option.dataset.abreviatura = arm.abreviatura;
                            selectArmEsp.appendChild(option);
                        });
                        
                        return armEsp;
                    } catch (error) {
                        console.error('Error al cargar armas/especialidades:', error);
                        return [];
                    }
                };
                
                // Cargar grados y armas/especialidades si estamos en modo edición
                if (editar) {
                    try {
                        // Cargar grados y armas/especialidades en paralelo
                        await Promise.all([
                            cargarGrados(),
                            cargarArmEsp()
                        ]);
                        
                        // Establecer los valores seleccionados
                        const selectGrado = document.getElementById('grado');
                        if (selectGrado) {
                            // Esperar un momento para asegurar que el select se haya renderizado
                            setTimeout(() => {
                                // Asegurarse de que el valor se establezca correctamente
                                // Convertir a string para asegurar la coincidencia con los valores de las opciones
                                const gradoIdStr = (persona.gradoId || '').toString();
                                selectGrado.value = gradoIdStr;
                                
                                console.log('Estableciendo gradoId:', gradoIdStr, 'en select. Valor actual:', selectGrado.value);
                                
                                // Verificar si el valor se estableció correctamente
                                if (selectGrado.value !== gradoIdStr) {
                                    console.warn('No se pudo establecer el valor del select. Opciones disponibles:', 
                                        Array.from(selectGrado.options).map(opt => ({
                                            value: opt.value, 
                                            text: opt.text
                                        }))
                                    );
                                }
                                
                                // Disparar evento change para asegurar que los eventos se activen
                                const event = new Event('change', { bubbles: true });
                                selectGrado.dispatchEvent(event);
                            }, 100);
                        }
                        
                        const selectArmEsp = document.getElementById('armesp');
                        if (selectArmEsp && persona.armEspId) {
                            selectArmEsp.value = persona.armEspId;
                        }
                    } catch (error) {
                        console.error('Error al cargar los datos para edición:', error);
                        mostrarNotificacion('error', 'Error', 'No se pudieron cargar los datos necesarios para la edición');
                    }
                }
                
                // Mostrar/ocultar secciones según el modo
                document.getElementById('seccionDetalles').style.display = editar ? 'none' : 'block';
                document.getElementById('seccionFormulario').style.display = editar ? 'block' : 'none';
                
                // Habilitar/deshabilitar campos según el modo
                const inputs = form.querySelectorAll('input, select');
                inputs.forEach(input => {
                    input.disabled = !editar && input.id !== 'personaId';
                    input.readOnly = !editar && input.id !== 'personaId';
                });
                
                // Controlar visibilidad de botones según el modo
                const btnGuardar = document.getElementById('btnGuardar');
                const btnCancelar = document.getElementById('btnCancelarEdicion');
                
                if (btnGuardar) {
                    btnGuardar.style.display = editar ? 'inline-block' : 'none';
                    btnGuardar.disabled = !editar;
                    btnGuardar.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Cambios';
                }
                
                if (btnCancelar) {
                    btnCancelar.style.display = editar ? 'inline-block' : 'none';
                }
            }
            
            // Mostrar el modal
            modal.show();
            
        } catch (error) {
            console.error('Error al cargar los datos completos:', error);
            mostrarNotificacion('error', 'Error', 'No se pudieron cargar los datos completos del personal');
        }
    })();
    
    // Llenar el formulario con los datos para edición
    if (persona) {
        document.getElementById('personaId').value = persona.id || '';
        document.getElementById('nombre').value = persona.nombre || '';
        document.getElementById('apellido').value = persona.apellido || '';
        document.getElementById('dni').value = persona.dni || '';
        
        // Configurar el select de grados para edición
        const selectGrado = document.getElementById('grado');
        if (selectGrado) {
            // Si ya hay opciones en el select, no las sobrescribimos
            if (selectGrado.options.length <= 1) {
                selectGrado.innerHTML = '<option value="">Seleccionar Grado</option>';
                // Si hay un grado seleccionado, lo agregamos al select
                if (persona.gradoId && persona.nombreGrado) {
                    const option = document.createElement('option');
                    option.value = persona.gradoId;
                    option.textContent = persona.nombreGrado;
                    option.setAttribute('data-completo', persona.nombreGradoCompleto || '');
                    selectGrado.appendChild(option);
                }
            }
            selectGrado.value = persona.gradoId || '';
        }
        
        // Configurar el select de armas/especialidades para edición
        const selectArmEsp = document.getElementById('armesp');
        if (selectArmEsp) {
            // Si ya hay opciones en el select, no las sobrescribimos
            if (selectArmEsp.options.length <= 1) {
                selectArmEsp.innerHTML = '<option value="">Seleccionar Arma/Especialidad</option>';
                // Si hay un arma seleccionada, la agregamos al select
                if (persona.armEspId && persona.nombreArmEsp) {
                    const option = document.createElement('option');
                    option.value = persona.armEspId;
                    option.textContent = persona.nombreArmEsp;
                    option.setAttribute('data-completo', persona.nombreArmEspCompleto || '');
                    selectArmEsp.appendChild(option);
                }
            }
            selectArmEsp.value = persona.armEspId || '';
        }
        
        // Mostrar/ocultar secciones según el modo
        document.getElementById('seccionDetalles').style.display = editar ? 'none' : 'block';
        document.getElementById('seccionFormulario').style.display = editar ? 'block' : 'none';
        
        // Habilitar/deshabilitar campos según el modo
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.disabled = !editar && input.id !== 'personaId';
            input.readOnly = !editar && input.id !== 'personaId';
        });
        
        // Cambiar el texto del botón de guardar
        const btnGuardar = document.getElementById('btnGuardar');
        if (btnGuardar) {
            btnGuardar.disabled = !editar;
            btnGuardar.style.display = editar ? 'block' : 'none';
            btnGuardar.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Cambios';
        }
    }
    
    // Mostrar el modal
    modal.show();
}

// Función para mostrar los detalles de una persona en el modal
function mostrarDetallesPersona(persona) {
    try {
        console.log('Mostrando detalles de la persona:', persona);
        mostrarDatosEnModal(persona, false);
    } catch (error) {
        console.error('Error al mostrar los detalles de la persona:', error);
        mostrarNotificacion('error', 'Error', 'No se pudieron cargar los detalles del personal');
    }
}

// Hacer las funciones accesibles globalmente
window.eliminarPersona = eliminarPersona;
window.mostrarDetallesPersona = mostrarDetallesPersona;

// Configurar botón de editar en la tabla
document.addEventListener('click', (e) => {
    const btnEditar = e.target.closest('.btn-editar-persona');
    if (btnEditar) {
        e.preventDefault();
        const personaId = parseInt(btnEditar.dataset.id);
        const persona = Array.from(document.querySelectorAll('#personal-table tr'))
            .map(row => ({
                id: parseInt(row.dataset.id),
                nombre: row.dataset.nombre,
                apellido: row.dataset.apellido,
                dni: row.dataset.dni,
                gradoId: parseInt(row.dataset.gradoId) || null,
                armEspId: parseInt(row.dataset.armEspId) || null
            }))
            .find(p => p.id === personaId);
        
        if (persona) {
            mostrarDatosEnModal(persona, true);
        }
    }
});
