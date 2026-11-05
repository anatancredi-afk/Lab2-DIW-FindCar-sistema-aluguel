const API = "http://localhost:3000";
const $ = id => document.getElementById(id);
const IMAGEM_PADRAO = "assets/img/carro-exemplo.png";

let usuario = null;
let cliente = null;
let dados = {};
let aba = "";

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function seguro(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, letra => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[letra]);
}

function dataHoje() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function dias(inicio, fim) {
  const primeira = new Date(inicio + "T12:00:00");
  const segunda = new Date(fim + "T12:00:00");
  return Math.round((segunda - primeira) / 86400000);
}

function mostrarAviso(texto, tipo = "success") {
  $("aviso").className = `alert alert-${tipo}`;
  $("aviso").textContent = texto;
}

// Comunicação com o banco

async function api(caminho, metodo = "GET", corpo = null) {
  const opcoes = { method: metodo };

  if (corpo !== null) {
    opcoes.headers = { "Content-Type": "application/json" };
    opcoes.body = JSON.stringify(corpo);
  }

  const resposta = await fetch(`${API}/${caminho}`, opcoes);

  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status} em ${caminho}`);
  }

  if (metodo === "DELETE") return null;

  return await resposta.json();
}

async function carregar() {
  dados.usuarios = await api("usuarios");
  dados.clientes = await api("clientes");
  dados.agentes = await api("agentes");
  dados.automoveis = await api("automoveis");
  dados.pedidos = await api("pedidos");
  dados.contratos = await api("contratos");

  if (usuario && usuario.tipo === "cliente") {
    cliente = dados.clientes.find(c =>
      String(c.id) === String(usuario.referenciaId)
    );
  }
}

function buscarCarro(id) {
  return dados.automoveis.find(c => String(c.id) === String(id));
}

function buscarPedido(id) {
  return dados.pedidos.find(p => String(p.id) === String(id));
}

function buscarCliente(id) {
  return dados.clientes.find(c => String(c.id) === String(id));
}

function nomeDono(carro) {
  if (carro.proprietarioTipo === "cliente") {
    const dono = buscarCliente(carro.proprietarioId);
    return dono ? dono.nome : "Cliente";
  }

  const dono = dados.agentes.find(a =>
    a.tipo === carro.proprietarioTipo &&
    String(a.id) === String(carro.proprietarioId)
  );

  return dono ? dono.nome : "Não informado";
}

function abrirModal(titulo, conteudo) {
  $("modalTitulo").textContent = titulo;
  $("modalCorpo").innerHTML = conteudo;
  bootstrap.Modal.getOrCreateInstance($("modal")).show();
}

function fecharModal() {
  bootstrap.Modal.getOrCreateInstance($("modal")).hide();
}
