import './App.css'
import {theme, Button, Card, Col, ConfigProvider, Drawer, Layout, Progress, Row, Tabs, Flex, Modal, Form, Input, message} from 'antd';
import {useEffect, useRef, useState} from 'react';
import {CaretRightOutlined, LeftOutlined, PauseOutlined, RightOutlined, SettingOutlined, BugOutlined, MinusOutlined, PlusOutlined, HeartFilled, HistoryOutlined, ReloadOutlined} from '@ant-design/icons';
import 'react-circular-progressbar/dist/styles.css';
import {getTab1, getTab2, getTab3} from "./settings/TabsManager";
import {useDispatch, useSelector} from "react-redux";
import {changeBlindLevel, updateNumOfPlayers, updateStartTime, updateBlindStructure} from "./redux/game";
import classicStructure from "./blindsStructures/classicStructure";
import modernStructure from "./blindsStructures/modernStructure";
import formatTime from './TimeFormatter';
import { Footer } from 'antd/es/layout/layout';
import logo from './logo.png'
import emailjs from '@emailjs/browser';

const { TextArea } = Input;
const { Header, Content } = Layout;

const App = () => {
    const [bugForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_path: window.location.pathname + window.location.search,
                page_title: document.title,
            });
        }
    }, []);

    useEffect(() => {
        // Check if user has already made a blind structure selection
        const hasSelectedBlindStructure = localStorage.getItem('blindStructureSelected') === 'true';
        if (!hasSelectedBlindStructure) {
            setShowCustomModal(true);
        }
    }, []);

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
    const [showCustomModal, setShowCustomModal] = useState(false);

    const showModal = () => {
        setIsModalOpen(true)
    }

    const handleClassicSelection = () => {
        dispatch(updateBlindStructure(classicStructure));
        localStorage.setItem('blindStructureSelected', 'true');
        setShowCustomModal(false);
    }

    const handleModernSelection = () => {
        dispatch(updateBlindStructure(modernStructure));
        localStorage.setItem('blindStructureSelected', 'true');
        setShowCustomModal(false);
    }

    const handleFromScratchSelection = () => {
        const emptyStructure = [
            {
                key: '1',
                small: 0,
                big: 0,
                duration: 20,
            }
        ];
        dispatch(updateBlindStructure(emptyStructure));
        localStorage.setItem('blindStructureSelected', 'true');
        setShowCustomModal(false);
    }

    const handleSubmit = (values) => {
        const currentTime = new Date().toISOString();
        if (window.gtag) {
            window.gtag('event', 'submit_bug', {
                event_category: 'User Interaction',
                event_label: 'Submit_bug',
                start_time: currentTime,
            });
        }
        emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            { text: values.bugDescription },
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY)
        .then(() => {
            setIsModalOpen(false)
            successMsg()
        }, () => {
            errorMsg()
        });
    }

    const handleCancel = () => {
      setIsModalOpen(false);
      bugForm.resetFields();
    }

    const ONE_SECOND = 1000;
    const game = useSelector((state) => state.game)
    const dispatch = useDispatch()

    const [open, setOpen] = useState(false);
    const [pausePlayIcon, setPausePlayIcon] = useState(<CaretRightOutlined />)
    const [totalTournamentTime, setTotalTournamentTime] = useState(0)
    const [timeLeft, setTimeLeft] = useState(game.blindStructure[0].duration * 60);
    const [timePassed, setTimePassed] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    let intervalRef = useRef();

    useEffect(() => {
        localStorage.setItem('game', JSON.stringify(game));
         if(!isPaused) {
            intervalRef.current = setInterval(updateTimer, ONE_SECOND);
        }
        return () => clearInterval(intervalRef.current);
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startGame = () => {
        let currentTime = new Date().toISOString();
        console.log("Start game called", currentTime);
        dispatch(updateStartTime(currentTime));
        setPausePlayIcon(getIcon());
        intervalRef.current = setInterval(updateTimer, ONE_SECOND);
        if (window.gtag) {
            window.gtag('event', 'start_new_game', {
                event_category: 'User Interaction',
                event_label: 'Start New Game',
                start_time: currentTime,
            });
        }
    };

    const updateTimer = () => {
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

    const togglePause = () => {
        if (isPaused) {
            if (!game.startTime) {
                startGame();
            } else {
                setPausePlayIcon(getIcon());
                intervalRef.current = setInterval(updateTimer, ONE_SECOND);
            }
        } else {
            setPausePlayIcon(getIcon());
            clearInterval(intervalRef.current);
        }
        setIsPaused((prev) => !prev);
    };

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

    const resetTimer = () => {
        dispatch(changeBlindLevel(1))
        setTimeLeft(game.blindStructure[0].duration * 60)
        setTimePassed(0)
        setTotalTournamentTime(0)
        dispatch(updateStartTime(null))

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


    const PortraitView = () => (
        <div className="portrait-view">
            <div className="portrait-content">
                <ReloadOutlined className="flip-icon" />
                <h2 className="portrait-title">Please rotate your device</h2>
                <p className="portrait-subtitle">For the best experience, please use landscape mode</p>
                {isMobile && (
                    <p className="portrait-mobile-warning">Phone screen size not supported. Please use iPad Mini or bigger.</p>
                )}
            </div>
        </div>
    );
    
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
                    {!(isMobile || isPortrait) && <Button className="settingsBtn" type="primary" onClick={showDrawer} icon={<SettingOutlined />}></Button>}
                </Flex>
                <h3 className='gameSubtitle'>{game.subtitle}</h3>
            </Header>
            <Content>
            <Drawer className ="settingsBg" title="Settings" placement="right" onClose={onClose} open={open} width={600}>
                    <Tabs centered="true" type="card" size="large" items={[getTab1(), getTab2(), getTab3()]}/>
                </Drawer>
                {(isMobile || isPortrait) ? (
                    <PortraitView />
                ) : (
                    <>
                        {/*Main row*/}
                        <Row>
                    {/*Timer column*/}
                    <Col xs={24} sm={24} md={16} lg={14} xl={14}>
                        <div className="timerBox">
                            <div className="timerContainer">
                                <Progress type="circle"
                                    format={() => null}
                                    status="normal"
                                    percent={calculatePercentage()}
                                    size={600}
                                    strokeWidth={2}
                                    strokeColor={"#666CFF"}
                                />
                                <div className="timerContentOverlay">
                                    <span className="mainCountdownText">{formatTime(timeLeft)}</span>
                                    <div className="timerButtons">
                                        <Button className="timerButton" onClick={() => togglePrev()} type="primary" shape="circle" icon={<LeftOutlined />} size={"large"} />
                                        <Button className="timerButton timerButtonMain" onClick={() => togglePause()} type="primary" shape="circle" icon={pausePlayIcon} size={"large"} />
                                        <Button className="timerButton" onClick={() => toggleNext()} type="primary" shape="circle" icon={<RightOutlined />} size={"large"} />
                                        <Button className="timerButton timerButtonReset" onClick={() => resetTimer()} type="primary" shape="circle" icon={<HistoryOutlined />} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/*Prizes column*/}
                    <Col className="prizesColumn" xs={0} sm={0} md={8} lg={10} xl={10} xxl={10}>
                        <div className="prizesColumnContent">
                            <div className="timerSection">
                                <p className="timeLapsedLabel">TOURNAMENT RUNNING TIME</p>
                                <h2 className="totalTimeLapsed">{formatTime(totalTournamentTime)}</h2> 
                            </div>
                            <div className="firstPrizeContainer">
                                <div className="winnerLabel">WINNER</div>
                                <Card bordered={false} className="prizesCard firstPrizeCard">
                                    <Flex justify="center" align="center">
                                        <h5 className="prizeLabel">1st</h5>
                                        <h1 className="prizeText">{game.currencySymbol}{game.prizes[0]}</h1>
                                    </Flex>
                                </Card>
                            </div>
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
                        </div>
                    </Col>
                </Row>

                {/* Blinds Panel */}
                <div className="blindsPanelContainer">
                    <Card bordered={false} className="blindsCard">
                        <div className="blindsPanelContent">
                            {/* Left Section - Blinds List */}
                            <div className="blindsListSection">
                                {game.blindStructure.slice(game.currentBlindLevel < 3 ? 0 : game.currentBlindLevel - 2, 
                                                           game.currentBlindLevel < 3 ? 4 : game.currentBlindLevel + 2
                                    ).map((blind, index) => {
                                    return <div key={index} className={parseInt(blind.key) === (game.currentBlindLevel) ? 'blind-item-selected' : 'blind-item'}>
                                        {blind.small}/{blind.big}
                                    </div>
                                })}
                                {game.currentBlindLevel > game.blindStructure.length - 2 ? <div className="blind-item">END</div> : null}
                            </div>

                            {/* Center Section - Current Level and Blinds */}
                            <div className="blindsCenterSection">
                                <div className="levelAndBlindsRow">
                                    <h1 className="activeBlindLeveltext">LEVEL {game.currentBlindLevel}</h1>
                                    <div className="blindsValueContainer">
                                        <div className="blindsLabel" style={{textAlign: 'left', paddingLeft: '10px'}}>BLINDS</div>
                                        <h1 className="activeBlindGreenText">
                                            {game.blindStructure[game.currentBlindLevel - 1].small + "/" + game.blindStructure[game.currentBlindLevel - 1].big}
                                        </h1>
                                    </div>
                                    <div className="blindsValueContainer anteContainer">
                                        <div className="blindsLabel" style={{textAlign: 'left', paddingLeft: '10px'}}>ANTE</div>
                                        <h1 className="activeBlindGreenText">0</h1>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Player Controls */}
                            <div className="blindsPlayerSection">
                                <div className="playerControlsContainer">
                                    <div className="playerLabel">Buy-ins:</div>
                                    <div className="playerControls">
                                        <Button onClick={() => dispatch(updateNumOfPlayers(game.numOfPlayers-1))} type="primary" shape="circle" icon={<MinusOutlined />} size="large" />
                                        <span className="playerCount">{game.numOfPlayers}</span>
                                        <Button onClick={() => dispatch(updateNumOfPlayers(game.numOfPlayers+1))} type="primary" shape="circle" icon={<PlusOutlined />} size="large" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                        <>
                            {contextHolder}
                        </>
                    </>
                )}

                <Modal
                    open={isModalOpen}
                    title="Tell us what's wrong"
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
                        <Form.Item name="bugDescription"
                                rules={[
                                    { required: true, message: 'Please describe the bug before submitting.' }
                                ]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Blind Structure Help Modal */}
                <Modal
                    open={showCustomModal}
                    title=""
                    footer={null}
                    closable={false}
                    maskClosable={false}
                    onCancel={() => {}} // Prevent closing
                    width={900}
                    centered
                    className="custom-modal"
                    styles={{
                        mask: {
                            backdropFilter: 'blur(12px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)'
                        }
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
                        color: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        border: '2px solid #333',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.9)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative elements */}
                        <div style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '100px',
                            height: '100px',
                            background: 'radial-gradient(circle, rgba(24, 144, 255, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '60px',
                            height: '60px',
                            background: 'radial-gradient(circle, rgba(82, 196, 26, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }}></div>

                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h1 style={{ 
                                color: '#fff', 
                                fontSize: '36px', 
                                fontWeight: '800',
                                marginBottom: '15px',
                                textShadow: '0 3px 6px rgba(0, 0, 0, 0.6)',
                                background: 'linear-gradient(45deg, #1890ff, #52c41a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                🃏 Select Your Poker Tournament Format
                            </h1>
                            <p style={{ 
                                color: '#ccc', 
                                fontSize: '20px', 
                                marginBottom: '8px',
                                fontWeight: '400',
                                letterSpacing: '0.3px'
                            }}>
                                Choose the chip structure that matches your tournament style
                            </p>
                            <p style={{ 
                                color: '#999', 
                                fontSize: '16px', 
                                marginBottom: '0',
                                fontWeight: '300',
                                fontStyle: 'italic'
                            }}>
                                Each format is optimized for different tournament lengths and player preferences
                            </p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', marginBottom: '40px' }}>
                            {/* Classic Tournament Setup */}
                            <div style={{ flex: 1, position: 'relative' }}>
                                <div
                                    onClick={handleClassicSelection}
                                    style={{
                                        width: '100%',
                                        height: '180px',
                                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                        border: '3px solid rgba(82, 196, 26, 0.4)',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-4px)';
                                        e.target.style.boxShadow = '0 12px 32px rgba(82, 196, 26, 0.4)';
                                        e.target.style.borderColor = 'rgba(82, 196, 26, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.3)';
                                        e.target.style.borderColor = 'rgba(82, 196, 26, 0.4)';
                                    }}
                                >
                                    {/* Decorative poker chips background */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        fontSize: '24px',
                                        opacity: 0.3
                                    }}>🟢</div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        left: '10px',
                                        fontSize: '20px',
                                        opacity: 0.3
                                    }}>🟩</div>
                                    
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>♠️</div>
                                    <div style={{ fontSize: '22px', marginBottom: '8px', fontWeight: '700' }}>Classic Tournament</div>
                                    <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: '400' }}>
                                        Traditional Multi-Level Structure
                                    </div>
                                </div>
                                
                                <div style={{ 
                                    marginTop: '25px',
                                    padding: '0'
                                }}>
                                    <div style={{ 
                                        fontSize: '16px', 
                                        color: '#52c41a', 
                                        fontWeight: '700', 
                                        marginBottom: '15px',
                                        textAlign: 'center',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        Chip Values
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        color: '#ccc'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#fff', 
                                                borderRadius: '50%', 
                                                border: '1px solid #ddd',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '4px',
                                                    height: '4px',
                                                    backgroundColor: '#333',
                                                    borderRadius: '50%'
                                                }}></div>
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>25</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#ff4d4f', 
                                                borderRadius: '50%',
                                                border: '1px solid #ff7875'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>100</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#1890ff', 
                                                borderRadius: '50%',
                                                border: '1px solid #40a9ff'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>500</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#52c41a', 
                                                borderRadius: '50%',
                                                border: '1px solid #73d13d'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>1,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#000', 
                                                borderRadius: '50%', 
                                                border: '1px solid #333'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>5,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#722ed1', 
                                                borderRadius: '50%',
                                                border: '1px solid #9254de'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>10,000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modern Tournament Setup */}
                            <div style={{ flex: 1, position: 'relative' }}>
                                <div
                                    onClick={handleModernSelection}
                                    style={{
                                        width: '100%',
                                        height: '180px',
                                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                        border: '3px solid rgba(24, 144, 255, 0.4)',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        boxShadow: '0 8px 24px rgba(24, 144, 255, 0.3)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-4px)';
                                        e.target.style.boxShadow = '0 12px 32px rgba(24, 144, 255, 0.4)';
                                        e.target.style.borderColor = 'rgba(24, 144, 255, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 8px 24px rgba(24, 144, 255, 0.3)';
                                        e.target.style.borderColor = 'rgba(24, 144, 255, 0.4)';
                                    }}
                                >
                                    {/* Decorative elements background */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        fontSize: '24px',
                                        opacity: 0.3
                                    }}>🔵</div>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        left: '10px',
                                        fontSize: '20px',
                                        opacity: 0.3
                                    }}>🟦</div>
                                    
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚡</div>
                                    <div style={{ fontSize: '22px', marginBottom: '8px', fontWeight: '700' }}>Modern Tournament</div>
                                    <div style={{ fontSize: '15px', opacity: 0.9, fontWeight: '400' }}>
                                        Fast-Paced Streamlined Format
                                    </div>
                                </div>
                                
                                <div style={{ 
                                    marginTop: '25px',
                                    padding: '0'
                                }}>
                                    <div style={{ 
                                        fontSize: '16px', 
                                        color: '#1890ff', 
                                        fontWeight: '700', 
                                        marginBottom: '15px',
                                        textAlign: 'center',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        Chip Values
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        color: '#ccc'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#fff', 
                                                borderRadius: '50%', 
                                                border: '1px solid #ddd',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '4px',
                                                    height: '4px',
                                                    backgroundColor: '#333',
                                                    borderRadius: '50%'
                                                }}></div>
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>100</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#ff4d4f', 
                                                borderRadius: '50%',
                                                border: '1px solid #ff7875'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>500</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#1890ff', 
                                                borderRadius: '50%',
                                                border: '1px solid #40a9ff'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>1,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#52c41a', 
                                                borderRadius: '50%',
                                                border: '1px solid #73d13d'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>5,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#000', 
                                                borderRadius: '50%', 
                                                border: '1px solid #333'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>10,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#faad14', 
                                                borderRadius: '50%',
                                                border: '1px solid #ffc53d'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>25,000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <Button 
                                type="default" 
                                onClick={handleFromScratchSelection}
                                size="large"
                                style={{ 
                                    background: 'linear-gradient(135deg, #434343 0%, #2A2A2A 100%)',
                                    border: '2px solid #555',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    padding: '12px 32px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    height: 'auto',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
                                    e.target.style.borderColor = '#777';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                                    e.target.style.borderColor = '#555';
                                }}
                            >
                                🚀 Start from Scratch
                            </Button>
                        </div>
                    </div>
                </Modal>

            </Content>
            <div className='preFooter'></div>
            <Footer style={{textAlign: 'center'}}>
                <Flex justify="space-evenly" align='center'>
                <Button onClick={showModal} type="primary" icon={<BugOutlined />} size="large">Report a Bug</Button>
                <span>Pokertimer.gg ©2025 Created with <HeartFilled style={{color: 'red'}}/> in London </span>
                <div className="coffeeBtn">
                    <a target="_blank" rel="noreferrer" href="https://www.buymeacoffee.com/kaigo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=kaigo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="bymecoffee"/></a>
                </div>
                
                </Flex>
                
            </Footer>
        </Layout>
        </ConfigProvider>
    );
};

export default App;