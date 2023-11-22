API_URL= "https://crimson-shuttle-973261.postman.co/workspace/0cd934c9-b453-41ad-9e11-e70e2dd6c479/collection/30236344-9eac65c0-b98c-4c5c-8303-8b8d90597a15?action=share&source=copy-link&creator=30236344"
const init = () => {
    
    const registerForm = document.getElementById('register-form');
    console.log(registerForm)

    const handleRegister = async (event) => {
        event.preventDefault(); 
        const usernameInfo = event.target.querySelector('#username')
        const passwordInfo = event.target.querySelector('#password')

        const username = usernameInfo.value;
        const password = passwordInfo.value;

        const response = await fetch(
            `${API_URL}/auth/register`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                }),
            }
        );
        const data = await response.json();
        console.log(data);
    }
    if (registerForm){
        registerForm.addEventListener('submit', handleRegister);
    }
    

    const loginForm = document.getElementById('login-form');
    console.log(loginForm)
    
    const handleLogin = async (event) => {
        event.preventDefault();
        const usernameInfo = loginForm.querySelector('#username');
        const passwordInfo = loginForm.querySelector('#password');

        const username = usernameInfo.value;
        const password = passwordInfo.value;

        const response = await fetch(
            `${API_URL}/auth/login`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    withCredentials: true,
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                }),
            });
        
        const data = await response.json();
        console.log(data)
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const createListsCard = (lists) => {
        console.log(lists)
        console.log(localStorage.getItem('user_id'));
        console.log(lists.created_by);
        return `
        <div class="card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">${lists.name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Created by: <strong>${localStorage.getItem('username')}</strong></h6>
                <p class="card-text">${lists.description}</p>
                ${
                    localStorage.getItem('username') === lists.created_by
                    ? `<button class="btn btn-warning" id="edit-lists" data-id=${lists.id}>Edit</button>
                       <button class='btn btn-danger' id='delete-readinglist' data-id=${lists.id}>Delete</button>` 
                    : ""
                }
                <button class='btn btn-outline-success' id='view-books' data-id=${lists.id}>View Books</button>
            </div>
        </div>
        `
    }

    const handleGetAllReadingLists = async (event) => {
        event.preventDefault();
        console.log('button clicked')
        const response = await fetch(`${API_URL}/list/all_reading_lists`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        let cards = "";
        data.reading_lists.forEach(lists => {
            cards += createListsCard(lists);
        })
        const listsDisplay = document.getElementById('lists-display');
        if (listsDisplay) {
            listsDisplay.innerHTML = cards;
        }
        const editButtons = document.querySelectorAll('button[data-id]#edit-lists');
        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log(btn)
                const card = btn.closest('.card');
                const cardTitle = card.querySelector('.card-title');
                const cardText = card.querySelector('.card-text');

                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.value = cardTitle.innerText;

                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.value = cardText.innerText;

                cardTitle.replaceWith(titleInput);
                cardText.replaceWith(textInput)

                const readingListFormHTML = `
                    <form id='new-book-form'>
                        <label for='book_name'>Book Name</label>
                        <input type='text' id='book_name' />
                        <br />
                        <label for='genre'>Genre</label>
                        <input type='text' id='genre' />
                        <br />
                        <label for='escription'>Description</label>
                        <input type='text' id='desc' />
                        <button class='btn btn-success'>Add Book</button>
                    </form>
                `;

                card.insertAdjacentHTML('beforeend', readingListFormHTML);

                const readingListId = btn.getAttribute('data-id');
                const newBookForm = card.querySelector('#new-book-form');
                newBookForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const response = await fetch(`${API_URL}/list/${readingListId}/add_book`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem('token')}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            "book_name": newBookForm.querySelector('#book_name').value,
                            "genre": newBookForm.querySelector('#genre').value,
                            "description": newBookForm.querySelector('#desc').value
                        }),
                    });
                    if (response.ok) {
                        window.location.reload();
                    }
                });

                const saveButton = document.createElement('button');
                saveButton.innerText = 'Save';
                saveButton.addEventListener('click', async () => {
                    const response = await fetch(`${API_URL}/list/update/list/${readingListId}`, {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem('token')}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "name": titleInput.value,
                            "description": textInput.value,
                        }),
                    })
                    if (response.ok) {
                        window.location.reload()
                    }
                });
                btn.insertAdjacentElement('afterend', saveButton);
            });
        });

        const deleteButtons = document.querySelectorAll('button[data-id]#delete-readinglist');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();

                const readingListId = btn.getAttribute('data-id');

                const response = await fetch(`${API_URL}/list/lists_delete/${readingListId}`, {
                    method: 'DELETE',
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.ok) {
                    window.location.reload();
                }
            })
        })

        const viewBooksButton = document.querySelectorAll('button[data-id]#view-books');
        viewBooksButton.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();

                const readingListId = btn.getAttribute('data-id');

                const response = await fetch(`${API_URL}/list/${readingListId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    },
                });
                const data = await response.json();
                console.log(data)

                const bookList = document.createElement('ul');
                data.reading_list.books.forEach(book => {
                    const bookItem = document.createElement('li');
                    const bookName = document.createElement('div');
                    bookName.textContent = `Title: ${book.book_name}`;
                    
                    const genre = document.createElement('div');
                    genre.textContent = `Genre: ${book.genre}`

                    bookItem.appendChild(bookName);
                    bookItem.appendChild(genre);
                    bookList.append(bookItem)
                });

                btn.insertAdjacentElement('afterend', bookList);
            })
        })
    };

    const displayReadingListsBtn = document.getElementById('get-listss');
    if (displayReadingListsBtn) {
        displayReadingListsBtn.addEventListener('click', handleGetAllReadingLists)
    }
    


    const createlistsForm = document.getElementById('create-lists-form')

    const handleCreatelists = async (event) => {
        event.preventDefault();

        const listsNameInfo = event.target.querySelector('#name');
        const listsName = listsNameInfo.value;

        const listsDescInfo = event.target.querySelector('#description');
        const listsDesc = listsDescInfo.value;
        console.log(listsDesc)

        const response = await fetch(`${API_URL}/list/new_reading_list`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": listsName,
                "description": rlDesc
            }),
        });
        const data = await response.json();
        console.log(data);
    }
    if (createlistsForm) {
        createlistsForm.addEventListener('submit', handleCreatelists);
    }

}

document.addEventListener("DOMContentLoaded", init);