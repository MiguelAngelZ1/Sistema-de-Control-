// URL base de la API
const apiUrl = 'http://localhost:5069/api/ArmEsp';

// Variables globales
let armEspData = [];
let armEspModal = null;
let confirmarEliminarModal = null;
let detallesModal = null;
let armEspAEliminar = null;

// Clase para manejar las notificaciones
class Notificacion {
    static mostrar(icono, titulo, mensaje) {
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

    static error(mensaje) {
        this.mostrar('error', 'Error', mensaje);
    }

    static exito(mensaje) {
        this.mostrar('success', 'Éxito', mensaje);
    }

    static advertencia(mensaje) {
        this.mostrar('warning', 'Advertencia', mensaje);
    }
}

// Clase para manejar las operaciones de la API
class ArmEspService {
    static async obtenerTodos() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Error al obtener los datos');
            return await response.json();
        } catch (error) {
            console.error('Error en obtenerTodos:', error);
            Notificacion.error('No se pudieron cargar los datos');
            return [];
        }
    }

    static async guardar(armEsp) {
        try {
            const metodo = armEsp.id ? 'PUT' : 'POST';
            const url = armEsp.id ? `${apiUrl}/${armEsp.id}` : apiUrl;

            const response = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(armEsp)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al guardar');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en guardar:', error);
            throw error;
        }
    }

    static async eliminar(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar');
            }

            return true;
        } catch (error) {
            console.error('Error en eliminar:', error);
            throw error;
        }
    }
}

// Clase para manejar la interfaz de usuario
class ArmEspUI {
    static inicializar() {
        // Inicializar modales
        armEspModal = new bootstrap.Modal(document.getElementById('armEspModal'));
        confirmarEliminarModal = new bootstrap.Modal(document.getElementById('confirmarEliminarModal'));
        detallesModal = new bootstrap.Modal(document.getElementById('detallesModal'));

        // Configurar eventos
        this.configurarEventos();

        // Cargar datos iniciales
        this.cargarDatos();
    }


    static async cargarDatos() {
        try {
            armEspData = await ArmEspService.obtenerTodos();
            this.actualizarTablas();
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    }

    static actualizarTablas() {
        const cuerpoTablaArmas = document.getElementById('cuerpoTablaArmas');
        const cuerpoTablaEspecialidades = document.getElementById('cuerpoTablaEspecialidades');

        // Filtrar armas y especialidades
        const armas = armEspData.filter(item => item.tipo === 'Arma');
        const especialidades = armEspData.filter(item => item.tipo === 'Especialidad');

        // Actualizar tabla de armas
        cuerpoTablaArmas.innerHTML = armas.map(arma => this.crearFilaTabla(arma)).join('');

        // Actualizar tabla de especialidades
        cuerpoTablaEspecialidades.innerHTML = especialidades.map(especialidad => this.crearFilaTabla(especialidad)).join('');

        // Agregar eventos a los botones
        this.agregarEventosBotones();
    }

    static crearFilaTabla(armEsp) {
        return `
            <tr data-id="${armEsp.id}">
                <td>${armEsp.nombre}</td>
                <td>${armEsp.descripcion || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-ver" data-id="${armEsp.id}" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning btn-editar" data-id="${armEsp.id}" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${armEsp.id}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    static agregarEventosBotones() {
        // Eventos para botones de ver
        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', (e) => this.mostrarDetalles(e));
        });

        // Eventos para botones de editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => this.mostrarFormularioEdicion(e));
        });

        // Eventos para botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => this.confirmarEliminacion(e));
        });
    }

    static mostrarFormulario(armEsp = null) {
        const form = document.getElementById('formArmEsp');
        const titulo = document.getElementById('armEspModalLabel');
        
        if (armEsp) {
            // Modo edición
            titulo.textContent = 'Editar Arma/Especialidad';
            document.getElementById('armEspId').value = armEsp.id || '';
            document.getElementById('tipo').value = armEsp.tipo || '';
            document.getElementById('nombre').value = armEsp.nombre || '';
            document.getElementById('descripcion').value = armEsp.descripcion || '';
        } else {
            // Modo creación
            titulo.textContent = 'Agregar Arma/Especialidad';
            form.reset();
        }

        armEspModal.show();
    }

    static mostrarDetalles(event) {
        const id = event.currentTarget.dataset.id;
        const armEsp = armEspData.find(item => item.id == id);

        if (armEsp) {
            document.getElementById('detalleTipo').textContent = armEsp.tipo || '-';
            document.getElementById('detalleNombre').textContent = armEsp.nombre || '-';
            document.getElementById('detalleDescripcion').textContent = armEsp.descripcion || '-';
            detallesModal.show();
        }
    }

    static confirmarEliminacion(event) {
        const id = event.currentTarget.dataset.id;
        armEspAEliminar = id;
        confirmarEliminarModal.show();
    }

    static async eliminar() {
        if (!armEspAEliminar) return;

        try {
            await ArmEspService.eliminar(armEspAEliminar);
            Notificacion.exito('Elemento eliminado correctamente');
            this.cargarDatos();
        } catch (error) {
            Notificacion.error('Error al eliminar el elemento');
            console.error('Error al eliminar:', error);
        } finally {
            confirmarEliminarModal.hide();
            armEspAEliminar = null;
        }
    }

    static async guardar() {
        const form = document.getElementById('formArmEsp');
        const id = document.getElementById('armEspId').value;
        const tipo = document.getElementById('tipo').value;
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        // Validación
        if (!tipo || !nombre) {
            Notificacion.advertencia('Los campos Tipo y Nombre son obligatorios');
            return;
        }


        const armEsp = {
            id: id ? parseInt(id) : 0,
            tipo,
            nombre,
            descripcion
        };

        try {
            await ArmEspService.guardar(armEsp);
            Notificacion.exito(id ? 'Elemento actualizado correctamente' : 'Elemento creado correctamente');
            armEspModal.hide();
            this.cargarDatos();
        } catch (error) {
            Notificacion.error(error.message || 'Error al guardar');
            console.error('Error al guardar:', error);
        }
    }

    static configurarEventos() {
        // Evento para el botón de guardar en el modal
        document.getElementById('btnGuardarArmEsp').addEventListener('click', () => this.guardar());

        // Evento para el botón de confirmar eliminación
        document.getElementById('confirmarEliminar').addEventListener('click', () => this.eliminar());

        // Evento para el botón de agregar nuevo
        document.querySelector('[data-bs-target="#armEspModal"]')?.addEventListener('click', () => this.mostrarFormulario());

        // Evento para el formulario (evitar envío con Enter)
        document.getElementById('formArmEsp')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardar();
        });
    }

    static mostrarFormularioEdicion(event) {
        const id = event.currentTarget.dataset.id;
        const armEsp = armEspData.find(item => item.id == id);
        if (armEsp) {
            this.mostrarFormulario(armEsp);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ArmEspUI.inicializar();
});