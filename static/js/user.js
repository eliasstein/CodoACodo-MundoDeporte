
const loginform = document.querySelector('.login-form');
const registerform = document.querySelector(".register-form");
const profileframe = document.querySelector(".profile-frame")

// const API_URL = "http://127.0.0.1:8000";  //url api local
const API_URL="https://mundo-deportes-backend-git-main-eliassteins-projects.vercel.app" //url api produccion

// const INDEX_PAGE = "/";                             //index local
const INDEX_PAGE = "/CodoACodo-MundoDeporte";    //index produccion



if (loginform != undefined) {                          //identificamos si estamos en la pagina de login
    loginform.addEventListener('submit', (e) => {     //si ese es el caso interceptamos el evento submit
        e.preventDefault();                         //removemos su funcion por default
        const email = e.target.querySelector("#uname").value  //obtenemos los datos del email
        const pass = e.target.querySelector("#pass").value    //obtenemos los datos de la contraseña

        var options = {         //Creamos los parametros para hacer un post a nuestra api
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                "email": email,
                "password": pass,
                "remember": document.querySelector(".remember-password").checked
            })
        };

        fetch(API_URL + "/api/user/login", options)    //Realizamos el post a la api
            .then(res => {
                if (res.status == 204) {               //Obsoleto (Metodo Set_cookie en el header)
                    console.log("logueado");
                    return res;
                }
                else if (res.status == 200) {        //Interceptamos la respuesta de la api
                    return res.json();          //convertimos la respuesta a .json
                }
                throw new Error('No se ha podido iniciar sesión');
            })
            .then(resp => {
                document.cookie = resp["usrnm"]       //Convertimos la respuesta de la api en cookies
                document.cookie = resp["localId"]
                document.cookie = resp["idToken"]
                if (resp["refreshToken"] != undefined)
                    document.cookie = resp["refreshToken"]
                // console.log(resp["usrnm"])
                Swal.fire({         //Mostramos un mensaje de exito al loguear
                    icon: "success",
                    text: "Se ha iniciado la sesión correctamente",
                    confirmButtonText: "OK"
                }).then(result => {
                    document.location.href = INDEX_PAGE;  //una vez se clickee el boton o fuera de la pantalla nos redirigira al index
                });
            })
            .catch((error) => {   //En caso de algun error se mostrara un mensaje de error
                Swal.fire({
                    icon: "error",
                    text: "No se ha podido iniciar sesión",
                    confirmButtonText: "OK"
                });
            });
    })  //End event
}

if (registerform != undefined) { //identificamos si estamos en la pagina de register
    registerform.addEventListener('submit', (e) => {
        e.preventDefault(); //Removemos la funcion por default del formulario
        const name = e.target.querySelector("#uname").value
        const email = e.target.querySelector("#email").value
        const email2 = e.target.querySelector("#r-email").value
        const pass = e.target.querySelector("#pass").value
        const pass2 = e.target.querySelector("#pass2").value

        if (email != email2) {       //Comprobaciones de seguridad
            Swal.fire({
                icon: "error",
                text: "El email debe ser igual en ambos campos",
                confirmButtonText: "OK"
            });
            return

        }
        else if (pass != pass2) {
            Swal.fire({
                icon: "error",
                text: "La constraseña debe ser igual en ambos campos",
                confirmButtonText: "OK"
            });
            return

        }
        else if (pass.length < 6 || pass2.length < 6) {
            Swal.fire({
                icon: "error",
                text: "La constraseña debe tener una longitud de 6 caracteres minimo",
                confirmButtonText: "OK"
            });
            return
        }


        var options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                "username": name,
                "email": email,
                "password": pass
            })
        };

        fetch(API_URL + "/api/user/register", options)     //fetch a la api para registrar el usuario
            .then(res => {
                if (res.ok) {
                    console.log("Registrado");
                    return res;
                }
                else if (res.status === 406) {
                    return Promise.reject({ status: res.status, message: "El usuario ya se encuentra registrado" });
                }
                else {
                    return Promise.reject({ status: res.status, message: "No se ha podido registrar" });
                }
            })
            .then(resp => {
                Swal.fire({
                    icon: "success",
                    text: "Se ha registrado el usuario correctamente",
                    confirmButtonText: "OK"
                }).then(result => {
                    if (result.isConfirmed)
                        document.location.href = INDEX_PAGE;
                });

            })
            .catch((error) => {
                if (error.status === 406 || error.status === 400) {
                    Swal.fire({
                        icon: "error",
                        text: "El usuario ya se encuentra registrado",
                        confirmButtonText: "OK"
                    })
                }
                else {
                    Swal.fire({
                        icon: "error",
                        text: "No se ha podido registrar el usuario",
                        confirmButtonText: "OK"
                    });
                }
            }); //end catch

    }); //end event
}

if (profileframe != undefined) {   //Si se cumple la condicion, estamos en la pagina de profile
    pfname = document.querySelector(".pf-name");
    pfemail = document.querySelector(".pf-email");
    fetch(API_URL + "/api/user/info/" + getCookie("localId"))   //recibimos la informacion del usuario
        .then(res => { if (res.ok) { return res.json(); } })
        .then(resp => {
            pfname.innerHTML = "Nombre: " + resp["data"]["username"]   //añadimos la informacion del usuario al html
            pfemail.innerHTML = "Email: " + resp["data"]["email"]
        })
}


function getCookie(name) {  //Funcion para obtener una cookie en especifico
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length > 1 ? parts.pop().split(';').shift() : null;
}

function deleteAllCookies() { //Funcion para borrar todas las cookies
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

        // Eliminar la cookie configurando una fecha de expiración en el pasado
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;  //funciona en local

        document.cookie = `${name}=;Max-Age=0;Path=/;SameSite=None;Secure;Partitioned;`   //funciona en produccion

    }
}

function checkIfLogged() {   //Funcion que comprueba si el usuario se encuentra logueado
    uname = document.querySelector(".login-register span")
    unameURL = document.querySelector(".login-register")
    if (getCookie("idToken") && getCookie("usrnm")) {    //Si las cookies existen
        uname.textContent = getCookie("usrnm");           //modificamos el textos de "entrar/registrarse" por el nombre del usuario
        if (window.location.href.includes("profile"))
            unameURL.href = ""          //modificamos la url para que en vez de mandarnos al login nos mande al perfil
        else if (window.location.href.includes("templates"))
            unameURL.href = "/CodoACodo-MundoDeporte/profile.html"
        else {
            unameURL.href = "/CodoACodo-MundoDeporte/templates/profile.html"          //modificamos la url para que en vez de mandarnos al login nos mande al perfil
        }

    }
    else if (getCookie("refreshToken") && getCookie("idToken") === null) {
        console.log("refrescar token");
        fetch(API_URL + "/api/user/token/refresh", {   //Actualizamos el token caducado
            method: "GET",
            credentials: "include"
        }).then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error("No se ha podido refrescar el token");
        })
            .then(resp => {
                document.cookie = resp["usrnm"]       //Convertimos la respuesta de la api en cookies
                document.cookie = resp["localId"]
                document.cookie = resp["idToken"]
                document.cookie = resp["refreshToken"]

                uname.textContent = getCookie("usrnm");
                if (window.location.href.includes("profile"))
                    unameURL.href = ""          //modificamos la url para que en vez de mandarnos al login nos mande al perfil
                else if (window.location.href.includes("templates"))
                    unameURL.href = "/CodoACodo-MundoDeporte/profile.html"
                else
                    unameURL.href = "/CodoACodo-MundoDeporte/templates/profile.html"          //modificamos la url para que en vez de mandarnos al login nos mande al perfil

            })
    }

    else {   //Si el usuario no esta logueado
        uname.textContent = "Entrar/Registrarse";
        console.log("Usuario no logueado");
    }
}

async function checkIfValid() { //Comprueba si el token es valido
    try {
        const response = await fetch(API_URL + "/api/user/token", {
            method: "GET",
            credentials: "include"
        });

        if (response.ok) { // Verifica si la respuesta tiene un status 200-299
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error en la petición:", error);
        return false;
    }
}

function logout() {          //Cierra sesion
    deleteAllCookies();     //Borra las cookies
    Swal.fire({             //Muestra un mensaje
        icon: "success",
        text: "Se ha cerrado la sesión correctamente",
        confirmButtonText: "OK"
    }).then(result => {
        document.location.href = INDEX_PAGE;
    });

}

checkIfLogged()
