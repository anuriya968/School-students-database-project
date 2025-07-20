// test change

const form = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTableBody');

let editingStudentId = null; // To track if we are editing a student

async function loadStudents() {
  try {
    const res = await fetch('/students');
    const students = await res.json();

    studentsTableBody.innerHTML = ''; // clear previous rows

    students.forEach(s => {
      const totalMarks = (s.marks.english || 0) 
                 + (s.marks.maths || 0) 
                 + (s.marks.evs || 0) 
                 + (s.marks.hindi || 0);
                 
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.name}</td>
        <td>${s.class}</td>
        <td>${s.age}</td>
        <td>${s.marks.english || 0}</td>
        <td>${s.marks.maths|| 0}</td>
        <td>${s.marks.evs|| 0}</td>
        <td>${s.marks.hindi|| 0}</td>
        <td>
          <button onclick="editStudent('${s._id}')">Edit</button>
          <button onclick="deleteStudent('${s._id}')">Delete</button>
          <button onclick = "findStudent('${s._id}')">Find</button>
        </td>
      `;
      studentsTableBody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading students:', err);
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(form);
  let marks = {};
  try {
    marks = formData.get('marks') ? JSON.parse(formData.get('marks')) : {};
  } catch {
    alert('Marks must be valid JSON');
    return;
  }

  const data = {
    name: formData.get('name'),
    class: formData.get('class'),
    age: Number(formData.get('age')),
    marks
  };

  let url = '/students';
  let method = 'POST';

  if (editingStudentId) {
    // If editing, update the student
    url = `/students/${editingStudentId}`;
    method = 'PUT';
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    form.reset();
    editingStudentId = null;
    form.querySelector('button').textContent = 'Add Student';
    loadStudents();
  } else {
    const error = await res.json();
    alert('Error: ' + (error.error || 'Failed to add/update student'));
  }
});

// Edit student function to load student data in form
async function editStudent(id) {
  try {
    const res = await fetch(`/students/${id}`);
    if (!res.ok) throw new Error('Student not found');
    const student = await res.json();

    form.name.value = student.name;
    form.class.value = student.class;
    form.age.value = student.age;
    form.marks.value = JSON.stringify(student.marks || {}, null, 2);

    editingStudentId = id;
    form.querySelector('button').textContent = 'Update Student';
  } catch (err) {
    alert('Error fetching student data');
  }
}

// Delete student function
async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    const res = await fetch(`/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    loadStudents();
  } catch (err) {
    alert('Error deleting student');
  }
}

// Load students on page load
loadStudents();