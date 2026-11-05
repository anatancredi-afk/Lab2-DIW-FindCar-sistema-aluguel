function mostrarVeiculos() {
  const carros = dados.automoveis.filter(c => c.disponivel);

  $("conteudo").innerHTML = `
    <h2 class="section-title">Veículos disponíveis</h2>
    <div class="row g-4">
      ${carros.map(c => `
        <div class="col-md-6 col-xl-4">
          <div class="car-card">
            <img class="car-image" src="${IMAGEM_PADRAO}"
              alt="${seguro(c.modelo)}">

            <div class="card-body">
              <h3>${seguro(c.marca)} ${seguro(c.modelo)}</h3>
              <p>
                Ano: ${seguro(c.ano)}<br>
                Placa: ${seguro(c.placa)}<br>
                Proprietário: ${seguro(nomeDono(c))}
              </p>
              <p>Quilômetro: ${dinheiro(c.valorKm)}</p>
              <div class="car-price">${dinheiro(c.valorDiaria)} / dia</div>

              <button class="btn btn-primary"
                onclick="simular('${seguro(c.id)}')">
                Simular aluguel
              </button>
            </div>
          </div>
        </div>
      `).join("") || "<p>Nenhum veículo disponível.</p>"}
    </div>
  `;
}

// Simulação de aluguel

function existeConflito(carroId, inicio, fim, ignorar = "") {
  return dados.pedidos.some(p =>
    String(p.automovelId) === String(carroId) &&
    String(p.id) !== String(ignorar) &&
    !["Cancelado", "Recusado"].includes(p.status) &&
    inicio < p.dataFim &&
    fim > p.dataInicio
  );
}

function simular(carroId, pedidoId = "") {
  const p = pedidoId ? buscarPedido(pedidoId) : null;

  if (p && (p.status !== "Pendente" ||
      String(p.clienteId) !== String(cliente.id))) {
    mostrarAviso("Pedido não pode ser editado.", "warning");
    return;
  }

  const c = buscarCarro(carroId);
  if (!c) return;

  abrirModal(p ? "Editar pedido" : "Simular aluguel", `
    <form id="formSimulacao"
      data-pedido="${seguro(pedidoId)}"
      data-carro="${seguro(c.id)}">

      <h4>${seguro(c.marca)} ${seguro(c.modelo)}</h4>

      <div class="row g-3">
        <div class="col-md-6">
          <label>Retirada</label>
          <input id="simInicio" type="date"
            class="form-control" min="${dataHoje()}"
            value="${seguro(p?.dataInicio || "")}" required>
        </div>

        <div class="col-md-6">
          <label>Devolução</label>
          <input id="simFim" type="date"
            class="form-control" min="${dataHoje()}"
            value="${seguro(p?.dataFim || "")}" required>
        </div>

        <div class="col-md-6">
          <label>Dias</label>
          <input id="simDias" class="form-control" readonly>
        </div>

        <div class="col-md-6">
          <label>Quilômetros estimados</label>
          <input id="simKm" type="number"
            class="form-control" min="0" step="1"
            value="${seguro(p?.kmEstimados ?? 0)}" required>
        </div>
      </div>

      <div class="info-box mt-3">
        <p>Diária: ${dinheiro(c.valorDiaria)}</p>
        <p>Km: ${dinheiro(c.valorKm)}</p>
        <strong>Total: <span id="simTotal">${dinheiro(0)}</span></strong>
      </div>

      <p id="erroSim" class="text-danger"></p>

      <button class="btn btn-primary mt-3" type="submit">
        ${p ? "Salvar alterações" : "Enviar pedido"}
      </button>
    </form>
  `);

  atualizarSimulacao();
}

function atualizarSimulacao() {
  const form = $("formSimulacao");
  if (!form) return;

  const c = buscarCarro(form.dataset.carro);
  const inicio = $("simInicio").value;
  const fim = $("simFim").value;
  const km = Number($("simKm").value);
  const quantidade = inicio && fim ? dias(inicio, fim) : 0;

  $("simDias").value = quantidade > 0 ? quantidade : "";

  let total = 0;

  if (quantidade > 0 && km >= 0) {
    total = quantidade * c.valorDiaria + km * c.valorKm;
  }

  $("simTotal").textContent = dinheiro(total);
}

async function salvarSimulacao(evento) {
  evento.preventDefault();

  const form = evento.target;
  const id = form.dataset.pedido;
  const c = buscarCarro(form.dataset.carro);
  const inicio = $("simInicio").value;
  const fim = $("simFim").value;
  const km = Number($("simKm").value);
  const quantidade = dias(inicio, fim);

  if (!inicio || !fim || inicio < dataHoje() ||
      quantidade <= 0 || !Number.isInteger(km) || km < 0) {
    $("erroSim").textContent = "Confira as datas e a quilometragem.";
    return;
  }

  try {
    await carregar();

    if (existeConflito(c.id, inicio, fim, id)) {
      throw new Error("Veículo já solicitado nesse período.");
    }

    if (id) {
      const atual = buscarPedido(id);

      if (!atual || atual.status !== "Pendente" ||
          String(atual.clienteId) !== String(cliente.id)) {
        throw new Error("Pedido não pode mais ser editado.");
      }
    } else if (!buscarCarro(c.id)?.disponivel) {
      throw new Error("Veículo indisponível.");
    }

    const registro = {
      dataInicio: inicio,
      dataFim: fim,
      quantidadeDias: quantidade,
      kmEstimados: km,
      valorDiaria: c.valorDiaria,
      valorKm: c.valorKm,
      valorEstimado: quantidade * c.valorDiaria + km * c.valorKm
    };

    if (id) {
      await api(`pedidos/${id}`, "PATCH", registro);
    } else {
      await api("pedidos", "POST", {
        ...registro,
        clienteId: cliente.id,
        automovelId: c.id,
        status: "Pendente",
        parecer: "",
        dataSolicitacao: dataHoje()
      });
    }

    fecharModal();
    await carregar();
    mostrarAba();
    mostrarAviso("Pedido salvo com sucesso!");

  } catch (erro) {
    $("erroSim").textContent = erro.message;
  }
}

// Pedidos do cliente

function mostrarMeusPedidos() {
  const pedidos = dados.pedidos.filter(p =>
    String(p.clienteId) === String(cliente.id)
  );

  $("conteudo").innerHTML = `
    <h2 class="section-title">Meus pedidos</h2>
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Carro</th><th>Período</th><th>Km</th>
            <th>Valor</th><th>Status</th><th>Parecer</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${pedidos.map(p => {
            const c = buscarCarro(p.automovelId);

            return `
              <tr>
                <td>${seguro(c?.marca)} ${seguro(c?.modelo)}</td>
                <td>${seguro(p.dataInicio)} a ${seguro(p.dataFim)}</td>
                <td>${seguro(p.kmEstimados)}</td>
                <td>${dinheiro(p.valorEstimado)}</td>
                <td>${seguro(p.status)}</td>
                <td>${seguro(p.parecer || "-")}</td>
                <td>
                  ${p.status === "Pendente" ? `
                    <button class="btn btn-sm btn-outline-primary"
                      onclick="simular('${seguro(p.automovelId)}','${seguro(p.id)}')">
                      Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                      onclick="cancelarPedido('${seguro(p.id)}')">
                      Cancelar
                    </button>
                  ` : "-"}
                </td>
              </tr>
            `;
          }).join("") || '<tr><td colspan="7">Nenhum pedido.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

async function cancelarPedido(id) {
  const p = buscarPedido(id);

  if (!p || p.status !== "Pendente" ||
      String(p.clienteId) !== String(cliente.id)) {
    mostrarAviso("Pedido não pode ser cancelado.", "warning");
    return;
  }

  if (!confirm("Cancelar este pedido?")) return;

  try {
    await api(`pedidos/${id}`, "PATCH", { status: "Cancelado" });
    await carregar();
    mostrarAba();
    mostrarAviso("Pedido cancelado.");
  } catch (erro) {
    mostrarAviso(erro.message, "danger");
  }
}

// Perfil do cliente

function campoEmprego(emprego = {}) {
  return `
    <div class="emprego row g-2 mb-2">
      <div class="col-md-6">
        <input class="form-control nomeEmprego"
          placeholder="Empregador"
          value="${seguro(emprego.empregador || "")}">
      </div>
      <div class="col-md-4">
        <input class="form-control rendaEmprego"
          type="number" min="0" step="0.01"
          placeholder="Rendimento"
          value="${seguro(emprego.rendimento ?? "")}">
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-outline-danger"
          onclick="this.closest('.emprego').remove()">
          Remover
        </button>
      </div>
    </div>
  `;
}

function adicionarEmprego() {
  if (document.querySelectorAll(".emprego").length >= 3) {
    mostrarAviso("Máximo de três empregadores.", "warning");
    return;
  }

  $("empregos").insertAdjacentHTML("beforeend", campoEmprego());
}

function mostrarPerfil() {
  $("conteudo").innerHTML = `
    <h2 class="section-title">Meu perfil</h2>

    <form id="formPerfil" class="form-card">
      <div class="row g-3">
        <div class="col-md-6">
          <label>Nome</label>
          <input name="nome" class="form-control"
            value="${seguro(cliente.nome)}" required>
        </div>
        <div class="col-md-3">
          <label>CPF</label>
          <input name="cpf" class="form-control"
            value="${seguro(cliente.cpf)}" required>
        </div>
        <div class="col-md-3">
          <label>RG</label>
          <input name="rg" class="form-control"
            value="${seguro(cliente.rg)}" required>
        </div>
        <div class="col-md-7">
          <label>Endereço</label>
          <input name="endereco" class="form-control"
            value="${seguro(cliente.endereco)}" required>
        </div>
        <div class="col-md-5">
          <label>Profissão</label>
          <input name="profissao" class="form-control"
            value="${seguro(cliente.profissao)}" required>
        </div>
      </div>

      <h4 class="mt-4">Empregadores e rendimentos</h4>
      <div id="empregos">
        ${(cliente.empregos || []).map(campoEmprego).join("")}
      </div>

      <button type="button" class="btn btn-outline-primary mt-2"
        onclick="adicionarEmprego()">
        Adicionar empregador
      </button>

      <div class="mt-4">
        <button class="btn btn-primary">Salvar perfil</button>
      </div>
    </form>
  `;
}

async function salvarPerfil(evento) {
  evento.preventDefault();

  const form = evento.target;
  const empregos = [];

  for (const linha of document.querySelectorAll(".emprego")) {
    const nome = linha.querySelector(".nomeEmprego").value.trim();
    const rendaTexto = linha.querySelector(".rendaEmprego").value;

    if (!nome && !rendaTexto) continue;

    if (!nome || rendaTexto === "" || Number(rendaTexto) < 0) {
      mostrarAviso("Confira os empregadores.", "danger");
      return;
    }

    empregos.push({
      empregador: nome,
      rendimento: Number(rendaTexto)
    });
  }

  const registro = {
    nome: form.elements.nome.value.trim(),
    cpf: form.elements.cpf.value.trim(),
    rg: form.elements.rg.value.trim(),
    endereco: form.elements.endereco.value.trim(),
    profissao: form.elements.profissao.value.trim(),
    empregos
  };

  try {
    await api(`clientes/${cliente.id}`, "PATCH", registro);
    await carregar();
    mostrarAba();
    $("saudacao").textContent = `Bem-vindo(a), ${cliente.nome}`;
    mostrarAviso("Perfil salvo!");
  } catch (erro) {
    mostrarAviso(erro.message, "danger");
  }
}
