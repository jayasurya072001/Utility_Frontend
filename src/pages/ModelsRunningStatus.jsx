import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Space, Tooltip } from 'antd';
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchVmsCount, fetchVmScaleStatus } from '../util-api/models-status';

const { Title, Paragraph, Text } = Typography;

const ModelsRunningStatus = () => {
    const navigate = useNavigate();
    const [scaleInfo, setScaleInfo] = useState(null);
    const [vmsInfo, setVmsInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [scaleRes, vmsRes] = await Promise.all([
                fetchVmScaleStatus(),
                fetchVmsCount()
            ]);
            setScaleInfo(scaleRes.data);
            setVmsInfo(vmsRes.data.vms);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch scaling info or VM data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 300000); // every 5 mins
        return () => clearInterval(intervalId);
    }, []);

    const handleCardClick = () => {
        navigate('/image-search');
    };

    const handleRefresh = (e) => {
        e?.stopPropagation();
        fetchData();
    };

    const getStatusColor = (value) => {
        if (value === 'Yes') return '#faad14'; // orange
        if (value === 'No') return '#52c41a'; // green
        return '#d9d9d9'; // default light gray
    };

    const statusItems = [
        { label: 'Current RPM', value: scaleInfo?.current_requests_per_minute },
        { label: 'Required RPM', value: scaleInfo?.required_requests_per_minute },
        { label: 'VMs Used', value: `${scaleInfo?.vm_count_used}/${vmsInfo?.total_vms}` },
        { label: 'Additional VMs Needed', value: scaleInfo?.estimated_additional_vms_needed },
        { 
            label: 'Scaling Needed', 
            value: scaleInfo?.scaling_needed ? 'Yes' : 'No',
            color: getStatusColor(scaleInfo?.scaling_needed ? 'Yes' : 'No')
        },
        { label: 'Status Message', value: scaleInfo?.message, color: '#a0d911' }
    ];

    return (
        <div style={{ 
            position: 'absolute', 
            top: '5vh', 
            left: '20vw',
            zIndex: 1
        }}>
            <Card
                title={
                    <Space align="center">
                        <Title level={4} style={{ color: 'white', margin: 0 }}>Image Search Status</Title>
                        <Tooltip title="Refresh data">
                            <ReloadOutlined 
                                style={{ 
                                    color: '#d9d9d9', 
                                    cursor: 'pointer',
                                    transition: 'color 0.3s',
                                    ':hover': { color: '#1890ff' }
                                }} 
                                onClick={handleRefresh} 
                            />
                        </Tooltip>
                    </Space>
                }
                bordered={false}
                style={{
                    width: 400,
                    backgroundColor: '#141414',
                    border: '1px solid #434343',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
                    }
                }}
                hoverable
                onClick={handleCardClick}
                extra={
                    <Tooltip title="Click to go to Image Search">
                        <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                    </Tooltip>
                }
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <Spin size="large" />
                    </div>
                ) : scaleInfo && vmsInfo ? (
                    <div style={{ padding: '8px 0' }}>
                        <Paragraph style={{ 
                            color: '#bfbfbf', 
                            marginBottom: 16,
                            fontStyle: 'italic'
                        }}>
                            Track VM processing & scaling status
                        </Paragraph>
                        
                        {statusItems.map((item, index) => (
                            <div key={index} style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                                paddingBottom: 8,
                                borderBottom: index !== statusItems.length - 1 ? '1px solid #303030' : 'none'
                            }}>
                                <Text strong style={{ color: '#bfbfbf' }}>{item.label}:</Text>
                                <Text style={{ color: item.color || '#d9d9d9' }}>{item.value}</Text>
                            </div>
                        ))}

                        {lastUpdated && (
                            <div style={{ 
                                marginTop: 12,
                                textAlign: 'right'
                            }}>
                                <Text type="secondary" style={{ 
                                    fontSize: 12,
                                    color: '#8c8c8c'
                                }}>
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </Text>
                            </div>
                        )}
                    </div>
                ) : (
                    <Text style={{ 
                        color: '#ff4d4f',
                        display: 'block',
                        textAlign: 'center',
                        padding: '16px 0'
                    }}>
                        Error loading scaling information
                    </Text>
                )}
            </Card>
        </div>
    );
};

export default ModelsRunningStatus;