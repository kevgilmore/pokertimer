import React, {useState} from 'react';
import { ConsoleSqlOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Form, Input, Slider, Flex, Col, Row  } from 'antd';
import {useSelector, useDispatch} from "react-redux";
import { useEffect } from 'react';
import {updateBlindLevel, updateBuyinPrice, updateExpenses, updateNumOfPlayers} from '../redux/game';

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


  const PayoutSlider = ({index, prizePool, updatePercentVal, defaultValue}) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    useEffect(() => {
      updatePercentVal(inputValue, index)
    }, [inputValue])

    const onChange = (newValue) => {
      setInputValue(newValue);
    };

    return (
      <div>
        <Flex justify="space-between" align="center">
          <label>£{Math.floor(prizePool * inputValue / 100)}</label>
          <label>{Math.floor(inputValue)}%</label>
        </Flex >
        <Slider
          min={0}
          max={100}
          onChange={onChange}
          defaultValue={defaultValue}
          value={typeof inputValue === 'number' ? inputValue : 100}
          tooltip={{open: false}}
        />
      </div>
      
    )
  }
const Tab2Component = () => {
  const dispatch = useDispatch()
  const game = useSelector((state) => state.game)
  const prizePool = (game.buyInPrice * game.numOfPlayers - game.expenses)
    const [percentValues, setPercentValues] = useState([50, 30, 20]);
    const updatePercentVal = (pertval, index) => {
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
        <Input
          onChange={e => {
            dispatch(updateNumOfPlayers(e.target.value))
          }}
          value={game.numOfPlayers}
          defaultValue={game.numOfPlayers}
        />
      </Form.Item>
  
      <Form.Item
        label="Buy-in price"
        name="buyinPrice">
        <Input
          onChange={e => {
          dispatch(updateBuyinPrice(e.target.value))
        }}
          value={game.buyInPrice}
          defaultValue={game.buyInPrice}
        />
      </Form.Item>
  
      <Form.Item
        label="Expenses"
        name="expenses">
        <Input
          onChange={e => {
          dispatch(updateExpenses(e.target.value))
        }}
          value={game.expenses}
          defaultValue={game.expenses}
        />
      </Form.Item>
  
      <hr></hr>
        <Row justify={'space-between'} align={'middle'}>
          <Col><h4>Total Prize Pool: </h4></Col>
          <Col><span>£ {prizePool}</span></Col>
        </Row>
      <hr></hr>
  
  <h2>Prize Split</h2>
    <Row>
      <Col span={6}></Col>
      <Col span={12}>
        <PayoutSlider prizePool={prizePool} index={0} defaultValue={50} updatePercentVal={updatePercentVal}/>
        <PayoutSlider prizePool={prizePool} index={1} defaultValue={30} updatePercentVal={updatePercentVal}/>
        <PayoutSlider prizePool={prizePool} index={2} defaultValue={20} updatePercentVal={updatePercentVal}/>
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