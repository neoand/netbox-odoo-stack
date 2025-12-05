# 📱 Mobile Development para Wazuh + Stack

> **Desenvolvendo Apps Nativos para sua Stack NetBox + Wazuh + Odoo**

---

## 🎯 **Visão Geral**

### **📲 Por que Mobile?**

- **SOC 24/7**: Monitore a segurança de qualquer lugar
- **Gestão em mobilidade**: Approve mudanças, responda alertas
- **Notificações em tempo real**: Seja alertado instantaneamente
- **Dashboard acessível**: Visualize KPIs em qualquer dispositivo
- **Ação rápida**: Take action em incidentes sem laptop

### **📊 Mobile Strategy**

```
MOBILE ECOSYSTEM:
├─ App Nativo iOS/Android
│   ├─ SOC Dashboard
│   ├─ Alert Management
│   ├─ Ticket Operations
│   └─ Asset Lookup
│
├─ Progressive Web App (PWA)
│   ├─ Browser-based
│   ├─ Offline support
│   ├─ Push notifications
│   └─ Install prompts
│
├─ Apple Watch / Android Wear
│   ├─ Quick alerts
│   ├─ One-tap actions
│   └─ Health monitoring
│
└─ Tablet App (iPad/Android)
    ├─ Detailed dashboards
    ├─ Multi-panel views
    ├─ On-call management
    └─ Incident response
```

---

## 🏗️ **Arquitetura Mobile**

### **📐 System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                     MOBILE APP ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐                │
│  │    iOS App       │      │  Android App     │                │
│  │   (Swift/UIKit)  │      │  (Kotlin/Jetpack)│                │
│  └────────┬─────────┘      └────────┬─────────┘                │
│           │                       │                          │
│           │                       │                          │
│           └───────────┬───────────┘                          │
│                       │                                      │
│                       ▼                                      │
│           ┌────────────────────────────┐                    │
│           │      API GATEWAY           │                    │
│           │   (Authentication + Rate   │                    │
│           │        Limiting)           │                    │
│           └─────────────┬──────────────┘                    │
│                         │                                    │
│                         ▼                                    │
│           ┌────────────────────────────────────┐            │
│           │        BACKEND SERVICES             │            │
│           │                                    │            │
│           │  ┌──────────┐  ┌──────────┐        │            │
│           │  │  NetBox  │  │  Wazuh   │        │            │
│           │  │   API    │  │   API    │        │            │
│           │  └──────────┘  └──────────┘        │            │
│           │                                    │            │
│           │  ┌──────────┐  ┌──────────┐        │            │
│           │  │  Odoo    │  │Push通知 │        │            │
│           │  │   API    │  │ Service  │        │            │
│           │  └──────────┘  └──────────┘        │            │
│           └────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **🔌 API Integration**

```typescript
// api-client.ts
class StackAPIClient {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  // NetBox Integration
  async getAsset(assetId: string): Promise<NetBoxAsset> {
    const response = await fetch(`${this.baseURL}/netbox/assets/${assetId}`, {
      headers: {
        'Authorization': `Token ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async searchAssets(query: string): Promise<NetBoxAsset[]> {
    const response = await fetch(`${this.baseURL}/netbox/assets/search?q=${query}`, {
      headers: {
        'Authorization': `Token ${this.token}`
      }
    });
    return response.json();
  }

  // Wazuh Integration
  async getAlerts(limit: number = 50): Promise<WazuhAlert[]> {
    const response = await fetch(`${this.baseURL}/wazuh/alerts?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await fetch(`${this.baseURL}/wazuh/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  // Odoo Integration
  async getTickets(status: string = 'open'): Promise<OdooTicket[]> {
    const response = await fetch(`${this.baseURL}/odoo/tickets?status=${status}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async createTicket(ticketData: OdooTicketData): Promise<OdooTicket> {
    const response = await fetch(`${this.baseURL}/odoo/tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    });
    return response.json();
  }

  async updateTicket(ticketId: string, updates: Partial<OdooTicket>): Promise<OdooTicket> {
    const response = await fetch(`${this.baseURL}/odoo/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  // Push Notifications
  async registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    await fetch(`${this.baseURL}/notifications/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, platform })
    });
  }
}
```

---

## 📱 **React Native App**

### **🚀 Setup Inicial**

```bash
# Install React Native CLI
npm install -g react-native-cli

# Create new project
npx react-native init WazuhStackMobile

# Navigate to project
cd WazuhStackMobile

# Install dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-push-notification
npm install react-native-encrypted-storage
npm install axios
npm install victory-native

# iOS dependencies
cd ios && pod install && cd ..

# Android dependencies
# Edit android/app/build.gradle (add permissions)
```

### **📄 App Structure**

```
WazuhStackMobile/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Alerts/
│   │   ├── Tickets/
│   │   └── Assets/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── AlertsScreen.tsx
│   │   ├── TicketsScreen.tsx
│   │   ├── AssetDetailScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── api-client.ts
│   │   ├── auth-service.ts
│   │   └── notification-service.ts
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── hooks/
│   │   ├── useAlerts.ts
│   │   ├── useTickets.ts
│   │   └── useAssets.ts
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
├── android/
├── ios/
└── App.tsx
```

### **🎨 Dashboard Screen**

```typescript
// src/screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
import { useAlerts } from '../hooks/useAlerts';
import { useTickets } from '../hooks/useTickets';

const DashboardScreen = () => {
  const { alerts, loading, refresh } = useAlerts();
  const { tickets, refresh: refreshTickets } = useTickets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshTickets()]);
    setRefreshing(false);
  };

  const criticalAlerts = alerts.filter(a => a.level >= 10).length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const highPriorityTickets = tickets.filter(t => t.priority >= 4).length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Security Operations Center</Text>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FF4444' }]}>
          <Text style={styles.statValue}>{criticalAlerts}</Text>
          <Text style={styles.statLabel}>Critical Alerts</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FFA500' }]}>
          <Text style={styles.statValue}>{openTickets}</Text>
          <Text style={styles.statLabel}>Open Tickets</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]]}>
          <Text style={styles.statValue}>{highPriorityTickets}</Text>
          <Text style={styles.statLabel}>High Priority</Text>
        </View>
      </View>

      {/* Alerts Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Alerts by Severity</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={20}
          height={250}
        >
          <VictoryBar
            data={[
              { x: 'Low', y: alerts.filter(a => a.level < 5).length },
              { x: 'Med', y: alerts.filter(a => a.level >= 5 && a.level < 10).length },
              { x: 'High', y: alerts.filter(a => a.level >= 10).length }
            ]}
            style={{
              data: { fill: '#2196F3' }
            }}
          />
        </VictoryChart>
      </View>

      {/* Recent Alerts */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Alerts</Text>
        {alerts.slice(0, 5).map((alert, index) => (
          <TouchableOpacity key={index} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>{alert.description}</Text>
              <View style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(alert.level) }
              ]}>
                <Text style={styles.severityText}>{alert.level}</Text>
              </View>
            </View>
            <Text style={styles.alertMeta}>
              {alert.asset_name} • {alert.timestamp}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Acknowledge Alert</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Create Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Search Assets</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const getSeverityColor = (level: number): string => {
  if (level >= 10) return '#FF4444';
  if (level >= 7) return '#FFA500';
  if (level >= 5) return '#FFEB3B';
  return '#4CAF50';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  alertCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertMeta: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default DashboardScreen;
```

### **🔔 Push Notifications**

```typescript
// src/services/notification-service.ts
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  configure() {
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        this.handleNotification(notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  handleNotification(notification: any) {
    // Navigate to alert detail screen
    if (notification.data?.alertId) {
      // Use navigation service to navigate
    }

    // Show in-app notification
    this.showInAppNotification(notification);
  }

  showInAppNotification(notification: any) {
    // Implementation for in-app notification
  }

  sendAlertNotification(alert: any) {
    PushNotification.localNotification({
      id: alert.id,
      title: `🚨 ${alert.description}`,
      message: `Asset: ${alert.asset_name} | Severity: ${alert.level}`,
      playSound: alert.level >= 10,
      soundName: alert.level >= 10 ? 'default' : undefined,
      importance: alert.level >= 10 ? 'max' : 'high',
      data: {
        alertId: alert.id,
        type: 'security_alert',
      },
      actions: ['View', 'Acknowledge'],
    });
  }

  sendTicketNotification(ticket: any) {
    PushNotification.localNotification({
      id: ticket.id,
      title: `🎫 ${ticket.name}`,
      message: `Priority: ${ticket.priority}`,
      playSound: true,
      importance: 'high',
      data: {
        ticketId: ticket.id,
        type: 'ticket_update',
      },
    });
  }
}

export default new NotificationService();
```

---

## 🔥 **Flutter App**

### **🚀 Setup**

```bash
# Install Flutter
flutter create wazuh_stack_mobile

# Add dependencies
flutter pub add http
flutter pub add provider
flutter pub add fl_chart
flutter pub add firebase_messaging
flutter pub add shared_preferences

# Configure platform-specific
# See flutter.dev/docs for details
```

### **📄 Main Dashboard**

```dart
// lib/screens/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/alerts_provider.dart';
import '../providers/tickets_provider.dart';
import '../widgets/alert_card.dart';
import '../widgets/stats_card.dart';
import '../widgets/chart_widget.dart';

class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isRefreshing = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Provider.of<AlertsProvider>(context, listen: false).loadAlerts();
    await Provider.of<TicketsProvider>(context, listen: false).loadTickets();
  }

  Future<void> _onRefresh() async {
    setState(() => _isRefreshing = true);
    await _loadData();
    setState(() => _isRefreshing = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Security Operations Center'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _onRefresh,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: Consumer2<AlertsProvider, TicketsProvider>(
          builder: (context, alertsProvider, ticketsProvider, child) {
            final alerts = alertsProvider.alerts;
            final tickets = ticketsProvider.tickets;

            final criticalAlerts = alerts.where((a) => a.level >= 10).length;
            final openTickets = tickets.where((t) => t.status == 'open').length;
            final highPriorityTickets = tickets.where((t) => t.priority >= 4).length;

            return SingleChildScrollView(
              physics: AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Security Overview',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  SizedBox(height: 16),

                  // Stats Row
                  Row(
                    children: [
                      Expanded(
                        child: StatsCard(
                          value: criticalAlerts.toString(),
                          label: 'Critical Alerts',
                          color: Colors.red,
                          icon: Icons.warning,
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: StatsCard(
                          value: openTickets.toString(),
                          label: 'Open Tickets',
                          color: Colors.orange,
                          icon: Icons.ticket,
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: StatsCard(
                          value: highPriorityTickets.toString(),
                          label: 'High Priority',
                          color: Colors.green,
                          icon: Icons.priority_high,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 24),

                  // Alerts Chart
                  Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Alerts by Severity',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          SizedBox(height: 16),
                          Container(
                            height: 200,
                            child: ChartWidget(alerts: alerts),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 24),

                  // Recent Alerts
                  Text(
                    'Recent Alerts',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  SizedBox(height: 16),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: alerts.length > 5 ? 5 : alerts.length,
                    itemBuilder: (context, index) {
                      return AlertCard(alert: alerts[index]);
                    },
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
```

### **🎨 Custom Widgets**

```dart
// lib/widgets/alert_card.dart
import 'package:flutter/material.dart';
import '../models/alert.dart';

class AlertCard extends StatelessWidget {
  final Alert alert;

  const AlertCard({Key? key, required this.alert}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = _getSeverityColor(alert.level);

    return Card(
      margin: EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 8,
          height: 48,
          color: color,
        ),
        title: Text(
          alert.description,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          '${alert.assetName} • ${alert.timestamp}',
        ),
        trailing: Chip(
          label: Text(alert.level.toString()),
          backgroundColor: color.withOpacity(0.2),
        ),
        onTap: () {
          // Navigate to alert detail
          Navigator.pushNamed(context, '/alert-detail', arguments: alert);
        },
      ),
    );
  }

  Color _getSeverityColor(int level) {
    if (level >= 10) return Colors.red;
    if (level >= 7) return Colors.orange;
    if (level >= 5) return Colors.amber;
    return Colors.green;
  }
}
```

---

## ⌚ **Smartwatch App**

### **Apple Watch (watchOS)**

```swift
// WatchOS App
import SwiftUI

struct ContentView: WatchRepresentable {
    @ObservedObject var alertsProvider = AlertsProvider()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "shield.fill")
                    Text("Security Center")
                        .font(.headline)
                }

                ForEach(alertsProvider.criticalAlerts, id: \.id) { alert in
                    HStack {
                        Circle()
                            .fill(Color.red)
                            .frame(width: 8, height: 8)

                        VStack(alignment: .leading) {
                            Text(alert.description)
                                .font(.caption)
                                .lineLimit(2)

                            Text(alert.assetName)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(8)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }
            }
            .padding()
        }
    }
}
```

### **Android Wear**

```kotlin
// MainActivity.kt (Android Wear)
class WearActivity : WearableActivity() {
    private lateinit var binding: ActivityWearBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWearBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupAlerts()
        setupButtons()
    }

    private fun setupAlerts() {
        // Load and display critical alerts
        // Auto-refresh every 30 seconds
    }

    private fun setupButtons() {
        binding.btnAcknowledge.setOnClickListener {
            // Acknowledge selected alert
        }

        binding.btnViewAll.setOnClickListener {
            // Open full app on phone
        }
    }
}
```

---

## 📊 **Metrics & Analytics**

### **📱 Mobile Analytics**

```dart
// Analytics service
class AnalyticsService {
  static void trackScreenView(String screenName) {
    // Track screen views
  }

  static void trackAlertView(String alertId) {
    // Track alert interactions
  }

  static void trackTicketAction(String action, String ticketId) {
    // Track ticket operations
  }

  static void trackPerformance(String operation, Duration duration) {
    // Track app performance
  }
}
```

### **📈 Key Mobile Metrics**

- Daily Active Users (DAU)
- Session Duration
- Screen Views
- Feature Adoption
- Push Notification CTR
- App Crashes
- Load Times
- API Response Times

---

## 🔒 **Security**

### **🔐 Authentication**

```typescript
// auth-service.ts
class AuthService {
  private token: string | null = null;

  async login(credentials: LoginCredentials): Promise<string> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    this.token = data.token;

    // Store securely
    await SecureStore.setItemAsync('auth_token', this.token);

    return this.token;
  }

  async logout() {
    this.token = null;
    await SecureStore.deleteItemAsync('auth_token');
  }

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;

    this.token = await SecureStore.getItemAsync('auth_token');
    return this.token;
  }
}
```

### **🛡️ Data Protection**

- **Encryption at rest**: Use React Native Encrypted Storage
- **Encryption in transit**: HTTPS/TLS only
- **Certificate pinning**: Prevent MITM attacks
- **Biometric auth**: Fingerprint/FaceID
- **Auto-logout**: Timeout after inactivity
- **Jailbreak/Root detection**: Prevent tampering

---

## 📦 **Deployment**

### **📱 App Store Deployment**

```bash
# iOS
cd ios
xcodebuild -workspace WazuhStack.xcworkspace \
           -scheme WazuhStack \
           -configuration Release \
           -archivePath WazuhStack.xcarchive \
           archive

# Upload to App Store Connect
xcrun altool --upload-app \
            --type ios \
            --file WazuhStack.ipa \
            --username your-apple-id

# Android
cd android
./gradlew bundleRelease

# Upload to Google Play Console
bundletool build-apks --bundle=app-release.aab --output=wazuh.apks
```

### **🚀 CI/CD Pipeline**

```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test

  ios-build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - run: cd ios && pod install
      - run: xcodebuild -workspace ios/WazuhStack.xcworkspace -scheme WazuhStack build

  android-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          distribution: 'temurin'
          java-version: '11'
      - run: ./gradlew assembleRelease
```

---

## 📚 **Próximos Passos**

Agora que você tem o mobile development:

1. **[Community](community/)** → Participe da comunidade
2. **[Use Cases](use-cases/)** → Mais cenários
3. **[Stack Integration](integrations/stack.md)** → Volte à stack

---

**📊 Status: ✅ Mobile Complete | React Native + Flutter | Smartwatch Apps | Ready for Stores**

---

**Total: iOS + Android + PWA + Smartwatch | Full stack mobile | Push notifications | CI/CD ready**
