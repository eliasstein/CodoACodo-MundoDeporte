
const loginform = document.querySelector('.login-form');
const registerform = document.querySelector(".register-form");
const profileframe= document.querySelector(".profile-frame")

// const API_URL="http://127.0.0.1:8000";  //url de la api
const API_URL="https://mundo-deportes-backend.vercel.app"

if (loginform!=undefined){ 
    loginform.addEventListener('submit', (e)=>{
        e.preventDefault();
        const email=e.target.querySelector("#uname").value
        const pass=e.target.querySelector("#pass").value

        var options = {         //Creamos los parametros del metodo post que haremos a la ia
            method: "POST",
            headers: { "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
              "email": email,    
              "password": pass,
              "remember": document.querySelector(".remember-password").checked
            })
          };
        
        fetch(API_URL+"/api/user/login",options)
        .then(res => {
            if (res.status==204){
                console.log("logueado");
                return res;
            }
            else if(res.status=200){
                return res.json();
            }
            throw new Error('No se ha podido iniciar sesión');
      })
        .then(resp=>{
            document.cookie=resp["usrnm"]
            document.cookie=resp["localId"]
            document.cookie=resp["idToken"]
            if (resp["refreshToken"]!=undefined)
                document.cookie=resp["refreshToken"]
            console.log(resp["usrnm"])
            Swal.fire({
                icon: "success",
                text: "Se ha iniciado la sesión correctamente",
                confirmButtonText: "OK"
              }).then(result=>{
                if(result.isConfirmed)
                    document.location.href="/CodoACodo-MundoDeporte";
              });
        })
        .catch((error)=>{
            Swal.fire({
                icon: "error",
                text: "No se ha podido iniciar sesión",
                confirmButtonText: "OK"
              });
        });
    })  //End event
}

if (registerform!=undefined){ 
    registerform.addEventListener('submit', (e)=>{
        e.preventDefault();
        const name=e.target.querySelector("#uname").value
        const email=e.target.querySelector("#email").value
        const pass=e.target.querySelector("#pass").value

        var options = {         //Creamos los parametros del metodo post que haremos a la ia
            method: "POST",
            headers: { "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
              "username":name,
              "email": email,    
              "password": pass
            })
          };
        
        fetch(API_URL+"/api/user/register",options)
        .then(res => {
            if (res.ok){
                console.log("Registrado");
                return res;
            }
            else if (res.status===406){
                return Promise.reject({status:res.status, message:"El usuario ya se encuentra registrado"});
            }
            else{
                return Promise.reject({status:res.status, message:"No se ha podido registrar"});
            }
      })
        .then(resp=>{
            Swal.fire({
                icon: "success",
                text: "Se ha registrado el usuario correctamente",
                confirmButtonText: "OK"
                }).then(result=>{
                if(result.isConfirmed)
                    document.location.href="/CodoACodo-MundoDeporte";
                });
            
        })
        .catch((error)=>{
            if (error.status===406 || error.status===400){
                Swal.fire({
                    icon: "error",
                    text: "El usuario ya se encuentra registrado",
                    confirmButtonText: "OK"
                  })
            }
            else{
            Swal.fire({
                icon: "error",
                text: "No se ha podido registrar el usuario",
                confirmButtonText: "OK"
              });
            }
        }); //end catch

    }); //end event
}

if (profileframe!=undefined){   //Si se cumple la condicion, estamos en el la pagina de profile
    pfname=document.querySelector(".pf-name");
    pfemail=document.querySelector(".pf-email");
    fetch(API_URL+"/api/user/info/"+getCookie("localId"))
    .then(res=>{if (res.ok){return res.json();}})
    .then(resp=>{
        // console.log(resp["data"])
        pfname.innerHTML="Nombre: "+ resp["data"]["username"]
        pfemail.innerHTML="Email: "+resp["data"]["email"]
        console.log(resp["data"]["email"])
    })
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length > 1 ? parts.pop().split(';').shift() : null;
  }

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

        // Eliminar la cookie configurando una fecha de expiración en el pasado
        console.log(getCookie(`${name}`));
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
}

function checkIfLogged(){
    uname=document.querySelector(".login-register span")
    unameURL=document.querySelector(".login-register")
    if (getCookie("idToken") && getCookie("usrnm")){
        uname.textContent=getCookie("usrnm");
        unameURL.href="templates/profile.html"
        checkIfValid().then(isValid => {
            if (isValid) {
                console.log("token valido");
            } else {
                console.log("token invalido");
            }
        });
    }
    else if (getCookie("refreshToken") && getCookie("idToken")===null){
        console.log("refrescar token");
        fetch(API_URL+"/api/user/token/refresh",{
            method: "GET",
            credentials: "include"
        }).then(res=>{
            if (res.ok){
                uname.textContent=getCookie("usrnm");
                unameURL.href="templates/profile.html"
                return res;
            }
            throw new Error("No se ha podido refrescar el token");
    })//end fetch
    }
    
    else{
        uname.textContent="Entrar/Registrarse";
        console.log("Usuario no logueado");
    }
}

async function checkIfValid() {
    try {
        const response = await fetch(API_URL+"/api/user/token", {
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

function logout(){
    deleteAllCookies();
    Swal.fire({
        icon: "success",
        text: "Se ha cerrado la sesión correctamente",
        confirmButtonText: "OK"
      }).then(result=>{
        if(result.isConfirmed)
            document.location.href="/CodoACodo-MundoDeporte";
      });

}

checkIfLogged()
