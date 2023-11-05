import './App.css'
import {theme, Button, Card, Col, ConfigProvider, Drawer, Layout, Progress, Row, Tabs, Flex, Modal, Form, Input, message} from 'antd';
import {useEffect, useRef, useState} from 'react';
import {CaretRightOutlined, LeftOutlined, PauseOutlined, RightOutlined, SettingOutlined, BugOutlined, MinusOutlined, PlusOutlined, HeartFilled, HistoryOutlined} from '@ant-design/icons';
import 'react-circular-progressbar/dist/styles.css';
import {getTab1, getTab2, getTab3} from "./settings/TabsManager";
import {useDispatch, useSelector} from "react-redux";
import {changeBlindLevel, updateNumOfPlayers} from "./redux/game";
import formatTime from './TimeFormatter';
import { Footer } from 'antd/es/layout/layout';
import logo from './logo.png'
import emailjs from '@emailjs/browser';

const { TextArea } = Input;

const { Header, Content } = Layout;

const App = () => {
    const [bugForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const successMsg = () => {
        messageApi
          .open({
            type: 'loading',
            content: 'Submitting..',
            duration: 1.5,
          })
          .then(() => message.success('Thank you for submitting this bug', 2.5))
      };

    const errorMsg = () => {
    messageApi.open({
        type: 'error',
        content: 'Unable to submit bug, please try again later',
    });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true)
    }

    const handleSubmit = (values) => {
        emailjs.send('service_165ezka', 'template_csw893k', {text: values.bugDescription}, "rWJ8HzdoJ0n8pPBL6")
        .then((result) => {
            setIsModalOpen(false)
            successMsg()
        }, (error) => {
            errorMsg()
        });
    }

    const handleCancel = () => {
      setIsModalOpen(false);
      bugForm.resetFields();
    }

    const game = useSelector((state) => state.game)
    const dispatch = useDispatch()

    const [open, setOpen] = useState(false);
    const [pausePlayIcon, setPausePlayIcon] = useState(<CaretRightOutlined />)
    const [totalTournamentTime, setTotalTournamentTime] = useState(0)
    const [timeLeft, setTimeLeft] = useState(game.blindStructure[0].duration * 60);
    const [timePassed, setTimePassed] = useState(0);
    const [isPaused, setIsPaused] = useState(true);

    let intervalRef = useRef();

    const decreaseNum = () => {
        setTotalTournamentTime((prev) => prev + 1)
        setTimePassed((prev) => prev + 1)
        setTimeLeft((prev) => prev - 1)
        if (timeLeft === 0 && hasNextBlind()) {
            setTimeLeft(game.blindStructure[game.currentBlindLevel-1].duration * 60)
            setTimePassed(0)
            dispatch(changeBlindLevel(game.currentBlindLevel + 1))
        }
    };

    const hasNextBlind = () => {
        return game.currentBlindLevel <= game.blindStructure.length -1
    }

    useEffect(() => {
        localStorage.setItem('game', JSON.stringify(game));
         if(!isPaused) {
            intervalRef.current = setInterval(decreaseNum, 1000);
        }
        return () => clearInterval(intervalRef.current);

    });

    const togglePrev = () => {
        if (game.currentBlindLevel > 1) {
            dispatch(changeBlindLevel(game.currentBlindLevel - 1))
            setTimeLeft(game.blindStructure[game.currentBlindLevel].duration * 60)
        }
    }

    const toggleNext = () => {
        if (hasNextBlind()) {
            dispatch(changeBlindLevel(game.currentBlindLevel + 1))
            setTimeLeft(game.blindStructure[game.currentBlindLevel].duration * 60)
        }
    }

    const togglePause = () => {
        if (isPaused) {
            setPausePlayIcon(getIcon())
            intervalRef.current = setInterval(decreaseNum, 1000);
        } else {
            setPausePlayIcon(getIcon())
            clearInterval(intervalRef.current);
        }
        setIsPaused((prev) => !prev);
    };

    const resetTimer = () => {
        dispatch(changeBlindLevel(1))
        setTimeLeft(game.blindStructure[0].duration * 60)
        setTimePassed(0)

        setIsPaused(true)
        setPausePlayIcon(<CaretRightOutlined/>)
        clearInterval(intervalRef.current);
    }

    const calculatePercentage = () => {
       let timeLeft = (game.blindStructure[game.currentBlindLevel-1].duration * 60 - timePassed);
       return (timeLeft / (game.blindStructure[game.currentBlindLevel-1].duration * 60) * 100).toFixed(0)
    }

    const getIcon = () => {
        if (isPaused) {
            return <PauseOutlined />
        } else {
            return <CaretRightOutlined/>
        }
    }

    const showDrawer = () => {
        setOpen(true)
    };

    const onClose = () => {
        setTimeLeft(game.blindStructure[game.currentBlindLevel-1].duration * 60 - timePassed)
        setOpen(false)
    };
    return (
            <ConfigProvider
                theme={{
                algorithm: theme.darkAlgorithm,
                    token: {
                        colorPrimary: '#666CFF',
                    },
                }}
            >
        <Layout className="mainBg">
            <Header className="navbarBg">
                <Flex justify='space-between' >
                    <a href="/"> <img className="logo" src={logo} alt="logo"></img></a>
                    <h1 className='gameTitle'>{game.title}</h1>
                    <Button className="settingsBtn" type="primary" onClick={showDrawer} icon={<SettingOutlined />}></Button>
                </Flex>
                <h3 className='gameSubtitle'>{game.subtitle}</h3>
            </Header>
            <Content>
            <Drawer className ="settingsBg" title="Settings" placement="right" onClose={onClose} open={open} width={600}>
                    <Tabs centered="true" type="card" size="large" items={[getTab1(), getTab2(), getTab3()]}/>
                </Drawer>
                {/*Main row*/}
                <Row>
                    {/*Timer column*/}
                    <Col span={14}>
                        <div className="timerBox">
                            <Progress type="circle"
                                format={() =>
                                <div className="timerControls">
                                    <span className="mainCountdownText">{formatTime(timeLeft)}</span>
                                    <br></br>
                                    {<Button style={{width: 50, height:50, margin:10}} onClick={() => togglePrev()} type="primary" shape="circle" icon={<LeftOutlined />} size={"large"} />}
                                    {<Button style={{width: 75, height:75, margin:10}} onClick={() => togglePause()} type="primary" shape="circle" icon={pausePlayIcon} size={"large"} />}
                                    {<Button style={{width: 50, height:50, margin:10}} onClick={() => toggleNext()} type="primary" shape="circle" icon={<RightOutlined />} size={"large"} />}
                                    {<Button className="resetButton" shape="circle" onClick={() => resetTimer()} icon={<HistoryOutlined />} type='primary'></Button>}
                                </div>}
                                    status="normal"
                                    percent={calculatePercentage()}
                                    size={600}
                                    strokeWidth={2}
                                    strokeColor={"#666CFF"}
                            />
                        </div>
                    </Col>

                    {/*Prizes column*/}
                    <Col className="prizesColumn" span={10}>
                        <Flex vertical justify="center">
                            <p className="timeLapsedLabel">TOURNAMENT RUNNING TIME</p>
                            <h5 className="totalTimeLapsed">{formatTime(totalTournamentTime)}</h5> 
                        </Flex>
                        <Card bordered={false} className="prizesCard firstPrizeCard">
                            <Flex justify="center" align="center">
                                <h5 className="prizeLabel">1st</h5>
                                <h1 className="prizeText">{game.currencySymbol}{game.prizes[0]}</h1>
                            </Flex>
                        </Card>
                        <Card bordered={false} className="prizesCard secondPrizeCard">
                            <Flex justify="center" align="center">
                                <h5 className="prizeLabel">2nd</h5>
                                <h1 className="prizeText">{game.currencySymbol}{game.prizes[1]}</h1>
                            </Flex>
                        </Card>
                        <Card bordered={false} className="prizesCard thirdPrizeCard">
                            <Flex justify="center" align="center">
                                <h5 className="prizeLabel">3rd</h5>
                                <h1 className="prizeText">{game.currencySymbol}{game.prizes[2]}</h1>
                            </Flex>
                        </Card>
                    </Col>
                </Row>

                {/* Blinds Panel */}
                <Row>
                    <Card bordered={false} className="blindsCard">
                        <Row>
                            <Col className="blindsList" span={2}>
                                {game.blindStructure.slice(game.currentBlindLevel < 3 ?     0 : game.currentBlindLevel - 2, 
                                                           game.currentBlindLevel < 3 ?     4 : game.currentBlindLevel + 2
                                    ).map((blind, index) => {
                                    return <h4 key={index} className={parseInt(blind.key)  === (game.currentBlindLevel) ? 'blind-item-selected' : 'blind-item'}>{blind.small}/{blind.big}</h4>
                                })}
                                {game.currentBlindLevel > game.blindStructure.length - 2? <h4>END</h4> : null}
                            </Col>
                            <div className="verticalLine"></div>
                            <Col className="flexBoxCol" span={8}>
                                <h1 className="activeBlindLeveltext">LEVEL {game.currentBlindLevel}</h1>
                            </Col>
                            <Col span={8}>
                                <h1 className="activeBlindGreenText">
                                    {game.blindStructure[game.currentBlindLevel - 1].small + "/" + game.blindStructure[game.currentBlindLevel - 1].big}
                                </h1>
                            </Col>
                            <Col span={5}>
                                <Flex style={{paddingTop: '20px'}} justify="center" align="center">
                                    <h2 style={{paddingRight: 15}}>BUY-INS</h2>
                                    <Button onClick={() => dispatch(updateNumOfPlayers(game.numOfPlayers-1))} type="primary" shape="circle" icon={<MinusOutlined />} size="large" />
                                    <h2 className="buyinText">{game.numOfPlayers}</h2>
                                    <Button onClick={() => dispatch(updateNumOfPlayers(game.numOfPlayers+1))} type="primary" shape="circle" icon={<PlusOutlined />} size="large" />
                                </Flex>
                            </Col>
                        </Row>
                    </Card>
                </Row>

                <>
                    {contextHolder}
                </>

                <Modal
                    open={isModalOpen}
                    title="Tell us whats wrong"
                    okText="Submit"
                    cancelText="Cancel"
                    onCancel={handleCancel}
                    onOk={() => {
                        bugForm
                        .validateFields()
                        .then((values) => {
                            bugForm.resetFields();
                            handleSubmit(values);
                        })
                        .catch((info) => {
                            console.log('Validate Failed:', info);
                        });
                    }}
                    >
                    <Form
                        form={bugForm}>
                        <Form.Item name="bugDescription">
                            <TextArea rows={4} />
                        </Form.Item>
                    </Form>
                </Modal>

            </Content>
            <div className='preFooter'></div>
            <Footer style={{textAlign: 'center'}}>
                <Flex justify="space-evenly" align='center'>
                <Button onClick={showModal} type="primary" icon={<BugOutlined />} size="large">Report a Bug</Button>
                <span>Pokertimer.gg ©2023 Created with <HeartFilled style={{color: 'red'}}/> in London </span>
                <div className="coffeeBtn">
                    <a target="_blank" rel="noreferrer" href="https://www.buymeacoffee.com/kaigo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=kaigo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
                </div>
                
                </Flex>
                
            </Footer>
        </Layout>
        </ConfigProvider>
    );
};
export default App;