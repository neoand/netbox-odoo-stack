# MISP - Malware Information Sharing Platform

## Visão Geral

O **MISP (Malware Information Sharing Platform)** é uma plataforma open-source de compartilhamento de informações sobre ameaças cibernéticas (Threat Intelligence), desenvolvida para armazenar, compartilhar, colaborar e correlacionar indicadores de comprometimento (IOCs) e informações sobre ameaças.

!!! abstract "O que é MISP?"
    MISP é uma ferramenta que permite às organizações:

    - **Coletar** indicadores de comprometimento (IOCs) de múltiplas fontes
    - **Armazenar** informações estruturadas sobre ameaças
    - **Compartilhar** dados com parceiros e comunidades confiáveis
    - **Correlacionar** automaticamente IOCs para identificar campanhas
    - **Exportar** dados para ferramentas de segurança (SIEM, IDS, firewall)
    - **Enriquecer** eventos com inteligência contextual

## História e Desenvolvimento

### Origem no CIRCL

O MISP foi desenvolvido originalmente pela **CIRCL (Computer Incident Response Center Luxembourg)** em 2011, inicialmente como uma ferramenta interna para gerenciar e compartilhar IOCs durante investigações de incidentes.

```mermaid
timeline
    title História do MISP
    2011 : Desenvolvimento inicial pelo CIRCL
         : Ferramenta interna de compartilhamento
    2012 : Lançamento open-source
         : Primeira versão pública
    2014 : Expansão para comunidade global
         : Suporte a STIX/TAXII
    2016 : Integração MITRE ATT&CK
         : Frameworks de Taxonomies
    2018 : PyMISP e API REST completa
         : Módulos de expansão
    2020 : MISP Objects 2.0
         : Dashboards e Analytics
    2023-2025 : IA e ML para correlação
              : Expansão global contínua
```

### Comunidade Global

Hoje, o MISP é utilizado por:

- **Centros de Resposta a Incidentes (CSIRTs/CERTs)** em mais de 80 países
- **Agências governamentais** e de defesa
- **Instituições financeiras** (ISACs bancários)
- **Empresas de tecnologia** e cibersegurança
- **Provedores de serviços gerenciados (MSPs/MSSPs)**
- **Organizações de pesquisa** e universidades

!!! success "Adoção Global"
    Mais de **6.000 instâncias MISP** ativas globalmente, compartilhando milhões de IOCs diariamente através de redes de confiança estabelecidas.

## Por Que Threat Intelligence É Crítica?

### O Cenário de Ameaças Moderno

As ameaças cibernéticas evoluem rapidamente. Adversários compartilham ferramentas, técnicas e infraestrutura. **Defender-se isoladamente não é mais eficaz**.

```mermaid
graph TB
    subgraph "Adversários Compartilham"
        A1[Malware] --> A2[Infraestrutura C2]
        A2 --> A3[TTPs]
        A3 --> A4[Exploits]
        A4 --> A1
    end

    subgraph "Defensores Devem Compartilhar"
        D1[IOCs] --> D2[Contexto]
        D2 --> D3[TTPs Observadas]
        D3 --> D4[Contramedidas]
        D4 --> D1
    end

    A1 -.Ataca.-> D1
    D4 -.Defende.-> A1

    style A1 fill:#ff6b6b
    style A2 fill:#ff6b6b
    style A3 fill:#ff6b6b
    style A4 fill:#ff6b6b
    style D1 fill:#51cf66
    style D2 fill:#51cf66
    style D3 fill:#51cf66
    style D4 fill:#51cf66
```

### Benefícios do Compartilhamento de Threat Intelligence

=== "Detecção Antecipada"
    ```yaml
    Cenário:
      - Organização A detecta campanha de phishing
      - Compartilha IOCs via MISP com comunidade
      - Organizações B, C, D recebem alertas
      - Bloqueiam proativamente antes do ataque

    Resultado:
      - Redução de 70-90% no tempo de exposição
      - Economia de milhões em custos de incidente
    ```

=== "Correlação de Ataques"
    ```yaml
    Cenário:
      - Múltiplas organizações sofrem ataques similares
      - IOCs são compartilhados no MISP
      - Correlação automática identifica campanha
      - Revela infraestrutura adversária completa

    Resultado:
      - Visibilidade de campanhas globais
      - Identificação de APTs e grupos organizados
    ```

=== "Enriquecimento Contextual"
    ```yaml
    Cenário:
      - SOC detecta IP suspeito em logs
      - Consulta MISP para contexto
      - Descobre: IOC de ransomware conhecido
      - Contém família, TTPs, recomendações

    Resultado:
      - Resposta mais rápida e eficaz
      - Decisões baseadas em inteligência
    ```

=== "Aprendizado Coletivo"
    ```yaml
    Cenário:
      - Comunidade ISAC compartilha IOCs
      - Organizações menores se beneficiam
      - Todos aprendem com incidentes de outros
      - Capacidades de defesa elevadas coletivamente

    Resultado:
      - Democratização da inteligência
      - Defesa coletiva mais forte
    ```

!!! quote "Compartilhamento é Essencial"
    "No mundo da cibersegurança, compartilhar informações sobre ameaças não é apenas benéfico – é essencial para a sobrevivência. O que uma organização aprende com um ataque pode salvar centenas de outras." - Alexandre Dulaunoy, CIRCL

## Conceitos Fundamentais do MISP

### 1. Events (Eventos)

**Events** são o conceito central do MISP. Representam incidentes, campanhas de ataque, ou conjuntos relacionados de indicadores.

```mermaid
graph LR
    E[Event: Campanha Phishing Q4-2025]
    E --> A1[Attribute: email suspeito]
    E --> A2[Attribute: domínio malicioso]
    E --> A3[Attribute: hash anexo]
    E --> O1[Object: Email completo]
    E --> O2[Object: Arquivo malware]
    E --> T1[Tag: phishing]
    E --> T2[Tag: tlp:amber]

    style E fill:#4dabf7
    style A1 fill:#a9e34b
    style A2 fill:#a9e34b
    style A3 fill:#a9e34b
    style O1 fill:#ffd43b
    style O2 fill:#ffd43b
```

!!! example "Exemplo de Event"
    ```yaml
    Event: "Campanha de Phishing - Falso Banco XYZ"
    Data: 2025-12-05
    Org: CERT-BR
    Distribution: Community
    Threat Level: High
    Analysis: Ongoing

    Attributes:
      - email-src: phishing@fake-banco.com
      - domain: fake-banco.com
      - ip-dst: 192.0.2.15
      - md5: 5d41402abc4b2a76b9719d911017c592

    Tags:
      - tlp:amber
      - phishing
      - financial-fraud
    ```

### 2. Attributes (Atributos)

**Attributes** são os indicadores individuais de comprometimento (IOCs) ou dados descritivos associados a um evento.

#### Tipos de Attributes Suportados

| Categoria | Tipos | Exemplos |
|-----------|-------|----------|
| **Network** | `ip-src`, `ip-dst`, `domain`, `hostname`, `url` | `192.0.2.1`, `malware.com` |
| **File** | `md5`, `sha1`, `sha256`, `filename`, `size` | `5d41402abc...`, `trojan.exe` |
| **Email** | `email-src`, `email-dst`, `email-subject` | `attacker@evil.com` |
| **Registry** | `regkey`, `regkey|value` | `HKLM\Software\Malware` |
| **Malware** | `malware-sample`, `malware-type` | Binário + hash |
| **Other** | `mutex`, `user-agent`, `AS`, `vulnerability` | `CVE-2024-1234` |

```python
# Exemplo de criação de Attributes via PyMISP
from pymisp import PyMISP, MISPEvent, MISPAttribute

misp = PyMISP('https://misp.example.com', 'API_KEY')

event = MISPEvent()
event.info = "Malware Emotet - Campanha Janeiro 2025"

# Attribute de domínio
attr_domain = MISPAttribute()
attr_domain.type = 'domain'
attr_domain.value = 'emotet-c2.malicious.com'
attr_domain.category = 'Network activity'
attr_domain.to_ids = True  # Gerar alertas de IDS
event.add_attribute(**attr_domain)

# Attribute de hash de arquivo
attr_hash = MISPAttribute()
attr_hash.type = 'sha256'
attr_hash.value = '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5'
attr_hash.category = 'Payload delivery'
attr_hash.to_ids = True
event.add_attribute(**attr_hash)

misp.add_event(event)
```

#### Flags Importantes

=== "to_ids"
    ```yaml
    to_ids: true/false

    Significado:
      - true: Este IOC deve gerar alertas em sistemas de detecção
      - false: Informação contextual, não para detecção automática

    Exemplo:
      - IP de C2 conhecido: to_ids = true (bloquear!)
      - IP de vítima: to_ids = false (contexto apenas)
    ```

=== "disable_correlation"
    ```yaml
    disable_correlation: true/false

    Significado:
      - false: MISP correlaciona este IOC entre eventos
      - true: Desabilitar correlação (dados genéricos)

    Exemplo:
      - Hash de malware: correlação ativada
      - String comum "admin": correlação desativada
    ```

=== "batch_import"
    ```yaml
    batch_import: true/false

    Significado:
      - true: Importação em lote, sem notificações
      - false: Notificar subscritores sobre mudanças

    Uso:
      - Importar feeds massivos: batch_import = true
    ```

### 3. Objects (Objetos)

**Objects** são estruturas complexas que agrupam múltiplos attributes relacionados em templates predefinidos.

```mermaid
graph TB
    subgraph "MISP Object: File"
        O[File Object]
        O --> A1[filename: malware.exe]
        O --> A2[md5: 5d414...]
        O --> A3[sha256: 59944...]
        O --> A4[size: 245760]
        O --> A5[mime-type: application/x-dosexec]
    end

    subgraph "MISP Object: Email"
        O2[Email Object]
        O2 --> B1[from: attacker@evil.com]
        O2 --> B2[to: victim@company.com]
        O2 --> B3[subject: Invoice]
        O2 --> B4[attachment: malware.exe]
        O2 --> B5[email-body: Click here...]
    end

    O -.Relacionamento.-> O2

    style O fill:#ffd43b
    style O2 fill:#ffd43b
```

#### Objects Templates Populares

=== "file"
    ```yaml
    Template: file
    Descrição: Representa um arquivo completo

    Attributes:
      - filename: Nome do arquivo
      - md5, sha1, sha256: Hashes
      - size-in-bytes: Tamanho
      - mime-type: Tipo MIME
      - entropy: Entropia (aleatoriedade)
      - ssdeep: Fuzzy hash

    Uso:
      - Malware samples
      - Documentos maliciosos
      - Executáveis suspeitos
    ```

=== "network-connection"
    ```yaml
    Template: network-connection
    Descrição: Conexão de rede completa

    Attributes:
      - ip-src: IP origem
      - ip-dst: IP destino
      - src-port: Porta origem
      - dst-port: Porta destino
      - protocol: TCP/UDP/ICMP
      - hostname: Hostname conectado

    Uso:
      - Conexões C2 de malware
      - Comunicações suspeitas
      - Beaconing
    ```

=== "email"
    ```yaml
    Template: email
    Descrição: Email completo

    Attributes:
      - from: Remetente
      - to: Destinatário
      - subject: Assunto
      - email-body: Corpo
      - attachment: Anexos
      - x-mailer: Cliente de email
      - reply-to: Responder para

    Uso:
      - Campanhas de phishing
      - Análise de spear-phishing
      - BEC (Business Email Compromise)
    ```

=== "domain-ip"
    ```yaml
    Template: domain-ip
    Descrição: Relacionamento domínio-IP

    Attributes:
      - domain: Nome de domínio
      - ip: Endereço IP resolvido
      - first-seen: Primeira observação
      - last-seen: Última observação
      - hostname: Hostname completo

    Uso:
      - Infraestrutura C2
      - Domínios de phishing
      - DGA (Domain Generation Algorithm)
    ```

=== "vulnerability"
    ```yaml
    Template: vulnerability
    Descrição: Vulnerabilidade CVE

    Attributes:
      - id: CVE-YYYY-XXXX
      - summary: Descrição
      - cvss-score: Pontuação CVSS
      - references: Links e referências
      - vulnerable-configuration: Config afetada
      - exploit-available: Exploit público?

    Uso:
      - Rastreamento de vulnerabilidades
      - Priorização de patches
      - Threat hunting por CVEs
    ```

### 4. Galaxies (Galáxias)

**Galaxies** são clusters de conhecimento que representam frameworks, malware families, threat actors e outros conceitos de inteligência.

```mermaid
graph TB
    subgraph "MISP Galaxies"
        G1[MITRE ATT&CK]
        G2[Threat Actor]
        G3[Tool]
        G4[Ransomware]
        G5[Sector]
        G6[RSIT]
    end

    G1 --> T1[T1566: Phishing]
    G1 --> T2[T1059: Command Execution]
    G1 --> T3[T1027: Obfuscation]

    G2 --> TA1[APT28]
    G2 --> TA2[Lazarus Group]
    G2 --> TA3[FIN7]

    G3 --> TO1[Cobalt Strike]
    G3 --> TO2[Mimikatz]

    G4 --> R1[LockBit]
    G4 --> R2[BlackCat]

    style G1 fill:#845ef7
    style G2 fill:#845ef7
    style G3 fill:#845ef7
    style G4 fill:#845ef7
```

#### Principais Galaxies

=== "MITRE ATT&CK"
    ```yaml
    Galaxy: mitre-attack-pattern

    Descrição:
      - Framework de TTPs (Tactics, Techniques, Procedures)
      - Matriz de técnicas observadas em ataques reais
      - Padrão da indústria para descrever comportamento adversário

    Exemplo:
      - T1566.001: Phishing - Spearphishing Attachment
      - T1059.001: PowerShell
      - T1070.004: File Deletion

    Uso no MISP:
      - Tagear events com técnicas observadas
      - Correlacionar TTPs entre campanhas
      - Mapear capacidades de threat actors
    ```

=== "Threat Actor"
    ```yaml
    Galaxy: threat-actor

    Descrição:
      - Grupos APT conhecidos
      - Operadores de ransomware
      - Cybercrime organizations

    Exemplo:
      - APT28 (Fancy Bear) - Rússia
      - Lazarus Group - Coreia do Norte
      - FIN7 - Cybercrime financeiro

    Uso no MISP:
      - Atribuir ataques a grupos
      - Rastrear campanhas por ator
      - Compartilhar inteligência sobre adversários
    ```

=== "Tool"
    ```yaml
    Galaxy: tool

    Descrição:
      - Ferramentas usadas por adversários
      - Malware frameworks
      - Post-exploitation tools

    Exemplo:
      - Cobalt Strike - C2 framework
      - Mimikatz - Credential dumping
      - BloodHound - AD reconnaissance

    Uso no MISP:
      - Identificar ferramentas em incidentes
      - Correlacionar uso de ferramentas
      - Desenvolver detecções específicas
    ```

=== "Ransomware"
    ```yaml
    Galaxy: ransomware

    Descrição:
      - Famílias de ransomware conhecidas
      - Variantes e evoluções
      - Grupos operadores

    Exemplo:
      - LockBit 3.0
      - BlackCat (ALPHV)
      - Conti

    Uso no MISP:
      - Rastrear campanhas de ransomware
      - Compartilhar IOCs entre vítimas
      - Análise de tendências
    ```

### 5. Taxonomies (Taxonomias)

**Taxonomies** são sistemas de classificação padronizados para categorizar eventos e atributos.

```mermaid
graph LR
    subgraph "Taxonomies no MISP"
        T1[TLP - Traffic Light Protocol]
        T2[PAP - Permissible Actions]
        T3[Admiralty Scale]
        T4[RSIT - Reference Security Incidents]
        T5[Workflow]
    end

    T1 --> TLP1[tlp:red - Restrito]
    T1 --> TLP2[tlp:amber - Limitado]
    T1 --> TLP3[tlp:green - Comunidade]
    T1 --> TLP4[tlp:white - Público]

    style T1 fill:#f59f00
    style TLP1 fill:#fa5252
    style TLP2 fill:#fd7e14
    style TLP3 fill:#51cf66
    style TLP4 fill:#e9ecef
```

#### Taxonomies Essenciais

=== "TLP - Traffic Light Protocol"
    ```yaml
    Taxonomy: tlp
    Propósito: Controlar compartilhamento de informações

    Níveis:
      tlp:red:
        - Informação extremamente sensível
        - Apenas destinatários específicos
        - Não compartilhar
        Exemplo: IOCs de incidente em andamento não divulgado

      tlp:amber:
        - Compartilhamento limitado
        - Apenas organizações participantes
        - Necessita justificativa para compartilhar
        Exemplo: IOCs de campanha afetando setor específico

      tlp:green:
        - Compartilhamento dentro da comunidade
        - Parceiros e peers confiáveis
        - Não tornar público
        Exemplo: IOCs validados de ameaças conhecidas

      tlp:white (ou tlp:clear):
        - Informação pública
        - Sem restrições de compartilhamento
        - Pode ser divulgado abertamente
        Exemplo: IOCs de malware antigo já público
    ```

=== "PAP - Permissible Actions Protocol"
    ```yaml
    Taxonomy: PAP
    Propósito: Definir ações permitidas com a informação

    Níveis:
      pap:red:
        - Apenas leitura, não usar
        - Informação para awareness apenas
        Exemplo: IOCs ainda em investigação

      pap:amber:
        - Pode usar em detecção passiva
        - Não bloquear automaticamente
        Exemplo: IOCs com possíveis falsos positivos

      pap:green:
        - Pode usar em detecção ativa
        - Bloquear/alertar permitido
        Exemplo: IOCs confirmados de malware

      pap:white:
        - Todas as ações permitidas
        - Compartilhar, bloquear, publicar
        Exemplo: IOCs validados de infraestrutura maliciosa
    ```

=== "Admiralty Scale"
    ```yaml
    Taxonomy: admiralty-scale
    Propósito: Avaliar confiabilidade da fonte e informação

    Confiabilidade da Fonte (A-F):
      A: Completamente confiável
      B: Geralmente confiável
      C: Razoavelmente confiável
      D: Não geralmente confiável
      E: Não confiável
      F: Confiabilidade não pode ser julgada

    Credibilidade da Informação (1-6):
      1: Confirmada por outras fontes
      2: Provavelmente verdadeira
      3: Possivelmente verdadeira
      4: Duvidosa
      5: Improvável
      6: Não pode ser julgada

    Exemplo:
      - IOC de fonte confiável e validado: A1
      - IOC de honeypot próprio, não confirmado: A2
      - IOC de fonte desconhecida, não validado: F6
    ```

=== "RSIT - Reference Security Incidents"
    ```yaml
    Taxonomy: rsit
    Propósito: Classificar tipos de incidentes de segurança

    Categorias:
      - Abusive Content: spam, phishing, harassment
      - Malicious Code: malware, ransomware, botnet
      - Information Gathering: scanning, sniffing
      - Intrusion Attempts: exploit attempts, brute-force
      - Intrusion: compromise confirmado
      - Availability: DDoS, sabotage
      - Information Security: data breach, unauthorized access
      - Fraud: phishing, copyright violation
      - Vulnerable: sistema vulnerável exposto
      - Other: outros tipos

    Exemplo:
      - Campanha de phishing: rsit:abusive-content="phishing"
      - Infecção por ransomware: rsit:malicious-code="ransomware"
    ```

### 6. Warninglists (Listas de Avisos)

**Warninglists** são listas de valores conhecidos como falsos positivos, usadas para filtrar IOCs que não são realmente maliciosos.

```mermaid
graph TB
    IOC[IOC Recebido: 8.8.8.8]

    IOC --> W1{Verificar Warninglists}

    W1 --> WL1[Lista: Public DNS Servers]
    W1 --> WL2[Lista: CDN IPs]
    W1 --> WL3[Lista: Alexa Top 1M]

    WL1 --> MATCH[MATCH! 8.8.8.8 é Google DNS]

    MATCH --> ACTION[Ação: Avisar analista]

    style IOC fill:#4dabf7
    style MATCH fill:#ffd43b
    style ACTION fill:#51cf66
```

#### Warninglists Importantes

| Lista | Descrição | Exemplos |
|-------|-----------|----------|
| **public-dns** | Servidores DNS públicos conhecidos | 8.8.8.8, 1.1.1.1 |
| **microsoft-azure** | IPs da infraestrutura Azure | Ranges do Azure |
| **amazon-aws** | IPs da AWS | Ranges EC2, S3, CloudFront |
| **google** | IPs de serviços Google | Gmail, Drive, YouTube |
| **alexa** | Top 1M domínios Alexa | google.com, facebook.com |
| **cisco-top1000** | Top 1000 domínios Cisco Umbrella | Domínios legítimos populares |
| **cloudflare** | IPs do Cloudflare | CDN ranges |
| **university-domains** | Domínios de universidades | .edu, universidades globais |
| **bank-website** | Sites de bancos legítimos | Domínios de instituições financeiras |
| **parking-domain** | Domínios em parking | Sedo, GoDaddy parking |

!!! warning "Uso de Warninglists"
    Warninglists **não bloqueiam** IOCs, apenas **alertam** que o valor pode ser legítimo. Cabe ao analista decidir se é realmente um falso positivo no contexto do incidente.

## Arquitetura do MISP

### Componentes Principais

```mermaid
graph TB
    subgraph "Frontend"
        UI[Web UI - CakePHP]
        API[REST API]
    end

    subgraph "Backend"
        APP[Application Logic]
        WORKERS[Background Workers]
        MODULES[Expansion Modules]
    end

    subgraph "Armazenamento"
        DB[(MySQL/MariaDB)]
        REDIS[(Redis Cache)]
        FILES[File Storage]
    end

    subgraph "Integrações"
        FEEDS[External Feeds]
        SYNC[MISP Sync Servers]
        EXPORT[Export Modules]
    end

    UI --> APP
    API --> APP
    APP --> DB
    APP --> REDIS
    APP --> FILES
    WORKERS --> APP
    MODULES --> APP
    FEEDS --> APP
    SYNC --> APP
    APP --> EXPORT

    style UI fill:#4dabf7
    style API fill:#4dabf7
    style APP fill:#51cf66
    style DB fill:#ffd43b
    style REDIS fill:#ffd43b
```

### Fluxo de Dados

```mermaid
sequenceDiagram
    participant U as Usuário/API
    participant W as Web/API
    participant A as App Logic
    participant R as Redis
    participant D as Database
    participant BG as Background Worker

    U->>W: Criar Event com IOCs
    W->>A: Processar Event
    A->>R: Cache temporário
    A->>D: Salvar Event
    A->>BG: Enfileirar jobs (correlação, export)

    BG->>D: Buscar events relacionados
    BG->>D: Criar correlações
    BG->>D: Atualizar índices

    BG->>A: Job completo
    A->>U: Event criado + correlações

    Note over U,BG: Processo assíncrono para performance
```

### Arquitetura de Deployment

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx/HAProxy]
    end

    subgraph "MISP Instances"
        M1[MISP Instance 1]
        M2[MISP Instance 2]
        M3[MISP Instance 3]
    end

    subgraph "Database Cluster"
        DBM[(MySQL Master)]
        DBS1[(MySQL Slave 1)]
        DBS2[(MySQL Slave 2)]
    end

    subgraph "Cache & Queue"
        RED1[(Redis Master)]
        RED2[(Redis Replica)]
    end

    subgraph "Storage"
        NFS[NFS/GlusterFS - Shared Storage]
    end

    LB --> M1
    LB --> M2
    LB --> M3

    M1 --> DBM
    M2 --> DBM
    M3 --> DBM

    DBM --> DBS1
    DBM --> DBS2

    M1 --> RED1
    M2 --> RED1
    M3 --> RED1

    RED1 --> RED2

    M1 --> NFS
    M2 --> NFS
    M3 --> NFS

    style LB fill:#4dabf7
    style DBM fill:#ffd43b
    style RED1 fill:#ff6b6b
```

## Comunidade e Sharing Groups

### Modelo de Compartilhamento

O MISP implementa um modelo de **compartilhamento baseado em confiança** através de:

#### 1. Distribution Levels

```mermaid
graph LR
    D1[Your organization only]
    D2[This community only]
    D3[Connected communities]
    D4[All communities]
    D5[Sharing Group]

    D1 -.Restrito.-> D2
    D2 -.Limitado.-> D3
    D3 -.Expandido.-> D4

    D5 -.Customizado.-> CUSTOM[Organizações específicas]

    style D1 fill:#fa5252
    style D2 fill:#fd7e14
    style D3 fill:#ffd43b
    style D4 fill:#51cf66
    style D5 fill:#4dabf7
```

=== "Your organization only"
    ```yaml
    Distribution: 0 - Your organization only

    Comportamento:
      - Apenas sua organização vê o event/attribute
      - Não é sincronizado com nenhum servidor
      - Uso: Informações internas confidenciais

    Exemplo:
      - IOCs de teste internos
      - Dados sob investigação
      - Informações proprietárias
    ```

=== "This community only"
    ```yaml
    Distribution: 1 - This community only

    Comportamento:
      - Visível para todas as organizações na instância MISP local
      - Não é sincronizado com servidores externos
      - Uso: Compartilhamento dentro de ISAC/comunidade local

    Exemplo:
      - IOCs de ataques ao setor bancário local
      - Informações de comunidade setorial
    ```

=== "Connected communities"
    ```yaml
    Distribution: 2 - Connected communities

    Comportamento:
      - Sincronizado com instâncias MISP conectadas
      - Propaga para servidores de sincronização configurados
      - Uso: Compartilhamento entre comunidades confiáveis

    Exemplo:
      - IOCs de campanha multi-setorial
      - Compartilhamento entre CERTs nacionais
    ```

=== "All communities"
    ```yaml
    Distribution: 3 - All communities

    Comportamento:
      - Sem restrições de compartilhamento
      - Propaga para qualquer instância MISP conectada
      - Uso: Informações públicas de interesse geral

    Exemplo:
      - IOCs de malware antigo já público
      - Feeds públicos de threat intelligence
    ```

=== "Sharing Group"
    ```yaml
    Distribution: 4 - Sharing Group

    Comportamento:
      - Compartilhado apenas com organizações específicas
      - Controle granular de acesso
      - Pode atravessar múltiplas instâncias MISP
      - Uso: Colaboração entre organizações selecionadas

    Exemplo:
      - Grupo "Financial Sector ISAC"
      - Grupo "National CERTs - Americas"
      - Grupo "Incident XYZ - Affected Companies"
    ```

#### 2. Sharing Groups

**Sharing Groups** permitem compartilhamento seletivo com organizações específicas, independentemente da instância MISP onde estão.

```mermaid
graph TB
    SG[Sharing Group: Financial ISAC]

    SG --> ORG1[Banco A - misp1.example.com]
    SG --> ORG2[Banco B - misp1.example.com]
    SG --> ORG3[Banco C - misp2.example.com]
    SG --> ORG4[Banco D - misp3.example.com]
    SG --> ORG5[CERT Setorial - misp4.example.com]

    E[Event: Ransomware Banking Sector]
    E -.Distribution: Sharing Group.-> SG

    style SG fill:#4dabf7
    style E fill:#51cf66
```

!!! tip "Boas Práticas de Sharing Groups"
    - Criar grupos baseados em **setores** (financeiro, energia, saúde)
    - Criar grupos baseados em **geografia** (LATAM, EU, APAC)
    - Criar grupos baseados em **incidentes** (campanha específica)
    - Criar grupos baseados em **tipo de org** (CERTs, MSPs, enterprises)

### ISACs e Comunidades Setoriais

**ISAC (Information Sharing and Analysis Center)** são comunidades setoriais que compartilham threat intelligence.

#### ISACs Globais Utilizando MISP

| Setor | ISAC | Região | Foco |
|-------|------|--------|------|
| **Financeiro** | FS-ISAC | Global | Bancos, seguradoras, fintech |
| **Energia** | E-ISAC | Global | Energia elétrica, óleo, gás |
| **Saúde** | H-ISAC | Global | Hospitais, farmacêuticas |
| **Aviação** | A-ISAC | Global | Companhias aéreas, aeroportos |
| **Automotivo** | Auto-ISAC | Global | Montadoras, fornecedores |
| **Telecomunicações** | Telecom ISAC | Global | Operadoras, equipamentos |
| **Educação** | EI-ISAC | US/Global | Universidades, escolas |
| **Varejo** | RH-ISAC | US/Global | Lojas, e-commerce |

!!! example "Modelo de ISAC com MISP"
    ```yaml
    ISAC: Financial Sector ISAC - América Latina

    Membros:
      - 45 instituições financeiras
      - 3 CERTs setoriais
      - 2 vendors de segurança

    Instâncias MISP:
      - misp-latam.fs-isac.org (central)
      - Instâncias locais de cada membro (sincronizadas)

    Sharing Groups:
      - FS-ISAC LATAM - All Members
      - FS-ISAC LATAM - Tier 1 Banks
      - FS-ISAC LATAM - CERTs Only
      - FS-ISAC Global - Cross-region

    Volume:
      - 500-1000 events/mês
      - 10,000-50,000 attributes/mês
      - Correlação de 70-80% de campanhas
    ```

## Por Que Usar MISP na Stack NEO_NETBOX_ODOO?

### Integração com a Stack

O MISP se integra perfeitamente com os outros componentes da stack para criar uma plataforma completa de defesa cibernética:

```mermaid
graph TB
    subgraph "Threat Intelligence - MISP"
        MISP[MISP Platform]
        FEEDS[External Feeds]
        COMM[Community Sharing]
    end

    subgraph "Detection - Wazuh"
        WAZUH[Wazuh SIEM]
        AGENTS[Wazuh Agents]
    end

    subgraph "Case Management - TheHive"
        HIVE[TheHive]
        CORTEX[Cortex Analyzers]
    end

    subgraph "Automation - Shuffle/n8n"
        SHUFFLE[Shuffle SOAR]
        N8N[n8n Workflows]
    end

    subgraph "Assets - NetBox"
        NETBOX[NetBox DCIM]
    end

    FEEDS --> MISP
    COMM --> MISP

    MISP -->|Export IOCs| WAZUH
    MISP -->|Enrich Cases| HIVE
    MISP -->|Query IOCs| CORTEX
    MISP -->|Trigger Workflows| SHUFFLE
    MISP -->|Context| N8N

    WAZUH -->|Detected IOCs| MISP
    HIVE -->|Observables| MISP

    AGENTS --> WAZUH
    NETBOX -.Asset Context.-> WAZUH

    style MISP fill:#845ef7
    style WAZUH fill:#51cf66
    style HIVE fill:#ffd43b
    style SHUFFLE fill:#4dabf7
```

### Casos de Uso na Stack

=== "1. IOCs para Detecção"
    ```yaml
    Fluxo:
      1. MISP recebe IOCs de feeds e comunidade
      2. IOCs são exportados para Wazuh CDB lists
      3. Wazuh agents comparam logs com IOCs
      4. Match de IOC gera alerta de alta prioridade
      5. TheHive cria caso automaticamente
      6. Shuffle orquestra resposta

    Benefício:
      - Detecção proativa de ameaças conhecidas
      - Redução de tempo de detecção de dias para minutos
      - Contexto imediato sobre a ameaça
    ```

=== "2. Enriquecimento de Casos"
    ```yaml
    Fluxo:
      1. TheHive recebe alerta com observable (IP, hash, domain)
      2. Cortex analyzer consulta MISP
      3. MISP retorna:
         - Events relacionados ao observable
         - Contexto (malware family, campaign, TTPs)
         - Threat actor attribution
         - Sightings de outras organizações
      4. Analista tem contexto completo para resposta

    Benefício:
      - Decisões informadas por inteligência
      - Compreensão do escopo da ameaça
      - Priorização baseada em contexto
    ```

=== "3. Compartilhamento de Incidentes"
    ```yaml
    Fluxo:
      1. Organização detecta campanha de ataque
      2. Analista cria Event no MISP com IOCs
      3. Event é tagueado e classificado (TLP, PAP)
      4. MISP sincroniza com instâncias de parceiros
      5. Outras organizações recebem IOCs proativamente
      6. Bloqueiam ataque antes de serem afetadas

    Benefício:
      - Defesa coletiva contra ameaças
      - Organizações menores se beneficiam
      - Redução de impacto de campanhas
    ```

=== "4. Threat Hunting"
    ```yaml
    Fluxo:
      1. Analista busca TTPs no MISP (ex: PowerShell + Scheduled Task)
      2. MISP retorna campaigns usando essas TTPs
      3. Analista extrai IOCs e técnicas associadas
      4. Cria queries de hunting no Wazuh
      5. Descobre atividade suspeita não detectada
      6. Adiciona novos IOCs ao MISP

    Benefício:
      - Caça proativa de ameaças
      - Descoberta de compromissos antigos
      - Melhoria contínua de detecções
    ```

### Vantagens Estratégicas

!!! success "Por Que MISP?"
    **1. Open Source e Extensível**
    - Sem custos de licenciamento
    - Código auditável
    - Comunidade ativa de desenvolvedores
    - Integrações abundantes

    **2. Padrões Abertos**
    - STIX/TAXII compliant
    - MITRE ATT&CK nativo
    - APIs REST completas
    - Interoperabilidade garantida

    **3. Comunidade Global**
    - 6000+ instâncias ativas
    - Milhões de IOCs compartilhados
    - Feeds gratuitos e comerciais
    - Suporte da comunidade

    **4. Flexibilidade**
    - On-premises ou cloud
    - Single ou multi-tenant
    - Customizável para qualquer setor
    - Escalável para qualquer tamanho

    **5. Integração Profunda**
    - Wazuh, Suricata, Snort
    - TheHive, Cortex
    - SIEM (Splunk, ELK, QRadar)
    - Firewalls, EDR, SOAR

## Comparação com Outras Plataformas de TI

| Característica | MISP | OpenCTI | AlienVault OTX | MITRE ATT&CK Navigator | Anomali ThreatStream |
|----------------|------|---------|----------------|------------------------|----------------------|
| **Tipo** | TIP open-source | TIP graph-based | Crowd-sourced TI | Framework visualization | TIP comercial |
| **Licença** | AGPL (free) | Apache 2.0 (free) | Free (cloud) | Apache 2.0 (free) | Comercial |
| **Compartilhamento** | P2P entre instâncias | Graph sync | Cloud central | N/A | Cloud central |
| **IOC Focus** | ✅ Excelente | ✅ Excelente | ✅ Bom | ❌ Não | ✅ Excelente |
| **TTPs Focus** | ✅ MITRE nativo | ✅ Graph-based | ⚠️ Limitado | ✅ Especializado | ✅ Bom |
| **STIX/TAXII** | ✅ Completo | ✅ Nativo | ⚠️ Limitado | ❌ Não | ✅ Completo |
| **On-Premises** | ✅ Sim | ✅ Sim | ❌ Cloud only | ✅ Sim | ⚠️ Enterprise only |
| **API** | ✅ REST completa | ✅ GraphQL | ✅ REST | ⚠️ Limitada | ✅ REST completa |
| **Comunidade** | ✅ Muito grande | ✅ Crescendo | ✅ Grande | ✅ Grande | ⚠️ Comercial |
| **Melhor Para** | Sharing, IOCs | Intel estratégica | Crowd intel | Mapeamento TTPs | Enterprise TI |

!!! tip "Quando Usar Cada Plataforma?"
    - **MISP**: Foco em compartilhamento de IOCs, comunidades, ISACs, operacional
    - **OpenCTI**: Foco em threat actors, campanhas estratégicas, graph analysis
    - **OTX**: Foco em inteligência crowd-sourced, gratuita, cloud
    - **ATT&CK Navigator**: Foco em visualizar e mapear TTPs, coverage de detecções
    - **ThreatStream**: Foco em enterprises com budget, integração comercial

### MISP vs OpenCTI: Qual Escolher?

Ambos são excelentes. **Podem coexistir!**

```mermaid
graph LR
    subgraph "Operational Intelligence"
        MISP[MISP]
        MISP --> IOC[IOCs para detecção]
        MISP --> SHARE[Compartilhamento P2P]
        MISP --> FEEDS[Feeds operacionais]
    end

    subgraph "Strategic Intelligence"
        OPENCTI[OpenCTI]
        OPENCTI --> ACTORS[Threat Actors]
        OPENCTI --> CAMPAIGN[Campaigns]
        OPENCTI --> GRAPH[Graph Analysis]
    end

    MISP -.Sync IOCs.-> OPENCTI
    OPENCTI -.Context.-> MISP

    style MISP fill:#845ef7
    style OPENCTI fill:#4dabf7
```

!!! example "Stack Ideal"
    ```yaml
    Cenário: Enterprise Security Operations

    Stack:
      - MISP: IOCs operacionais, detecção diária, compartilhamento
      - OpenCTI: Threat actors, campanhas estratégicas, CTI reporting
      - MITRE ATT&CK Navigator: Coverage de detecções, gaps analysis
      - TheHive: Case management, incident response
      - Cortex: Analyzers, enriquecimento automático

    Resultado: Cobertura completa de Threat Intelligence!
    ```

## Próximos Passos

Agora que você compreende o que é MISP e seus conceitos fundamentais, prossiga para:

1. **[Setup e Instalação](setup.md)** - Instalar e configurar sua instância MISP
2. **[Gestão de Threat Intelligence](threat-intelligence.md)** - Criar events, attributes, objects
3. **[Compartilhamento](sharing.md)** - Configurar sharing groups e sincronização
4. **[Integração com Stack](integration-stack.md)** - Integrar MISP com Wazuh, TheHive, etc
5. **[Casos de Uso](use-cases.md)** - Exemplos práticos detalhados
6. **[API Reference](api-reference.md)** - Automatizar operações via API

!!! quote "Lembre-se"
    "Threat Intelligence não é sobre ter mais dados, é sobre ter os dados certos, no momento certo, para as pessoas certas, para tomar as decisões certas." - Paradigma do MISP

---

**Documentação**: NEO_NETBOX_ODOO Stack
**Versão**: 1.0
**Última Atualização**: 2025-12-05
