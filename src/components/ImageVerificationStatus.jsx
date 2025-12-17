import React from 'react';

const ImageVerificationStatus = ({ verification, type = "issue" }) => {
  if (!verification) return null;

  const getStatusColor = (confidence, isReal) => {
    if (!isReal || confidence < 50) return '#ff6b6b';
    if (confidence < 70) return '#feca57';
    return '#48dbfb';
  };

  const getStatusText = (confidence, isReal) => {
    if (!isReal) return 'Suspicious';
    if (confidence < 50) return 'Low Quality';
    if (confidence < 70) return 'Moderate';
    if (confidence < 90) return 'Good';
    return 'Excellent';
  };

  const getStatusIcon = (confidence, isReal) => {
    if (!isReal || confidence < 50) return '⚠️';
    if (confidence < 70) return '⚡';
    if (confidence < 90) return '✅';
    return '🌟';
  };

  const statusColor = getStatusColor(verification.confidence, verification.isReal);
  const statusText = getStatusText(verification.confidence, verification.isReal);
  const statusIcon = getStatusIcon(verification.confidence, verification.isReal);

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: `2px solid ${statusColor}`,
      borderRadius: '8px',
      padding: '12px',
      margin: '10px 0',
      fontSize: '14px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '18px', marginRight: '8px' }}>{statusIcon}</span>
        <strong style={{ color: statusColor }}>
          {type === 'resolution' ? 'Resolution' : 'Issue'} Image Verification: {statusText}
        </strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{
          width: '100px',
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden',
          marginRight: '10px'
        }}>
          <div style={{
            width: `${verification.confidence}%`,
            height: '100%',
            backgroundColor: statusColor,
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <span style={{ fontWeight: 'bold' }}>{verification.confidence}%</span>
      </div>

      {verification.warnings && verification.warnings.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <strong style={{ color: '#666' }}>Checks:</strong>
          <ul style={{ margin: '4px 0 0 20px', color: '#666' }}>
            {verification.warnings.slice(0, 2).map((warning, index) => (
              <li key={index} style={{ fontSize: '12px' }}>{warning}</li>
            ))}
            {verification.warnings.length > 2 && (
              <li style={{ fontSize: '12px', fontStyle: 'italic' }}>
                +{verification.warnings.length - 2} more checks
              </li>
            )}
          </ul>
        </div>
      )}

      {verification.adminFlag && (
        <div style={{
          marginTop: '8px',
          padding: '6px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px'
        }}>
          <strong style={{ color: '#856404' }}>⚡ Flagged for Review</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#856404' }}>
            {verification.adminFlag.flagReason}
          </p>
        </div>
      )}

      <details style={{ marginTop: '8px' }}>
        <summary style={{ 
          cursor: 'pointer', 
          color: '#666',
          fontSize: '12px',
          outline: 'none'
        }}>
          How does image verification work?
        </summary>
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#666',
          lineHeight: '1.4'
        }}>
          <p><strong>Our AI system checks:</strong></p>
          <ul style={{ margin: '4px 0 0 16px' }}>
            <li>📄 <strong>File authenticity</strong> - Format, size, and structure</li>
            <li>📸 <strong>EXIF metadata</strong> - Camera and device information</li>
            <li>🎨 <strong>Image quality</strong> - Compression and color patterns</li>
            <li>🔍 <strong>Manipulation detection</strong> - Signs of editing or generation</li>
            <li>📊 <strong>Natural patterns</strong> - Noise and consistency analysis</li>
          </ul>
          <p style={{ marginTop: '6px', fontStyle: 'italic' }}>
            Higher confidence means the image appears more authentic and unmodified.
          </p>
        </div>
      </details>
    </div>
  );
};

export default ImageVerificationStatus;