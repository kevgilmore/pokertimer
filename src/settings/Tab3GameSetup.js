import { Form, Input } from "antd";
import { useDispatch } from "react-redux";
import { updateTitle, updateSubtitle } from "../redux/game";

const Tab3Component = () => {
    const dispatch = useDispatch();
    
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
          <Form.Item label="Title" name="title">
            <Input 
              onChange={(value) => {dispatch(updateTitle(value.target.value));}}
              maxLength={50}
              value=""
              defaultValue=""
              style={{width: 400}}
            />
          </Form.Item>

          <Form.Item label="Subtitle" name="subtitle">
          <Input 
              onChange={(value) => {dispatch(updateSubtitle(value.target.value));}}
              maxLength={50}
              value=""
              defaultValue=""
              style={{width: 400}}
            />
          </Form.Item>
      </Form>
    )
}

export default Tab3Component;