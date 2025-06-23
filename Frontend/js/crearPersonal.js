// URLs de la API
const API_URL = 'http://localhost:5069/api/Personal';
const API_GRADOS = 'http://localhost:5069/api/Grado';
const API_ARMESP = 'http://localhost:5069/api/ArmEsp';

// Elementos del DOM
const formNuevaPersona = document.getElementById('formNuevaPersona');
const selectGrado = document.getElementById('grado');
const selectArmEsp = document.getElementById('armesp');

// Función para mostrar alertas
function mostrarAlerta(titulo, mensaje, icono = 'success') {
    return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono,
        confirmButtonText: 'Aceptar'
    });
}

// Función para cargar los grados desde la API
async function cargarGrados() {
    console.log('Iniciando carga de grados...');
    try {
        console.log('Realizando petición a:', API_GRADOS);
        const response = await fetch(API_GRADOS);
        console.log('Respuesta recibida:', response);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta:', errorText);
            throw new Error(`Error al cargar los grados: ${response.status} ${response.statusText}`);
        }
        
        const grados = await response.json();
        console.log('Grados recibidos:', grados);
        
        // Limpiar opciones existentes (excepto la primera opción por defecto)
        while (selectGrado.options.length > 1) {
            selectGrado.remove(1);
        }
        
        // Verificar si hay grados para mostrar
        if (!grados || grados.length === 0) {
            console.warn('No se recibieron grados de la API');
            return;
        }
        
        // Agregar opciones de grados
        grados.forEach(grado => {
            const option = document.createElement('option');
            option.value = grado.id || grado.id_grado; // Usar el nombre de campo correcto
            const displayText = grado.descripcion || grado.abreviatura || `ID: ${grado.id || grado.id_grado}`;
            option.textContent = displayText;
            selectGrado.appendChild(option);
        });
        
        console.log('Grados cargados exitosamente');
    } catch (error) {
        console.error('Error al cargar grados:', error);
        mostrarAlerta('Error', 'No se pudieron cargar los grados. Por favor, intente recargar la página.', 'error');
        throw error;
    }
}

// Función para cargar las armas/especialidades desde la API
async function cargarArmasEspecialidades() {
    console.log('Iniciando carga de armas/especialidades...');
    try {
        console.log('Realizando petición a:', API_ARMESP);
        const response = await fetch(API_ARMESP);
        console.log('Respuesta recibida:', response);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta:', errorText);
            throw new Error(`Error al cargar las armas/especialidades: ${response.status} ${response.statusText}`);
        }
        
        const armasEsp = await response.json();
        console.log('Armas/Especialidades recibidas:', armasEsp);
        
        // Limpiar opciones existentes (excepto la primera opción por defecto)
        while (selectArmEsp.options.length > 1) {
            selectArmEsp.remove(1);
        }
        
        // Verificar si hay armas/especialidades para mostrar
        if (!armasEsp || armasEsp.length === 0) {
            console.warn('No se recibieron armas/especialidades de la API');
            return;
        }
        
        // Agregar opciones de armas/especialidades
        armasEsp.forEach(arma => {
            const option = document.createElement('option');
            option.value = arma.id_armesp || arma.id; // Usar el nombre de campo correcto
            const displayText = arma.abreviatura || arma.descripcion || `ID: ${arma.id_armesp || arma.id}`;
            option.textContent = displayText;
            selectArmEsp.appendChild(option);
        });
        
        console.log('Armas/Especialidades cargadas exitosamente');
    } catch (error) {
        console.error('Error al cargar armas/especialidades:', error);
        mostrarAlerta('Error', 'No se pudieron cargar las armas/especialidades. Por favor, intente recargar la página.', 'error');
        throw error;
    }
}

// Función para validar el formulario
function validarFormulario(formData) {
    // Validar DNI (solo números, entre 7 y 8 dígitos)
    const dni = formData.get('dni');
    if (!/^\d{7,8}$/.test(dni)) {
        mostrarAlerta('Error', 'El DNI debe contener 7 u 8 dígitos numéricos', 'error');
        return false;
    }
    
    // Validar que se haya seleccionado un grado
    if (!formData.get('gradoId')) {
        mostrarAlerta('Error', 'Debe seleccionar un grado', 'error');
        return false;
    }
    
    // Validar que se haya seleccionado un arma/especialidad
    if (!formData.get('armEspId')) {
        mostrarAlerta('Error', 'Debe seleccionar un arma/especialidad', 'error');
        return false;
    }
    
    return true;
}

// Función para enviar los datos al servidor
async function guardarPersona(persona) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: 0, // El ID lo genera la base de datos
                nombre: persona.get('nombre'),
                apellido: persona.get('apellido'),
                dni: persona.get('dni'),
                gradoId: parseInt(persona.get('gradoId')),
                armEspId: parseInt(persona.get('armEspId'))
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar la persona');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al guardar la persona:', error);
        throw error;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM completamente cargado, iniciando carga de datos...');
    
    // Verificar que los elementos del DOM existan
    if (!formNuevaPersona || !selectGrado || !selectArmEsp) {
        console.error('Error: No se encontraron todos los elementos del DOM necesarios');
        console.log('formNuevaPersona:', formNuevaPersona);
        console.log('selectGrado:', selectGrado);
        console.log('selectArmEsp:', selectArmEsp);
        return;
    }
    // Cargar grados y armas/especialidades al cargar la página
    Promise.all([
        cargarGrados(),
        cargarArmasEspecialidades()
    ]).catch(error => {
        console.error('Error al cargar datos iniciales:', error);
        mostrarAlerta('Error', 'No se pudieron cargar los datos iniciales', 'error');
    });

    // Manejar el envío del formulario
    formNuevaPersona.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formNuevaPersona);
        
        // Validar el formulario
        if (!validarFormulario(formData)) {
            return;
        }
        
        // Mostrar indicador de carga
        const btnGuardar = formNuevaPersona.querySelector('button[type="submit"]');
        const textoOriginal = btnGuardar.innerHTML;
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        try {
            // Enviar datos al servidor
            await guardarPersona(formData);
            
            // Mostrar mensaje de éxito
            await mostrarAlerta('¡Éxito!', 'La persona se ha guardado correctamente', 'success');
            
            // Redirigir a la lista de personal
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error al guardar la persona:', error);
            mostrarAlerta('Error', error.message || 'Ocurrió un error al guardar la persona', 'error');
        } finally {
            // Restaurar el botón
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = textoOriginal;
        }
    });
});