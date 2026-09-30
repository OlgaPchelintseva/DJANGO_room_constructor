document.addEventListener('DOMContentLoaded', function(){
    const saveBtn = document.getElementById('saveRoom');
    const roomWorkspace = document.getElementById('roomWorkspace');
    const catalogItems = document.querySelectorAll('.catalog-item');

    let draggedElement = null;

    catalogItems.forEach(item => {
        item.addEventListener("dragstart", function(e){
            draggedElement = {
                type: "catalog",
                id: item.getAttribute("data-id"),
                imageUrl: item.getAttribute("data-image"),
                name: item.getAttribute("data-name")
            };
            e.dataTransfer.setData("text/plan", item.getAttribute("data-id"));
        });
    });

    roomWorkspace.addEventListener("dragover", function(e){
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    roomWorkspace.addEventListener('drop', function(e){
        e.preventDefault();
        if (!draggedElement) return;
        const rect = roomWorkspace.getBoundingClientRect();
        
        let x = e.clientX - rect.left - 40;
        let y = e.clientY - rect.top - 40;

        x = Math.max(0, Math.min(x, rect.width - 80));
        y = Math.max(0, Math.min(y, rect.height -80));

        if (draggedElement.type === 'catalog'){
            createPlacedElement(draggedElement.id, draggedElement.imageUrl, draggedElement.name, x, y);
        } else if (draggedElement.type === 'exist'){
            const existElement = draggedElement.element;
            existElement.style.left = `${x}px`;
            existElement.style.top = `${y}px`;
        }
        draggedElement = null;
    });

    function createPlacedElement(furnitureId, imageUrl, name, x, y, width=80, height=80, rotation=0){
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('placed-item');
        itemDiv.style.left = `${x}px`;
        itemDiv.style.top = `${y}px`;
        itemDiv.style.width = `${width}px`;
        itemDiv.style.height = `${height}px`;
        itemDiv.style.transform = `rotate(${rotation}deg)`;
        itemDiv.setAttribute("data-furniture-id", furnitureId);
        itemDiv.setAttribute("data-rotation", rotation);
        itemDiv.setAttribute("draggable", "true");

        const controlsBtn = document.createElement('div');
        controlsBtn.classList.add('placed-item-controls');
        controlsBtn.innerHTML = `
                            <button class="control-btn rot-left">&#8634;</button>
                            <button class="control-btn rot-right">&#8635;</button>`

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = name;
        img.style.width = '100%';
        img.style.height = '100%';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Удалить предмет';

        // маркер для изменения размера
        const resizeHandle = document.createElement('div');
        resizeHandle.classList.add('resize-handle');

        deleteBtn.addEventListener('click', function(e){
            e.stopPropagation();
            itemDiv.remove();
        })
        itemDiv.appendChild(controlsBtn);
        itemDiv.appendChild(img);
        itemDiv.appendChild(deleteBtn);
        itemDiv.appendChild(resizeHandle);

        makeMoveItem(itemDiv);
        setupInteractive(itemDiv);
        roomWorkspace.appendChild(itemDiv);
    }

    function setupInteractive(element){
        const rotateLeft = element.querySelector('.rot-left');
        const rotateRight = element.querySelector('.rot-right');
        if (rotateLeft && rotateRight){
            rotateLeft.addEventListener('click', function(e){
                e.stopPropagation();
                changeRotation(element, -15);
            });
            rotateRight.addEventListener('click', function(e){
                e.stopPropagation();
                changeRotation(element, 15);
            });
        }
        const handle = itemElement.querySelector('.resize-handle');
        if (handle){
            handle.addEventListener('mousedown', function(e){
                e.stopPropagation();
                e.preventDefault();
                element.setAttribute('draggable', "false");

                const startWidth = element.offsetWidth;
                const startHeight = element.offsetHeight;
                const startX = e.clientX;
                const startY = e.clientY;

                function onMouseMove(moveEvent){
                    const newWidth = Math.max(30, startWidth + (moveEvent.clientX - startX));
                    const newHeight = Math.max(30, startHeight + (moveEvent.clientY - startY));
                    element.style.width = `${newWidth}px`;
                    element.style.height = `${newHeight}px`;
                }

                function onMouseUp(){
                    element.setAttribute("draggable", "true");
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        }
    }
    
    function changeRotation(el, deg){
        let currentRotation = parseInt(el.getAttribute('data-rotation')) || 0;
        currentRotation = (currentRotation + deg) % 360;
        el.setAttribute('data-rotation', currentRotation);
        el.style.transform = `rotate(${currentRotation}deg)`;
    }

    function makeMoveItem(element){
        element.addEventListener("dragstart", function(e){
            draggedElement = {
                type: 'exist',
                element: element
            };
            e.dataTransfer.setData('text/plain', 'move');
        });
    }

    const initilPlacedItems = roomWorkspace.querySelectorAll('.placed-item');
    initilPlacedItems.forEach(item => {
        item.setAttribute("draggable", "true");
        makeMoveItem(item);
        setupInteractive(item);

        const delBtn = item.querySelector('.delete-btn');
        if (delBtn){
            delBtn.addEventListener('click', function(e){
                e.stopPropagation()
                item.remove();
            });
        }
    });

    if (saveBtn){
        saveBtn.addEventListener('click', function(){
            const placedItems = roomWorkspace.querySelectorAll('.placed-item');
            const itemsData = [];
            placedItems.forEach(item => {
                const furnitureId = item.getAttribute('data-furniture-id');
                const x = parseInt(item.style.left) || 0;
                const y = parseInt(item.style.top) || 0;
                itemsData.push({
                    furniture_id: furnitureId,
                    x: x,
                    y: y
                });
            });
            // ПОЛУЧАЕМ CSRF-token
            function getCookie(name){
                let cookieVal = null;
                if (document.cookie && document.cookie !== ''){
                    const cookie = document.cookie.split(';');
                    for (let i = 0; i < cookie.length; i++){
                        const c = cookie[i].trim();
                        if (c.substring(0, name.length+1) == (name + '=')){
                            cookieVal = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieVal;
            }
            const csrfToken = getCookie('csrf');
            const roomId = roomWorkspace.getAttribute('data-room-id') || 1;

            fetch(`/room/${roomId}/save/`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({items: itemsData})
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success'){
                    alert('Успех ' + data.message);
                }else{
                    alert('Ошибка сохранения ' + data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка на сервере ', error);
                alert('Не удалось сохранить');
            });

        })
    }    
})

