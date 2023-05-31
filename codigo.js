"use strict";

const agregar = document.querySelector(".agregar");
const resultados = document.querySelector(".resultados");

const solicitudBD = indexedDB.open("listaCompras",4);

solicitudBD.addEventListener("upgradeneeded", ()=> {
	const bd = solicitudBD.result;
	
	bd.addEventListener("error", ()=> {
		alert("Ocurrio un error");
	})

	bd.createObjectStore("compras", {
		autoIncrement: true
	});
})

solicitudBD.addEventListener("success", ()=> {
	console.log("Todo salio bien");
	verListaCompras();
})

const añadirListaCompras = objeto => {
	const bd = solicitudBD.result;
	const transaccion = bd.transaction("compras", "readwrite");

	const solicitudFinal = transaccion.objectStore("compras");

	let resultado;

	resultado = solicitudFinal.add(objeto);

	resultado.addEventListener("complete", ()=> {
		alert("Objeto agregado a la Base de Datos correctamente");
	})
}

let valorTotal = 0;

const verListaCompras = () => {
	const bd = solicitudBD.result;
	const transaccion = bd.transaction("compras", "readonly");
	const objeto = transaccion.objectStore("compras");

	const cursor = objeto.openCursor();

	let datos = resultados.querySelectorAll("DIV");

	datos.forEach(dato => dato.remove());
	

	cursor.addEventListener("success", ()=> {
		if (cursor.result) {

			let fragmento = document.createDocumentFragment();
			let div = document.createElement("DIV");
			let inputRedondo = document.createElement("INPUT");
			let p = document.createElement("P");
			let botonEditar = document.createElement("BUTTON");
			let botonGuardar = document.createElement("BUTTON");
			let botonEliminar = document.createElement("BUTTON");
			let precioP = document.createElement("P");

			inputRedondo.setAttribute("type","checkbox");
			inputRedondo.setAttribute("class","check");
			inputRedondo.setAttribute("id",`input${cursor.result.key}`);
			inputRedondo.setAttribute("onchange", `funcionTachar("${inputRedondo.id}")`);

			p.textContent = cursor.result.value.objeto;
			p.setAttribute("id",cursor.result.key);
			p.style.width = "40%";

			botonEditar.textContent = "Editar";
			botonEditar.setAttribute("id",`editar${cursor.result.key}`);
			botonEditar.classList.add("editar");
			botonEditar.setAttribute("onclick",`funcionEditar("${botonEditar.id}")`);

			botonGuardar.textContent = "Guardar";
			botonGuardar.setAttribute("id",`guardar${cursor.result.key}`);
			botonGuardar.classList.add("guardar");
			botonGuardar.style.display ="none";
			botonGuardar.setAttribute("onclick",`funcionGuardar("${botonGuardar.id}")`);

			botonEliminar.textContent =  "Eliminar";
			botonEliminar.setAttribute("id",`eliminar${cursor.result.key}`);
			botonEliminar.classList.add("eliminar");
			botonEliminar.setAttribute("onclick",`funcionEliminar("${botonEliminar.id}")`);

			precioP.textContent = cursor.result.value.precio;
			precioP.classList.add("precio");

			div.appendChild(inputRedondo);
			div.appendChild(p);
			div.appendChild(botonEditar);
			div.appendChild(botonGuardar);
			div.appendChild(botonEliminar);
			div.appendChild(precioP);
			fragmento.appendChild(div);

			resultados.appendChild(fragmento);

			let numero = parseInt(cursor.result.value.precio);
			valorTotal += numero;

			cursor.result.continue();

			console.log(valorTotal);
		}
		let cuentaTotal = document.querySelector(".total");
		cuentaTotal.textContent = valorTotal;
	})
}

agregar.addEventListener("click", ()=> {
	let input = document.querySelector(".input");
	let texto = input.value;
	input.value = "";

	let inputNum = document.querySelector(".valor");
	let valor = inputNum.value;
	inputNum.value = "";

	if (texto == "") {
		alert("Tienes que escribir algo");
		return 0;
	}

	if(valor == "") {
		alert("Tienes que escribir un valor");
		return 0;
	}
	
	añadirListaCompras({objeto: texto, precio: valor});
	valorTotal = 0;
	verListaCompras();
})

const funcionTachar = identificador => {
	let element = document.getElementById(`${identificador}`);
	console.log(element);
	let texto = element.nextElementSibling;

	if(element.checked) {
		texto.style.textDecoration = "line-through";
	}else if(element.checked == false) {
		texto.style.textDecoration = "none";
	}
}

const funcionEditar = identificador => {
	let element = document.getElementById(`${identificador}`);
	let texto = element.previousElementSibling;
	let botonSig = element.nextElementSibling;
	let precio = botonSig.nextElementSibling.nextElementSibling;

	texto.setAttribute("contenteditable","true");
	precio.setAttribute("contenteditable","true");
	element.style.display = "none";
	botonSig.style.display = "inline-block";
}

const modificarLista = (objeto,key) => {
	const bd = solicitudBD.result;
	const transaccion = bd.transaction(["compras"],"readwrite");
	const objetoBd = transaccion.objectStore("compras");
	objetoBd.put(objeto,key);
}


const funcionGuardar = identificador => {
	let element = document.getElementById(`${identificador}`);
	let botonAnt = element.previousElementSibling;
	let texto = botonAnt.previousElementSibling;
	let nuevoValor = texto.textContent;
	let precio = element.nextElementSibling.nextElementSibling;
	let nuevoPrecio = precio.textContent;

	texto.setAttribute("contenteditable","false");
	let Id = texto.id;

	modificarLista({objeto : nuevoValor, precio : nuevoPrecio},parseInt(Id));
	
	valorTotal = 0;
	verListaCompras();

	element.style.display = "none";
	botonAnt.style.display = "inline-block";
}

const funcionEliminar = identificador => {
	let element = document.getElementById(`${identificador}`);
	let valor = element.previousElementSibling.previousElementSibling.previousElementSibling.id;
	let nodoPadre = element.parentNode;

	let precio = element.nextElementSibling.textContent;
	let cuentaTotal = document.querySelector(".total");
	let resta = parseInt(cuentaTotal.textContent) - parseInt(precio);

	cuentaTotal.textContent = resta;

	const bd = solicitudBD.result;
	const transaccion = bd.transaction(["compras"],"readwrite");
	const objetoBd = transaccion.objectStore("compras");
	objetoBd.delete(parseInt(valor));

	nodoPadre.remove();
}