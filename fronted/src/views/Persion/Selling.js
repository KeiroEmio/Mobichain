import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useApi from '../../Hooks/useApi';
import deleteIcon from '../../asserts/deleteIcon.png'; // Ensure these paths are correct
import addIcon from '../../asserts/addIcon.png';

const api = new useApi();

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [owner, setOwner] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editableProduct, setEditableProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState('');

    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const response = await api.get('/api/account');
                if (response.status !== 200) {
                    throw new Error('No response object or response is not OK');
                }
                setOwner(response.data.address);
            } catch (error) {
                console.error("Fetching owner failed: ", error);
            }
        };

        fetchOwner();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!owner) return;

            try {
                const response = await api.post(`/api/android/selling/${owner}`);
                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('response.data:', response.data)
                setProducts(response.data);
            } catch (error) {
                console.error("Fetching products failed: ", error);
            }
        };

        fetchProducts();
    }, [owner]);

    const handleDeleteImage = () => {
        setImage('');
    };

    const handleAddImage = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setEditableProduct(product);
        setIsEditing(false);
        setImage(product.imagepath);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleConfirm = async () => {
        setIsEditing(false);
        try {
            const response = await api.post(`/api/android/edit/${editableProduct.id}`, editableProduct);
            if (response.status === 200) {
                const updatedProducts = products.map(p => p.id === editableProduct.id ? editableProduct : p);
                console.log('updatedProducts:', updatedProducts)
                setProducts(updatedProducts);
                setSelectedProduct(editableProduct);
            } else {
                throw new Error(`Failed to update product: ${response.status}`);
            }
        } catch (error) {
            console.error("Error updating product: ", error);
        }
    };

    const handleChange = (e) => {
        setEditableProduct({ ...editableProduct, [e.target.name]: e.target.value });
    };

    const handleReturn = () => {
        setSelectedProduct(null);
        setIsEditing(false);
    };


    return (
        <>
            <Container>
                {products.map((product) => (
                    <ItemContainer key={product.id} onClick={() => handleProductClick(product)}>
                        <Content>
                            <Title>{`${product.brand} ${product.model}`}</Title>
                            {/* src={`/asserts/images/${record.imagePath}` */}
                            <img src={`/asserts/images/${product.imagepath}`} alt="Product" style={{ height: '200px', objectFit: 'cover' }} />
                            <Price>{`$${product.price}`}</Price>
                        </Content>
                    </ItemContainer>
                ))}
            </Container>

            {selectedProduct && (
                <>
                    <Overlay className="active" onClick={handleReturn} />
                    <Modal className="active">
                        <h2>{selectedProduct.brand} {selectedProduct.model}</h2>
                        {isEditing ? (
                            <EditForm>
                                <Input name="brand" value={editableProduct.brand} onChange={handleChange} />
                                <Input name="model" value={editableProduct.model} onChange={handleChange} />
                                <Input name="price" value={editableProduct.price} onChange={handleChange} />
                                <ImageManagement image={editableProduct.imagepath}>
                                    {image && (
                                        <>
                                            <img src={`/asserts/images/${image}`} alt="Product" style={{ height: '200px', objectFit: 'cover' }} />
                                            <DeleteIcon src={deleteIcon} alt="Delete" onClick={handleDeleteImage} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} />
                                        </>
                                    )}
                                    {!image && (
                                        <label>
                                            <input type="file" style={{ display: 'none' }} onChange={handleAddImage} />
                                            <img src={addIcon} alt="Add" style={{ cursor: 'pointer', width: '100%', height: '100%' }} />
                                        </label>
                                    )}
                                </ImageManagement>
                                <ButtonRow>
                                    <Button onClick={handleConfirm}>提交</Button>
                                    <Button onClick={handleReturn}>返回</Button>
                                </ButtonRow>
                            </EditForm>
                        ) : (
                            <>
                                <img src={`/asserts/images/${selectedProduct.imagepath}`} alt={selectedProduct.model} style={{ height: '200px', objectFit: 'cover' }} />
                                <p>Model: ${selectedProduct.model}</p>
                                <p>Price: ${selectedProduct.price}</p>
                                <p>Owner: {selectedProduct.owner}</p>
                                <Button onClick={handleEdit}>Edit</Button>
                            </>
                        )}
                    </Modal>
                </>
            )}
        </>
    );
};

export default ProductList;

// Replace styled-components with your preferred styling approach
const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  background-color: #f2f2f2;
  padding: 0; // 取消容器内间距
  margin: -10px; // 抵消项目间距对容器的影响
  overflow-y: scroll; // 只在需要时显示垂直滚动条
  max-height: 120vh; // 最大高度设置为视窗高度的80%，确保内容超出会有滚动条
`;

const ItemContainer = styled.div`
  flex: 0 0 calc(25% - 20px); // 每个项目占据25%的容器宽度减去总边距
  display: flex;
  background-color: #fff;
  margin: 10px; // 项目间距
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  height: 300px; // 增大高度
  width: calc(25% - 20px); // 宽度是容器的25%减去边距
  cursor: pointer; // 将光标变成手掌形状
  transition: transform 0.3s ease, box-shadow 0.3s ease; // 添加平滑过渡效果

  &:hover {
    transform: translateY(-5px); // 鼠标悬停时，项目向上移动5px
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); // 增加阴影以创建按下效果
  }
`;
const Image = styled.img`
  width: 60%; // 图片宽度为容器的60%
  height: auto; // 高度自动，以保持图片原有的宽高比
  object-fit: cover; // 图片过大时，保持宽高比并填充空间
  margin: auto; // 使图片在容器中居中显示
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
`;

const Title = styled.span`
  width: 60%; // 可以设置一个宽度
  font-size: 16px;
  font-weight: bold;
  text-align: center; // 文本居中
`;

const Subtitle = styled.span`
  font-size: 14px;
  color: #666;
`;

const Price = styled.span`
  font-size: 18px;
  color: red; // 将价格文本颜色改为红色
  font-weight: bold;
  align-self: center; // 价格也居中对齐
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1); // 添加scale来配合动画
  background: linear-gradient(135deg, #6e8efb, #a777e3); // 添加一个渐变背景
  padding: 30px;
  z-index: 1000;
  border-radius: 15px; // 增加圆角
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25); // 更大更柔和的阴影
  width: 90%;
  max-width: 600px; // 增加最大宽度
  opacity: 0; // 开始时透明度为0
  transition: transform 0.4s ease-out, opacity 0.4s ease-out; // 平滑的动画过渡效果
  will-change: transform, opacity; // 提升动画性能
  &.active {
    opacity: 1; // 激活状态下透明度为1
    transform: translate(-50%, -50%) scale(1); // 激活状态下scale为1
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 999;
  opacity: 0; // 开始时透明度为0
  transition: opacity 0.4s ease-out; // 平滑的动画过渡效果
  will-change: opacity; // 提升动画性能
  &.active {
    opacity: 1; // 激活状态下透明度为1
  }
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  margin: 0 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ImageManagement = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  background-image: url(${props => props.image ? `/assets/images/${props.image}` : addIcon});
  background-size: cover;
  background-position: center;
  border: 1px solid #ccc;
  margin-bottom: 10px;
`;

const DeleteIcon = styled.img`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  width: 24px; // Adjust based on your icon size
  height: 24px; // Adjust based on your icon size
`;