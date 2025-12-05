#!/usr/bin/env python3
"""
☁️ Cloud Resource Simulator
Simulates AWS, Azure, and GCP resources with real-time metrics
"""

from flask import Flask, jsonify
import random
import time
from datetime import datetime

app = Flask(__name__)

# AWS Resources
aws_resources = {
    "ec2": [
        {"id": "i-001", "type": "t2.micro", "zone": "us-east-1a", "status": "running"},
        {"id": "i-002", "type": "t3.medium", "zone": "us-east-1b", "status": "running"},
        {"id": "i-003", "type": "m5.large", "zone": "us-east-1c", "status": "running"},
        {"id": "i-004", "type": "m5.xlarge", "zone": "us-east-1a", "status": "stopped"},
        {"id": "i-005", "type": "c5.xlarge", "zone": "us-east-1b", "status": "running"},
    ],
    "rds": [
        {"id": "db-001", "engine": "MySQL", "class": "db.t3.micro", "status": "available"},
        {"id": "db-002", "engine": "PostgreSQL", "class": "db.t3.medium", "status": "available"},
    ],
    "s3": [
        {"id": "bucket-001", "name": "app-data-001", "region": "us-east-1", "size": "245.7 GB"},
        {"id": "bucket-002", "name": "backups-002", "region": "us-east-1", "size": "1.2 TB"},
        {"id": "bucket-003", "name": "logs-003", "region": "us-east-1", "size": "890.3 GB"},
    ],
    "lambda": [
        {"id": "lambda-001", "name": "process-image", "runtime": "python3.9", "invocations": 1247},
        {"id": "lambda-002", "name": "send-email", "runtime": "nodejs18", "invocations": 892},
        {"id": "lambda-003", "name": "data-transform", "runtime": "python3.9", "invocations": 2156},
    ]
}

# Azure Resources
azure_resources = {
    "vms": [
        {"id": "vm-001", "size": "Standard_B2s", "location": "eastus", "status": "running"},
        {"id": "vm-002", "size": "Standard_D4s_v3", "location": "eastus", "status": "running"},
        {"id": "vm-003", "size": "Standard_F8s_v2", "location": "eastus2", "status": "stopped"},
    ],
    "cosmosdb": [
        {"id": "cosmos-001", "kind": "GlobalDocumentDB", "consistency": "Session", "rus": 1500},
        {"id": "cosmos-002", "kind": "MongoDB", "consistency": "Strong", "rus": 800},
    ],
    "storage": [
        {"id": "storage-001", "name": "appstorage001", "tier": "Hot", "size": "456 GB"},
        {"id": "storage-002", "name": "backups002", "tier": "Cool", "size": "2.1 TB"},
    ],
    "functions": [
        {"id": "func-001", "name": "trigger-webhook", "runtime": "python", "calls": 3421},
        {"id": "func-002", "name": "process-queue", "runtime": "dotnet", "calls": 1876},
    ]
}

# GCP Resources
gcp_resources = {
    "instances": [
        {"id": "inst-001", "machineType": "e2-micro", "zone": "us-central1-a", "status": "RUNNING"},
        {"id": "inst-002", "machineType": "e2-medium", "zone": "us-central1-b", "status": "RUNNING"},
        {"id": "inst-003", "machineType": "n1-standard-4", "zone": "us-central1-c", "status": "TERMINATED"},
    ],
    "gke": [
        {"id": "gke-001", "name": "production-cluster", "nodes": 3, "status": "RUNNING"},
        {"id": "gke-002", "name": "staging-cluster", "nodes": 2, "status": "RUNNING"},
    ],
    "cloud_sql": [
        {"id": "sql-001", "engine": "PostgreSQL", "tier": "db-f1-micro", "status": "RUNNABLE"},
        {"id": "sql-002", "engine": "MySQL", "tier": "db-n1-standard-2", "status": "RUNNABLE"},
    ],
    "functions": [
        {"id": "func-gcp-001", "name": "upload-trigger", "runtime": "python39", "executions": 5672},
        {"id": "func-gcp-002", "name": "image-processor", "runtime": "nodejs18", "executions": 2341},
    ]
}

def get_cloud_costs():
    """Calculate estimated monthly costs"""
    return {
        "aws": {
            "ec2": 1847.50,
            "rds": 123.45,
            "s3": 67.89,
            "lambda": 23.45,
            "total": 2062.29
        },
        "azure": {
            "vms": 987.32,
            "cosmosdb": 234.56,
            "storage": 145.67,
            "functions": 45.32,
            "total": 1412.87
        },
        "gcp": {
            "compute": 876.54,
            "gke": 345.67,
            "cloud_sql": 234.89,
            "functions": 78.90,
            "total": 1536.00
        }
    }

def get_metrics():
    """Get real-time metrics for all cloud resources"""
    return {
        "aws": {
            "ec2_instances": len(aws_resources["ec2"]),
            "rds_instances": len(aws_resources["rds"]),
            "s3_buckets": len(aws_resources["s3"]),
            "lambda_functions": len(aws_resources["lambda"]),
            "cpu_utilization": random.uniform(20, 85),
            "memory_utilization": random.uniform(30, 90),
            "network_in": f"{random.uniform(10, 500):.2f} MB/s",
            "network_out": f"{random.uniform(5, 300):.2f} MB/s"
        },
        "azure": {
            "vms": len(azure_resources["vms"]),
            "cosmosdb": len(azure_resources["cosmosdb"]),
            "storage_accounts": len(azure_resources["storage"]),
            "functions": len(azure_resources["functions"]),
            "cpu_utilization": random.uniform(15, 80),
            "memory_utilization": random.uniform(25, 85),
            "storage_used": f"{random.uniform(100, 2000):.2f} GB",
            "requests_per_second": random.randint(50, 500)
        },
        "gcp": {
            "instances": len(gcp_resources["instances"]),
            "gke_clusters": len(gcp_resources["gke"]),
            "cloud_sql": len(gcp_resources["cloud_sql"]),
            "functions": len(gcp_resources["functions"]),
            "cpu_utilization": random.uniform(18, 82),
            "memory_utilization": random.uniform(28, 88),
            "storage_usage": f"{random.uniform(150, 2500):.2f} GB",
            "api_requests": random.randint(1000, 10000)
        }
    }

@app.route('/api/aws/resources')
def get_aws_resources():
    """Get AWS resources"""
    return jsonify(aws_resources)

@app.route('/api/azure/resources')
def get_azure_resources():
    """Get Azure resources"""
    return jsonify(azure_resources)

@app.route('/api/gcp/resources')
def get_gcp_resources():
    """Get GCP resources"""
    return jsonify(gcp_resources)

@app.route('/api/metrics')
def get_metrics_endpoint():
    """Get cloud metrics"""
    return jsonify(get_metrics())

@app.route('/api/costs')
def get_costs():
    """Get estimated costs"""
    return jsonify(get_cloud_costs())

@app.route('/api/status')
def get_status():
    """Get overall status"""
    return jsonify({
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "aws": "operational",
            "azure": "operational",
            "gcp": "operational"
        },
        "total_resources": (
            len(aws_resources["ec2"]) + len(aws_resources["rds"]) + len(aws_resources["s3"]) +
            len(azure_resources["vms"]) + len(azure_resources["cosmosdb"]) +
            len(gcp_resources["instances"]) + len(gcp_resources["gke"])
        ),
        "uptime": f"{random.randint(90, 99)}.{random.randint(0, 9)}%"
    })

@app.route('/')
def dashboard():
    """Simple HTML dashboard"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>☁️ Cloud Resource Dashboard</title>
        <meta http-equiv="refresh" content="30">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
            .cloud-section { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .aws { border-left: 5px solid #FF9900; }
            .azure { border-left: 5px solid #0078D4; }
            .gcp { border-left: 5px solid #4285F4; }
            h1 { margin: 0; }
            h2 { margin-top: 0; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .value { font-size: 24px; font-weight: bold; color: #333; }
            .label { font-size: 12px; color: #666; }
            .cost { background: #e8f5e9; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>☁️ Multi-Cloud Resource Dashboard</h1>
                <p>Real-time monitoring of AWS, Azure & GCP resources</p>
            </div>
            <div class="cloud-section aws">
                <h2>Amazon Web Services (AWS)</h2>
                <div class="metric">
                    <div class="value">""" + str(len(aws_resources["ec2"])) + """</div>
                    <div class="label">EC2 Instances</div>
                </div>
                <div class="metric">
                    <div class="value">""" + str(len(aws_resources["rds"])) + """</div>
                    <div class="label">RDS Databases</div>
                </div>
                <div class="metric">
                    <div class="value">""" + str(len(aws_resources["s3"])) + """</div>
                    <div class="label">S3 Buckets</div>
                </div>
                <div class="cost">
                    <strong>Monthly Cost:</strong> $""" + f"{get_cloud_costs()['aws']['total']:.2f}" + """
                </div>
            </div>
            <div class="cloud-section azure">
                <h2>Microsoft Azure</h2>
                <div class="metric">
                    <div class="value">""" + str(len(azure_resources["vms"])) + """</div>
                    <div class="label">Virtual Machines</div>
                </div>
                <div class="metric">
                    <div class="value">""" + str(len(azure_resources["cosmosdb"])) + """</div>
                    <div class="label">Cosmos DB</div>
                </div>
                <div class="metric">
                    <div class="value">""" + str(len(azure_resources["storage"])) + """</div>
                    <div class="label">Storage Accounts</div>
                </div>
                <div class="cost">
                    <strong>Monthly Cost:</strong> $""" + f"{get_cloud_costs()['azure']['total']:.2f}" + """
                </div>
            </div>
            <div class="cloud-section gcp">
                <h2>Google Cloud Platform (GCP)</h2>
                <div class="metric">
                    <div class="value">""" + str(len(gcp_resources["instances"])) + """</div>
                    <div class="label">Compute Instances</div>
                </div>
                <div class="metric">
                    <div class="value">""" + str(len(gcp_resources["gke"])) + """</div>
                    <div class="label">GKE Clusters</div>
                </div>
                <div class="metric">
                    <div class="value">""" + str(len(gcp_resources["cloud_sql"])) + """</div>
                    <div class="label">Cloud SQL</div>
                </div>
                <div class="cost">
                    <strong>Monthly Cost:</strong> $""" + f"{get_cloud_costs()['gcp']['total']:.2f}" + """
                </div>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    print("☁️ Cloud Resource Simulator starting...")
    print("📊 Dashboard: http://localhost:8091")
    print("🔗 Endpoints:")
    print("   - AWS: /api/aws/resources")
    print("   - Azure: /api/azure/resources")
    print("   - GCP: /api/gcp/resources")
    print("   - Metrics: /api/metrics")
    print("   - Costs: /api/costs")
    print("-" * 60)
    app.run(host='0.0.0.0', port=8091, debug=False)
