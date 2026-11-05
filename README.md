
# FindCar — Sistema de Aluguel de Automóveis

Projeto desenvolvido para a disciplina de **Desenvolvimento de Interfaces Web**, do curso de Ciência da Computação da PUC Minas.

O **FindCar** é uma aplicação web para gerenciamento de aluguéis de automóveis, permitindo que clientes realizem solicitações de aluguel e que agentes acompanhem, avaliem e gerenciem os pedidos e contratos.

---

## 1. Descrição do Projeto

O FindCar foi desenvolvido a partir dos requisitos apresentados no laboratório **Sistema de Aluguel de Carros**.

O sistema simula o processo de aluguel de automóveis, desde a consulta de veículos e a solicitação de aluguel até a análise financeira e a execução do contrato.

A aplicação possui dois perfis de acesso:

- **Cliente:** responsável por consultar veículos, realizar simulações, cadastrar, modificar, consultar e cancelar pedidos de aluguel.
- **Agente:** responsável por analisar pedidos, registrar pareceres financeiros, gerenciar contratos e administrar os automóveis cadastrados.

O sistema também contempla a possibilidade de associação de contratos de aluguel a contratos de crédito bancário concedidos por bancos agentes.

A persistência dos dados é realizada por meio do JSON Server, que simula uma API REST utilizando o arquivo `db.json`.

---

## 2. Funcionalidades

### 2.1. Autenticação

- Login de usuários previamente cadastrados.
- Identificação do perfil de acesso.
- Direcionamento para as funcionalidades de cliente ou agente.
- Encerramento da sessão.

### 2.2. Área do Cliente

- Consulta dos automóveis cadastrados.
- Visualização das informações dos veículos.
- Simulação de aluguel com datas e quilometragem estimada.
- Cálculo do valor estimado do aluguel.
- Cadastro de pedidos.
- Consulta dos pedidos realizados.
- Modificação de pedidos pendentes.
- Cancelamento de pedidos.
- Consulta e atualização dos dados pessoais.
- Cadastro de até três empregadores e respectivos rendimentos.

### 2.3. Área do Agente

- Consulta dos pedidos de aluguel.
- Modificação de informações dos pedidos.
- Análise financeira dos clientes.
- Registro de parecer financeiro.
- Aprovação ou recusa de solicitações.
- Consulta dos contratos de aluguel.
- Confirmação da execução de contratos.
- Registro de crédito bancário associado ao contrato, quando aplicável.
- Cadastro de automóveis.
- Edição e exclusão de automóveis.
- Identificação do proprietário do veículo como cliente, empresa ou banco.

---

## 3. Protótipos e Wireframes

Os wireframes do FindCar foram desenvolvidos durante a etapa de planejamento do projeto, com o objetivo de definir a estrutura das páginas, a disposição dos elementos e os principais fluxos de navegação.

A seguir, são apresentados os wireframes utilizados como referência para o desenvolvimento da interface da aplicação.

<!-- Insira aqui as imagens exportadas dos wireframes -->

---

## 4. Tecnologias Utilizadas

| Tecnologia | Utilização |
|------------|------------|
| HTML5 | Estruturação das páginas e dos elementos da interface |
| CSS3 | Estilização e personalização visual |
| JavaScript | Implementação das funcionalidades e interações |
| Bootstrap 5 | Componentes visuais e organização do layout |
| Fetch API | Comunicação entre a aplicação e a API REST |
| JSON Server | Simulação do servidor e persistência dos dados |
| JSON | Armazenamento e troca de informações |
| Node.js / npm | Execução dos servidores locais |

---

## 5. Dependências, Bibliotecas e Frameworks

### 5.1. Bootstrap 5

Utilizado para a construção da interface, incluindo formulários, botões, tabelas, componentes e organização do layout.

### 5.2. JSON Server

Utilizado para simular uma API REST e permitir operações de consulta, cadastro, atualização e exclusão de registros.

### 5.3. Fetch API

Utilizada no JavaScript para realizar requisições HTTP aos endpoints disponibilizados pelo JSON Server.

### 5.4. Serve

Utilizado para disponibilizar a interface da aplicação em um servidor HTTP local.

---

## 6. Arquitetura do Sistema

A aplicação utiliza uma arquitetura simples, com separação entre a interface web e a camada de persistência de dados.

O **frontend** foi desenvolvido com HTML, CSS e JavaScript, enquanto o JSON Server é responsável por disponibilizar os dados por meio de uma API REST.

A comunicação ocorre através da Fetch API.

### 6.1. Organização do JavaScript

| Arquivo | Responsabilidade |
|---------|------------------|
| `dados.js` | Configuração da API, carregamento dos dados e funções auxiliares |
| `autenticacao.js` | Login, logout e recuperação da sessão |
| `area-cliente.js` | Funcionalidades relacionadas aos clientes |
| `area-agente.js` | Funcionalidades relacionadas aos agentes |
| `app.js` | Inicialização da aplicação, navegação e eventos |

### 6.2. Estrutura dos Dados

O arquivo `db.json` contém as coleções utilizadas pela aplicação.

| Coleção | Descrição |
|---------|-----------|
| `usuarios` | Credenciais e identificação dos usuários |
| `clientes` | Dados pessoais, profissionais e financeiros dos clientes |
| `agentes` | Informações dos agentes, empresas e bancos |
| `automoveis` | Dados dos veículos cadastrados |
| `pedidos` | Solicitações de aluguel realizadas pelos clientes |
| `contratos` | Contratos de aluguel gerados após aprovação |
| `creditos` | Contratos de crédito bancário associados aos aluguéis |

---

## 7. Estrutura de Diretórios

```text
FindCar/
│
├── assets/
│   ├── img/
│   │   └── ...
│   └── wireframes.png
│
├── css/
│   └── style.css
│
├── js/
│   ├── dados.js
│   ├── autenticacao.js
│   ├── area-cliente.js
│   ├── area-agente.js
│   └── app.js
│
├── index.html
├── db.json
└── README.md
```

---

## 8. Instalação e Execução Local

### 8.1. Pré-requisitos

Para executar o projeto, é necessário possuir:

- Node.js e npm instalados.
- Navegador web atualizado.
- Editor de código, como o Visual Studio Code.

### 8.2. Obter o Projeto

Clone o repositório utilizando o Git:

```bash
git clone https://github.com/SEU-USUARIO/findcar-sistema-aluguel.git
```

Acesse a pasta do projeto:

```bash
cd findcar-sistema-aluguel
```

Também é possível baixar o repositório em formato ZIP e extrair os arquivos.

### 8.3. Iniciar o JSON Server

No terminal, dentro da pasta do projeto, execute:

```bash
npx json-server db.json --port 3000
```

A API REST ficará disponível em:

http://localhost:3000

### 8.4. Iniciar o Servidor da Interface

Abra outro terminal, mantendo o JSON Server em execução.

Execute:

```bash
npx serve . -l 3001
```

A aplicação ficará disponível em:

http://localhost:3001

**Importante:** os dois servidores devem permanecer em execução durante a utilização do sistema.

---

## 9. Dados de Acesso para Testes

O sistema possui usuários fictícios previamente cadastrados no arquivo `db.json`.

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | `cliente@teste.com` | `123456` |
| Agente | `agente@teste.com` | `123456` |

Esses dados são utilizados exclusivamente para fins acadêmicos e demonstração da aplicação.

---

## 10. Testes e Verificação

Os principais fluxos de utilização do sistema são:

| Funcionalidade | Verificação |
|----------------|-------------|
| Login | Acesso com os perfis cliente e agente |
| Consulta de veículos | Carregamento dos automóveis cadastrados |
| Simulação de aluguel | Cálculo do valor estimado |
| Cadastro de pedido | Registro da solicitação no JSON Server |
| Edição de pedido | Atualização das informações permitidas |
| Cancelamento | Alteração do status do pedido |
| Análise financeira | Registro de parecer e decisão do agente |
| Aprovação | Geração do contrato de aluguel |
| Execução de contrato | Atualização do status da contratação |
| Crédito bancário | Associação opcional a um banco agente |
| Gestão de automóveis | Cadastro, edição e exclusão de registros |
| Persistência | Armazenamento das alterações no `db.json` |

Os testes devem ser realizados utilizando os dados fictícios disponíveis na aplicação.

---

## 11. Deploy

O projeto foi desenvolvido para execução local.

A interface depende de uma API REST disponibilizada pelo JSON Server. Portanto, a publicação completa do sistema exige que a API também esteja hospedada e acessível.

A abertura isolada do arquivo `index.html`, sem a API em execução, não disponibiliza todas as funcionalidades.

---

## 12. Limitações do Projeto

O FindCar é um protótipo acadêmico desenvolvido para demonstrar os requisitos do laboratório.

A autenticação utiliza dados de teste e não possui mecanismos de segurança adequados para produção.

O sistema não realiza pagamentos reais nem integração com instituições financeiras.

Os contratos de crédito bancário são registrados como créditos já concedidos, sem simular processos reais de aprovação bancária.

---

## 13. Autoria

**Ana Luiza Tancredi Vidal**

Ciência da Computação  
Pontifícia Universidade Católica de Minas Gerais (PUC Minas)  
Disciplina: Desenvolvimento de Interfaces Web

---

## 14. Referências

- [Bootstrap](https://getbootstrap.com/)
- [MDN Web Docs](https://developer.mozilla.org/pt-BR/)
- [JSON Server](https://github.com/typicode/json-server)
- [Node.js](https://nodejs.org/)
- [Template README — João Paulo Aramuni](https://github.com/joaopauloaramuni/desenvolvimento-de-interfaces-web/blob/main/TEMPLATES/template_README.md)