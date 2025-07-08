import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Camera, Wifi, WifiOff } from 'lucide-react';

interface LiveFeedProps {
  cameraId: string;
  cameraName: string;
  streamUrl: string;
  onDetection?: (detection: any) => void;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({
  cameraId,
  cameraName,
  streamUrl,
  onDetection,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    // Simulate camera connection
    const connectCamera = async () => {
      try {
        // In a real implementation, this would connect to the camera stream
        setIsConnected(true);
        
        // Simulate periodic detections
        const detectionInterval = setInterval(() => {
          if (Math.random() < 0.1) { // 10% chance of detection
            const detection = {
              id: Date.now().toString(),
              plateNumber: generateMockPlate(),
              confidence: 0.8 + Math.random() * 0.2,
              timestamp: new Date().toISOString(),
              boundingBox: {
                x: Math.random() * 200,
                y: Math.random() * 200,
                width: 150,
                height: 50,
              },
            };
            
            setDetections(prev => [detection, ...prev.slice(0, 4)]);
            onDetection?.(detection);
          }
        }, 2000);

        // Simulate FPS counter
        const fpsInterval = setInterval(() => {
          setFps(25 + Math.floor(Math.random() * 10));
        }, 1000);

        return () => {
          clearInterval(detectionInterval);
          clearInterval(fpsInterval);
        };
      } catch (error) {
        setIsConnected(false);
      }
    };

    connectCamera();
  }, [cameraId, onDetection]);

  const generateMockPlate = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let plate = '';
    for (let i = 0; i < 3; i++) {
      plate += letters[Math.floor(Math.random() * letters.length)];
    }
    plate += '-';
    for (let i = 0; i < 4; i++) {
      plate += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return plate;
  };

  return (
    <Card className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">{cameraName}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? 'success' : 'error'}>
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
          {isConnected && (
            <Badge variant="info">{fps} FPS</Badge>
          )}
        </div>
      </div>

      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {isConnected ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            />
            
            {/* Detection overlays */}
            {detections.map((detection) => (
              <div
                key={detection.id}
                className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                style={{
                  left: `${(detection.boundingBox.x / 640) * 100}%`,
                  top: `${(detection.boundingBox.y / 480) * 100}%`,
                  width: `${(detection.boundingBox.width / 640) * 100}%`,
                  height: `${(detection.boundingBox.height / 480) * 100}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {detection.plateNumber} ({Math.round(detection.confidence * 100)}%)
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p>Camera Offline</p>
            </div>
          </div>
        )}
      </div>

      {detections.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Detections</h4>
          <div className="space-y-2">
            {detections.slice(0, 3).map((detection) => (
              <div key={detection.id} className="flex items-center justify-between text-sm">
                <span className="font-mono">{detection.plateNumber}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{Math.round(detection.confidence * 100)}%</Badge>
                  <span className="text-gray-500">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};