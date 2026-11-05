
/* PEDIDOS DO AGENTE */

function mostrarPedidos() {
  let linhas = "";

  for (const pedido of dados.pedidos) {
    const clientePedido = buscarCliente(pedido.clienteId);
    const carro = buscarCarro(pedido.automovelId);

    let acoes = "-";

    if (pedido.status === "Pendente" ||
        pedido.status === "Em análise") {
      acoes = `
        <button class="btn btn-sm btn-outline-primary"
          onclick="editarPedidoAgente('${seguro(pedido.id)}')">
          Editar
        </button>

        <button class="btn btn-sm btn-primary"
          onclick="analisar('${seguro(pedido.id)}')">
          Analisar
        </button>
      `;
    }

    linhas += `
      <tr>
        <td>${seguro(clientePedido ? clientePedido.nome : "-")}</td>
        <td>${seguro(carro ? carro.marca : "")}
            ${seguro(carro ? carro.modelo : "")}</td>
        <td>${seguro(pedido.dataInicio)} a
            ${seguro(pedido.dataFim)}</td>
        <td>${dinheiro(pedido.valorEstimado)}</td>
        <td>${seguro(pedido.status)}</td>
        <td>${acoes}</td>
      </tr>
    `;
  }

  if (!linhas) {
    linhas = `
      <tr>
        <td colspan="6">Nenhum pedido cadastrado.</td>
      </tr>
    `;
  }

  $("conteudo").innerHTML = `
    <h2 class="section-title">Análise de pedidos</h2>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Veículo</th>
            <th>Período</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>
  `;
}

/* EDIÇÃO DE PEDIDOS PELO AGENTE */

function editarPedidoAgente(id) {
  const pedido = buscarPedido(id);

  if (!pedido) return;

  if (pedido.status !== "Pendente" &&
      pedido.status !== "Em análise") {
    mostrarAviso("Este pedido não pode ser editado.", "warning");
    return;
  }

  const carro = buscarCarro(pedido.automovelId);

  if (!carro) {
    mostrarAviso("Veículo não encontrado.", "danger");
    return;
  }

  abrirModal("Editar pedido de aluguel", `
    <form id="formEditarPedido" data-id="${seguro(id)}">

      <h4>${seguro(carro.marca)} ${seguro(carro.modelo)}</h4>

      <div class="row g-3">

        <div class="col-md-6">
          <label>Data de retirada</label>
          <input name="inicio" type="date"
            class="form-control"
            value="${seguro(pedido.dataInicio)}" required>
        </div>

        <div class="col-md-6">
          <label>Data de devolução</label>
          <input name="fim" type="date"
            class="form-control"
            value="${seguro(pedido.dataFim)}" required>
        </div>

        <div class="col-md-6">
          <label>Quilômetros estimados</label>
          <input name="km" type="number"
            class="form-control"
            min="0" step="1"
            value="${seguro(pedido.kmEstimados)}" required>
        </div>

        <div class="col-md-6">
          <label>Valor da diária</label>
          <input class="form-control"
            value="${dinheiro(pedido.valorDiaria)}" readonly>
        </div>

      </div>

      <p class="text-secondary mt-3">
        O valor estimado será recalculado ao salvar.
      </p>

      <p id="erroEditarPedido" class="text-danger"></p>

      <button type="submit" class="btn btn-primary">
        Salvar alterações
      </button>
    </form>
  `);
}

async function salvarEdicaoPedido(evento) {
  evento.preventDefault();

  const form = evento.target;
  const id = form.dataset.id;

  const inicio = form.elements.inicio.value;
  const fim = form.elements.fim.value;
  const km = Number(form.elements.km.value);
  const quantidade = dias(inicio, fim);

  if (!inicio || !fim || quantidade <= 0 ||
      !Number.isInteger(km) || km < 0) {
    $("erroEditarPedido").textContent =
      "Confira as datas e a quilometragem.";
    return;
  }

  try {
    await carregar();

    const pedido = buscarPedido(id);

    if (!pedido ||
        (pedido.status !== "Pendente" &&
         pedido.status !== "Em análise")) {
      throw new Error("Este pedido não pode mais ser editado.");
    }

    // Verifica conflitos com outros pedidos do veículo.
    const conflito = dados.pedidos.some(p =>
      String(p.automovelId) === String(pedido.automovelId) &&
      String(p.id) !== String(id) &&
      p.status !== "Cancelado" &&
      p.status !== "Recusado" &&
      inicio < p.dataFim &&
      fim > p.dataInicio
    );

    if (conflito) {
      throw new Error("Já existe um pedido nesse período.");
    }

    const valor = quantidade * Number(pedido.valorDiaria) +
                  km * Number(pedido.valorKm);

    await api(`pedidos/${id}`, "PATCH", {
      dataInicio: inicio,
      dataFim: fim,
      quantidadeDias: quantidade,
      kmEstimados: km,
      valorEstimado: valor
    });

    fecharModal();
    await carregar();
    mostrarAba();
    mostrarAviso("Pedido atualizado com sucesso!");

  } catch (erro) {
    $("erroEditarPedido").textContent = erro.message;
  }
}

/* ANÁLISE FINANCEIRA */

function analisar(id) {
  const pedido = buscarPedido(id);

  if (!pedido) return;

  if (pedido.status !== "Pendente" &&
      pedido.status !== "Em análise") {
    mostrarAviso("Pedido já finalizado.", "warning");
    return;
  }

  const pessoa = buscarCliente(pedido.clienteId);
  const carro = buscarCarro(pedido.automovelId);

  if (!pessoa || !carro) return;

  let rendaTotal = 0;
  let empregosHTML = "";

  for (const emprego of pessoa.empregos || []) {
    rendaTotal += Number(emprego.rendimento);

    empregosHTML += `
      <p>
        ${seguro(emprego.empregador)}:
        ${dinheiro(emprego.rendimento)}
      </p>
    `;
  }

  if (!empregosHTML) {
    empregosHTML = "<p>Não informado.</p>";
  }

  abrirModal("Análise financeira", `
    <form id="formAnalise" data-id="${seguro(id)}">

      <h4>${seguro(pessoa.nome)}</h4>

      <p>
        CPF: ${seguro(pessoa.cpf)}<br>
        RG: ${seguro(pessoa.rg)}<br>
        Profissão: ${seguro(pessoa.profissao)}<br>
        Endereço: ${seguro(pessoa.endereco)}
      </p>

      <h5>Empregadores e rendimentos</h5>

      ${empregosHTML}

      <p>
        <strong>Renda total: ${dinheiro(rendaTotal)}</strong>
      </p>

      <hr>

      <h5>Dados do aluguel</h5>

      <p>
        Veículo: ${seguro(carro.marca)}
        ${seguro(carro.modelo)}<br>
        Período: ${seguro(pedido.dataInicio)} a
        ${seguro(pedido.dataFim)}<br>
        Dias: ${seguro(pedido.quantidadeDias)}<br>
        Km estimados: ${seguro(pedido.kmEstimados)}<br>
        Valor estimado: ${dinheiro(pedido.valorEstimado)}
      </p>

      <label>Parecer financeiro</label>
      <textarea id="parecer"
        class="form-control" required>${seguro(pedido.parecer || "")}</textarea>

      <label class="mt-3">Decisão</label>
      <select id="decisao" class="form-select" required>
        <option value="">Selecione</option>
        <option value="Em análise">Manter em análise</option>
        <option value="Aprovado">Aprovar</option>
        <option value="Recusado">Recusar</option>
      </select>

      <p id="erroAnalise" class="text-danger mt-2"></p>

      <button type="submit" class="btn btn-primary mt-3">
        Salvar avaliação
      </button>
    </form>
  `);
}

async function salvarAnalise(evento) {
  evento.preventDefault();

  const id = evento.target.dataset.id;
  const parecer = $("parecer").value.trim();
  const status = $("decisao").value;

  if (!parecer || !["Em análise", "Aprovado", "Recusado"].includes(status)) {
    $("erroAnalise").textContent = "Informe o parecer e a decisão.";
    return;
  }

  try {
    await carregar();

    const pedido = buscarPedido(id);

    if (!pedido ||
        (pedido.status !== "Pendente" &&
         pedido.status !== "Em análise")) {
      throw new Error("Pedido já finalizado.");
    }

    await api(`pedidos/${id}`, "PATCH", {
      parecer: parecer,
      status: status
    });

    // Um pedido aprovado fica disponível para contratação.
    if (status === "Aprovado") {
      const existeContrato = dados.contratos.some(c =>
        String(c.pedidoId) === String(id)
      );

      if (!existeContrato) {
        await api("contratos", "POST", {
          pedidoId: pedido.id,
          clienteId: pedido.clienteId,
          automovelId: pedido.automovelId,
          valorEstimado: pedido.valorEstimado,
          status: "Aguardando contratação",
          creditoBancario: false,
          bancoId: null,
          creditoId: null,
          dataExecucao: null
        });
      }
    }

    fecharModal();
    await carregar();
    mostrarAba();
    mostrarAviso("Avaliação salva com sucesso!");

  } catch (erro) {
    $("erroAnalise").textContent = erro.message;
  }
}

/* CONTRATOS */

function nomeBanco(id) {
  const banco = dados.agentes.find(a =>
    a.tipo === "banco" &&
    String(a.id) === String(id)
  );

  return banco ? banco.nome : "Não informado";
}

function mostrarContratos() {
  let linhas = "";

  for (const contrato of dados.contratos) {
    const pessoa = buscarCliente(contrato.clienteId);
    const carro = buscarCarro(contrato.automovelId);

    let credito = "Não";

    if (contrato.creditoBancario) {
      credito = `
        Sim<br>
        <small>${seguro(nomeBanco(contrato.bancoId))}</small>
      `;
    }

    let acao = "-";

    if (contrato.status === "Aguardando contratação") {
      acao = `
        <button class="btn btn-sm btn-primary"
          onclick="executarContrato('${seguro(contrato.id)}')">
          Executar contrato
        </button>
      `;
    }

    linhas += `
      <tr>
        <td>${seguro(contrato.id)}</td>
        <td>${seguro(pessoa ? pessoa.nome : "-")}</td>
        <td>
          ${seguro(carro ? carro.marca : "")}
          ${seguro(carro ? carro.modelo : "")}
        </td>
        <td>${seguro(carro ? nomeDono(carro) : "-")}</td>
        <td>${dinheiro(contrato.valorEstimado)}</td>
        <td>${seguro(contrato.status)}</td>
        <td>${credito}</td>
        <td>${acao}</td>
      </tr>
    `;
  }

  if (!linhas) {
    linhas = `
      <tr>
        <td colspan="8">Nenhum contrato cadastrado.</td>
      </tr>
    `;
  }

  $("conteudo").innerHTML = `
    <h2 class="section-title">Contratos de aluguel</h2>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Veículo</th>
            <th>Proprietário</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Crédito bancário</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>${linhas}</tbody>
      </table>
    </div>
  `;
}

/* EXECUÇÃO E CRÉDITO BANCÁRIO */

function executarContrato(id) {
  const contrato = dados.contratos.find(c =>
    String(c.id) === String(id)
  );

  if (!contrato || contrato.status !== "Aguardando contratação") {
    mostrarAviso("Contrato indisponível para execução.", "warning");
    return;
  }

  const pessoa = buscarCliente(contrato.clienteId);
  const carro = buscarCarro(contrato.automovelId);

  let bancosHTML = "";

  for (const agente of dados.agentes) {
    if (agente.tipo === "banco") {
      bancosHTML += `
        <option value="${seguro(agente.id)}">
          ${seguro(agente.nome)}
        </option>
      `;
    }
  }

  abrirModal("Execução do contrato", `
    <form id="formExecutarContrato" data-id="${seguro(id)}">

      <h4>Dados do contrato</h4>

      <p>
        Cliente: ${seguro(pessoa ? pessoa.nome : "-")}<br>
        Veículo: ${seguro(carro ? carro.marca : "")}
        ${seguro(carro ? carro.modelo : "")}<br>
        Valor estimado: ${dinheiro(contrato.valorEstimado)}
      </p>

      <hr>

      <h5>Contrato de crédito bancário</h5>

      <p class="text-secondary">
        Informe se o aluguel está associado a um
        contrato de crédito já concedido por um banco agente.
      </p>

      <label>Possui contrato de crédito?</label>
      <select id="possuiCredito" class="form-select" required>
        <option value="nao">Não</option>
        <option value="sim">Sim</option>
      </select>

      <div id="camposCredito" class="d-none mt-3">

        <label>Banco que concedeu o crédito</label>
        <select id="bancoCredito" class="form-select">
          <option value="">Selecione um banco</option>
          ${bancosHTML}
        </select>

        <label class="mt-3">Número do contrato de crédito</label>
        <input id="numeroCredito"
          class="form-control"
          placeholder="Ex.: CRED001">

        <label class="mt-3">Valor do crédito concedido (R$)</label>
        <input id="valorCredito"
          type="number"
          class="form-control"
          min="0.01"
          step="0.01">
      </div>

      <p id="erroContrato" class="text-danger mt-3"></p>

      <button type="submit" class="btn btn-primary mt-3">
        Confirmar execução
      </button>
    </form>
  `);
}

function atualizarCamposCredito() {
  const mostrar = $("possuiCredito").value === "sim";

  $("camposCredito").classList.toggle("d-none", !mostrar);

  $("bancoCredito").required = mostrar;
  $("numeroCredito").required = mostrar;
  $("valorCredito").required = mostrar;
}

async function salvarExecucaoContrato(evento) {
  evento.preventDefault();

  const id = evento.target.dataset.id;
  const possuiCredito = $("possuiCredito").value === "sim";

  try {
    await carregar();

    const contrato = dados.contratos.find(c =>
      String(c.id) === String(id)
    );

    if (!contrato || contrato.status !== "Aguardando contratação") {
      throw new Error("Este contrato já foi executado ou alterado.");
    }

    const pedido = buscarPedido(contrato.pedidoId);

    if (!pedido || pedido.status !== "Aprovado") {
      throw new Error("O pedido precisa estar aprovado.");
    }

    let bancoId = null;
    let creditoId = null;

    if (possuiCredito) {
      bancoId = $("bancoCredito").value;
      const numero = $("numeroCredito").value.trim();
      const valor = Number($("valorCredito").value);

      const banco = dados.agentes.find(a =>
        a.tipo === "banco" &&
        String(a.id) === String(bancoId)
      );

      if (!banco || !numero ||
          !Number.isFinite(valor) || valor <= 0) {
        throw new Error("Preencha corretamente os dados do crédito.");
      }

      // Registra o contrato de crédito já concedido.
      const credito = await api("creditos", "POST", {
        numero: numero,
        bancoId: bancoId,
        contratoAluguelId: contrato.id,
        valor: valor,
        situacao: "Concedido"
      });

      creditoId = credito.id;
    }

    const data = dataHoje();

    await api(`contratos/${id}`, "PATCH", {
      status: "Executado",
      creditoBancario: possuiCredito,
      bancoId: bancoId,
      creditoId: creditoId,
      dataExecucao: data
    });

    fecharModal();
    await carregar();
    mostrarAba();
    mostrarAviso("Contrato executado com sucesso!");

  } catch (erro) {
    $("erroContrato").textContent = erro.message;
  }
}

/* CADASTRO DE AUTOMÓVEIS */

function mostrarAutomoveis() {
  let linhas = "";

  for (const carro of dados.automoveis) {
    linhas += `
      <tr>
        <td>
          <img src="${IMAGEM_PADRAO}"
            alt="Carro" width="90" height="60"
            style="object-fit:contain">
        </td>
        <td>${seguro(carro.matricula)}</td>
        <td>
          ${seguro(carro.marca)}
          ${seguro(carro.modelo)}
          (${seguro(carro.ano)})
        </td>
        <td>${seguro(carro.placa)}</td>
        <td>${seguro(nomeDono(carro))}</td>
        <td>${dinheiro(carro.valorDiaria)}</td>
        <td>${carro.disponivel ? "Sim" : "Não"}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary"
            onclick="formularioCarro('${seguro(carro.id)}')">
            Editar
          </button>

          <button class="btn btn-sm btn-outline-danger"
            onclick="excluirCarro('${seguro(carro.id)}')">
            Excluir
          </button>
        </td>
      </tr>
    `;
  }

  if (!linhas) {
    linhas = `
      <tr><td colspan="8">Nenhum automóvel.</td></tr>
    `;
  }

  $("conteudo").innerHTML = `
    <h2 class="section-title">Automóveis cadastrados</h2>

    <button class="btn btn-primary mb-4"
      onclick="formularioCarro()">
      Cadastrar automóvel
    </button>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Matrícula</th>
            <th>Carro</th>
            <th>Placa</th>
            <th>Proprietário</th>
            <th>Diária</th>
            <th>Disponível</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>
  `;
}

function opcoesProprietarios(tipo, id = "") {
  let lista = [];

  if (tipo === "cliente") {
    lista = dados.clientes;
  } else {
    lista = dados.agentes.filter(a => a.tipo === tipo);
  }

  let html = "";

  for (const pessoa of lista) {
    const selecionado =
      String(pessoa.id) === String(id) ? "selected" : "";

    html += `
      <option value="${seguro(pessoa.id)}" ${selecionado}>
        ${seguro(pessoa.nome)}
      </option>
    `;
  }

  return html;
}

function atualizarProprietarios() {
  $("idDono").innerHTML =
    opcoesProprietarios($("tipoDono").value);
}

function formularioCarro(id = "") {
  const carro = id ? buscarCarro(id) : null;

  function valor(campo) {
    return carro ? seguro(carro[campo]) : "";
  }

  const tipo = carro ? carro.proprietarioTipo : "empresa";
  const donoId = carro ? carro.proprietarioId : "";

  abrirModal(carro ? "Editar automóvel" : "Cadastrar automóvel", `
    <form id="formCarro" data-id="${seguro(id)}">

      <div class="row g-3">

        <div class="col-md-6">
          <label>Matrícula</label>
          <input name="matricula" class="form-control"
            value="${valor("matricula")}" required>
        </div>

        <div class="col-md-6">
          <label>Marca</label>
          <input name="marca" class="form-control"
            value="${valor("marca")}" required>
        </div>

        <div class="col-md-6">
          <label>Modelo</label>
          <input name="modelo" class="form-control"
            value="${valor("modelo")}" required>
        </div>

        <div class="col-md-3">
          <label>Ano</label>
          <input name="ano" type="number"
            min="1900" max="2100"
            class="form-control"
            value="${valor("ano")}" required>
        </div>

        <div class="col-md-3">
          <label>Placa</label>
          <input name="placa" class="form-control"
            value="${valor("placa")}" required>
        </div>

        <div class="col-md-6">
          <label>Diária (R$)</label>
          <input name="valorDiaria" type="number"
            min="0.01" step="0.01"
            class="form-control"
            value="${valor("valorDiaria")}" required>
        </div>

        <div class="col-md-6">
          <label>Tarifa por km (R$)</label>
          <input name="valorKm" type="number"
            min="0" step="0.01"
            class="form-control"
            value="${valor("valorKm")}" required>
        </div>

        <div class="col-md-6">
          <label>Tipo de proprietário</label>
          <select name="proprietarioTipo"
            id="tipoDono" class="form-select"
            onchange="atualizarProprietarios()">

            <option value="empresa"
              ${tipo === "empresa" ? "selected" : ""}>
              Empresa
            </option>

            <option value="banco"
              ${tipo === "banco" ? "selected" : ""}>
              Banco
            </option>

            <option value="cliente"
              ${tipo === "cliente" ? "selected" : ""}>
              Cliente
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label>Proprietário</label>
          <select name="proprietarioId"
            id="idDono" class="form-select" required>
            ${opcoesProprietarios(tipo, donoId)}
          </select>
        </div>

        <div class="col-md-6">
          <label>Disponibilidade</label>
          <select name="disponivel" class="form-select">

            <option value="true"
              ${!carro || carro.disponivel ? "selected" : ""}>
              Disponível
            </option>

            <option value="false"
              ${carro && !carro.disponivel ? "selected" : ""}>
              Indisponível
            </option>
          </select>
        </div>
      </div>

      <p id="erroCarro" class="text-danger mt-3"></p>

      <button type="submit" class="btn btn-primary mt-3">
        Salvar automóvel
      </button>
    </form>
  `);
}

async function salvarCarro(evento) {
  evento.preventDefault();

  const form = evento.target;
  const id = form.dataset.id;

  const registro = {
    matricula: form.elements.matricula.value.trim().toUpperCase(),
    marca: form.elements.marca.value.trim(),
    modelo: form.elements.modelo.value.trim(),
    ano: Number(form.elements.ano.value),
    placa: form.elements.placa.value.trim().toUpperCase(),
    valorDiaria: Number(form.elements.valorDiaria.value),
    valorKm: Number(form.elements.valorKm.value),
    proprietarioTipo: form.elements.proprietarioTipo.value,
    proprietarioId: form.elements.proprietarioId.value,
    disponivel: form.elements.disponivel.value === "true",
    imagem: IMAGEM_PADRAO
  };

  try {
    await carregar();

    if (!registro.matricula || !registro.marca ||
        !registro.modelo || !registro.placa) {
      throw new Error("Preencha todos os campos.");
    }

    if (!Number.isInteger(registro.ano) ||
        registro.ano < 1900 || registro.ano > 2100 ||
        registro.valorDiaria <= 0 ||
        registro.valorKm < 0) {
      throw new Error("Confira o ano e os valores.");
    }

    for (const carro of dados.automoveis) {
      if (String(carro.id) === String(id)) continue;

      if (carro.placa.toUpperCase() === registro.placa) {
        throw new Error("Já existe um carro com esta placa.");
      }

      if (carro.matricula.toUpperCase() === registro.matricula) {
        throw new Error("Já existe um carro com esta matrícula.");
      }
    }

    const proprietarios = registro.proprietarioTipo === "cliente"
      ? dados.clientes
      : dados.agentes.filter(a =>
          a.tipo === registro.proprietarioTipo
        );

    const donoExiste = proprietarios.some(p =>
      String(p.id) === String(registro.proprietarioId)
    );

    if (!donoExiste) {
      throw new Error("Selecione um proprietário válido.");
    }

    if (id) {
      await api(`automoveis/${id}`, "PATCH", registro);
    } else {
      await api("automoveis", "POST", registro);
    }

    fecharModal();
    await carregar();
    mostrarAba();
    mostrarAviso("Automóvel salvo com sucesso!");

  } catch (erro) {
    $("erroCarro").textContent = erro.message;
  }
}

async function excluirCarro(id) {
  const possuiPedidos = dados.pedidos.some(p =>
    String(p.automovelId) === String(id)
  );

  const possuiContratos = dados.contratos.some(c =>
    String(c.automovelId) === String(id)
  );

  if (possuiPedidos || possuiContratos) {
    mostrarAviso(
      "Este veículo possui pedidos ou contratos e não pode ser excluído.",
      "warning"
    );
    return;
  }

  if (!confirm("Excluir este automóvel?")) return;

  try {
    await api(`automoveis/${id}`, "DELETE");
    await carregar();
    mostrarAba();
    mostrarAviso("Automóvel excluído.");
  } catch (erro) {
    mostrarAviso(erro.message, "danger");
  }
}
