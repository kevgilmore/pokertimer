import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space, Form, Input } from 'antd';

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

const tab2Component = () => (
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
      name="numPlayers"
      rules={[
        {
          required: false,
          message: 'Please input your username!',
        },
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      label="Buy-in price"
      name="buyinPrice"
      rules={[
        {
          required: false,
          message: 'Please input your password!',
        },
      ]}
    >
      <Input />
    </Form.Item>
  </Form>
);

export default tab2Component;