import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Row, Col, Button, Space, Tooltip, Badge, Progress } from 'antd';
import { 
  RefreshCw, 
  Power, 
  Play, 
  RotateCw, 
  Info, 
  Server, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  HardDrive
} from 'lucide-react';
import { fetchVmStatus } from '../util-api/models-status';

const { Title, Text } = Typography;

const StatusIndicator = ({ status, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
    {status ? (
      <CheckCircle size={18} color="#52c41a" />
    ) : (
      <XCircle size={18} color="#ff4d4f" />
    )}
    <Text style={{ color: '#d9d9d9', fontSize: 14 }}>
      {label}
    </Text>
  </div>
);

const ImageSearch = () => {
  const [vmStats, setVmStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchVmStatus();
      setVmStats(res.data.vm_status || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching VM status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 300000);
    return () => clearInterval(intervalId);
  }, []);

  const handleVMAction = async (vmId, action) => {
    setActionLoading(prev => ({ ...prev, [vmId]: true }));
    try {
      console.log(`${action} VM:`, vmId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchData();
    } catch (err) {
      console.error(`Error ${action} VM ${vmId}:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [vmId]: false }));
    }
  };

  const getProcessingTimeColor = (time) => {
    if (!time) return '#d9d9d9';
    const seconds = parseFloat(time);
    if (seconds > 25) return '#ff4d4f';
    if (seconds > 15) return '#faad14';
    return '#52c41a';
  };

  const getHealthScore = (vm) => {
    let score = 100;
    if (vm.needs_restart) score -= 30;
    if (parseFloat(vm["avg+processing"] || 0) > 25) score -= 30;
    if (parseFloat(vm["avg+processing"] || 0) > 20) score -= 20;
    if (!vm.active) score = 0;
    return Math.max(0, score);
  };

  if (loading && !vmStats.length) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '60vh'
      }}>
        <Spin indicator={<RefreshCw className="spin-icon" />} size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
        padding: '2rem',
        width: '70%',
        margin: '0 auto',
        minHeight: '100vh'
      }}>      
      <Card
        title={
          <Space align="center" size="middle">
            <Server size={28} color="#8c8c8c" />
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              VM Management Dashboard
            </Title>
          </Space>
        }
        extra={
          <Space size="large">
            {lastUpdated && (
              <Space size={6} style={{ marginRight: 8 }}>
                <Clock size={18} color="#8c8c8c" />
                <Text type="secondary" style={{ color: '#8c8c8c' }}>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              </Space>
            )}
            <Tooltip title="Refresh data">
              <Button 
                icon={<RefreshCw size={18} />}
                onClick={fetchData}
                loading={loading}
                type="text"
                style={{ color: '#8c8c8c' }}
                size="large"
              />
            </Tooltip>
          </Space>
        }
        style={{ 
          backgroundColor: '#141414', 
          border: '1px solid #303030',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          width: '100%'
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Section */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #303030',
          background: 'linear-gradient(90deg, #1a1a1a 0%, #141414 100%)'
        }}>
          <Space direction="vertical" size={4}>
            <Text style={{ color: '#bfbfbf', fontSize: 15 }}>
              Monitor and manage your image search virtual machines
            </Text>
            <Space size={8}>
              <HardDrive size={16} color="#8c8c8c" />
              <Text style={{ color: '#8c8c8c', fontSize: 13 }}>
                {vmStats.length} {vmStats.length === 1 ? 'instance' : 'instances'} running
              </Text>
            </Space>
          </Space>
        </div>

        {/* Main Content */}
        {vmStats.length === 0 && !loading ? (
          <div style={{ 
            padding: '60px 24px', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
          }}>
            <AlertCircle size={64} color="#8c8c8c" />
            <Text style={{ color: '#8c8c8c', fontSize: 18 }}>No active VM instances</Text>
            <Button 
              type="primary" 
              onClick={fetchData}
              icon={<RefreshCw size={18} />}
              size="large"
            >
              Refresh Status
            </Button>
          </div>
        ) : (
          <div style={{ padding: '16px 0' }}>
            {vmStats.map((vm, index) => (
              <div 
                key={vm.vm_id}
                style={{ 
                  padding: '24px',
                  margin: '0 24px',
                  borderBottom: index < vmStats.length - 1 ? '1px solid #252525' : 'none',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    backgroundColor: '#1a1a1a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <Row 
                  gutter={[24, 16]} 
                  align="middle"
                  style={{
                    display: 'flex',
                    flexWrap: 'nowrap', // Prevent wrapping
                    width: '100%'
                  }}
                >
                  {/* VM ID Column */}
                  <Col flex="220px">
                    <Space direction="vertical" size={6}>
                      <Text strong style={{ color: '#bfbfbf', fontSize: 12 }}>VM IDENTIFIER</Text>
                      <div style={{ 
                        backgroundColor: '#252525',
                        padding: '10px 12px',
                        borderRadius: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <HardDrive size={16} color="#faad14" />
                        <Text code style={{ color: '#faad14', fontSize: 15 }}>
                          {vm.vm_id}
                        </Text>
                      </div>
                    </Space>
                  </Col>

                  {/* Health Column */}
                  <Col flex="180px">
                    <Space direction="vertical" size={6}>
                      <Text strong style={{ color: '#bfbfbf', fontSize: 12 }}>HEALTH STATUS</Text>
                      <Progress
                        percent={getHealthScore(vm)}
                        showInfo={false}
                        strokeColor={
                          getHealthScore(vm) > 70 ? '#52c41a' : 
                          getHealthScore(vm) > 30 ? '#faad14' : '#ff4d4f'
                        }
                        trailColor="#252525"
                        strokeWidth={12}
                        style={{ minWidth: 120 }}
                      />
                      <Text style={{ 
                        color: getHealthScore(vm) > 70 ? '#52c41a' : 
                              getHealthScore(vm) > 30 ? '#faad14' : '#ff4d4f',
                        fontSize: 12
                      }}>
                        {getHealthScore(vm)}% Healthy
                      </Text>
                    </Space>
                  </Col>

                  {/* Status Column */}
                  <Col flex="200px">
                    <Space direction="vertical" size={6}>
                      <Text strong style={{ color: '#bfbfbf', fontSize: 12 }}>VM STATUS</Text>
                      <StatusIndicator status={vm.active} label="Active" />
                      <StatusIndicator status={vm.needs_restart} label="Needs Restart" />
                    </Space>
                  </Col>

                  {/* Performance Column */}
                  <Col flex="180px">
                    <Space direction="vertical" size={6}>
                      <Text strong style={{ color: '#bfbfbf', fontSize: 12 }}>PERFORMANCE</Text>
                      <Space size={8}>
                        <Clock size={18} color={getProcessingTimeColor(vm["avg+processing"])} />
                        <Text style={{ 
                          color: getProcessingTimeColor(vm["avg+processing"]),
                          fontSize: 14
                        }}>
                          {vm["avg+processing"] || 'N/A'} seconds
                        </Text>
                      </Space>
                    </Space>
                  </Col>

                  {/* Actions Column - This will take remaining space */}
                  <Col flex="auto" style={{ minWidth: '200px' }}>
                    <Space direction="vertical" size={6}>
                      <Text strong style={{ color: '#bfbfbf', fontSize: 12 }}>ACTIONS</Text>
                      <Space size={8} wrap>
                        <Tooltip title="Start VM">
                          <Button 
                            icon={<Play size={18} />}
                            onClick={() => handleVMAction(vm.vm_id, 'start')}
                            loading={actionLoading[vm.vm_id]}
                            disabled={vm.active}
                            type="text"
                            style={{ 
                              color: '#8c8c8c',
                              border: '1px solid #303030',
                              padding: '8px 12px'
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Stop VM">
                          <Button 
                            icon={<Power size={18} />}
                            onClick={() => handleVMAction(vm.vm_id, 'stop')}
                            loading={actionLoading[vm.vm_id]}
                            disabled={!vm.active}
                            type="text"
                            style={{ 
                              color: '#ff4d4f',
                              border: '1px solid #303030',
                              padding: '8px 12px'
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Restart VM">
                          <Button 
                            icon={<RotateCw size={18} />}
                            onClick={() => handleVMAction(vm.vm_id, 'restart')}
                            loading={actionLoading[vm.vm_id]}
                            type="primary"
                            style={{ 
                              padding: '8px 12px',
                              background: 'transparent'
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </Space>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImageSearch;