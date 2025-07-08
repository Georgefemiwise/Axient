# Security Guide

## Overview

The Axient ALPR system implements multiple layers of security to protect sensitive data, ensure system integrity, and maintain user privacy. This document outlines the security measures, best practices, and compliance requirements.

## Authentication & Authorization

### Multi-Factor Authentication (MFA)
- **Implementation**: JWT-based authentication with optional TOTP
- **Session Management**: Secure session handling with refresh tokens
- **Password Policy**: Minimum 8 characters, complexity requirements
- **Account Lockout**: Automatic lockout after 5 failed attempts

### Role-Based Access Control (RBAC)
```javascript
const roles = {
  admin: {
    permissions: ['*'], // Full access
    description: 'System administrator'
  },
  operator: {
    permissions: [
      'view_detections',
      'manage_plates',
      'manage_cameras',
      'view_analytics'
    ],
    description: 'System operator'
  },
  viewer: {
    permissions: [
      'view_detections',
      'view_analytics'
    ],
    description: 'Read-only access'
  }
};
```

### API Security
- **JWT Tokens**: Signed with RS256 algorithm
- **Token Expiration**: 24-hour access tokens, 7-day refresh tokens
- **Rate Limiting**: Configurable per endpoint
- **CORS Protection**: Strict origin validation

## Data Protection

### Encryption at Rest
- **Database**: AES-256 encryption for sensitive fields
- **File Storage**: Encrypted image storage with unique keys
- **Backups**: Encrypted backup files with separate key management
- **Configuration**: Encrypted environment variables

### Encryption in Transit
- **HTTPS/TLS 1.3**: All client-server communication
- **Certificate Management**: Automated renewal with Let's Encrypt
- **HSTS**: HTTP Strict Transport Security headers
- **Certificate Pinning**: Mobile app certificate validation

### Data Anonymization
```sql
-- Example of data anonymization for analytics
CREATE VIEW analytics_view AS
SELECT 
  id,
  LEFT(plate_number, 3) || '-XXXX' as masked_plate,
  confidence,
  detected_at,
  camera_id
FROM license_plates
WHERE created_at > NOW() - INTERVAL '30 days';
```

## Network Security

### Firewall Configuration
```bash
# UFW rules for production server
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH (restrict to specific IPs)
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000/tcp   # Block direct app access
sudo ufw enable
```

### VPN Access
- **Camera Network**: Isolated VLAN with VPN access
- **Admin Access**: VPN required for administrative functions
- **Monitoring**: Network traffic monitoring and alerting

### DDoS Protection
- **Rate Limiting**: Application-level rate limiting
- **Load Balancer**: DDoS protection at infrastructure level
- **CDN**: Content delivery network with DDoS mitigation
- **Monitoring**: Real-time attack detection and response

## Input Validation & Sanitization

### API Input Validation
```javascript
import { z } from 'zod';

const plateSchema = z.object({
  plate_number: z.string()
    .min(6)
    .max(10)
    .regex(/^[A-Z0-9-]+$/, 'Invalid plate format'),
  owner_name: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z\s]+$/, 'Invalid name format'),
  owner_phone: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone format')
});

export function validatePlateInput(data) {
  return plateSchema.safeParse(data);
}
```

### SQL Injection Prevention
- **Parameterized Queries**: All database queries use parameters
- **ORM Protection**: Supabase client with built-in protection
- **Input Sanitization**: Server-side validation and sanitization
- **Stored Procedures**: Critical operations use stored procedures

### XSS Prevention
```javascript
// Content Security Policy
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' wss: https:;
  frame-ancestors 'none';
`;

export function securityHeaders() {
  return {
    'Content-Security-Policy': cspHeader,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}
```

## Database Security

### Row Level Security (RLS)
```sql
-- Example RLS policy for license plates
CREATE POLICY "Users can view plates based on role"
  ON license_plates FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN current_user_role() = 'admin' THEN true
      WHEN current_user_role() = 'operator' THEN true
      WHEN current_user_role() = 'viewer' THEN 
        created_at > NOW() - INTERVAL '7 days'
      ELSE false
    END
  );
```

### Database Hardening
- **Connection Encryption**: SSL/TLS for all connections
- **User Privileges**: Principle of least privilege
- **Audit Logging**: Comprehensive database activity logging
- **Regular Updates**: Automated security patches

### Backup Security
```bash
#!/bin/bash
# Secure backup script with encryption
BACKUP_DIR="/secure/backups"
GPG_RECIPIENT="backup@axient.com"
DATE=$(date +%Y%m%d_%H%M%S)

# Create encrypted backup
pg_dump axient_alpr | gpg --encrypt --recipient $GPG_RECIPIENT > \
  $BACKUP_DIR/backup_$DATE.sql.gpg

# Secure file permissions
chmod 600 $BACKUP_DIR/backup_$DATE.sql.gpg
```

## Application Security

### Secure Coding Practices
- **Code Reviews**: Mandatory security-focused code reviews
- **Static Analysis**: Automated security scanning (ESLint, Semgrep)
- **Dependency Scanning**: Regular vulnerability assessments
- **Secrets Management**: No hardcoded secrets, environment variables

### Error Handling
```javascript
// Secure error handling
export function handleError(error, req, res) {
  // Log full error details
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    user: req.user?.id,
    endpoint: req.path,
    ip: req.ip
  });

  // Return sanitized error to client
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(error.status || 500).json({
    success: false,
    error: isProduction ? 'Internal server error' : error.message,
    code: error.code || 'INTERNAL_ERROR'
  });
}
```

### File Upload Security
```javascript
import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && 
        allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});
```

## Privacy & Compliance

### Data Retention Policy
```sql
-- Automated data cleanup
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete detections older than 2 years
  DELETE FROM detections 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Archive license plates older than 1 year
  INSERT INTO license_plates_archive 
  SELECT * FROM license_plates 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  DELETE FROM license_plates 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Delete logs older than 6 months
  DELETE FROM system_logs 
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');
```

### GDPR Compliance
- **Data Minimization**: Collect only necessary data
- **Right to Erasure**: Automated data deletion on request
- **Data Portability**: Export functionality for user data
- **Consent Management**: Clear consent mechanisms
- **Privacy by Design**: Built-in privacy protections

### Audit Logging
```javascript
export function auditLog(action, resource, user, details = {}) {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    resource,
    user_id: user.id,
    user_email: user.email,
    ip_address: details.ip,
    user_agent: details.userAgent,
    details: JSON.stringify(details.data || {}),
    result: details.result || 'success'
  };

  // Store in secure audit log
  logger.info('Audit log', auditEntry);
  
  // Also store in database for compliance
  supabase.from('audit_logs').insert(auditEntry);
}
```

## Monitoring & Incident Response

### Security Monitoring
```javascript
// Security event detection
export function detectSecurityEvents(req, res, next) {
  const suspiciousPatterns = [
    /union.*select/i,     // SQL injection
    /<script/i,           // XSS attempts
    /\.\.\//,            // Path traversal
    /eval\(/i,           // Code injection
  ];

  const userInput = JSON.stringify(req.body) + req.url;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userInput)) {
      logger.warn('Security threat detected', {
        pattern: pattern.toString(),
        input: userInput,
        ip: req.ip,
        user: req.user?.id
      });
      
      // Block request and alert security team
      return res.status(403).json({
        success: false,
        error: 'Request blocked for security reasons'
      });
    }
  }
  
  next();
}
```

### Incident Response Plan
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Rapid threat assessment and classification
3. **Containment**: Immediate threat containment measures
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Post-incident analysis and improvements

### Security Alerts
```javascript
export function sendSecurityAlert(type, details) {
  const alert = {
    type,
    severity: getSeverityLevel(type),
    timestamp: new Date().toISOString(),
    details,
    system: 'axient-alpr'
  };

  // Send to security team
  notificationService.sendAlert('security-team@company.com', alert);
  
  // Log to SIEM system
  siemLogger.alert(alert);
  
  // Store in security events table
  supabase.from('security_events').insert(alert);
}
```

## Security Testing

### Penetration Testing
- **Schedule**: Quarterly external penetration tests
- **Scope**: Full application and infrastructure testing
- **Remediation**: 30-day remediation timeline for critical issues
- **Verification**: Re-testing after remediation

### Vulnerability Management
```bash
#!/bin/bash
# Automated vulnerability scanning
npm audit --audit-level moderate
docker run --rm -v $(pwd):/app clair-scanner:latest /app
snyk test --severity-threshold=medium
```

### Security Checklist

#### Pre-Deployment Security Review
- [ ] Code review completed with security focus
- [ ] Dependency vulnerabilities resolved
- [ ] Security headers implemented
- [ ] Input validation comprehensive
- [ ] Authentication/authorization tested
- [ ] Encryption properly implemented
- [ ] Error handling secure
- [ ] Logging and monitoring configured
- [ ] Backup and recovery tested
- [ ] Incident response plan updated

#### Regular Security Maintenance
- [ ] Security patches applied monthly
- [ ] Access reviews conducted quarterly
- [ ] Penetration testing performed quarterly
- [ ] Security training completed annually
- [ ] Disaster recovery tested annually
- [ ] Compliance audit passed annually

## Compliance Requirements

### Industry Standards
- **ISO 27001**: Information security management
- **SOC 2 Type II**: Security and availability controls
- **NIST Cybersecurity Framework**: Risk management
- **OWASP Top 10**: Web application security

### Regulatory Compliance
- **GDPR**: European data protection regulation
- **CCPA**: California consumer privacy act
- **HIPAA**: Healthcare information protection (if applicable)
- **PCI DSS**: Payment card industry standards (if applicable)

This security guide provides comprehensive protection measures for the Axient ALPR system. Regular reviews and updates ensure continued security effectiveness against evolving threats.