import HeaderPrevPageBtn from '../../components/HeaderPrevPageBtn';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
// import { BASE_URL } from "../../constant/union";
import { useEffect, useState } from 'react';
import customAxios from '../../apiFetcher/customAxios';
import AWS from 'aws-sdk';
import { categoryList } from '../../Product/categoryList';
import { UploadPageModal } from '../../components/modal/UploadPageModal';
import axios from 'axios';

interface FormValue {
  userId: number;
  productName: string;
  price: number;
  // imageStoragePath: 'C:/greenjangteo/product';
  images: [
    {
      url: string;
      position: 0;
    },
  ];
  description: string;
  inventory: number;
  categoryId: number;
}

const UploadProduct = () => {
  const {
    register,
    handleSubmit,
    // formState: { errors },
  } = useForm<FormValue>({
    mode: 'onSubmit',
  });

  const { userId } = useParams();
  const navigate = useNavigate();
  const onReset = () => {
    navigate(-1);
  };

  // const [myBucket, setMyBucket] = useState(Object);
  // console.log(Object);
  const [selectedFile, setSelectedFile] = useState('');
  const [imgURL, setImgURL] = useState(``);
  // console.log(myBucket);
  const onSubmit = async (data: FormValue) => {
    await axios
      .all([
        customAxios.post(`/product`, {
          userId: userId,
          productName: data.productName,
          price: data.price,
          categoryId: data.categoryId,

          description: data.description,
          inventory: data.inventory,
          images: [
            {
              url: imgURL.slice(0, limit),
              position: 0,
            },
          ],
        }),
        customAxios.post(`/productDocuments`),
      ])
      .then(response => {
        console.log(response);
        navigate(-1);
      })
      .catch(error => {
        console.log(error.response);
        console.log(data);
      });
  };

  const limit = imgURL.indexOf('?');

  useEffect(() => {
    AWS.config.update({
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    });
  }, []);
  const myBucket = new AWS.S3({
    params: { Bucket: `greengangteo` },
    region: import.meta.env.VITE_AWS_DEFAULT_REGION,
  });

  //   setMyBucket(myBucket);

  const handleFileInput = (e: any) => {
    setSelectedFile(e.target.files[0]);
    console.log('e', e);
  };

  const [selectCategory, setselectCategory] = useState();
  const handleSelectInput = (e: any) => {
    setselectCategory(e.target.value);
  };
  const uploadFile = (file: any) => {
    const param = {
      ACL: 'public-read',
      ContentType: `image/*`,
      Body: file,
      Bucket: `greengangteo`,
      Key: `product/${file.name}`,
    };

    myBucket.putObject(param).send((err: any) => {
      if (err) {
        console.log(err);
      } else {
        const url = myBucket.getSignedUrl('getObject', { Key: param.Key });
        console.log(url, 'url');
        setImgURL(url);
      }
    });
  };

  const [modalOpen, setModalOpen] = useState(false);

  const showModal = () => {
    setModalOpen(true);
    uploadFile(selectedFile);
  };

  return (
    <>
      <HeaderPrevPageBtn />
      <Wrapper>
        <UploadForm onSubmit={handleSubmit(onSubmit)}>
          <BtnBox>
            <Button type="reset" onClick={onReset}>
              취소
            </Button>
            {/* <Button type="submit"> */}
            <Button type="button" onClick={showModal}>
              등록
            </Button>
            {modalOpen && <UploadPageModal setModalOpen={setModalOpen} />}
            {/* <Button type="submit">작성완료</Button> */}
          </BtnBox>
          <Box>
            <Label htmlFor="image">이미지</Label>
            <Input
              type="file"
              id="image"
              {...register('images', {
                onChange: e => {
                  handleFileInput(e);
                  uploadFile(selectedFile);
                },
              })}
            ></Input>
          </Box>
          <Box>
            <Label htmlFor="firstCategories">분류1</Label>
            <Select
              onChange={e => handleSelectInput(e)}
              id="firstCategories"
              // {...register('firstCategoryName', {
              //   required: '카테고리를 지정해주세요',
              //   onChange: e => {
              //     handleSelectInput(e);
              //   },
              // })}
            >
              <Option value="카테고리">카테고리</Option>
              {categoryList.map(category => (
                <Option
                  value={category.firstCategoryName}
                  key={category.firstCategoryName}
                >
                  {category.firstCategoryName}
                </Option>
              ))}
            </Select>
          </Box>
          <Box className="category">
            <Label htmlFor="SecondCategories">분류2</Label>
            <Select
              id="SecondCategories"
              {...register('categoryId', {
                required: '카테고리를 지정해주세요',
              })}
            >
              <Option value="카테고리" disabled>
                카테고리
              </Option>
              {categoryList.map(
                category =>
                  selectCategory == category.firstCategoryName &&
                  category.secondCategories.map(secondCategory => (
                    <Option value={secondCategory.id} key={secondCategory.name}>
                      {secondCategory.name}
                    </Option>
                  )),
              )}
            </Select>
          </Box>
          <Box>
            <Label htmlFor="productName">상품명</Label>
            <Input
              type="text"
              id="productName"
              {...register('productName', {
                required: '상품명을 입력해주세요',
              })}
            ></Input>
          </Box>
          <Box>
            <Label htmlFor="price">가격</Label>
            <Input
              type="number"
              id="price"
              {...register('price', { required: '가격을 입력해주세요' })}
            ></Input>
          </Box>
          <Box>
            <Label htmlFor="inventory">수량</Label>
            <Input
              type="number"
              id="productQuantity"
              {...register('inventory', {
                required: '재고 수량을 입력해주세요',
              })}
            ></Input>
          </Box>
          <Textarea
            rows={20}
            placeholder="제품의 설명을 입력해주세요"
            {...register('description', {
              required: '제품의 설명을 입력해주세요',
            })}
          ></Textarea>
        </UploadForm>
      </Wrapper>
    </>
  );
};
export default UploadProduct;

const Wrapper = styled.div`
  padding: 20px;
  position: relative;
`;
const BtnBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;
const Box = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 10px 0;

  &.category {
    margin-bottom: 20px;
  }
`;
const Button = styled.button`
  display: block;
  margin-left: auto;
  padding: 10px 20px;
  background-color: #dedede;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-left: 10px;
`;
const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
`;
const Input = styled.input`
  flex: auto;
  padding: 5px;
`;
const Label = styled.label`
  width: 120px;
`;
const Select = styled.select`
  // margin: 20px 0;
  flex: auto;
  padding: 5px;
  font-size: 16px;
`;
const Option = styled.option`
  text-align: center;
  font-size: 16px;
`;
const Textarea = styled.textarea`
  margin: 10px 0;
  padding: 10px;
  font-size: 16px;

  &::placeholder {
    color: #b0b0b0;
  }
`;
