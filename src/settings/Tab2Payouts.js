import React, { useState, useCallback, useEffect } from "react";
import { DownOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Space,
  Form,
  Input,
  InputNumber,
  Slider,
  Flex,
  Col,
  Row
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  updateCurrency,
  updateBuyinPrice,
  updateExpenses,
  updateNumOfPlayers,
  updatePrizes,
} from "../redux/game";

const onFinish = (values) => {
  console.log("Success:", values);
};
const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const items = [
  {
    label: "GBP",
    key: "1",
  },
  {
    label: "EUR",
    key: "2",
  },
  {
    label: "USD",
    key: "3",
  },
];

const PayoutSlider = ({ index, prizePool, updatePercentVal, defaultValue, currencySymbol }) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  useEffect(() => {
    updatePercentVal(inputValue, index);
  }, [inputValue]);

  const onChange = (newValue) => {
    setInputValue(newValue);
  };

  return (
    <div>
      <Flex justify="space-between" align="center">
        <label>{currencySymbol}{Math.floor((prizePool * inputValue) / 100)}</label>
        <label>{Math.floor(inputValue)}%</label>
      </Flex>
      <Slider
        min={0}
        max={100}
        onChange={onChange}
        defaultValue={defaultValue}
        value={typeof inputValue === "number" ? inputValue : 100}
        tooltip={{ open: false }}
      />
    </div>
  );
};

const Tab2Component = () => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game);
  const prizePool = game.buyInPrice * game.numOfPlayers - game.expenses;
  const [percentValues, setPercentValues] = useState([50, 30, 20]);
  const sumPercents = percentValues.reduce((acc, a) => acc + a, 0);

  useEffect(() => {
    updatePrizesState();
  }, [percentValues, prizePool]);

  const updatePercentVal = (pertval, index) => {
    const _val = [...percentValues];
    _val[index] = pertval;
    setPercentValues(_val);
  };

  const updatePrizesState = useCallback(() => {
    if (sumPercents <= 100) {
      const prizes = percentValues.map((val) =>
        Math.floor((prizePool * val) / 100)
      );
      dispatch(updatePrizes(prizes));
    }
  }, [percentValues, prizePool]);

  const handleMenuClick = (e) => {
    const currency = items[e.key - 1].label;
    dispatch(updateCurrency(currency));
  };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  
  const InputPlayers = () => {
    return  <InputNumber
              onChange={(value) => {
                dispatch(updateNumOfPlayers(value));
              }}
              value={game.numOfPlayers}
              style={{width: 70, backgroundColor: "#202020"}}
              bordered={false}
              stringMode={false}
            />
  }
  return (
    <Form
      name="basic"
      labelCol={{
        span: 6, 
        offset: 3
      }}
      wrapperCol={{
        span: 6,
        offset: 9,
      }}
      style={{
        maxWidth: 600,
      }}
      initialValues={{
        numPlayers: game.numOfPlayers,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      labelAlign="left"
    >
      <Dropdown menu={menuProps}>
        <Button>
          <Space>
            {game.currency}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Form.Item label="Number of players" name="numPlayers">
        <InputPlayers />
      </Form.Item>
      <Form.Item label="Buy-in price" name="buyinPrice">
        <InputNumber
          onChange={(value) => {
            dispatch(updateBuyinPrice(value));
          }}
          value={game.buyInPrice}
          defaultValue={game.buyInPrice}
					prefix={game.currencySymbol}
          style={{width: 70, backgroundColor: "#202020"}}
          bordered={false}
          stringMode={false}
        />
      </Form.Item>
			
      <Form.Item label="Expenses" name="expenses">
        <InputNumber
          onChange={(value) => {
            dispatch(updateExpenses(value));
          }}
          value={game.expenses}
          defaultValue={game.expenses}
					prefix={game.currencySymbol}
          style={{width: 70, backgroundColor: "#202020"}}
          bordered={false}
          stringMode={false}
        />
      </Form.Item>
      
      
      <hr className="prizePoolTotalLine"></hr>
      <div className="prizePoolTotal">
        <p style={{float: "left"}}>Total Prize Pool: </p>
        <p style={{float: "right"}}>{game.currencySymbol} {prizePool}</p>
      </div>
      <hr className="prizePoolTotalLine"></hr>
      <h2 style={{textAlign: "center"}}>Prize Split</h2>
      <Row>
        <Col span={6} className="payoutslabels">
          <h4>1st</h4>
          <h4>2nd</h4>
          <h4>3rd</h4>
        </Col>
        <Col span={14} className="payoutsBox">
            <PayoutSlider
              prizePool={prizePool}
              index={0}
              defaultValue={50}
              updatePercentVal={updatePercentVal}
              currencySymbol={game.currencySymbol}
            />

          <PayoutSlider
            prizePool={prizePool}
            index={1}
            defaultValue={30}
            updatePercentVal={updatePercentVal}
						currencySymbol={game.currencySymbol}
          />
          <PayoutSlider
            prizePool={prizePool}
            index={2}
            defaultValue={20}
            updatePercentVal={updatePercentVal}
						currencySymbol={game.currencySymbol}
          />
        </Col>
        <Col span={4}></Col>
      </Row>
      <Flex justify="center" align="center">
        <label style={{ color: sumPercents > 100 ? "red" : "white" }}>
          {sumPercents.toFixed(0)}%
        </label>
      </Flex>
    </Form>
  );
};

export default Tab2Component;