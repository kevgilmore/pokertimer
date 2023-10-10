import React, {useState} from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Form, Input, Slider, Flex, Col, Row  } from 'antd';
import {useDispatch, useSelector} from "react-redux";

const onFinish = (values) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const items = [
    {
      label: 'GBP',
      key: '1',
    },
    {
      label: 'EUR',
      key: '2',
    },
    {
      label: 'USD',
      key: '3',
    },
  ];

const menuProps = {
    items,
    //onClick: handleMenuClick,
  };


  const PayoutSlider = ({index, prizePool, updatePercentVal}) => {
    const [inputValue, setInputValue] = useState(0);

    const onChange = (newValue) => {
      setInputValue(newValue);
      updatePercentVal(100 - newValue, index)
    };
    const percent = 100 - inputValue
    return (
      <div>
        <Flex justify="space-between" align="center">
          <label>£{Math.floor(prizePool * percent / 100)}</label>
          <label>{Math.floor(percent)}%</label>
        </Flex >
        <Slider
          min={1}
          max={100}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 100}
          tooltip={{open: false}}
        />
      </div>
      
    )
  }
const Tab2Component = () => {
    const game = useSelector((state) => {
        return state.game;
    })
    const prizePool = game?.prizePool
    const [inputValue, setInputValue] = useState(1);
    const onChange = (newValue) => {
      setInputValue(newValue);
    };
    const [percentValues, setPercentValues] = useState([0,0,0]);
    const updatePercentVal = (pertval, index) => {
      console.log("pertval, inde", pertval, index)
      const _val = [...percentValues]
      _val[index] = pertval;
      setPercentValues(_val)
    }
    const sumPercents = percentValues.reduce((acc, a) => acc + a, 0)
  return (
    <Form
      name="basic"
      labelCol={{
        span: 8,
      }}
      wrapperCol={{
        span: 16,
      }}
      style={{
        maxWidth: 600,
      }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
  
  <Dropdown menu={menuProps}>
        <Button>
          <Space>
            £ GBP
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
  
      <Form.Item
        label="Number of players"
        name="numPlayers">
        <Input />
      </Form.Item>
  
      <Form.Item
        label="Buy-in price"
        name="buyinPrice">
        <Input />
      </Form.Item>
  
      <Form.Item
        label="Expenses"
        name="expenses">
        <Input />
      </Form.Item>
  
      <hr></hr>
      <h4>Total Prize Pool: </h4>
      <hr></hr>
  
      <h2>Prize Split</h2>
      <Form.Item
        label="Number of paid places"
        name="numPaidPlaces">
        <Input />
   </Form.Item> 
  
    {/* put slider */}
    <Row>
      <Col span={6}></Col>
      <Col span={12}>
        {[0,1,2].map(index => <PayoutSlider prizePool={prizePool} index={index} updatePercentVal={updatePercentVal}/>)}
      </Col>
      <Col span={6}></Col>
    </Row>
    <Flex justify="center" align="center">
        <label>{sumPercents.toFixed(0)}%</label>
    </Flex >
   
    </Form>
  );
}

export default Tab2Component;