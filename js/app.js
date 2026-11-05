function mostrarSistema() {
  $("login").classList.add("d-none");
  $("app").classList.remove("d-none");

  const ehCliente = usuario.tipo === "cliente";

  if (ehCliente) {
    $("saudacao").textContent = `Bem-vindo(a), ${cliente.nome}`;
    $("tituloArea").textContent = "Área do Cliente";
    $("subtituloArea").textContent =
      "Escolha um carro e acompanhe seus pedidos";
  } else {
    $("saudacao").textContent = "Bem-vindo, Agente";
    $("tituloArea").textContent = "Área do Agente";
    $("subtituloArea").textContent =
      "Gerencie veículos, pedidos e contratos";
  }

  const menus = ehCliente
    ? [
        ["veiculos", "Veículos"],
        ["meus", "Meus pedidos"],
        ["perfil", "Meu perfil"]
      ]
    : [
        ["contratos", "Contratos"],
        ["pedidos", "Pedidos"],
        ["automoveis", "Automóveis"]
      ];

  if (!menus.some(m => m[0] === aba)) {
    aba = menus[0][0];
  }

  $("abas").innerHTML = menus.map(m => `
    <button type="button"
      data-aba="${m[0]}"
      class="${aba === m[0] ? "active" : ""}">
      ${m[1]}
    </button>
  `).join("");

  mostrarAba();
}

function mostrarAba() {
  if (aba === "veiculos") mostrarVeiculos();
  if (aba === "meus") mostrarMeusPedidos();
  if (aba === "perfil") mostrarPerfil();
  if (aba === "contratos") mostrarContratos();
  if (aba === "pedidos") mostrarPedidos();
  if (aba === "automoveis") mostrarAutomoveis();
}

// Eventos

$("loginForm").addEventListener("submit", entrar);
$("sair").addEventListener("click", sair);

$("abas").addEventListener("click", evento => {
  const botao = evento.target.closest("[data-aba]");
  if (!botao) return;

  aba = botao.dataset.aba;
  mostrarSistema();
});

$("conteudo").addEventListener("submit", evento => {
  if (evento.target.id === "formPerfil") {
    salvarPerfil(evento);
  }
});


$("modalCorpo").addEventListener("submit", evento => {
  if (evento.target.id === "formSimulacao") {
    salvarSimulacao(evento);
  }

  if (evento.target.id === "formAnalise") {
    salvarAnalise(evento);
  }

  if (evento.target.id === "formCarro") {
    salvarCarro(evento);
  }

  if (evento.target.id === "formEditarPedido") {
    salvarEdicaoPedido(evento);
  }

  if (evento.target.id === "formExecutarContrato") {
    salvarExecucaoContrato(evento);
  }
});


$("modalCorpo").addEventListener("input", evento => {
  if (["simInicio", "simFim", "simKm"].includes(evento.target.id)) {
    atualizarSimulacao();
  }
});

$("modalCorpo").addEventListener("change", evento => {
  if (evento.target.id === "possuiCredito") {
    atualizarCamposCredito();
  }
});

restaurar();
