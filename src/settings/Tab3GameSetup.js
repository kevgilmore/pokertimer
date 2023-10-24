import { Form,Input } from "antd";

const tab3Component = () => {
    return (
    <Form
    name="basic"
    labelCol={{
      span: 4, 
      offset: 1
    }}
    wrapperCol={{
      span: 8,
      offset: 0,
    }}
    style={{
        paddingTop: 20,
        maxWidth: 600,
    }}
    initialValues={{
      remember: true,
    }}
    autoComplete="off"
    labelAlign="left"
    >
        <Form.Item label="Title" name="numPlayers">
            <Input
            value=""
            defaultValue=""
            style={{width: 400}}
            />
        </Form.Item>

        <Form.Item label="Subtitle" name="numPlayers">
            <Input
            value=""
            defaultValue=""
            style={{width: 400}}
            />
        </Form.Item>
    </Form>


    )
}

export default tab3Component;