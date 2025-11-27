let matriz = [[]];
let estados = new Set();

function sanitizar(sentenca) {
  return sentenca
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "");
}

function charIndiceRespectivo(caractere) {
  return caractere.charCodeAt(0) - 97;
}

let contEstados = 1;

function criaEstado() {
  matriz.push(new Array(26).fill(null));
  return contEstados++;
}

//genuinamente nao e o melhor nome mas FUNCIONA
function meterToken(token) {
  let estado = 0;

  for (let i = 0; i < token.length; i++) {
    const caractere = token[i];
    const coluna = charIndiceRespectivo(caractere);

    if (matriz[estado][coluna] === null) {
      const estadoNovo = criaEstado();
      matriz[estado][coluna] = estadoNovo;
      estado = estadoNovo;
    } else {
      estado = matriz[estado][coluna];
    }
  }

  estados.add(estado);
}

function renderizarMatriz() {
  const tbody = document.getElementById("tab-matriz");
  tbody.innerHTML = "";

  for (let estado = 0; estado < matriz.length; estado++) {
    const tr = document.createElement("tr");
    const tdEstado = document.createElement("td");

    tdEstado.textContent = `q${estado}`;

    if (estados.has(estado)) {
      tdEstado.textContent += "*";
      tdEstado.style.backgroundColor = "var(--verde)";
    }

    tr.appendChild(tdEstado);

    for (let coluna = 0; coluna < 26; coluna++) {
      const td = document.createElement("td");
      td.dataset.estado = estado;
      td.dataset.coluna = coluna;

      const valor = matriz[estado][coluna];
      td.textContent = valor !== null ? `q${valor}` : "";

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
}

function pesquisa(texto) {
  //isso aq reseta a formatacao de campos sem ter q dar backtrack
  document.querySelectorAll("td").forEach((td) => {
    td.style.backgroundColor = "";
    td.style.color = "";
  });

  const sentenca = sanitizar(texto).replace(/\s/g, "");
  if (!sentenca) {
    document.getElementById("status").textContent = "";
    return;
  }

  let estado = 0;
  let valido = true;

  for (let i = 0; i < sentenca.length; i++) {
    const caractere = sentenca[i];
    const coluna = charIndiceRespectivo(caractere);
    const celula = document.querySelector(
      `td[data-estado="${estado}"][data-coluna="${coluna}"]`,
    );

    if (matriz[estado][coluna] !== null) {
      const proximoEstado = matriz[estado][coluna];

      if (celula) {
        celula.style.backgroundColor = "var(--verde)";
        celula.style.color = "white";
      }

      estado = proximoEstado;
    } else {
      if (celula) {
        celula.style.backgroundColor = "var(--vermelho)";
        celula.style.color = "white";
      }
      valido = false;
      break;
    }
  }

  const status = document.getElementById("status");

  if (!valido) {
    status.textContent = "Sentença inválida >:(";
    status.style.color = "var(--vermelho)";
  } else if (estados.has(estado)) {
    status.textContent = "Sentença válida :D";
    status.style.color = "var(--verde-terminal)";
  } else {
    status.textContent = "hmmm...";
    status.style.color = "var(--terminal-neutro)";
  }
}

//preload dinamico da matriz
document.addEventListener("DOMContentLoaded", function () {
  matriz[0] = new Array(26).fill(null);
  renderizarMatriz();

  document
    .getElementById("adicionar-palavra")
    .addEventListener("click", function () {
      const input = document.getElementById("entrada-palavras");
      const texto = sanitizar(input.value);

      if (texto.trim()) {
        const tokens = texto.split(/\s+/).filter((p) => p.length > 0);
        tokens.forEach((token) => meterToken(token));
        renderizarMatriz();
        input.value = "";
      }
    });

  document
    .getElementById("entrada-palavras")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("adicionar-palavra").click();
      }
    });
});
