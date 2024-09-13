import React from 'react';
import { Carousel, Card, Row, Col, Typography, List, Avatar, Input, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Height } from '@mui/icons-material';

const { Title, Paragraph, Text } = Typography;

// Add some inline CSS for the scrollbar visibility
const scrollbarStyle = {
    overflowY: 'auto', // Show vertical scrollbar only when needed
    overflowX: 'auto', // Show horizontal scrollbar only when needed
    maxHeight: '600px', // Set a maximum height to ensure the content can overflow
};

const searchBarStyle = {
    position: 'fixed',
    top: 80,
    left: 0,
    right: 0,
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white background
    zIndex: 1000, // Make sure it stays on top of other content
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid #ddd', // Optional: Add a bottom border for better separation
};


const Home = () => {
    const testimonials = [
        {
            name: "Alice Johnson",
            testimonial: "This platform has changed the way I shop for electronics. The prices are unbeatable!",
            avatar: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=User1"
        },
        {
            name: "Bob Smith",
            testimonial: "I sold all my old textbooks and made some decent money. It was super easy to use this site.",
            avatar: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=User2"
        },
        {
            name: "Carol Taylor",
            testimonial: "Buying second-hand is now my first choice thanks to this site. Great for the environment and my wallet!",
            avatar: "https://via.placeholder.com/150/FFFF00/FFFFFF?Text=User3"
        },
        // Add more items to extend the scroll
        {
            name: "David Lee",
            testimonial: "Fantastic experience with buying vintage items. Reliable sellers and great support!",
            avatar: "https://via.placeholder.com/150/008000/FFFFFF?Text=User4"
        },
        {
            name: "Eva Green",
            testimonial: "I found exactly what I needed for my home renovation. Prices are good and so is the quality!",
            avatar: "https://via.placeholder.com/150/00CED1/FFFFFF?Text=User5"
        }
    ];

    return (
        <div style={scrollbarStyle}>
            <div style={searchBarStyle}>
                <Input.Search
                    placeholder="搜索你想要的内容..."
                    enterButton
                    style={{ width: '80%', borderRadius: '20px' }}
                />
            </div>
            <Carousel autoplay>
                {/* Image slides */}
                <div>
                    <video controls style={{ width: '100%', maxHeight: '450px' }}>
                        <source src={`/asserts/videos/0f9e5bad40e9c9e5bd9b74b9b7b5f354.mp4`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div>
                    <img src="https://tse3-mm.cn.bing.net/th/id/OIP-C.5uS5JEtWNGieM6o-9JVWdgHaEc?w=320&h=191&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="First Slide" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
                </div>
                <div>
                    <img src="https://tse1-mm.cn.bing.net/th/id/OIP-C.WQUxQCOBoQEomT-eWJrSvwHaE8?w=242&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="Second Slide" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
                </div>
                {/* Video slide */}
            </Carousel>
            {/* Additional content sections */}
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col span={12}>
                    <Card title="About the Platform" bordered={false}>
                        <EnvironmentOutlined style={{ fontSize: '20px', color: '#08c' }} />
                        <Paragraph>
                            Our second-hand trading platform is committed to providing a sustainable shopping alternative. We believe in the power of the circular economy to reduce waste and offer value to our users.
                        </Paragraph>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Our Mission" bordered={false}>
                        <EnvironmentOutlined style={{ fontSize: '20px', color: '#08c' }} />
                        <Paragraph>
                            Join our mission to make second-hand trading the first choice for consumers. Together, we can make a positive impact on the environment and our communities.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
            {/* Testimonials section with visible scrollbar */}
            <div style={scrollbarStyle}>
                <List
                    itemLayout="vertical"
                    dataSource={testimonials}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={item.avatar} />}
                                title={item.name}
                                description={item.testimonial}
                            />
                        </List.Item>
                    )}
                />
            </div>



            <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', borderTop: '1px solid #eee' }}>
                <Text strong>© {new Date().getFullYear()} Second-Hand Platform</Text>
                <Paragraph>
                    Licensed under the MIT License.
                </Paragraph>
            </div>
        </div>
    );
};

export default Home;
