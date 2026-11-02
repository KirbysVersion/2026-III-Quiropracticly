const STORAGE_KEY = "quiropracticly-datos-v1";
const vacio = { pacientes: [], citas: [], tratamientos: [] };
let datos = cargarDatos();
let pacienteSeleccionado = null;

function cargarDatos() {
  try {
    const guardados = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return guardados && Array.isArray(guardados.pacientes) ? guardados : structuredClone(vacio);
  } catch { return structuredClone(vacio); }
}
function guardarDatos() { localStorage.setItem(STORAGE_KEY, JSON.stringify(datos)); }
function hoyISO() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}
function fechaBonita(fecha) {
  if (!fecha) return "—";
  const [y, m, d] = fecha.split("-");
  return y && m && d ? `${d}/${m}/${y}` : fecha;
}
function escapar(texto = "") {
  return String(texto).replace(/[&<>"']/g, caracter => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caracter]));
}
function pacientePorId(id) { return datos.pacientes.find(p => p.id === Number(id)); }
function siguienteId() { return Math.max(0, ...datos.pacientes.map(x => x.id), ...datos.citas.map(x => x.id), ...datos.tratamientos.map(x => x.id)) + 1; }
function campo(label, name, type = "text", options = {}) {
  const required = options.required ? " required" : "";
  const min = options.min !== undefined ? ` min="${options.min}"` : "";
  const value = options.value ? ` value="${escapar(options.value)}"` : "";
  const placeholder = options.placeholder ? ` placeholder="${escapar(options.placeholder)}"` : "";
  return `<label>${label}<input name="${name}" type="${type}"${required}${min}${value}${placeholder}></label>`;
}
function campoDiagnostico() {
  return `<div class="diagnostico-field"><label>Diagnóstico<input name="diagnostico" type="text" placeholder="Escribe o selecciona zonas de dolor"></label><button type="button" class="map-toggle" aria-expanded="false">⌖ Elegir zonas en el mapa</button><div class="pain-map hidden"><div class="pain-map-heading"><strong>Selecciona las zonas con dolor</strong><span>Puedes elegir más de una.</span></div><svg class="body-map" viewBox="0 0 520 350" role="group" aria-label="Mapa corporal interactivo de zonas de dolor">
    <g class="body-figure" aria-hidden="true"><circle cx="130" cy="45" r="19"/><path d="M119 68h22v15l22 11-8 83-10 28h-30l-10-28-8-83 22-11z"/><path d="M99 96 78 105 61 155l-12 57M163 96l21 9 17 50 12 57M105 185l-8 70 4 69M155 185l8 70-4 69"/><circle cx="390" cy="45" r="19"/><path d="M379 68h22v15l22 11-8 83-10 28h-30l-10-28-8-83 22-11z"/><path d="M359 96 338 105l-17 50-12 57M423 96l21 9 17 50 12 57M365 185l-8 70 4 69M415 185l8 70-4 69"/></g>
    <text class="figure-label" x="130" y="344" text-anchor="middle">FRENTE</text><text class="figure-label" x="390" y="344" text-anchor="middle">ESPALDA</text>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor cervical" aria-label="Dolor cervical"><circle cx="130" cy="78" r="9"/><title>Dolor cervical</title></g>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de hombro" aria-label="Dolor de hombro"><circle cx="107" cy="101" r="9"/><title>Dolor de hombro</title></g><g class="pain-point" role="button" tabindex="0" data-pain="Dolor de hombro" aria-label="Dolor de hombro"><circle cx="153" cy="101" r="9"/><title>Dolor de hombro</title></g>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de codo" aria-label="Dolor de codo"><circle cx="66" cy="158" r="9"/><title>Dolor de codo</title></g><g class="pain-point" role="button" tabindex="0" data-pain="Dolor de codo" aria-label="Dolor de codo"><circle cx="194" cy="158" r="9"/><title>Dolor de codo</title></g>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de muñeca" aria-label="Dolor de muñeca"><circle cx="50" cy="211" r="9"/><title>Dolor de muñeca</title></g><g class="pain-point" role="button" tabindex="0" data-pain="Dolor de muñeca" aria-label="Dolor de muñeca"><circle cx="210" cy="211" r="9"/><title>Dolor de muñeca</title></g>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor dorsal" aria-label="Dolor dorsal"><circle cx="390" cy="132" r="9"/><title>Dolor dorsal</title></g><g class="pain-point" role="button" tabindex="0" data-pain="Dolor lumbar" aria-label="Dolor lumbar"><circle cx="390" cy="178" r="9"/><title>Dolor lumbar</title></g>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de cadera" aria-label="Dolor de cadera"><circle cx="376" cy="200" r="9"/></g><g class="pain-point" role="button" tabindex="0" data-pain="Dolor de cadera" aria-label="Dolor de cadera"><circle cx="404" cy="200" r="9"/></g>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de rodilla" aria-label="Dolor de rodilla"><circle cx="115" cy="255" r="9"/><title>Dolor de rodilla</title></g><g class="pain-point" role="button" tabindex="0" data-pain="Dolor de rodilla" aria-label="Dolor de rodilla"><circle cx="165" cy="255" r="9"/><title>Dolor de rodilla</title></g>
    <g class="pain-point" role="button" tabindex="0" data-pain="Dolor de tobillo" aria-label="Dolor de tobillo"><circle cx="101" cy="322" r="9"/><title>Dolor de tobillo</title></g><g class="pain-point" role="button" tabindex="0" data-pain="Dolor de tobillo" aria-label="Dolor de tobillo"><circle cx="159" cy="322" r="9"/><title>Dolor de tobillo</title></g>
  </svg><p class="pain-map-help">Toca un punto del cuerpo para agregar o quitar esa zona del diagnóstico.</p></div></div>`;
}
function selector(label, name, choices, required = true) {
  return `<label>${label}<select name="${name}"${required ? " required" : ""}>${choices.map(([v, t]) => `<option value="${escapar(v)}">${escapar(t)}</option>`).join("")}</select></label>`;
}
function bloqueFormulario(campos) { return `${campos}<button class="btn" type="submit">Guardar</button>`; }

function actualizarEstadisticas() {
  const ahora = new Date(), mes = String(ahora.getMonth() + 1).padStart(2, "0"), anio = String(ahora.getFullYear());
  const registrosMes = datos.pacientes.filter(p => (p.fechaRegistro || "").startsWith(`${anio}-${mes}`)).length;
  const citasHoy = datos.citas.filter(c => c.fecha === hoyISO() && !["Cancelada", "Completada"].includes(c.estado)).length;
  document.getElementById("totalPacientes").textContent = datos.pacientes.length;
  document.getElementById("pacientesEsteMes").textContent = `+${registrosMes} este mes`;
  document.getElementById("totalCitas").textContent = datos.citas.filter(c => !["Cancelada", "Completada"].includes(c.estado)).length;
  document.getElementById("citasRestantes").textContent = `${citasHoy} restantes hoy`;
  document.getElementById("totalTratamientos").textContent = datos.tratamientos.filter(t => t.estado === "Activo").length;
}
function filaVacia(tbody, columnas, mensaje) { tbody.innerHTML = `<tr><td class="empty" colspan="${columnas}">${mensaje}</td></tr>`; }
function renderPacientes(filtro = "") {
  const tbody = document.getElementById("tablaPacientes");
  const lista = datos.pacientes.filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()));
  if (!lista.length) return filaVacia(tbody, 7, filtro ? "No se encontraron pacientes." : "Aún no hay pacientes registrados.");
  tbody.innerHTML = lista.map(p => `<tr class="patient-row" data-id="${p.id}"><td>${escapar(p.folio)}</td><td>${escapar(p.nombre)}</td><td>${p.edad || "—"}</td><td>${escapar(p.telefono || "—")}</td><td>${escapar(p.diagnostico || "—")}</td><td><span class="status ${p.estado === "Activo" ? "active" : "pending"}">${escapar(p.estado)}</span></td><td class="row-actions"><button class="schedule-btn" data-cita-paciente="${p.id}">Agendar cita</button><button class="edit-btn" data-edit-paciente="${p.id}">Editar</button><button class="delete-btn" data-delete-paciente="${p.id}" aria-label="Eliminar a ${escapar(p.nombre)}">Eliminar</button></td></tr>`).join("");
  tbody.querySelectorAll(".patient-row").forEach(row => row.addEventListener("click", e => { if (!e.target.closest("button")) mostrarFicha(Number(row.dataset.id)); }));
  tbody.querySelectorAll("[data-delete-paciente]").forEach(btn => btn.addEventListener("click", () => eliminarPaciente(Number(btn.dataset.deletePaciente))));
  tbody.querySelectorAll("[data-edit-paciente]").forEach(btn => btn.addEventListener("click", () => editarPaciente(Number(btn.dataset.editPaciente))));
  tbody.querySelectorAll("[data-cita-paciente]").forEach(btn => btn.addEventListener("click", () => abrirFormularioCita(Number(btn.dataset.citaPaciente))));
}
function renderCitas() {
  const tbody = document.getElementById("tablaCitas");
  if (!datos.citas.length) return filaVacia(tbody, 6, "Aún no hay citas registradas.");
  tbody.innerHTML = [...datos.citas].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)).map(c => `<tr><td>${fechaBonita(c.fecha)}</td><td>${escapar(c.hora)}</td><td>${escapar(pacientePorId(c.pacienteId)?.nombre || "—")}</td><td>${escapar(c.tipo)}</td><td><span class="status ${c.estado === "Confirmada" || c.estado === "Completada" ? "active" : "pending"}">${escapar(c.estado)}</span></td><td class="row-actions">${["Cancelada", "Completada"].includes(c.estado) ? `<button class="edit-btn" data-restaurar-cita="${c.id}">${c.estado === "Completada" ? "Deshacer completado" : "Restaurar"} (${escapar(c.estadoAnterior || "Pendiente")})</button>` : `<button class="delete-btn" data-cancelar-cita="${c.id}">Cancelar</button><button class="edit-btn" data-completar-cita="${c.id}">Completar</button>`}<button class="delete-btn" data-delete-cita="${c.id}">Eliminar</button></td></tr>`).join("");
  tbody.querySelectorAll("[data-delete-cita]").forEach(b => b.addEventListener("click", () => { datos.citas = datos.citas.filter(c => c.id !== Number(b.dataset.deleteCita)); actualizarTodo(); }));
  tbody.querySelectorAll("[data-cancelar-cita]").forEach(b => b.addEventListener("click", () => cambiarEstadoCita(Number(b.dataset.cancelarCita), "Cancelada")));
  tbody.querySelectorAll("[data-completar-cita]").forEach(b => b.addEventListener("click", () => cambiarEstadoCita(Number(b.dataset.completarCita), "Completada")));
  tbody.querySelectorAll("[data-restaurar-cita]").forEach(b => b.addEventListener("click", () => restaurarCita(Number(b.dataset.restaurarCita))));
}
function renderTratamientos() {
  const tbody = document.getElementById("tablaTratamientos");
  if (!datos.tratamientos.length) return filaVacia(tbody, 6, "Aún no hay tratamientos registrados.");
  tbody.innerHTML = datos.tratamientos.map(t => `<tr><td>${escapar(pacientePorId(t.pacienteId)?.nombre || "—")}</td><td>${escapar(t.nombre)}</td><td>${fechaBonita(t.fechaInicio)}</td><td>${escapar(t.sesiones || "—")}</td><td><span class="status ${["Activo", "Completado"].includes(t.estado) ? "active" : "pending"}">${escapar(t.estado)}</span></td><td class="row-actions">${t.estado === "Activo" ? `<button class="edit-btn" data-completar-tratamiento="${t.id}">Marcar completado</button>` : ""}<button class="delete-btn" data-delete-tratamiento="${t.id}">Eliminar</button></td></tr>`).join("");
  tbody.querySelectorAll("[data-delete-tratamiento]").forEach(b => b.addEventListener("click", () => { datos.tratamientos = datos.tratamientos.filter(t => t.id !== Number(b.dataset.deleteTratamiento)); actualizarTodo(); }));
  tbody.querySelectorAll("[data-completar-tratamiento]").forEach(b => b.addEventListener("click", () => {
    const tratamiento = datos.tratamientos.find(t => t.id === Number(b.dataset.completarTratamiento));
    if (tratamiento) { tratamiento.estado = "Completado"; actualizarTodo(); }
  }));
}
function mostrarFicha(id) {
  const p = pacientePorId(id); if (!p) return;
  pacienteSeleccionado = id;
  document.getElementById("btnCitaPaciente").disabled = false;
  document.getElementById("nombrePaciente").textContent = p.nombre;
  document.getElementById("folioPaciente").textContent = `Folio ${p.folio}`;
  document.getElementById("avatarPaciente").textContent = p.nombre.trim().charAt(0).toUpperCase();
  document.getElementById("edadPaciente").textContent = p.edad || "—";
  document.getElementById("telefonoPaciente").textContent = p.telefono || "—";
  document.getElementById("diagnosticoPaciente").textContent = p.diagnostico || "—";
  document.getElementById("inicioPaciente").textContent = fechaBonita(p.fechaInicio);
  document.getElementById("estadoPaciente").textContent = p.estado;
  document.getElementById("notasPaciente").textContent = p.notas || "—";
  const registros = [...(p.historial || []), ...datos.citas.filter(c => c.pacienteId === id).map(c => ({ fecha: c.fecha, descripcion: `Cita: ${c.tipo} (${c.estado})` })), ...datos.tratamientos.filter(t => t.pacienteId === id).map(t => ({ fecha: t.fechaInicio, descripcion: `Tratamiento: ${t.nombre} (${t.estado})` }))].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  const historial = document.getElementById("historialPaciente");
  historial.innerHTML = registros.length ? registros.map(r => `<div class="historial-item"><strong>${escapar(r.descripcion)}</strong><span>${fechaBonita(r.fecha)}</span></div>`).join("") : "<p>No hay historial registrado.</p>";
}
function actualizarTodo() { guardarDatos(); actualizarEstadisticas(); renderPacientes(document.getElementById("buscarPaciente").value); renderCitas(); renderTratamientos(); if (pacienteSeleccionado && pacientePorId(pacienteSeleccionado)) mostrarFicha(pacienteSeleccionado); }

const modal = document.getElementById("modal"), form = document.getElementById("formModal");
function abrirModal(titulo, descripcion, campos, guardar, iniciales = {}) {
  document.getElementById("modalTitulo").textContent = titulo;
  document.getElementById("modalDescripcion").textContent = descripcion;
  form.innerHTML = bloqueFormulario(campos);
  Object.entries(iniciales).forEach(([nombre, valor]) => {
    const control = form.elements.namedItem(nombre);
    if (control) control.value = valor ?? "";
  });
  activarMapaDiagnostico();
  form.onsubmit = event => { event.preventDefault(); const valores = Object.fromEntries(new FormData(form)); guardar(valores); cerrarModal(); };
  modal.classList.remove("hidden");
  form.querySelector("input,select")?.focus();
}
function activarMapaDiagnostico() {
  const input = form.elements.namedItem("diagnostico");
  const toggle = form.querySelector(".map-toggle"), panel = form.querySelector(".pain-map");
  if (!input || !toggle || !panel) return;
  const puntos = [...panel.querySelectorAll(".pain-point")];
  const actualizarPuntos = () => {
    const valores = input.value.split(/[,;]/).map(x => x.trim()).filter(Boolean);
    puntos.forEach(p => {
      const activo = valores.includes(p.dataset.pain);
      p.classList.toggle("selected", activo);
      p.setAttribute("aria-pressed", String(activo));
    });
  };
  const alternarPunto = p => {
    const valores = input.value.split(/[,;]/).map(x => x.trim()).filter(Boolean);
    const texto = p.dataset.pain;
    const nuevos = valores.includes(texto) ? valores.filter(x => x !== texto) : [...valores, texto];
    input.value = nuevos.join(", ");
    actualizarPuntos();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
  toggle.addEventListener("click", () => {
    const abierto = panel.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!abierto));
    toggle.textContent = abierto ? "⌖ Elegir zonas en el mapa" : "Cerrar mapa de dolor";
    if (!abierto) actualizarPuntos();
  });
  puntos.forEach(p => {
    p.addEventListener("click", () => alternarPunto(p));
    p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternarPunto(p); } });
  });
  input.addEventListener("input", actualizarPuntos);
}
function cerrarModal() { modal.classList.add("hidden"); form.reset(); }
document.getElementById("cerrarModal").addEventListener("click", cerrarModal);
modal.addEventListener("click", e => { if (e.target === modal) cerrarModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarModal(); });

function listaPacientes() { return datos.pacientes.length ? datos.pacientes.map(p => [String(p.id), p.nombre]).sort((a, b) => a[1].localeCompare(b[1], "es")) : []; }
function editarPaciente(id) {
  const p = pacientePorId(id); if (!p) return;
  const campos = `<div class="form-grid">${campo("Nombre completo", "nombre", "text", { required: true })}${campo("Edad", "edad", "number", { min: 0 })}${campo("Teléfono", "telefono", "tel")}${campoDiagnostico()}${campo("Fecha de inicio", "fechaInicio", "date")}${selector("Estado del paciente", "estado", [["Activo", "Activo"], ["Inactivo", "Inactivo"]])}<label class="wide">Notas clínicas<textarea name="notas" rows="3" placeholder="Antecedentes, observaciones u otra información"></textarea></label></div>`;
  abrirModal("Editar paciente", "Actualiza los datos de su ficha.", campos, v => {
    Object.assign(p, { nombre: v.nombre.trim(), edad: v.edad, telefono: v.telefono.trim(), diagnostico: v.diagnostico.trim(), fechaInicio: v.fechaInicio, estado: v.estado, notas: v.notas.trim() });
    p.historial = p.historial || [];
    p.historial.unshift({ fecha: hoyISO(), descripcion: "Ficha del paciente actualizada" });
    pacienteSeleccionado = id; actualizarTodo();
  }, { nombre: p.nombre, edad: p.edad, telefono: p.telefono, diagnostico: p.diagnostico, fechaInicio: p.fechaInicio, estado: p.estado, notas: p.notas });
}
function cambiarEstadoCita(id, estado) {
  const cita = datos.citas.find(c => c.id === id); if (!cita) return;
  cita.estadoAnterior = cita.estado;
  cita.estado = estado; actualizarTodo();
}
function restaurarCita(id) {
  const cita = datos.citas.find(c => c.id === id); if (!cita || !["Cancelada", "Completada"].includes(cita.estado)) return;
  cita.estado = cita.estadoAnterior || "Pendiente";
  delete cita.estadoAnterior;
  actualizarTodo();
}
function eliminarPaciente(id) {
  const p = pacientePorId(id); if (!p || !confirm(`¿Eliminar la ficha de ${p.nombre} y sus citas y tratamientos?`)) return;
  datos.pacientes = datos.pacientes.filter(x => x.id !== id); datos.citas = datos.citas.filter(x => x.pacienteId !== id); datos.tratamientos = datos.tratamientos.filter(x => x.pacienteId !== id);
  if (pacienteSeleccionado === id) pacienteSeleccionado = null;
  actualizarTodo();
  if (!pacienteSeleccionado) { document.getElementById("nombrePaciente").textContent = "Selecciona un paciente"; document.getElementById("folioPaciente").textContent = "Folio —"; document.getElementById("avatarPaciente").textContent = "?"; document.getElementById("btnCitaPaciente").disabled = true;["edadPaciente", "telefonoPaciente", "diagnosticoPaciente", "inicioPaciente", "estadoPaciente", "notasPaciente"].forEach(id => document.getElementById(id).textContent = "—"); document.getElementById("historialPaciente").innerHTML = "<p>Selecciona un paciente para consultar su historial.</p>"; }
}

document.getElementById("btnNuevoPaciente").addEventListener("click", () => {
  const campos = `<div class="form-grid">${campo("Nombre completo", "nombre", "text", { required: true })}${campo("Edad", "edad", "number", { min: 0 })}${campo("Teléfono", "telefono", "tel")}${campoDiagnostico()}${campo("Fecha de inicio", "fechaInicio", "date")}${selector("Estado del paciente", "estado", [["Activo", "Activo"], ["Inactivo", "Inactivo"]])}<label class="wide">Notas clínicas<textarea name="notas" rows="3" placeholder="Antecedentes, observaciones u otra información"></textarea></label></div><fieldset><legend>Cita inicial (opcional)</legend><div class="form-grid">${campo("Fecha", "citaFecha", "date")}${campo("Hora", "citaHora", "time")}${campo("Tipo de cita", "citaTipo", "text", { placeholder: "Evaluación inicial" })}</div></fieldset><fieldset><legend>Tratamiento (opcional)</legend><div class="form-grid">${campo("Nombre del tratamiento", "tratamiento")}${campo("Sesiones", "sesiones", "text", { placeholder: "0 / 10" })}</div></fieldset>`;
  abrirModal("Nuevo paciente", "Completa la ficha; puedes incluir su cita inicial y tratamiento.", campos, v => {
    const id = siguienteId(); const paciente = { id, folio: `P-${String(id).padStart(4, "0")}`, nombre: v.nombre.trim(), edad: v.edad, telefono: v.telefono.trim(), diagnostico: v.diagnostico.trim(), fechaInicio: v.fechaInicio || hoyISO(), fechaRegistro: hoyISO(), estado: v.estado, notas: v.notas.trim(), historial: [] };
    datos.pacientes.push(paciente);
    if (v.citaFecha && v.citaHora) datos.citas.push({ id: siguienteId(), pacienteId: id, fecha: v.citaFecha, hora: v.citaHora, tipo: v.citaTipo.trim() || "Consulta", estado: "Pendiente" });
    if (v.tratamiento.trim()) datos.tratamientos.push({ id: siguienteId(), pacienteId: id, nombre: v.tratamiento.trim(), fechaInicio: hoyISO(), sesiones: v.sesiones.trim(), estado: "Activo" });
    pacienteSeleccionado = id; actualizarTodo(); mostrarFicha(id);
  });
});
function abrirFormularioCita(pacienteId = null) {
  const pacientes = listaPacientes(); if (!pacientes.length) return alert("Registra primero un paciente para poder asignar una cita.");
  const iniciales = { fecha: hoyISO(), estado: "Pendiente" };
  if (pacienteId) iniciales.pacienteId = String(pacienteId);
  abrirModal("Nueva cita", "Programa una cita para un paciente.", `<div class="form-grid">${selector("Paciente", "pacienteId", pacientes)}${campo("Fecha", "fecha", "date", { required: true, value: hoyISO() })}${campo("Hora", "hora", "time", { required: true })}${campo("Tipo de cita", "tipo", "text", { required: true, placeholder: "Consulta, seguimiento..." })}${selector("Estado", "estado", [["Pendiente", "Pendiente"], ["Confirmada", "Confirmada"], ["Completada", "Completada"], ["Cancelada", "Cancelada"]])}</div>`, v => { datos.citas.push({ id: siguienteId(), pacienteId: Number(v.pacienteId), fecha: v.fecha, hora: v.hora, tipo: v.tipo.trim(), estado: v.estado }); actualizarTodo(); }, iniciales);
}
document.getElementById("btnNuevaCita").addEventListener("click", () => abrirFormularioCita());
document.getElementById("btnCitaPaciente").addEventListener("click", () => { if (pacienteSeleccionado) abrirFormularioCita(pacienteSeleccionado); });
document.getElementById("btnNuevoTratamiento").addEventListener("click", () => {
  const pacientes = listaPacientes(); if (!pacientes.length) return alert("Registra primero un paciente para poder asignar un tratamiento.");
  abrirModal("Nuevo tratamiento", "Agrega un tratamiento al expediente del paciente.", `<div class="form-grid">${selector("Paciente", "pacienteId", pacientes)}${campo("Tratamiento", "nombre", "text", { required: true })}${campo("Fecha de inicio", "fechaInicio", "date", { required: true, value: hoyISO() })}${campo("Sesiones realizadas / totales", "sesiones", "text", { placeholder: "0 / 10" })}${selector("Estado", "estado", [["Activo", "Activo"], ["Finalizado", "Finalizado"], ["Pausado", "Pausado"]])}</div>`, v => { datos.tratamientos.push({ id: siguienteId(), pacienteId: Number(v.pacienteId), nombre: v.nombre.trim(), fechaInicio: v.fechaInicio, sesiones: v.sesiones.trim(), estado: v.estado }); actualizarTodo(); });
});
document.getElementById("buscarPaciente").addEventListener("input", e => renderPacientes(e.target.value));
document.querySelectorAll(".menu-item").forEach(b => b.addEventListener("click", () => { document.querySelectorAll(".menu-item").forEach(x => x.classList.toggle("active", x === b)); document.querySelectorAll(".section").forEach(s => s.classList.toggle("active", s.id === b.dataset.section)); document.querySelector(".app").classList.toggle("home-view", b.dataset.section === "inicio"); }));
actualizarTodo();
