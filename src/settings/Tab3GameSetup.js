import { Form,Input } from "antd";

const tab3Component = () => {
    return (
    <Form>
        <Form.Item label="Title" name="numPlayers">
            <Input
            value=""
            defaultValue=""
            />
        </Form.Item>

        <Form.Item label="Subtitle" name="numPlayers">
            <Input
            value=""
            defaultValue=""
            />
        </Form.Item>
    </Form>


    )
}

export default tab3Component;