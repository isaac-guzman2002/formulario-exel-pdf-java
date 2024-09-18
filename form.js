let studentData = JSON.parse(localStorage.getItem("students")) || [];

let currentPage = 1;

let recordsPerPage = 3;

const studentTable = document.querySelector("#studentTable tbody");

const form = document.getElementById("studentForm");

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

document
  .getElementById("recordsPerPage")
  .addEventListener("change", (event) => {
    recordsPerPage = parseInt(event.target.value);
    renderTable();
  });

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const comments = document.getElementById("comments").value;

  if (!validateEmail(email)) {
    alert("Por favor, introduce un correo válido.");
    return;
  }

  const isDuplicate = studentData.some((student) => student.email === email);
  if (isDuplicate) {
    alert("Este correo ya está registrado.");
    return;
  }

  const student = { name, email, comments };
  studentData.push(student);
  localStorage.setItem("students", JSON.stringify(studentData));

  form.reset();
  renderTable();
});

function renderTable() {
  studentTable.innerHTML = "";

  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = studentData.slice(startIndex, endIndex);

  currentRecords.forEach((student, index) => {
    const row = studentTable.insertRow();

    row.insertCell(0).innerText = student.name;
    row.insertCell(1).innerText = student.email;
    row.insertCell(2).innerText = student.comments;

    const actionCell = row.insertCell(3);
    const editBtn = document.createElement("button");
    editBtn.innerText = "Editar";
    editBtn.className = "action-btn edit-btn";
    editBtn.onclick = () => editStudent(startIndex + index);
    actionCell.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Eliminar";
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.onclick = () => confirmDelete(startIndex + index);
    actionCell.appendChild(deleteBtn);
  });

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = endIndex >= studentData.length;
}

function confirmDelete(index) {
  const confirmed = confirm(
    "¿Estás seguro de que deseas eliminar este alumno?"
  );
  if (confirmed) {
    deleteStudent(index);
  }
}

function deleteStudent(index) {
  studentData.splice(index, 1);
  localStorage.setItem("students", JSON.stringify(studentData));
  renderTable();
}

function editStudent(index) {
  const student = studentData[index];
  document.getElementById("name").value = student.name;
  document.getElementById("email").value = student.email;
  document.getElementById("comments").value = student.comments;
  deleteStudent(index);
}

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if ((currentPage - 1) * recordsPerPage < studentData.length) {
    currentPage++;
    renderTable();
  }
});

//exportar a pdf

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Agrega texto inicial al documento
  doc.text("Estudiantes", 14, 10);

  // Mapeo de datos de los estudiantes
  const tabledata = studentData.map((student) => [
    student.name,
    student.email,
    student.comments,
  ]);

  // Agrega una tabla automática al documento PDF
  doc.autoTable({
    head: [["Nombre", "Email", "Comentarios"]],
    body: tabledata,
  });

  // Guarda el PDF generado
  doc.save("documento.pdf");
}

function exportToExcel() {
  // Crea la hoja de Excel a partir de los datos en formato JSON
  const ws = XLSX.utils.json_to_sheet(studentData);

  // Crea un nuevo libro de trabajo
  const wb = XLSX.utils.book_new();

  // Añade la hoja de trabajo con el nombre 'alumnos'
  XLSX.utils.book_append_sheet(wb, ws, "alumnos");

  // Escribe y descarga el archivo Excel con el nombre 'alumnos.xlsx'
  XLSX.writeFile(wb, "alumnos.xlsx");
}

window.onload = renderTable;
