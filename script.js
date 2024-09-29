'use strict';

const color = document.querySelector('#color');
const createBtn = document.querySelector('#createBtn');
const list = document.querySelector('#list');

const createNote = () => {
    const newNote = document.createElement('div');
    newNote.classList.add('note');
    newNote.innerHTML = `
        <div class="note-controls">
            <span class="clear"><i class="ri-format-clear"></i></span>
            <span class="save"><i class="ri-save-3-line"></i></span>
        </div>
        <span class="close"><i class="ri-close-line"></i></span>
        <textarea placeholder="Write Content Here...." rows="10" cols="30"></textarea>`;
    newNote.style.borderTopColor = color.value;
    list.appendChild(newNote);
};

createBtn.addEventListener('click', createNote);

const handleNoteActions = (event) => {
    const note = event.target.closest('.note');
    if (!note) return;

    const textarea = note.querySelector('textarea');

    if (event.target.closest('.close')) {
        note.remove();
    } else if (event.target.closest('.clear')) {
        textarea.value = '';
    } else if (event.target.closest('.save')) {
        const text = textarea.value.trim();
        if (text) {
            const blob = new Blob([text], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'note.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    }
};

document.addEventListener('click', handleNoteActions);

let draggedNote = null;
let initialX, initialY, initialTouchX, initialTouchY;

const startDragging = (event) => {
    const target = event.type === 'touchstart' ? event.touches[0].target : event.target;
    if (target.classList.contains('note')) {
        draggedNote = target;
        const rect = draggedNote.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        if (event.type === 'mousedown') {
            initialTouchX = event.clientX;
            initialTouchY = event.clientY;
        } else if (event.type === 'touchstart') {
            initialTouchX = event.touches[0].clientX;
            initialTouchY = event.touches[0].clientY;
        }
        draggedNote.style.cursor = 'grabbing';
    }
};

const drag = (event) => {
    if (!draggedNote) return;

    let clientX, clientY;
    if (event.type === 'mousemove') {
        clientX = event.clientX;
        clientY = event.clientY;
    } else if (event.type === 'touchmove') {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    }

    const dx = clientX - initialTouchX;
    const dy = clientY - initialTouchY;

    let newX = initialX + dx;
    let newY = initialY + dy;

    const maxX = window.innerWidth - draggedNote.offsetWidth;
    const maxY = window.innerHeight - draggedNote.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    draggedNote.style.left = `${newX}px`;
    draggedNote.style.top = `${newY}px`;

    event.preventDefault(); // Prevent scrolling on touch devices
};

const stopDragging = () => {
    if (draggedNote) {
        draggedNote.style.cursor = 'auto';
        draggedNote = null;
    }
};

document.addEventListener('mousedown', startDragging);
document.addEventListener('touchstart', startDragging, { passive: false });
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });
document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

// Prevent default touch behavior on notes
list.addEventListener('touchstart', (event) => {
    if (event.target.closest('.note')) {
        event.preventDefault();
    }
}, { passive: false });

// Add touch-action: none to notes
const addTouchActionNone = () => {
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        note.style.touchAction = 'none';
    });
};

// Call addTouchActionNone after creating a new note
const originalCreateNote = createNote;
createNote = () => {
    originalCreateNote();
    addTouchActionNone();
};

// Initial call to set touch-action on existing notes
addTouchActionNone();
