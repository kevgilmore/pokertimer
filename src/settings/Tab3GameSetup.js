import { Form, Input, Button, Flex } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateTitle, updateSubtitle, updateBlindStructure } from "../redux/game";
import classicStructure from "../blindsStructures/classicStructure";
import modernStructure from "../blindsStructures/modernStructure";

const Tab3Component = () => {
    const dispatch = useDispatch();
    const game = useSelector(state => state.game);
    
    // Determine which structure is currently selected
    const isClassicSelected = game.blindStructure[0]?.small === 25;
    const isModernSelected = game.blindStructure[0]?.small === 100;
    
    const handleClassicSelection = () => {
        dispatch(updateBlindStructure(classicStructure));
    }

    const handleModernSelection = () => {
        dispatch(updateBlindStructure(modernStructure));
    }
    
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

          <Form.Item 
            name="blindStructure"
            style={{ marginBottom: '24px' }}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
          >
            <div style={{ marginTop: '16px' }}>
              <Flex gap="large" style={{ marginBottom: '16px', justifyContent: 'center' }}>
                <div style={{ width: '240px' }}>
                  <Button
                    type="primary"
                    onClick={handleClassicSelection}
                    style={{
                      background: isClassicSelected 
                        ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                        : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      border: isClassicSelected ? '3px solid #fff' : '3px solid rgba(82, 196, 26, 0.4)',
                      borderRadius: '12px',
                      height: '70px',
                      width: '100%',
                      fontWeight: '600',
                      boxShadow: isClassicSelected 
                        ? '0 6px 20px rgba(82, 196, 26, 0.5)' 
                        : '0 4px 12px rgba(82, 196, 26, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(82, 196, 26, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = isClassicSelected 
                        ? '0 6px 20px rgba(82, 196, 26, 0.5)' 
                        : '0 4px 12px rgba(82, 196, 26, 0.3)';
                    }}
                  >
                    {isClassicSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontSize: '16px'
                      }}>✓</div>
                    )}
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>♠️ Classic</div>
                    <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
                      Starts: 25/50 → Ends: 2500/5000
                    </div>
                  </Button>
                
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px 12px',
                  backgroundColor: 'rgba(82, 196, 26, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(82, 196, 26, 0.2)',
                  fontSize: '11px',
                  color: '#ccc',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#52c41a', fontWeight: '600', marginBottom: '4px' }}>Chip Values:</div>
                  <div>White: 25 • Red: 100 • Blue: 500</div>
                  <div>Green: 1,000 • Black: 5,000 • Purple: 10,000</div>
                </div>
              </div>
              
                <div style={{ width: '240px' }}>
                  <Button
                    type="primary"
                    onClick={handleModernSelection}
                    style={{
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      border: isModernSelected ? '3px solid #fff' : '3px solid rgba(24, 144, 255, 0.4)',
                      borderRadius: '12px',
                      height: '70px',
                      width: '100%',
                      fontWeight: '600',
                      boxShadow: isModernSelected 
                        ? '0 6px 20px rgba(24, 144, 255, 0.5)' 
                        : '0 4px 12px rgba(24, 144, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = isModernSelected 
                        ? '0 6px 20px rgba(24, 144, 255, 0.5)' 
                        : '0 4px 12px rgba(24, 144, 255, 0.3)';
                    }}
                  >
                    {isModernSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontSize: '16px'
                      }}>✓</div>
                    )}
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>⚡ Modern</div>
                    <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '400' }}>
                      Starts: 100/200 → Ends: 80000/160000
                    </div>
                  </Button>
                
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px 12px',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(24, 144, 255, 0.2)',
                    fontSize: '11px',
                    color: '#ccc',
                    textAlign: 'center'
                  }}>
                    <div style={{ color: '#1890ff', fontWeight: '600', marginBottom: '4px' }}>Chip Values:</div>
                    <div>White: 100 • Red: 500 • Blue: 1,000</div>
                    <div>Green: 5,000 • Black: 10,000 • Yellow: 25,000</div>
                  </div>
                </div>
              </Flex>
            </div>
          </Form.Item>
      </Form>
    )
}

export default Tab3Component;