# ☁️ Laboratório Cloud Infrastructure - AWS | Azure | GCP

> **"Multi-cloud em ação: Infrastructure as Code, Containers, Serverless e DevOps"**

---

## 🎯 **Objetivo**

Laboratório hands-on para infraestrutura cloud multi-provider:
- ✅ **AWS Services Simulation**
- ✅ **Azure Resource Management**
- ✅ **Google Cloud Platform**
- ✅ **Infrastructure as Code (Terraform)**
- ✅ **Container Orchestration (Kubernetes)**
- ✅ **Serverless Computing**
- ✅ **CI/CD Pipelines**
- ✅ **Cloud Monitoring & Alerting**

---

## 📋 **Componentes**

| Serviço | Porta | Função |
|---------|-------|--------|
| **AWS Simulator** | 8087 | Simulação completa AWS |
| **Azure Portal** | 8088 | Interface Azure |
| **GCP Console** | 8089 | Google Cloud Console |
| **Terraform** | N/A | IaC provisioning |
| **Kubernetes** | 6443 | Container orchestration |
| **Helm** | N/A | Package manager |
| **Jenkins** | 8090 | CI/CD pipelines |
| **Prometheus** | 9090 | Metrics collection |
| **Grafana Cloud** | 3003 | Cloud dashboards |

---

## 🚀 **Quick Start**

```bash
# Lab Cloud Infrastructure
cd labs/cloud
docker-compose up -d

# Acessar:
# - AWS Simulator: http://localhost:8087
# - Azure Portal: http://localhost:8088
# - GCP Console: http://localhost:8089
# - Kubernetes: https://localhost:6443
# - Jenkins: http://localhost:8090
# - Grafana Cloud: http://localhost:3003
```

---

## 🎓 **Exercícios**

### **Exercício 1: AWS Infrastructure (60 min)**
```bash
# 1. Provisionar VPC com Terraform
# 2. Criar EC2 instances
# 3. Configurar RDS database
# 4. Deploy aplicação containerizada (ECS/EKS)
# 5. Configurar CloudWatch monitoring
```

**Recursos simulados:**
- 10 EC2 instances (t2.micro → m5.xlarge)
- 2 RDS databases (MySQL + PostgreSQL)
- 3 S3 buckets
- 1 VPC com 3 subnets
- CloudFront distribution

### **Exercício 2: Azure ARM Templates (45 min)**
```bash
# 1. Deploy resource group
# 2. Criar virtual network
# 3. Provision VMs
# 4. Configurar Azure Monitor
# 5. Implement Azure Security Center
```

### **Exercício 3: GCP Kubernetes (60 min)**
```bash
# 1. Criar GKE cluster
# 2. Deploy microservices
# 3. Configurar ingress
# 4. Setup Cloud SQL
# 5. Implement Istio service mesh
```

### **Exercício 4: Multi-Cloud DevOps (90 min)**
```bash
# 1. Criar pipeline Jenkins
# 2. Deploy multi-stage (dev/staging/prod)
# 3. Blue-Green deployment
# 4. Auto-scaling configuration
# 5. Disaster recovery test
```

### **Exercício 5: Serverless Computing (45 min)**
```python
# Lambda Functions (AWS)
# Azure Functions
# Cloud Functions (GCP)
# - API Gateway
# - DynamoDB
# - CosmosDB
# - Firestore
```

---

## 📊 **Métricas Cloud**

### **AWS Dashboard:**
- **EC2 Instances:** 10 running
- **RDS Connections:** 247 active
- **S3 Storage:** 2.3 TB
- **Lambda Invocations:** 12,347/day
- **CloudWatch Alerts:** 3 triggers
- **Monthly Cost:** $2,847

### **Azure Dashboard:**
- **VM Instances:** 8 running
- **CosmosDB RUs:** 1,500 consumed
- **Storage Accounts:** 5 active
- **Function Executions:** 8,234/day
- **Azure Monitor:** 2 alerts
- **Monthly Cost:** $1,923

### **GCP Dashboard:**
- **GKE Nodes:** 12 running
- **Cloud SQL:** 2 instances
- **Cloud Storage:** 1.8 TB
- **Pub/Sub Messages:** 45,678/day
- **Cloud Logging:** 3 warnings
- **Monthly Cost:** $2,156

---

## 🎯 **Casos de Uso**

### **1. Multi-Cloud Strategy**
- Distribuição de carga entre clouds
- Avoid vendor lock-in
- Otimização de custos
- Compliance e governança

### **2. Hybrid Cloud**
- Conexão on-premise ↔ cloud
- Data replication
- Disaster recovery
- Burst computing

### **3. Cloud Migration**
- Assess → Migrate → Optimize
- Lift & Shift vs Re-architect
- Zero-downtime migration
- Post-migration optimization

### **4. DevOps Moderno**
- GitOps workflow
- Infrastructure as Code
- Continuous Delivery
- Observability

---

## 🛠️ **Ferramentas Cloud**

### **Infrastructure as Code:**
- Terraform
- AWS CloudFormation
- Azure ARM Templates
- Google Cloud Deployment Manager
- Pulumi

### **Container Orchestration:**
- Kubernetes
- Amazon EKS
- Azure AKS
- Google GKE
- Docker Swarm

### **CI/CD:**
- Jenkins
- GitLab CI/CD
- GitHub Actions
- Azure DevOps
- Google Cloud Build

### **Monitoring:**
- Prometheus
- Grafana
- ELK Stack
- Datadog
- New Relic

---

## 📚 **Certificações**

### **AWS:**
- ✅ Solutions Architect Associate
- ✅ DevOps Engineer Professional
- ⏳ Security Specialist
- ⏳ Advanced Networking

### **Azure:**
- ✅ Administrator Associate
- ✅ DevOps Engineer Expert
- ⏳ Security Engineer
- ⏳ Data Engineer

### **GCP:**
- ✅ Associate Cloud Engineer
- ✅ Professional Cloud Architect
- ⏳ DevOps Engineer
- ⏳ Security Engineer

---

## 📚 **Recursos**

- 📖 [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected)
- 🎥 [Azure Architecture Center](https://docs.microsoft.com/azure/architecture)
- 📝 [Google Cloud Architecture Guide](https://cloud.google.com/architecture)

---

**☁️ Cloud First, Cloud Smart. Lab v1.0**
