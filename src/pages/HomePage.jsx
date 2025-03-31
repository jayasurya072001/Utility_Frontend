import React from "react";
import { Link } from "react-router-dom";
import { Layout, Card, Row, Col, Typography } from "antd";
import { FileText, BarChart, Repeat, Link as LinkIcon, Zap, Cpu, Database, TestTube2 } from "lucide-react";

const { Content } = Layout;
const { Title, Text } = Typography;

const quickLinks = [
  { 
    key: "fresh-load", 
    label: "Fresh Load Test", 
    icon: <FileText size={24} />,
    description: "Perform initial load testing for new models",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  { 
    key: "analysis-verification", 
    label: "Analysis Validation", 
    icon: <BarChart size={24} />,
    description: "Validate model analysis results",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
  },
  { 
    key: "regression-load", 
    label: "Regression Load Test", 
    icon: <Repeat size={24} />,
    description: "Run comparative regression tests",
    gradient: "linear-gradient(135deg, #f46b45 0%, #eea849 100%)"
  },
  { 
    key: "urlmodel-test", 
    label: "URL Model Test", 
    icon: <LinkIcon size={24} />,
    description: "Test models with URL inputs",
    gradient: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)"
  },
  { 
    key: "image-model-test", 
    label: "Image Model Test", 
    icon: <Cpu size={24} />,
    description: "Test models with image uploads",
    gradient: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)"
  },
  { 
    key: "performance-test", 
    label: "Performance Metrics", 
    icon: <Zap size={24} />,
    description: "View system performance analytics",
    gradient: "linear-gradient(135deg, #43C6AC 0%, #191654 100%)"
  },
];

const HomePage = () => {
  return (
    <Layout style={{
      minHeight: '90vh',
      background: '#111',
      padding: '24px'
    }}>
      <Content>
        <div style={{ 
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ 
            color: '#ffffff',
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Welcome to Utility Tools
          </Title>
          <Text style={{ 
            color: '#aaaaaa',
            fontSize: '16px'
          }}>
            Select a tool to get started
          </Text>
        </div>

        <Row gutter={[24, 24]} justify="center">
          {quickLinks.map((item) => (
            <Col 
              xs={24} 
              sm={12} 
              md={8} 
              lg={8} 
              xl={8} 
              key={item.key}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Link to={`/${item.key}`} style={{ textDecoration: 'none', width: '100%' }}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}
                  bodyStyle={{
                    padding: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                  cover={
                    <div style={{
                      height: '4px',
                      background: item.gradient,
                      width: '100%'
                    }} />
                  }
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    background: '#252525',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                  }}>
                    {React.cloneElement(item.icon, { 
                      style: { 
                        color: '#1890ff' 
                      } 
                    })}
                  </div>
                  <Title level={4} style={{ 
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>
                    {item.label}
                  </Title>
                  <Text style={{ 
                    color: '#888888',
                    fontSize: '14px'
                  }}>
                    {item.description}
                  </Text>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default HomePage;