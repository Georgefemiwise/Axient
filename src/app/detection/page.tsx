import React from 'react';
import { Header } from '@/components/layout/Header';
import { LiveFeed } from '@/components/detection/LiveFeed';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DetectionPage() {
  // Mock camera data
  const cameras = [
    {
      id: '1',
      name: 'Main Entrance',
      streamUrl: 'rtsp://camera1.local/stream',
      status: 'online',
    },
    {
      id: '2',
      name: 'Parking Lot A',
      streamUrl: 'rtsp://camera2.local/stream',
      status: 'online',
    },
    {
      id: '3',
      name: 'Exit Gate',
      streamUrl: 'rtsp://camera3.local/stream',
      status: 'offline',
    },
    {
      id: '4',
      name: 'Side Entrance',
      streamUrl: 'rtsp://camera4.local/stream',
      status: 'online',
    },
  ];

  const handleDetection = (detection: any) => {
    console.log('New detection:', detection);
    // Handle real-time detection updates
  };

  return (
    <>
      <Header title="Live Detection" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Camera Feeds</h2>
              <p className="text-gray-600">Monitor live camera feeds and license plate detections</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="success">
                {cameras.filter(c => c.status === 'online').length} Online
              </Badge>
              <Badge variant="error">
                {cameras.filter(c => c.status === 'offline').length} Offline
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cameras.map((camera) => (
            <LiveFeed
              key={camera.id}
              cameraId={camera.id}
              cameraName={camera.name}
              streamUrl={camera.streamUrl}
              onDetection={handleDetection}
            />
          ))}
        </div>

        {/* Detection Log */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Detections</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Camera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mock detection data */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                    ABC-1234
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Main Entrance
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    95%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    10:30 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">Registered</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                    XYZ-5678
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Parking Lot A
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    87%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    10:25 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="warning">Unknown</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  );
}