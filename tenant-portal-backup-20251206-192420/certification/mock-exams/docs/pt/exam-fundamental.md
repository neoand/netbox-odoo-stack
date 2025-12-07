# 📝 Simulado - NEO_STACK Certified Fundamental

## 📋 Informações do Exame

**Nível**: Fundamental
**Duração**: 120 minutos (2 horas)
**Questões**: 120 questões
**Pontuação Mínima**: 70%
**Formato**: Múltipla escolha + Prática + Estudos de caso

### Distribuição de Questões

| Tipo | Quantidade | Pontos | Tempo Estimado |
|------|------------|--------|----------------|
| Múltipla Escolha | 72 | 1 ponto cada | 60 minutos |
| Prática/Lab | 30 | 2 pontos cada | 45 minutos |
| Estudos de Caso | 18 | 3 pontos cada | 15 minutos |
| **TOTAL** | **120** | **180 pontos** | **120 minutos** |

---

## 📌 Instruções

1. **Leia cuidadosamente** cada questão antes de responder
2. **Gerencie seu tempo** - aproximadamente 1 minuto por questão
3. **Questions marked** com 🖥️ requerem acesso ao laboratório
4. **Para questões de múltipla escolha**, selecione apenas UMA resposta
5. **Questões práticas** devem ser executadas no ambiente de laboratório
6. **Estudos de caso** incluem múltiplas subquestões

---

## 🎯 SEÇÃO 1: MÚLTIPLA ESCOLHA (72 questões)

### Módulo 1: Introdução ao NEO_STACK (18 questões)

#### Questão 1
Qual é a principal função do **NetBox** no NEO_STACK Platform?

A) Gerenciar tickets de helpdesk
B) Monitorar eventos de segurança
C) Gerenciar IPAM e DCIM
D) Orquestrar containers

**Resposta**: C
**Explicação**: NetBox é especializado em IP Address Management (IPAM) e Data Center Infrastructure Management (DCIM), fornecendo inventário completo de infraestrutura de rede.

---

#### Questão 2
No modelo de **multi-tenancy** do NEO_STACK, cada tenant possui:

A) Dados compartilhados entre todos os tenants
B) Isolamento completo de dados e configurações
C) Apenas isolamento de usuários
D) Nenhum isolamento

**Resposta**: B
**Explicação**: O multi-tenancy garante isolamento completo - cada organização tem seus próprios dados, configurações, usuários e permissões completamente separados.

---

#### Questão 3
O **Wazuh** é classificado como:

A) Um firewall de aplicação web
B) Um SIEM (Security Information and Event Management)
C) Um sistema de backup
D) Um balanceador de carga

**Resposta**: B
**Explicação**: Wazuh é uma plataforma SIEM open source que coleta, analisa e correlaciona logs de segurança em tempo real.

---

#### Questão 4
Qual componente do NEO_STACK é responsável por **gestão de processos**?

A) NetBox
B) Wazuh
C) Odoo
D) TheHive

**Resposta**: C
**Explicação**: Odoo é um ERP/CRM que gerencia processos de negócio incluindo helpdesk, tickets, CRM, vendas e gestão de projetos.

---

#### Questão 5
A arquitetura do NEO_STACK segue um modelo:

A) Monolítico
B) Em camadas (layered)
C) Peer-to-peer
D) Cliente-servidor simples

**Resposta**: B
**Explicação**: A arquitetura é em camadas: UI, Serviços, Aplicação, Dados e Infraestrutura, permitindo escalabilidade e isolamento.

---

#### Questão 6
Para acessar a API do NetBox, você precisa de:

A) Apenas um token de API
B) Usuário e senha do sistema
C) Certificado SSL
D) Chave SSH

**Resposta**: A
**Explicação**: NetBox usa autenticação baseada em token para APIs REST, proporcionando acesso programático seguro.

---

#### Questão 7
O **TheHive** é principalmente usado para:

A) Monitoramento de rede
B) Gestão de incidentes de segurança
C) Backup de dados
D) Controle de acesso

**Resposta**: B
**Explicação**: TheHive é uma plataforma de gestão de incidentes de segurança que coordena resposta, investigação e resolução de casos.

---

#### Questão 8
No dashboard principal do NEO_STACK, você pode ver:

A) Apenas estatísticas de rede
B) Visão unificada de todos os componentes
C) Apenas alertas de segurança
D) Somente informações de usuários

**Resposta**: B
**Explicação**: O dashboard oferece visão unificada integrando dados de NetBox, Wazuh, Odoo e outros componentes em tempo real.

---

#### Questão 9
Para criar um dispositivo no NetBox, você deve primeiro definir:

A) Um IP address
B) Um device type
C) Um VLAN
D) Um rack

**Resposta**: B
**Explicação**: Device types são templates que definem as características e campos padrão para um tipo específico de dispositivo.

---

#### Questão 10
Um **VLAN** no NetBox representa:

A) Um dispositivo físico
B) Uma rede lógica isolada
C) Um usuário do sistema
D) Um certificado SSL

**Resposta**: B
**Explicação**: VLANs (Virtual LANs) são redes lógicas que permitem segmentação e isolamento de tráfego em redes físicas.

---

#### Questão 11
O **Shuffle** é uma plataforma de:

A) Backup automatizado
B) SOAR (Security Orchestration, Automation and Response)
C) Monitoramento de aplicações
D) Gestão de banco de dados

**Resposta**: B
**Explicação**: Shuffle é uma plataforma SOAR que automatiza workflows de segurança através de playbooks e integrações.

---

#### Questão 12
Para acessar os dados históricos no Wazuh, você usa:

A) Apenas o dashboard web
B) O módulo de Kibana integrado
C) Comandos de linha de comando
D) Apenas alertas em tempo real

**Resposta**: B
**Explicação**: Wazuh integra com Kibana para visualização avançada de logs, métricas e dados históricos.

---

#### Questão 13
Um **device** no NetBox pode estar associado a:

A) Apenas uma localização
B) Múltiplas localizações simultaneamente
C) Apenas racks
D) Nenhuma localização específica

**Resposta**: A
**Explicação**: Cada dispositivo deve ter uma localização específica (site, rack, posição) para manter inventário preciso.

---

#### Questão 14
O **Odoo** permite criar:

A) Apenas tickets de suporte
B) Múltiplos módulos (apps)
C) Somente relatórios financeiros
D) Apenas usuários

**Resposta**: B
**Explicação**: Odoo é modular - possui apps para helpdesk, CRM, vendas, projetos, contabilidade e mais.

---

#### Questão 15
Um **webhook** é usado para:

A) Backup de arquivos
B) Notificar sistemas externos sobre eventos
C) Monitorar tráfego de rede
D) Criptografar dados

**Resposta**: B
**Explicação**: Webhooks enviam notificações automáticas para URLs configuradas quando eventos específicos ocorrem.

---

#### Questão 16
A URL padrão da interface web do **NetBox** é:

A) http://localhost:8080
B) http://localhost:8000
C) http://netbox.local
D) Varia por instalação

**Resposta**: D
**Explicação**: A URL varia conforme configuração durante instalação - pode ser personalizada pelo administrador.

---

#### Questão 17
Para visualizar a topologia de rede no NEO_STACK, você deve acessar:

A) O módulo de Wazuh
B) O dashboard do NetBox
C) A seção de usuários do Odoo
D) O painel do Shuffle

**Resposta**: B
**Explicação**: NetBox fornece visualização de topologia de rede, incluindo connections, VLANs e relacionamentos entre dispositivos.

---

#### Questão 18
O **status** de um dispositivo no NetBox pode ser:

A) Apenas "ativo" ou "inativo"
B) "Ativo", "Planejado", "Fora de serviço"
C) Somente "Online" ou "Offline"
D) Apenas "Disponível"

**Resposta**: B
**Explicação**: Status incluem: ativo (em uso), planejado (futuro), fora de serviço (retirado) e outros conforme configuração.

---

### Módulo 2: NetBox - Infraestrutura (20 questões)

#### Questão 19
Para criar um **IP prefix** no NetBox, você deve especificar:

A) Apenas o endereço de rede
B) Endereço de rede e máscara/CIDR
C) Apenas a máscara de sub-rede
D) Apenas o gateway

**Resposta**: B
**Explicação**: Um IP prefix requer endereço de rede (ex: 192.168.1.0) e máscara/CIDR (ex: /24) para definir a sub-rede.

---

#### Questão 20
Um **IP address** no NetBox pode ter os seguintes status:

A) Ativo, Disponível, Reservado, Fornecido
B) Online, Offline, Maintenance
C) Available, Used, Deprecated
D) Free, Busy, Error

**Resposta**: A
**Explicação**: Status de IP: Ativo (em uso), Disponível (livre), Reservado (não alocável), Fornecido (delegado).

---

#### Questão 21
Para organizar dispositivos por localização física, o NetBox usa a hierarquia:

A) Sites > Regions > Racks > Devices
B) Regions > Sites > Racks > Devices
C) Sites > Racks > Regions > Devices
D) Racks > Sites > Regions > Devices

**Resposta**: A
**Explicação**: Hierarquia: Sites (localizações geográficas) → Regions (agrupamento) → Racks (armários) → Devices.

---

#### Questão 22
Um **device type** define:

A) O status atual do dispositivo
B) As características e campos padrão do dispositivo
C) A localização física
D) O endereço IP

**Resposta**: B
**Explicação**: Device types são templates que definem fabricante, modelo, interfaces, slots e campos customizados.

---

#### Questão 23
Para adicionar uma interface de rede a um dispositivo, você deve:

A) Definir apenas o nome
B) Especificar tipo, nome e velocidade
C) Apenas escolher a porta física
D) Definir apenas o MAC address

**Resposta**: B
**Explicação**: Interfaces requerem tipo (Ethernet, Fiber, etc.), nome (GigabitEthernet0/1) e velocidade (1G, 10G).

---

#### Questão 24
Um **cable** no NetBox conecta:

A) Duas interfaces de dispositivos
B) Um dispositivo a um rack
C) Duas VLANs
D) Dois sites

**Resposta**: A
**Explicação**: Cabos conectam interfaces físicas entre dispositivos, permitindo rastreamento de conexões físicas.

---

#### Questão 25
O campo **role** de um dispositivo indica:

A) A função do dispositivo na rede (ex: Core, Access, Distribution)
B) O nível de privilégio do usuário
C) A empresa fornecedora
D) A data de aquisição

**Resposta**: A
**Explicação**: Roles categorizam dispositivos por função: Core, Distribution, Access, Border, etc.

---

#### Questão 26
Para importar dispositivos em massa no NetBox, você pode usar:

A) Apenas a interface web
B) API REST ou CSV import
C) Apenas CLI commands
D) Não é possível importação em massa

**Resposta**: B
**Explicação**: NetBox suporta importação via API REST ou arquivos CSV para operações em massa.

---

#### Questão 27
Um **tenant** no NetBox é usado para:

A) Identificar o cliente/organização proprietária
B) Definir permissões de usuário
C) Configurar VLANs
D) Gerenciar licenças

**Resposta**: A
**Explicação**: Tenants associam recursos (dispositivos, IPs) a clientes/organizações para isolamento e billing.

---

#### Questão 28
O campo **primary_ip** de um dispositivo é:

A) O primeiro IP alocado para ele
B) O IP usado para gerenciamento remoto
C) O gateway padrão
D) O DNS primário

**Resposta**: B
**Explicação**: Primary IP é o endereço usado para acesso remoto, console e operações de gerenciamento.

---

#### Questão 29
Para criar uma **VLAN** no NetBox, você deve especificar:

A) Apenas o ID numérico
B) ID, nome e grupo (opcional)
C) Apenas o nome
D) ID, nome e status

**Resposta**: B
**Explicação**: VLANs requerem ID (1-4094), nome descritivo e opcionalmente grupo para organização.

---

#### Questão 30
Um **virtual chassis** representa:

A) Um rack físico
B) Múltiplos dispositivos gerenciados como uma unidade
C) Uma VLAN
D) Um site remoto

**Resposta**: B
**Explicação**: Virtual chassis agrupa switches em stack físico que operam como um único dispositivo lógico.

---

#### Questão 31
O **power port** em um dispositivo é usado para:

A) Conexão de rede
B) Alimentación elétrica
C) Console de gerenciamento
D) Transferência de arquivos

**Resposta**: B
**Explicação**: Power ports conectam dispositivos a PDUs (Power Distribution Units) para monitoramento de energia.

---

#### Questão 32
Para gerar relatórios no NetBox, você pode usar:

A) Apenas interface web
B) Relatórios internos ou API para exportação
C) Apenas CLI commands
D) Somente via webhooks

**Resposta**: B
**Explicação**: NetBox possui relatórios internos e API REST para exportar dados para ferramentas externas.

---

#### Questão 33
Um **cluster** no NetBox representa:

A) Um grupo de racks
B) Múltiplos dispositivos físicos ou virtuais agrupados
C) Um site
D) Uma VLAN

**Resposta**: B
**Explicação**: Clusters agrupam dispositivos físicos ou virtuais (hypervisors, containers) para gestão de virtualização.

---

#### Questão 34
O campo **serial** de um dispositivo é:

A) O número de série único do hardware
B) O número de portas
C) A velocidade da interface
D) O ID do fabricante

**Resposta**: A
**Explicação**: Serial é o número único do fabricante usado para rastrear e identificar hardware específico.

---

#### Questão 35
Para configurar **custom fields** no NetBox:

A) Não é possível customizar campos
B) Via Interface Admin > Custom Fields
C) Apenas via API
D) Somente editando o código fonte

**Resposta**: B
**Explicação**: Custom fields são criados na interface administrativa sem necessidade de programação.

---

#### Questão 36
Um **circuit** no NetBox representa:

A) Uma conexão de rede física
B) Um circuito elétrico
C) Uma rota de rede
D) Um dispositivo de rede

**Resposta**: A
**Explicação**: Circuits representam conexões físicas como linhas WAN, fibras, MPLS entre sites ou provedores.

---

#### Questão 37
O **tag** em recursos do NetBox é usado para:

A) Identificar o fabricante
B) Marcação e categorização flexível
C) Definir permissões
D) Controlar versionamento

**Resposta**: B
**Explicação**: Tags são labels flexíveis para categorizar e filtrar recursos (ex: "production", "DMZ", "critical").

---

#### Questão 38
Para excluir um dispositivo no NetBox:

A) É sempre permitido
B) Apenas se não tiver recursos associados
C) Apenas por administradores
D) Requer confirmação duplo

**Resposta**: B
**Explicação**: Dispositivos com recursos associados (interfaces, connections, IPs) não podem ser excluídos até que sejam removidos.

---

### Módulo 3: Wazuh - Segurança (18 questões)

#### Questão 39
Os principais componentes do **Wazuh** são:

A) Manager, Agents, Kibana
B) Server, Clients, Dashboard
C) Master, Slave, Monitor
D) Controller, Agent, Viewer

**Resposta**: A
**Explicação**: Wazuh Manager (central), Agents (clientes), Kibana (visualização) formam a arquitetura principal.

---

#### Questão 40
Um **agent** do Wazuh é instalado em:

A) Apenas o servidor central
B) Cada sistema que deseja monitorar
C) Apenas dispositivos de rede
D) Apenas servidores Windows

**Resposta**: B
**Explicação**: Agents são instalados em hosts (Windows, Linux, macOS) para coletar logs e métricas localmente.

---

#### Questão 41
O **Wazuh Manager** é responsável por:

A) Coletar logs dos agentes
B) Receber, analisar e armazenar logs
C) Visualizar dashboards
D) Gerenciar usuários

**Resposta**: B
**Explicação**: Manager centraliza recebimento, análise, decodificação e correlação de eventos dos agents.

---

#### Questão 42
Os **rules** no Wazuh são usados para:

A) Filtrar logs recebidos
B) Identificar eventos de interesse
C) Configurar alertas
D) Todas as alternativas

**Resposta**: D
**Explicação**: Rules filtram, identificam, categorizam e disparão alertas para eventos relevantes.

---

#### Questão 43
Para configurar um agent no Wazuh, você deve:

A) Apenas instalar o pacote
B) Instalar e registar com o Manager
C) Apenas configurar o IP do Manager
D) Apenas definir a chave

**Resposta**: B
**Explicação**: Agent requer instalação, configuração do IP do Manager e registro com chave de autenticação.

---

#### Questão 44
O **active response** no Wazuh permite:

A) Responder automaticamente a ameaças
B) Monitorar continuamente
C) Gerar relatórios
D) Configurar dashboards

**Resposta**: A
**Explicação**: Active response executa ações automáticas (bloquear IP, matar processo) quando regras são disparadas.

---

#### Questão 45
O arquivo **ossec.conf** é usado para:

A) Configuração do Manager
B) Configuração do Agent
C) Definição de rules
D) Configuração do Kibana

**Resposta**: B
**Explicação**: ossec.conf é o arquivo principal de configuração do agent, definindo destino de logs, remote settings.

---

#### Questão 46
Os **decoders** no Wazuh são responsáveis por:

A) Decodificar protocolos criptografados
B) Parsear e estruturar logs brutos
C) Comprimir logs antigos
D) Filtrar logs por data

**Resposta**: B
**Explicação**: Decoders extraem campos estruturados de logs brutos (IP, usuário, comando) para análise por rules.

---

#### Questão 47
Para visualizar alertas do Wazuh, você pode usar:

A) Apenas linha de comando
B) Kibana ou CLI
C) Apenas dashboard web
D) Apenas APIs

**Resposta**: B
**Explicação**: Alertas visualizados via Kibana (web) ou comandos CLI como `wazuh-logtest`.

---

#### Questão 48
Um **FIM** (File Integrity Monitoring) monitora:

A) Tráfego de rede
B) Alterações em arquivos críticos
C) Performance de disco
D) Conexões ativas

**Resposta**: B
**Explicação**: FIM rastreia mudanças (MD5/SHA1) em arquivos, detectando modificação, criação, exclusão.

---

#### Questão 49
O **rootcheck** no Wazuh verifica:

A) Configurações de rede
B) Malware, rootkits e vulnerabilidades
C) Performance do sistema
D] Uso de disco

**Resposta**: B
**Explicação**: Rootcheck procura por malware, rootkits, vulnerabilidades e configurações inseguras.

---

#### Questão 50
Para integrar Wazuh com TheHive:

A) É automático
B) Via integração nativa ou webhook
C) Apenas via API REST
D) Não é possível

**Resposta**: B
**Explicação**: Integração via plugin nativo do TheHive ou webhooks personalizados para criar casos automaticamente.

---

#### Questão 51
O **Wodle** é:

A) Um tipo de rule
B) Um scanner de vulnerabilidades
C) Um módulo de integração
D) Um agente ligero

**Resposta**: C
**Explicação**: Wodles são módulos de integração para coletar dados (OpenSCAP, CIS-CAT, inventory, etc.).

---

#### Questão 52
Para configurar **email alerts** no Wazuh:

A) Apenas via Kibana
B) Editando ossec.conf ou Rules
C) Apenas via interface web
D) Não é possível

**Resposta**: B
**Explicação**: Email alerts configurados editando ossec.conf (global, email) e rules (alert level).

---

#### Questão 53
O **VULN** detector verifica:

A) Vulnerabilidades no sistema operacional
B) Vulnerabilidades em aplicações web
C) Apenas CVEs conhecidos
D) Vulnerabilidades de rede

**Resposta**: A
**Explicação**: VULN detector consulta bases (CVE, RHSA, DSA) para identificar vulnerabilidades em pacotes instalados.

---

#### Questão 54
Os **agents** se comunicam com o Manager via:

A) HTTP/HTTPS
B) UDP/TCP Syslog
C) SNMP
D) SSH

**Resposta**: B
**Explicação**: Comunicação padrão via UDP 1514/TCP 1514 usando protocolo Syslog encriptado.

---

#### Questão 55
O **syscheck** monitora:

A) Uso de CPU e memória
B) Integridade de arquivos
C] Conexões de rede
D) Processos ativos

**Resposta**: B
**Explicação**: Syscheck (FIM) rastreia mudanças em diretórios/arquivos configurados.

---

#### Questão 56
Para executar **wazuh-logtest**:

A) Apenas no Manager
B) Apenas em agents
C) Em qualquer host com Wazuh instalado
D) Apenas via API

**Resposta**: A
**Explicação**: wazuh-logtest é ferramenta do Manager para testar regras e decoders interativamente.

---

### Módulo 4: Odoo - Processos (16 questões)

#### Questão 57
O **Odoo** é classificado como:

A) Um sistema operacional
B) Um ERP/CRM open source
C) Um firewall
D) Um banco de dados

**Resposta**: B
**Explicação**: Odoo é um ERP (Enterprise Resource Planning) e CRM (Customer Relationship Management) open source.

---

#### Questão 58
Um **ticket** no helpdesk do Odoo representa:

A) Uma tarefa de desenvolvimento
B) Uma requisição ou problema do cliente
C) Uma configuração de sistema
D) Um relatório financeiro

**Resposta**: B
**Explicação**: Tickets são requisições de suporte, problemas ou incidentes reportados por clientes.

---

#### Questão 59
Os **status** de um ticket podem ser:

A) Novo, Em andamento, Resolvido, Fechado
B) Ativo, Inativo, Excluído
C) Aberto, Pendente, Concluído
D) Apenas "aberto" e "fechado"

**Resposta**: A
**Explicação**: Workflow típico: Novo → Em Andamento → Resolvido → Fechado (com opções personalizadas).

---

#### Questão 60
Para criar um usuário no Odoo, você deve definir:

A) Apenas nome e email
B) Nome, email, senha e permissões
C) Apenas login e senha
D) Nome, empresa e telefone

**Resposta**: B
**Explicação**: Usuários requerem dados pessoais, credenciais e atribuição a grupos/permissões.

---

#### Questão 61
Os **grupos** no Odoo definem:

A) Times de trabalho
B) Permissões e acesso a módulos
C) Tipos de tickets
D) Níveis hierárquicos

**Resposta**: B
**Explicação**: Grupos controlam acesso a funcionalidades - cada grupo tem permissões específicas para módulos.

---

#### Questão 62
Um **workflow** no Odoo é:

A) Um processo automatizado
B) Uma sequência de etapas para um processo
C) Um tipo de relatório
D) Um template de email

**Resposta**: B
**Explicação**: Workflows definem etapas, transições e automações para processos de negócio.

---

#### Questão 63
O **SLA** (Service Level Agreement) é usado para:

A) Definir preços
B) Estabelecer metas de tempo de resposta
C) Configurar emails
D) Gerar relatórios

**Resposta**: B
**Explicação**: SLAs definem prazos (ex: 4h para resposta) e metas de qualidade de serviço.

---

#### Questão 64
Para atribuir um ticket a um técnico:

A) É automático
B) Manual via campo "Responsável"
C) Por ordem de chegada
D) Apenas por administradores

**Resposta**: B
**Explicação**: Atribuição manual através do campo "Responsável" ou regras automáticas configuradas.

---

#### Questão 65
O **categoria** de um ticket é usada para:

A) Identificar o cliente
B) Classificar e agrupar tickets similares
C) Definir prioridade
D] Configurar alertas

**Resposta**: B
**Explicação**: Categorias organizam tickets por tipo/assunto (Suporte Técnico, Cobrança, Dúvidas).

---

#### Questão 66
Para priorizar tickets, você pode usar:

A) Apenas cores
B) Campos de prioridade (Baixa, Normal, Alta, Urgente)
C) Apenas tags
D) Não é possível priorizar

**Resposta**: B
**Explicação**: Campos de prioridade padronizados ou customizados para classificação e triagem.

---

#### Questão 67
O **portal do cliente** no Odoo permite:

A) Gerenciar usuários
B) Visualizar e interagir com próprios tickets
C) Configurar o sistema
D) Gerar relatórios financeiros

**Resposta**: B
**Explicação**: Portal dá acesso self-service a clientes para criar, acompanhar e responder tickets.

---

#### Questão 68
Os **conversas** em tickets:

A) São apenas emails
B) Registram todas as interações (email, notas internas, chat)
C) Apenas notas do técnico
D) Apenas anexos

**Resposta**: B
**Explicação**: Timeline registra todas as atividades: emails, notas, mudanças de status, anexos.

---

#### Questão 69
Para gerar relatórios no Odoo, você usa:

A) Apenas gráficos
B) Módulo de Relatórios ou Business Intelligence
C) Apenas exportação CSV
D) Apenas API

**Resposta**: B
**Explicação**: Odoo possui módulo de relatórios com filtros, gráficos, tabelas dinâmicas e exportação.

---

#### Questão 70
O **contrato** no Odoo é usado para:

A) Acordos de trabalho
B) Gerenciar planos de serviço e faturamento
C) Contratos de licença de software
D) Acordos de nível de serviço

**Resposta**: B
**Explicação**: Contratos geram serviços recorrentes, valores e faturamento automático.

---

#### Questão 71
Um **produto** no Odoo pode ser:

A) Apenas físico
B) Físico ou serviço (intangível)
C) Apenas digital
D) Apenas serviços

**Resposta**: B
**Explicação**: Produtos incluem físicos (equipamentos) e serviços (consultoria, manutenção).

---

#### Questão 72
A **categoria** de produtos é usada para:

A) Agrupar produtos similares
B) Definir preços
C) Configurar impostos
D) Controlar estoque

**Resposta**: A
**Explicação**: Categorias organizam produtos por tipo/categoria para facilitar gestão e relatórios.

---

## 🖥️ SEÇÃO 2: PRÁTICA/LABORATÓRIO (30 questões)

### Instruções da Seção Prática

Para as próximas 30 questões, você deve usar o **ambiente de laboratório** fornecido. Cada questão prática vale 2 pontos.

**Lab Environment Credentials:**
- URL: https://lab.neo-stack.com
- Usuário: student@neo-stack.com
- Senha: [fornecida no início do exame]

**Instruções:**
1. Acesse o ambiente de laboratório
2. Complete cada tarefa conforme solicitado
3. Capture screenshots quando solicitado
4. Anote os resultados para responder as questões

---

#### Questão 73 🖥️ LAB
**Tarefa**: Criar um novo site no NetBox

**Instruções**:
1. Acesse o NetBox em http://lab-netbox.local
2. Faça login com as credenciais fornecidas
3. Navegue para Sites
4. Crie um site chamado "São Paulo Data Center"
5. Defina a região como "Brasil - Sudeste"
6. Defina o endereço como "Av. Paulista, 1000, São Paulo, SP"

**Qual é o ID numérico atribuído ao site criado?**

A) 1
B) 2
C) 3
D) 4

**Resposta**: B
**Explicação**: No laboratório, o primeiro site já existia ("Matriz"), então o novo site recebe ID 2.

---

#### Questão 74 🖥️ LAB
**Tarefa**: Adicionar um dispositivo no NetBox

**Instruções**:
1. Use o site criado na questão anterior
2. Navegue para Devices
3. Adicione um novo dispositivo com:
   - Device Type: Cisco Catalyst 2960
   - Device Role: Access Switch
   - Nome: SW-SP-001
   - Serial: FCW1234ABCD

**Em qual rack o dispositivo foi instalado?**

A) Rack-01
B) Rack-02
C) Não foi instalado em rack
D) Rack-03

**Resposta**: C
**Explicação**: O dispositivo foi criado mas não atribuído a um rack específico (field opcional).

---

#### Questão 75 🖥️ LAB
**Tarefa**: Criar um prefix IP

**Instruções**:
1. No NetBox, vá para IPAM > Prefixes
2. Crie um novo prefix:
   - Prefix: 10.0.100.0/24
   - Description: Rede de Servidores
   - Site: São Paulo Data Center

**Qual o status do prefix criado?**

A) Active
B) Reserved
C) Deprecated
D) Container

**Resposta**: A
**Explicação**: Prefixes são criados com status "Active" por padrão, indicando uso normal.

---

#### Questão 76 🖥️ LAB
**Tarefa**: Alocar um IP address

**Instruções**:
1. Vá para IPAM > IP Addresses
2. Aloque um IP do prefix 10.0.100.0/24
3. Atribua ao dispositivo SW-SP-001
4. Defina interface: GigabitEthernet0/1

**Qual IP foi alocado?**

A) 10.0.100.1
B) 10.0.100.2
C) 10.0.100.10
D) 10.0.100.100

**Resposta**: B
**Explicação**: O .1 é tipicamente gateway, então o primeiro disponível é .2.

---

#### Questão 77 🖥️ LAB
**Tarefa**: Configurar um agente Wazuh

**Instruções**:
1. Acesse a VM Linux no laboratório (192.168.100.10)
2. Instale o agente Wazuh
3. Configure para conectar ao Manager (192.168.100.5)
4. Registre o agente

**Qual comando foi usado para registrar o agente?**

A) /var/ossec/bin/manage_agents -a 192.168.100.5 -e manager
B) /var/ossec/bin/agent-auth -m 192.168.100.5
C) systemctl start wazuh-agent
D) /var/ossec/bin/ossec-control start

**Resposta**: B
**Explicação**: `agent-auth` é o comando para registrar agente com o Manager.

---

#### Questão 78 🖥️ LAB
**Tarefa**: Verificar status do agente Wazuh

**Instruções**:
1. Na VM Linux, execute o comando para verificar status
2. Verifique se o agente está conectado

**Qual o status mostrado?**

A) Active
B) Connected
C) Running
D) Disconnected

**Resposta**: B
**Explicação**: Status "Connected" indica comunicação ativa com o Manager.

---

#### Questão 79 🖥️ LAB
**Tarefa**: Criar um ticket no Odoo

**Instruções**:
1. Acesse o Odoo em http://lab-odoo.local
2. Navegue para Helpdesk
3. Crie um novo ticket:
   - Cliente: ACME Corp
   - Assunto: Problema de conectividade
   - Categoria: Suporte Técnico
   - Prioridade: Alta

**Qual o número do ticket criado?**

A) #0001
B) #0002
C) #0003
D) #0004

**Resposta**: C
**Explicação**: Dois tickets já existiam no sistema, então este recebe #0003.

---

#### Questão 80 🖥️ LAB
**Tarefa**: Atribuir ticket a um técnico

**Instruções**:
1. Edite o ticket criado
2. Atribua ao técnico "João Silva"
3. Mude o status para "Em Andamento"

**Qual o novo status do ticket?**

A) Novo
B) Em Andamento
C) Resolvido
D) Fechado

**Resposta**: B
**Explicação**: Status alterado para "Em Andamento" conforme solicitado.

---

#### Questão 81 🖥️ LAB
**Tarefa**: Adicionar nota interna ao ticket

**Instruções**:
1. No ticket, adicione uma nota interna
2. Conteúdo: "Cliente reportou intermitência na rede"
3. Salve a nota

**A nota foi salva como:**

A) Mensagem pública
B) Nota interna
C) Email automático
D) Atividade externa

**Resposta**: B
**Explicação**: Notas internas são visíveis apenas para equipe interna.

---

#### Questão 82 🖥️ LAB
**Tarefa**: Verificar alertas no Wazuh

**Instruções**:
1. Acesse o Kibana em http://lab-kibana.local
2. Vá para Wazuh > Alerts
3. Procure por alertas dos últimos 30 minutos

**Quantos alertas foram encontrados?**

A) 0-5
B) 6-15
C) 16-30
D) Mais de 30

**Resposta**: B
**Explicação**: Cerca de 10-12 alertas relacionados a login, heartbeat e monitoramento do sistema.

---

#### Questão 83 🖥️ LAB
**Tarefa**: Criar um VLAN no NetBox

**Instruções**:
1. No NetBox, vá para IPAM > VLANs
2. Crie uma nova VLAN:
   - VLAN ID: 100
   - Nome: VLAN_USUARIOS
   - Site: São Paulo Data Center

**Qual o status da VLAN criada?**

A) Active
B) Reserved
C) Deprecated
D) Planned

**Resposta**: A
**Explicação**: VLANs são criadas com status "Active" por padrão.

---

#### Questão 84 🖥️ LAB
**Tarefa**: Conectar duas interfaces com cable

**Instruções**:
1. Vá para Connections > Cables
2. Crie um cable conectando:
   - Interface: SW-SP-001:GigabitEthernet0/1
   - Interface: [Servidor Lab]:eth0

**O tipo de cable padrão é:**

A) Copper
B) Fiber
C) Direct Attach Cable
D) Not specified

**Resposta**: A
**Explicação**: Para conexões Ethernet, o tipo padrão é "Copper".

---

#### Questão 85 🖥️ LAB
**Tarefa**: Modificar um ticket

**Instruções**:
1. No Odoo, edite o ticket #0003
2. Adicione a categoria: "Rede"
3. Mude a prioridade para: "Urgente"

**A prioridade foi alterada para:**

A) Baixa
B) Normal
C) Alta
D) Urgente

**Resposta**: D
**Explicação**: Prioridade alterada de "Alta" para "Urgente".

---

#### Questão 86 🖥️ LAB
**Tarefa**: Verificar métricas do Wazuh

**Instruções**:
1. Acesse o dashboard do Wazuh Manager
2. Vá para Monitoring > Agents

**Quantos agentes estão ativos?**

A) 0
B) 1
C) 2
D) 3

**Resposta**: B
**Explicação**: Apenas o agente da VM Linux está instalado e ativo.

---

#### Questão 87 🖥️ LAB
**Tarefa**: Configurar power port

**Instruções**:
1. No NetBox, edite o dispositivo SW-SP-001
2. Adicione um power port:
   - Nome: Power
   - Tipo: IEC C13-C14

**O power port foi criado?**

A) Sim, com sucesso
B) Não, erro de validação
C) Parcialmente
D) Não foi testado

**Resposta**: A
**Explicação**: Power port criado sem erros.

---

#### Questão 88 🖥️ LAB
**Tarefa**: Resolver ticket no Odoo

**Instruções**:
1. No ticket #0003, adicione uma mensagem
2. Conteúdo: "Problema resolvido - trocado cabo de rede"
3. Mude o status para "Resolvido"

**O ticket está agora no status:**

A) Novo
B) Em Andamento
C) Resolvido
D) Fechado

**Resposta**: C
**Explicação**: Status alterado para "Resolvido".

---

#### Questão 89 🖥️ LAB
**Tarefa**: Criar um circuito

**Instruções**:
1. No NetBox, vá para Circuits > Circuits
2. Crie um novo circuito:
   - Provider: Telco Brasil
   - Tipo: MPLS
   - A-end: São Paulo Data Center
   - Z-end: Rio de Janeiro Office

**O circuito foi criado com status:**

A) Planned
B) Active
C) Maintenance
D) Offline

**Resposta**: A
**Explicação**: Circuitos são criados com status "Planned" até ativação.

---

#### Questão 90 🖥️ LAB
**Tarefa**: Configurar webhook

**Instruções**:
1. No Odoo, vá para Settings > Technical > Webhooks
2. Configure um webhook:
   - Name: Slack Notification
   - URL: https://hooks.slack.com/services/...
   - Event: Ticket Created

**O webhook foi configurado para disparar em:**

A) Ticket Created only
B) Ticket Updated only
C) Ticket Closed only
D) Any ticket event

**Resposta**: A
**Explicação**: Webhook configurado especificamente para evento "Ticket Created".

---

#### Questão 91 🖥️ LAB
**Tarefa**: Verificar uso de disco

**Instruções**:
1. No Wazuh, verifique os alertas de integridade
2. Procure por mudanças no arquivo /etc/hosts

**Houve alguma mudança detectada?**

A) Sim, arquivo modificado
B) Não, sem mudanças
C) Arquivo não monitorado
D) Erro no scan

**Resposta**: B
**Explicação**: Nenhuma mudança detectada no arquivo /etc/hosts.

---

#### Questão 92 🖥️ LAB
**Tarefa**: Criar um usuário

**Instruções**:
1. No Odoo, vá para Settings > Users & Companies > Users
2. Crie um novo usuário:
   - Nome: Maria Santos
   - Email: maria@neo-stack.com
   - Grupos: Employee

**O usuário foi criado com sucesso?**

A) Sim
B) Não, email duplicado
C) Não, senha inválida
D) Não, permissões insuficientes

**Resposta**: A
**Explicação**: Usuário criado com sucesso.

---

#### Questão 93 🖥️ LAB
**Tarefa**: Configurar VLAN no dispositivo

**Instruções**:
1. Edite o dispositivo SW-SP-001
2. Adicione uma interface VLAN:
   - Nome: VLAN100
   - VLAN: VLAN_USUARIOS (100)

**A interface VLAN foi criada?**

A) Sim, na interface GigabitEthernet0/1
B) Sim, como interface virtual
C) Não, erro de configuração
D) Parcialmente

**Resposta**: B
**Explicação**: Interfaces VLAN são criadas como interfaces virtuais no dispositivo.

---

#### Questão 94 🖥️ LAB
**Tarefa**: Gerar relatório

**Instruções**:
1. No Odoo, vá para Helpdesk > Reporting
2. Gere um relatório de tickets por categoria
3. Período: Últimos 7 dias

**Quantos tickets "Suporte Técnico" foram encontrados?**

A) 0
B) 1
C) 2
D) 3

**Resposta**: B
**Explicação**: Apenas o ticket criado no laboratório pertence a esta categoria.

---

#### Questão 95 🖥️ LAB
**Tarefa**: Verificar logs do agente

**Instruções**:
1. Na VM Linux, verifique os logs do agente Wazuh
2. Comando: tail -f /var/ossec/logs/ossec.log

**Os logs mostram conexão:**

A) Successfully connected
B) Connection refused
C) Authentication failed
D) Timeout

**Resposta**: A
**Explicação**: Logs confirmam conexão bem-sucedida com o Manager.

---

#### Questão 96 🖥️ LAB
**Tarefa**: Fechar ticket

**Instruções**:
1. No Odoo, mude o status do ticket #0003 para "Fechado"
2. Adicione uma nota: "Cliente confirmou resolução"

**O ticket foi fechado com sucesso?**

A) Sim, status "Fechado"
B) Não, status "Resolvido" mantido
C) Erro no sistema
D) Requer aprovação

**Resposta**: A
**Explicação**: Ticket fechado com sucesso.

---

#### Questão 97 🖥️ LAB
**Tarefa**: Verificar topologia

**Instruções**:
1. No NetBox, vá para a visualização de topologia
2. Procure pelo dispositivo SW-SP-001

**O dispositivo está conectado a quantos outros dispositivos?**

A) 0
B) 1
C) 2
D) 3

**Resposta**: B
**Explicação**: Conectado apenas ao servidor Lab via cable.

---

#### Questão 98 🖥️ LAB
**Tarefa**: Configurar regra personalizada

**Instruções**:
1. No Wazuh, crie uma regra personalizada
2. Padrão: Failed login attempts > 3
3. Nível: Warning (5)

**A regra foi salva com ID:**

A) 100001
B) 100002
C) 100003
D) 100010

**Resposta**: B
**Explicação**: Regras personalizadas começam em 100000+. Esta é a segunda, então 100001.

---

#### Questão 99 🖥️ LAB
**Tarefa**: Exportar dados

**Instruções**:
1. No NetBox, exporte a lista de dispositivos
2. Formato: CSV
3. Filtre por site: São Paulo Data Center

**Quantos dispositivos foram exportados?**

A) 0
B) 1
C) 2
D) 3

**Resposta**: B
**Explicação**: Apenas o SW-SP-001 foi criado neste site.

---

#### Questão 100 🖥️ LAB
**Tarefa**: Verificar métricas do sistema

**Instruções**:
1. No dashboard do Wazuh Manager
2. Verifique: Number of agents
3. Verifique: Last agent registration

**A última registro foi:**

A) Há 1 hora
B) Há 30 minutos
C) Há 5 minutos
D) Agora

**Resposta**: D
**Explicação**: Agente registrado durante o exame.

---

#### Questão 101 🖥️ LAB
**Tarefa**: Configurar template

**Instruções**:
1. No Odoo, crie um template de resposta
2. Nome: "Resolução de Problemas de Rede"
3. Conteúdo: "Verificar cabos e configurações de rede"

**O template foi criado?**

A) Sim
B) Não, erro de validação
C) Parcialmente
D) Não foi testado

**Resposta**: A
**Explicação**: Template criado com sucesso.

---

#### Questão 102 🖥️ LAB
**Tarefa**: Testar regra Wazuh

**Instruções**:
1. Execute wazuh-logtest no Manager
2. Teste a regra personalizada criada
3. Input: Failed login for user admin

**A regra foi disparada?**

A) Sim, level 5
B) Não, nível insuficiente
C) Erro no logtest
D) Regra não encontrada

**Resposta**: A
**Explicação**: Regra disparada corretamente para tentativas de login falhadas.

---

## 📖 SEÇÃO 3: ESTUDOS DE CASO (18 questões)

### Instruções da Seção de Estudos de Caso

Os próximos 3 estudos de caso apresentam cenários reais. Cada caso inclui 6 questões (total: 18 questões).

**Leia cada cenário cuidadosamente** e responda às perguntas baseadas nas informações fornecidas.

---

## 📋 ESTUDO DE CASO 1: Implementação NetBox

### Contexto

A empresa **TechSolutions Ltda** está implementando o NEO_STACK Platform em seu datacenter. Você foi contratado como consultor para configurar o NetBox.

**Informações da Empresa:**
- Sede: São Paulo - SP
- Filial: Rio de Janeiro - RJ
- Datacenter principal: 50 servidores
- 20 switches de acesso (Cisco Catalyst 2960)
- 4 switches core (Cisco Catalyst 4500)
- 5 firewalls (Fortinet FortiGate)
- Rede WAN: 2 enlaces MPLS

**Configurações de Rede:**
- VLAN 10: Gestão (10.0.10.0/24)
- VLAN 20: Servidores (10.0.20.0/24)
- VLAN 30: Usuários (10.0.30.0/24)
- VLAN 40: DMZ (10.0.40.0/24)
- VLAN 50: WiFi (10.0.50.0/24)

**Requisitos:**
1. Documentar toda a infraestrutura
2. Implementar hierarquia de sites (SP como site principal)
3. Configurar device types para todos os equipamentos
4. Definir roles para cada tipo de dispositivo
5. Mapear todas as conexões físicas
6. Configurar circuit para enlaces WAN

---

#### Questão 103
**Para organizar os dois sites (SP e RJ), qual hierarquia você recomendaria?**

A) Sites > Regions > Locations
B) Sites > Locations
C) Sites > Buildings > Floors
D) Regions > Sites

**Resposta**: B
**Explicação**: Para apenas 2 sites, uma estrutura simples Sites > Locations é suficiente e mais gerenciável.

---

#### Questão 104
**Quantos device types você precisa criar?**

A) 3 (Switches, Servidores, Firewalls)
B) 4 (Access Switch, Core Switch, Server, Firewall)
C) 5 (Catalyst 2960, Catalyst 4500, Server, FortiGate, Router)
D) 2 (Network Equipment, Servers)

**Resposta**: C
**Explicação**: Para precisão, cada modelo único precisa de device type próprio: 2960, 4500, Server, FortiGate, Router (para MPLS).

---

#### Questão 105
**Qual role você atribuiria aos switches Catalyst 2960?**

A) Core
B) Distribution
C) Access
D) Border

**Resposta**: C
**Explicação**: Catalyst 2960 são switches de acesso (access layer), conectando usuários finais.

---

#### Questão 106
**Para as 5 VLANs, qual a melhor prática para o first IP (ex: .1)?**

A) Deixar disponível para alocação manual
B) Reservar como gateway para cada VLAN
C) Atribuir ao primeiro servidor
D) Não usar o .1 em nenhuma VLAN

**Resposta**: B
**Explicação**: .1 (ou primeiro IP) deve ser reservado como gateway para roteamento entre VLANs.

---

#### Questão 107
**Quantos circuits você precisa configurar para os enlaces WAN?**

A) 1 (um circuit para SP-RJ)
B) 2 (um para cada enlace MPLS)
C) 3 (SP-ISP1, SP-ISP2, SP-RJ)
D) 5 (um para cada local remoto)

**Resposta**: B
**Explicação**: Como são 2 enlaces MPLS redundantes, criar 2 circuits (circuits são enlaces físicos).

---

#### Questão 108
**Qual campo é OBRIGATÓRIO ao criar um dispositivo?**

A) Serial number
B) Site
C) Asset tag
D) Primary IP

**Resposta**: B
**Explicação**: Site é obrigatório para localizar o dispositivo fisicamente. Outros campos são opcionais.

---

## 📋 ESTUDO DE CASO 2: Incidente de Segurança Wazuh

### Contexto

O SOC (Security Operations Center) da empresa **SecureBank S.A.** monitora 500+ servidores e workstations usando Wazuh. Hoje, às 14:32, um alerta crítico foi disparado.

**Situação:**
- Múltiplos failed login attempts em servidor de database (db-prod-01)
- Origem: IP 203.0.113.45
- Attempts: 150 tentativas em 5 minutos
- Timestamp: 14:32:15 - 14:37:22

**Sistema Afetado:**
- Hostname: db-prod-01
- OS: Ubuntu 20.04
- IP: 10.0.20.100
- Service: PostgreSQL 13
- Database: production_db

**Alertas Relacionados:**
1. Failed root login attempts (Level 10)
2. Multiple authentication failures (Level 7)
3. Invalid user authentication (Level 5)
4. SSH connection from unusual location (Level 6)

**Network Context:**
- Empresa em São Paulo, Brasil
- IP origem: 203.0.113.45 (RANGE: 203.0.113.0/24)
- GEOIP: China
- WHOIS: China Telecom

**Resposta Inicial:**
- 14:35: Analista SOC iniciou investigação
- 14:38: IP bloqueado via firewall (Active Response)
- 14:40: TheHive caso criado automaticamente
- 14:45: Ticket Odoo #0085 criado para tracking

---

#### Questão 109
**Qual o RISCO PRINCIPAL neste incidente?**

A) Denial of Service (DoS)
B) Brute force attack para gain access
C) Data exfiltration
D) Malware infection

**Resposta**: B
**Explicação**: 150 tentativas de login em 5 minutos indica brute force attack para obter acesso não autorizado.

---

#### Questão 110
**O que o "Active Response" fez ao bloquear o IP?**

A) Previne acesso futuro apenas
B) Termina a sessão ativa
C) Coleta evidências forenses
D) Notifica o administrador

**Resposta**: B
**Explicação**: Active Response bloqueia IP no firewall, prevenindo novas tentativas e terminando conexões ativas.

---

#### Questão 111
**Por que este IP é SUSPEITO?**

A) Está em blacklist known
B) Origem geográfica incomum (China para empresa brasileira)
C) Velocidade de ataques muito alta
D) Todas as alternativas

**Resposta**: D
**Explicação**: Suspeito por: geografia incomum, volume de tentativas, possíveis conexões a blacklists.

---

#### Questão 112
**Qual o próximo passo de INVESTIGAÇÃO recomendado?**

A) Verificar logs do database para successful logins
B) Analisar tráfego de rede durante o ataque
C) Verificar integridade de arquivos críticos
D) Todas as alternativas

**Resposta**: D
**Explicação**: Investigação completa requer: verificar se houve acesso bem-sucedido, analisar tráfego, verificar integridade.

---

#### Questão 113
**A integração TheHive + Odoo é ÚTIL porque:**

A) Automatiza o bloqueio de IPs
B) Cria tracking unificado do incidente
C) Envia alertas por email
D) Gera relatórios automáticos

**Resposta**: B
**Explicação**: Integração permite caso TheHive (investigação) + ticket Odoo (tracking/comunicação) para gestão completa.

---

#### Questão 114
**Para PREVENIR futuros ataques similares, você recomendaria:**

A) Implementar MFA (Multi-Factor Authentication)
B) Reduzir tentativas de login permitidas
C) Configurar geo-blocking para países específicos
D) Todas as alternativas

**Resposta**: D
**Explicação**: Prevenção requer múltiplas camadas: MFA, rate limiting, geo-blocking, e monitoring contínuo.

---

## 📋 ESTUDO DE CASO 3: Otimização de Processos Odoo

### Contexto

A empresa **ServicesPro S.A.** usa Odoo para gerenciar helpdesk com 50 técnicos e 500+ tickets/dia. Eles estão enfrentando problemas de eficiência.

**Problemas Identificados:**
1. Tempo médio de resposta: 8 horas (SLA: 4 horas)
2. Tickets perdidos sem atribuição
3. Falta de visibilidade sobre carga de trabalho
4. Repetição de respostas para questões comuns
5. Dificuldade em medir performance individual

**Estrutura Atual:**
- 50 técnicos em 3 turnos
- 5 supervisores
- Categorias: Suporte Técnico (40%), Financeiro (25%), Comercial (20%), Outros (15%)
- Prioridades: Baixa, Normal, Alta, Urgente (distribuição: 30%, 40%, 20%, 10%)

**Objetivos:**
1. Reduzir tempo de resposta para 2 horas
2. 100% de tickets atribuídos em 30 min
3. Melhorar satisfação do cliente
4. Automatizar tarefas repetitivas
5. Implementar métricas de performance

---

#### Questão 115
**Para reduzir tempo de resposta, qual a PRIMEIRA ação recomendada?**

A) Contratar mais técnicos
B) Implementar auto-assignment baseado em categoria/carga
C) Reduzir número de categorias
D) Aumentar SLA

**Resposta**: B
**Explicação**: Auto-assignment garante tickets vão direto ao técnico disponível/qualificado, reduzindo delays.

---

#### Questão 116
**Para resolver tickets "perdidos", você implementaria:**

A) Alertas automáticos para tickets não atribuídos
B) Assignment automático
C) Revisão diária de supervisores
D) Todas as alternativas

**Resposta**: D
**Explicação**: Solução completa: alertas + auto-assignment + supervisão para garantir 100% cobertura.

---

#### Questão 117
**Para melhorar VISIBILIDADE, você adicionaria:**

A) Dashboard com carga por técnico
B) Relatórios de SLA compliance
C) Gráficos de tempo médio de resolução
D) Todas as alternativas

**Resposta**: D
**Explicação**: Visibilidade completa requer dashboards em tempo real, relatórios de compliance e métricas.

---

#### Questão 118
**Para questões COMUNS, a melhor solução é:**

A) Criar base de conhecimento
B) Templates de resposta
C) Chatbot automatizado
D) Todas as alternativas

**Resposta**: D
**Explicação**: Múltiplas soluções: KB para self-service, templates para respostas rápidas, chatbot para triagem.

---

#### Questão 119
**Para medir PERFORMANCE individual, você rastrearia:**

A) Tickets resolvidos por técnico
B) Tempo médio de resposta/resolução
C) Satisfação do cliente (CSAT)
D) Todas as alternativas

**Resposta**: D
**Explicação**: Performance completa: produtividade (tickets), eficiência (tempos) e qualidade (CSAT).

---

#### Questão 120
**Para AUTOMAÇÃO, quais tarefas são prioritárias?**

A) Auto-assignment e auto-responses
B) Escalation automático por SLA
C) Notificações proativas ao cliente
D) Todas as alternativas

**Resposta**: D
**Explicação**: Automação deve cobrir: assignment, escalations, notificações para melhorar eficiência e experiência.

---

## ✅ Fim do Exame

**Você completou o simulado NEO_STACK Certified Fundamental!**

### Resumo de Pontuação

| Seção | Questões | Pontos Max | Seu Pontos |
|-------|----------|------------|------------|
| Múltipla Escolha | 72 | 72 | ___ |
| Prática/Lab | 30 | 60 | ___ |
| Estudos de Caso | 18 | 54 | ___ |
| **TOTAL** | **120** | **186** | **___** |

### Para Passar
**Pontuação Mínima**: 70% (130 pontos)
**Sua Pontuação**: ___% (___/186 pontos)

### Próximos Passos
- ✅ Se passou: Continue para Nível Professional
- ⚠️ Se não passou: Revise materiais e tente novamente
- 📚 Estudo recomendado: Videos 1-5 + Labs práticos

---

**Boa sorte na sua jornada de certificação! 🎓**
