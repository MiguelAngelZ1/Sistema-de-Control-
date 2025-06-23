document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando script...');
    const form = document.getElementById('gradoForm');
    const gradoCompletoInput = document.getElementById('gradoCompleto');
    const abreviaturaInput = document.getElementById('abreviatura');
    
    if (!form || !gradoCompletoInput || !abreviaturaInput) {
        console.error('No se encontraron los elementos necesarios');
        return;
    }

    // Función para formatear el texto (primera letra mayúscula, resto minúsculas)
    function formatearTexto(texto) {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .replace(/\s+/g, ' ') // Reemplaza múltiples espacios por uno solo
            .trim() // Elimina espacios al inicio y final
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    }

    // Validación en tiempo real para Grado Completo
    gradoCompletoInput.addEventListener('input', function(e) {
        // Elimina cualquier carácter que no sea letra o espacio
        this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
    });

    // Formatear al salir del campo
    gradoCompletoInput.addEventListener('blur', function() {
        this.value = formatearTexto(this.value);
    });

    // Validación en tiempo real para Abreviatura
    abreviaturaInput.addEventListener('input', function(e) {
        // Convierte a mayúsculas y elimina caracteres no alfabéticos
        this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '');
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Formulario enviado');
        
        // Validar que los campos no estén vacíos
        let abreviatura = abreviaturaInput.value.trim();
        let gradoCompleto = gradoCompletoInput.value.trim();
        
        // Aplicar formato final
        gradoCompleto = formatearTexto(gradoCompleto);
        gradoCompletoInput.value = gradoCompleto;
        
        abreviatura = abreviatura.toUpperCase();
        abreviaturaInput.value = abreviatura;
        
        if (!abreviatura || !gradoCompleto) {
            console.error('Campos vacíos detectados');
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor complete todos los campos',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const grado = {
            descripcion: abreviatura,
            gradoCompleto: gradoCompleto
        };

        console.log('Datos a enviar:', grado);

        try {
            console.log('Enviando datos a la API...');
            const response = await fetch('http://localhost:5069/api/grado', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(grado)
            });

            console.log('Respuesta recibida:', response);

            const data = await response.json();
            console.log('Datos de respuesta:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error al guardar el grado');
            }

            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Grado guardado correctamente',
                confirmButtonText: 'Aceptar'
            });

            console.log('Redirigiendo a index.html...');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error en la petición:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Ocurrió un error al guardar el grado',
                confirmButtonText: 'Aceptar'
            });
        }
    });
});