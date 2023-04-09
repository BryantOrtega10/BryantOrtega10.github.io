let maps = [];
let datosGen = []
function initMap() {
    console.log("Api GOOGLE Cargada")
    
}

window.initMap = initMap;


const agregarModal = new bootstrap.Modal('#agregar-modal', {
    keyboard: false
})

document.querySelector("#agregar").addEventListener("click", (e) => {
    document.querySelector('#continente').value = "";
    document.querySelector('#ubicacion').value = "";
    document.querySelector('#pagina').value = "";
    document.querySelector('#archivo').value = "";
    agregarModal.show()
})
document.querySelector("#guardar").addEventListener("click", (e) => {
    const continente = document.querySelector('#continente');
    const ubicacion = document.querySelector('#ubicacion');
    const pagina = document.querySelector('#pagina');
    const archivo = document.querySelector('#archivo');

    if(continente.value == ""){
        alert("Seleccione un continenete")
    }
    else if(ubicacion.value == ""){
        alert("Seleccione una ubicación")
    }
    else if(pagina.value == ""){
        alert("Seleccione una página")
    }
    else if (!archivo.files[0]) {
        alert("Selecciona un archivo")
    } else {
        let file = archivo.files[0];
        let fr = new FileReader();
        fr.onload = (e) => {
            const textoCsv = fr.result//.replace("\r","")
            const lineas = textoCsv.split('\n')
            const arregloCsv = lineas.map(linea => linea.split(','))
            let arrIps = []
            let cargue = []
            for (let i = 1; i < (arregloCsv.length - 1); i++) {
                const linea = arregloCsv[i];
                linea[5] = linea[5].replace("\r","")
                if (linea[5] != ""){
                    arrIps.push(linea[5])
                }
                cargue.push({
                    hop: linea[0],
                    time1: linea[1],
                    time2: linea[2],
                    time3: linea[3],
                    host: linea[4],
                    ip: linea[5]                   
                })
            }
            
            datosGen.push({
                continente: continente,
                ubicacion: ubicacion,
                pagina: pagina,
                cargue: cargue
            })



            document.querySelector("#cargando").classList.add("active")
            fetch("https://ip-api.com/batch", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(arrIps)
            })
            .then(response => response.json())
            .then((data) => {
                document.querySelector("#cargando").classList.remove("active")
                let ubicacionesParaGoogle = []
                for (let j = 0; j < data.length; j++) {
                    const item = data[j];
                    if(item.status == 'success'){
                        if(ubicacionesParaGoogle.length > 0){
                            const ultimaUbicacion = ubicacionesParaGoogle[ubicacionesParaGoogle.length - 1]
                            if(ultimaUbicacion.zip != item.zip){
                                ubicacionesParaGoogle.push(item);
                            }
                        }
                        else{
                            ubicacionesParaGoogle.push(item);
                        }
                    }
                    
                }
                let contenedor = document.querySelector(`#cont-${continente.value}-${pagina.value}`)
                const ultimaData = datosGen[datosGen.length - 1]
                const ultimoSalto = ultimaData.cargue[ultimaData.cargue.length - 1].hop
                
                let infoHtml = `<div class="row">
                    <div class="col-3">Numero Saltos: ${ultimoSalto}</div>
                    <div class="col-3">Cargue: #${datosGen.length}</div>
                    <div class="col-12"><div class="map" id="map${datosGen.length - 1}"></div></div>
                </div>
                <hr>`;
                const item = document.createElement("div");
                item.innerHTML = infoHtml;
                contenedor.insertBefore(item, contenedor.firstChild);
            

                var map = new google.maps.Map(document.getElementById(`map${datosGen.length - 1}`), {
                    center: { lat: -34.397, lng: 150.644 },
                    zoom: 4,
                });
                maps.push(map)
                for (let k = 0; k < ubicacionesParaGoogle.length; k++) {
                    const ubic = ubicacionesParaGoogle[k];                    
                    const myLatLng = { lat: ubic.lat, lng: ubic.lon };
                    new google.maps.Marker({
                        position: myLatLng,
                        map: maps[maps.length - 1],
                        title: `${ubic.country} - ${ubic.regionName}`
                    });
                    
                    if(k == (ubicacionesParaGoogle.length - 1)){
                        maps[maps.length - 1].setCenter(myLatLng)
                    }

                    if(k>0){
                        const ubicDestino = ubicacionesParaGoogle[k];
                        const ubicOrigen = ubicacionesParaGoogle[k - 1];
                        
                        new google.maps.Polyline({
                            path: [{lat: ubicOrigen.lat, lng: ubicOrigen.lon}, {lat: ubicDestino.lat, lng: ubicDestino.lon}],
                            icons: [{
                                icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
                                offset: '100%'
                            }],
                            geodesic: true,
                            map: maps[maps.length - 1]
                        });
                    }
                }
                
                document.getElementById(`v-continente-${continente.value}-tab`).click();
                document.getElementById(`${continente.value}-${pagina.value}-tab`).click();
                agregarModal.hide()
            })

        };
        fr.readAsText(file);

    }
})

async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}