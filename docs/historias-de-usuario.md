
# Histórias do Usuário

As histórias de usuário do FindCar descrevem as funcionalidades do sistema de aluguel de automóveis, considerando os perfis de cliente e agente, os requisitos do Laboratório 02 e as regras de negócio do projeto.

## Cliente

### HU00 - Criar conta

Como visitante, quero criar uma conta no FindCar para acessar as funcionalidades disponíveis aos clientes e realizar solicitações de aluguel.

**Critérios de aceitação:** o usuário deve informar os dados obrigatórios para o cadastro; o sistema deve validar os campos preenchidos; CPF e e-mail não podem estar associados a outra conta; os dados devem ser armazenados no JSON Server; após o cadastro, o usuário deve conseguir acessar o sistema com suas credenciais.

### HU01 - Realizar login

Como cliente, quero acessar o sistema com minhas credenciais para utilizar as funcionalidades disponíveis na minha área.

**Critérios de aceitação:** o usuário deve informar credenciais válidas; o sistema deve identificar seu perfil; o cliente autenticado deve acessar somente as funcionalidades destinadas ao seu perfil.

### HU02 - Manter cadastro

Como cliente, quero consultar e alterar meus dados pessoais e profissionais para manter atualizadas as informações utilizadas na análise dos pedidos.

**Critérios de aceitação:** o cliente pode consultar e atualizar nome, CPF, RG, endereço e profissão; pode informar até três empregadores com seus respectivos rendimentos; os dados devem ser persistidos no JSON Server.

### HU03 - Consultar automóveis

Como cliente, quero visualizar os automóveis cadastrados para escolher um veículo adequado às minhas necessidades.

**Critérios de aceitação:** o sistema deve apresentar os dados dos automóveis, incluindo marca, modelo, ano, proprietário e valores de aluguel; a disponibilidade do veículo deve ser considerada para permitir novas solicitações.

### HU04 - Simular aluguel

Como cliente, quero informar o período de utilização e a quilometragem estimada para consultar o valor previsto do aluguel.

**Critérios de aceitação:** o cliente deve informar as datas de retirada e devolução e a quilometragem estimada; a data inicial não pode ser anterior à data atual; o período deve ser válido; a quilometragem deve ser um número inteiro não negativo; o valor estimado deve considerar as diárias e a quilometragem informada.

### HU05 - Criar pedido de aluguel

Como cliente, quero selecionar um automóvel e registrar uma solicitação de aluguel para encaminhar meu pedido à avaliação de um agente.

**Critérios de aceitação:** o veículo deve estar disponível; as datas e a quilometragem devem ser válidas; não pode existir conflito com outro pedido ativo para o mesmo veículo e período; o pedido deve ser associado ao cliente autenticado e iniciar com o status `Pendente`.

### HU06 - Acompanhar pedidos

Como cliente, quero consultar meus pedidos de aluguel para acompanhar suas informações e o andamento da análise.

**Critérios de aceitação:** o cliente deve visualizar somente os próprios pedidos; a listagem deve apresentar o automóvel, período, quilometragem, valor estimado, status e parecer do agente, quando disponível.

### HU07 - Modificar pedido

Como cliente, quero alterar o período ou a quilometragem estimada de uma solicitação pendente para corrigir informações antes da análise.

**Critérios de aceitação:** somente pedidos com status `Pendente` podem ser modificados pelo cliente responsável; as novas datas e a quilometragem devem ser validadas; não pode haver conflito de períodos; o valor estimado deve ser recalculado; as alterações devem ser persistidas no sistema.

### HU08 - Cancelar pedido

Como cliente, quero cancelar uma solicitação de aluguel pendente para desistir de uma contratação ainda não analisada.

**Critérios de aceitação:** o cliente só pode cancelar seus próprios pedidos com status `Pendente`; o sistema deve solicitar confirmação; após o cancelamento, o status deve ser atualizado para `Cancelado`.

## Agente

### HU09 - Realizar login

Como agente, quero acessar o sistema com minhas credenciais para consultar e gerenciar as solicitações e os contratos de aluguel.

**Critérios de aceitação:** o agente deve informar credenciais válidas; o sistema deve identificar seu perfil e disponibilizar as funcionalidades correspondentes.

### HU10 - Consultar pedidos e dados dos clientes

Como agente, quero consultar as solicitações de aluguel e os dados cadastrais e financeiros dos clientes para apoiar a análise dos pedidos.

**Critérios de aceitação:** o agente deve visualizar as solicitações registradas; durante a análise, deve conseguir consultar os dados pessoais e profissionais do cliente, seus empregadores e rendimentos declarados.

### HU11 - Modificar pedido

Como agente, quero alterar informações de uma solicitação de aluguel para corrigir dados antes da conclusão da avaliação.

**Critérios de aceitação:** somente pedidos com status `Pendente` ou `Em análise` podem ser modificados; o agente pode alterar o período e a quilometragem estimada; os dados devem ser validados; não pode haver conflito com outros pedidos ativos do veículo; o valor estimado deve ser recalculado e as alterações persistidas.

### HU12 - Avaliar pedido

Como agente, quero registrar um parecer sobre uma solicitação de aluguel para definir se o pedido poderá prosseguir para contratação.

**Critérios de aceitação:** somente pedidos com status `Pendente` ou `Em análise` podem ser avaliados; o parecer é obrigatório; o agente pode definir a decisão como `Em análise`, `Aprovado` ou `Recusado`; o status e o parecer devem ser atualizados no sistema.

### HU13 - Consultar contratos

Como agente, quero consultar os contratos de aluguel registrados para acompanhar sua situação e identificar aqueles disponíveis para execução.

**Critérios de aceitação:** o sistema deve apresentar os contratos cadastrados, com informações do cliente, automóvel, proprietário, valor estimado, status e eventual associação com crédito bancário; contratos com status `Aguardando contratação` devem apresentar a opção de execução.

### HU14 - Executar contrato

Como agente, quero executar o contrato de um pedido aprovado para registrar a conclusão da contratação.

**Critérios de aceitação:** somente contratos com status `Aguardando contratação` podem ser executados; o pedido associado deve estar `Aprovado`; a execução deve registrar a data e atualizar o contrato para `Executado`.

### HU15 - Registrar crédito bancário

Como agente, quero associar um contrato de crédito bancário já concedido a um contrato de aluguel para registrar as condições financeiras relacionadas à contratação.

**Critérios de aceitação:** a associação de crédito é opcional; quando houver crédito, devem ser informados um banco agente válido, o número do contrato de crédito e um valor positivo; os dados devem ser registrados no sistema e vinculados ao contrato de aluguel.

### HU16 - Cadastrar automóvel

Como agente, quero cadastrar automóveis e seus respectivos proprietários para manter atualizada a relação de veículos do sistema.

**Critérios de aceitação:** devem ser informados matrícula, marca, modelo, ano, placa, valores de diária e quilometragem, proprietário e disponibilidade; matrícula e placa não podem estar duplicadas; o proprietário deve ser um cliente, uma empresa ou um banco cadastrado; os dados devem ser persistidos no JSON Server.

### HU17 - Editar automóvel

Como agente, quero alterar as informações de um automóvel cadastrado para manter seus dados e sua disponibilidade atualizados.

**Critérios de aceitação:** o agente deve poder modificar os dados do veículo e de seu proprietário; os campos devem respeitar as validações do cadastro; matrícula e placa devem permanecer únicas; as alterações devem ser persistidas.

### HU18 - Excluir automóvel

Como agente, quero excluir automóveis cadastrados para remover veículos que não devem mais permanecer no sistema.

**Critérios de aceitação:** o automóvel não pode possuir pedidos ou contratos vinculados; o sistema deve solicitar confirmação antes da exclusão; após a confirmação, o registro deve ser removido do JSON Server.

## Regras de Negócio

1. O acesso às funcionalidades internas exige autenticação com uma conta previamente cadastrada.

2. O sistema diferencia os perfis de cliente e agente, disponibilizando funcionalidades específicas para cada um.

3. O cadastro de novos clientes deve validar os campos obrigatórios e impedir a duplicação de CPF e e-mail.

4. Cada cliente pode declarar até três empregadores e seus respectivos rendimentos.

5. Cada pedido de aluguel pertence a um cliente e está associado a um automóvel.

6. Um novo pedido deve iniciar com o status `Pendente`.

7. A data inicial do aluguel não pode ser anterior à data atual, e o período informado deve possuir duração válida.

8. A quilometragem estimada deve ser um número inteiro não negativo.

9. O valor estimado do aluguel é calculado considerando a quantidade de diárias, o valor da diária e a quilometragem estimada multiplicada pelo valor por quilômetro.

10. O sistema deve impedir conflitos de períodos entre pedidos ativos associados ao mesmo automóvel.

11. Clientes podem consultar apenas seus próprios pedidos.

12. Clientes só podem modificar ou cancelar pedidos com status `Pendente`.

13. A edição de um pedido pelo cliente permite alterar o período e a quilometragem estimada, mantendo a associação com o automóvel originalmente solicitado.

14. Agentes podem modificar pedidos com status `Pendente` ou `Em análise`.

15. Somente agentes podem registrar pareceres e definir decisões de análise financeira.

16. A avaliação de um pedido exige o preenchimento de um parecer e permite as decisões `Em análise`, `Aprovado` ou `Recusado`.

17. A aprovação de um pedido gera um contrato com status `Aguardando contratação`, caso ainda não exista um contrato associado.

18. Um contrato só pode ser executado quando estiver aguardando contratação e o pedido correspondente estiver aprovado.

19. O crédito bancário é opcional e pode ser associado ao contrato durante sua execução.

20. Quando houver crédito bancário, devem ser informados um banco agente válido, o número do contrato e um valor positivo.

21. Os automóveis podem pertencer a clientes, empresas ou bancos cadastrados no sistema.

22. Matrículas e placas de automóveis não podem ser duplicadas.

23. Automóveis com pedidos ou contratos vinculados não podem ser excluídos.

24. Os dados de clientes, automóveis, pedidos, contratos e créditos são persistidos por meio do JSON Server, utilizando a Fetch API.
