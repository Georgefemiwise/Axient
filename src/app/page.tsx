import React from 'react';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card } from '@/components/ui/Card';
import { 
  Camera, 
  Car, 
  Bell, 
  TrendingUp,
  Activity,
  Shield,
  Clock,
  Users
} from 'lucide-react';

export default function Dashboard() {
  // Mock data - in real app, this would come from API
  const stats = {
    totalDetections: 1247,
    registeredPlates: 89,
    activeCameras: 12,
    detectionsToday: 156,
    accuracyRate: 94.2,
    avgProcessingTime: 0.3,
    systemUptime: 99.8,
  };

  const recentDetections = [
    {
      id: '1',
      plateNumber: 'ABC-1234',
      timestamp: '2024-01-15T10:30:00Z',
      camera: 'Main Entrance',
      confidence: 0.95,
      status: 'registered',
    },
    {
      id: '2',
      plateNumber: 'XYZ-5678',
      timestamp: '2024-01-15T10:25:00Z',
      camera: 'Parking Lot A',
      confidence: 0.87,
      status: 'unknown',
    },
    {
      id: '3',
      plateNumber: 'DEF-9012',
      timestamp: '2024-01-15T10:20:00Z',
      camera: 'Exit Gate',
      confidence: 0.92,
      status: 'flagged',
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Detections"
            value={stats.totalDetections.toLocaleString()}
            change={{ value: 12, type: 'increase' }}
            icon={Camera}
            color="blue"
          />
          <StatsCard
            title="Registered Plates"
            value={stats.registeredPlates}
            change={{ value: 5, type: 'increase' }}
            icon={Car}
            color="green"
          />
          <StatsCard
            title="Active Cameras"
            value={stats.activeCameras}
            icon={Activity}
            color="yellow"
          />
          <StatsCard
            title="Today's Detections"
            value={stats.detectionsToday}
            change={{ value: 8, type: 'increase' }}
            icon={TrendingUp}
            color="blue"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                <p className="text-3xl font-bold text-success-600">{stats.accuracyRate}%</p>
              </div>
              <Shield className="h-8 w-8 text-success-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-3xl font-bold text-primary-600">{stats.avgProcessingTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-primary-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-3xl font-bold text-success-600">{stats.systemUptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-success-600" />
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Detections</h3>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {recentDetections.map((detection) => (
                <div key={detection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-mono font-medium text-gray-900">{detection.plateNumber}</p>
                    <p className="text-sm text-gray-600">{detection.camera}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      detection.status === 'registered' 
                        ? 'bg-success-100 text-success-800'
                        : detection.status === 'flagged'
                        ? 'bg-error-100 text-error-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {detection.status}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(detection.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ML Model Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Connection</span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                  Connected
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SMS Service</span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                  Operational
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">WebSocket Connection</span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">
                  Connected
                </span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}