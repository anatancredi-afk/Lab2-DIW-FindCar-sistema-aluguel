async function entrar(evento) {
  evento.preventDefault();

  try {
    await carregar();

    const email = $("email").value.trim();
    const senha = $("senha").value;

    const conta = dados.usuarios.find(u =>
      u.email === email && u.senha === senha
    );

    if (!conta) {
      mostrarAviso("E-mail ou senha incorretos.", "danger");
      return;
    }

    if (conta.tipo !== "cliente" && conta.tipo !== "agente") {
      throw new Error("Tipo de usuário inválido.");
    }

    usuario = conta;

    if (conta.tipo === "cliente") {
      cliente = buscarCliente(conta.referenciaId);
    } else {
      cliente = null;
    }

    if (conta.tipo === "cliente" && !cliente) {
      throw new Error("Cliente não encontrado.");
    }

    sessionStorage.setItem("findcarId", String(conta.id));
    aba = "";
    mostrarSistema();

  } catch (erro) {
    mostrarAviso(erro.message, "danger");
  }
}

function sair() {
  usuario = null;
  cliente = null;
  aba = "";

  sessionStorage.removeItem("findcarId");

  $("app").classList.add("d-none");
  $("login").classList.remove("d-none");
  $("loginForm").reset();
}

async function restaurar() {
  const id = sessionStorage.getItem("findcarId");

  if (!id) return;

  try {
    await carregar();

    usuario = dados.usuarios.find(u =>
      String(u.id) === String(id)
    );

    if (!usuario || !["cliente", "agente"].includes(usuario.tipo)) {
      sair();
      return;
    }

    if (usuario.tipo === "cliente") {
      cliente = buscarCliente(usuario.referenciaId);
    } else {
      cliente = null;
    }

    if (usuario.tipo === "cliente" && !cliente) {
      sair();
      return;
    }

    mostrarSistema();

  } catch (erro) {
    mostrarAviso("Inicie o JSON Server na porta 3000.", "warning");
  }
}
