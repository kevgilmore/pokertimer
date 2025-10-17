import './App.css'
import {theme, Button, Card, Col, ConfigProvider, Drawer, Layout, Progress, Row, Tabs, Flex, Modal, Form, Input, message} from 'antd';
import {useEffect, useRef, useState} from 'react';
import {CaretRightOutlined, LeftOutlined, PauseOutlined, RightOutlined, SettingOutlined, BugOutlined, MinusOutlined, PlusOutlined, HeartFilled, HistoryOutlined, ReloadOutlined, MobileOutlined} from '@ant-design/icons';
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
    const [showIntroModal, setShowIntroModal] = useState(false);
    const [showRemoteModal, setShowRemoteModal] = useState(false);

    const showModal = () => {
        setIsModalOpen(true)
    }

    const showRemoteModalHandler = () => {
        setShowRemoteModal(true)
        
        // Track remote modal open event
        if (window.gtag) {
            window.gtag('event', 'remote_modal_open', {
                event_category: 'User Interaction',
                event_label: 'Remote Modal Opened',
                custom_parameters: {
                    timestamp: new Date().toISOString(),
                    user_agent: navigator.userAgent,
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`
                }
            });
        }
    }

    const handleClassicSelection = () => {
        dispatch(updateBlindStructure(classicStructure));
        localStorage.setItem('blindStructureSelected', 'true');
        setShowIntroModal(false);
    }

    const handleModernSelection = () => {
        dispatch(updateBlindStructure(modernStructure));
        localStorage.setItem('blindStructureSelected', 'true');
        setShowIntroModal(false);
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
        setShowIntroModal(false);
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
        const emailText = values.email ? `\n\nEmail: ${values.email}` : '';
        const fullText = values.bugDescription + emailText;
        
        emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            { text: fullText },
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
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const [gameStartTime, setGameStartTime] = useState(null);
    const [gameSessionId, setGameSessionId] = useState(null);

    let intervalRef = useRef();

    // Google Analytics tracking functions
    const trackGameStart = (gameType, currency) => {
        const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setGameSessionId(sessionId);
        setGameStartTime(Date.now());
        
        if (window.gtag) {
            window.gtag('event', 'game_start', {
                event_category: 'Game Session',
                event_label: 'Game Started',
                custom_parameters: {
                    game_type: gameType,
                    currency: currency,
                    session_id: sessionId,
                    blind_structure: game.blindStructure.length,
                    start_time: new Date().toISOString()
                }
            });
        }
    };

    const trackGameEnd = (reason = 'user_ended') => {
        if (!gameStartTime || !gameSessionId) return;
        
        const gameLength = Math.floor((Date.now() - gameStartTime) / 1000); // in seconds
        const gameLengthMinutes = Math.floor(gameLength / 60);
        const maxBlindLevel = game.currentBlindLevel;
        const totalBuyins = game.numOfPlayers;
        
        if (window.gtag) {
            window.gtag('event', 'game_end', {
                event_category: 'Game Session',
                event_label: 'Game Ended',
                value: gameLengthMinutes,
                custom_parameters: {
                    session_id: gameSessionId,
                    game_length_seconds: gameLength,
                    game_length_minutes: gameLengthMinutes,
                    max_blind_level: maxBlindLevel,
                    total_buyins: totalBuyins,
                    end_reason: reason,
                    end_time: new Date().toISOString()
                }
            });
        }
        
        // Reset session tracking
        setGameSessionId(null);
        setGameStartTime(null);
    };

    const trackBuyinChange = (newBuyinCount) => {
        if (!gameSessionId) return;
        
        if (window.gtag) {
            window.gtag('event', 'buyin_change', {
                event_category: 'Game Session',
                event_label: 'Buyins Updated',
                value: newBuyinCount,
                custom_parameters: {
                    session_id: gameSessionId,
                    new_buyin_count: newBuyinCount,
                    timestamp: new Date().toISOString()
                }
            });
        }
    };

    const handleBuyinIncrease = () => {
        const newCount = game.numOfPlayers + 1;
        dispatch(updateNumOfPlayers(newCount));
        trackBuyinChange(newCount);
    };

    const handleBuyinDecrease = () => {
        if (game.numOfPlayers > 1) {
            const newCount = game.numOfPlayers - 1;
            dispatch(updateNumOfPlayers(newCount));
            trackBuyinChange(newCount);
        }
    };

    // Track when user leaves the page
    useEffect(() => {
        const handleBeforeUnload = () => {
            trackGameEnd('page_unload');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [gameStartTime, gameSessionId]);

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
            setViewportHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Check if user has already made a blind structure selection
        const hasSelectedBlindStructure = localStorage.getItem('blindStructureSelected') === 'true';
        if (!hasSelectedBlindStructure && !isPortrait) {
            setShowIntroModal(true);
        }
    }, [isPortrait]);

    const startGame = () => {
        let currentTime = new Date().toISOString();
        console.log("Start game called", currentTime);
        dispatch(updateStartTime(currentTime));
        setPausePlayIcon(getIcon());
        intervalRef.current = setInterval(updateTimer, ONE_SECOND);
        
        // Determine game type based on blind structure
        const gameType = game.blindStructure === classicStructure ? 'classic' : 
                        game.blindStructure === modernStructure ? 'modern' : 'custom';
        
        // Track game start with comprehensive data
        trackGameStart(gameType, game.currency);
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
            const newLevel = game.currentBlindLevel - 1;
            dispatch(changeBlindLevel(newLevel))
            setTimeLeft(game.blindStructure[newLevel - 1].duration * 60)
        }
    }

    const toggleNext = () => {
        if (hasNextBlind()) {
            const newLevel = game.currentBlindLevel + 1;
            dispatch(changeBlindLevel(newLevel))
            setTimeLeft(game.blindStructure[newLevel - 1].duration * 60)
        }
    }

    const resetTimer = () => {
        // Track game end before resetting
        trackGameEnd('user_reset');
        
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

    const formatBlindValue = (value) => {
        if (value >= 10000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return value.toString();
    }

    const formatBlindsDisplay = (small, big) => {
        if (small >= 10000 || big >= 10000) {
            // When either blind reaches 10K+, abbreviate both for consistency
            const smallFormatted = small >= 10000 ? (small / 1000).toFixed(0) + 'K' : (small / 1000).toFixed(0) + 'K';
            const bigFormatted = big >= 10000 ? (big / 1000).toFixed(0) + 'K' : (big / 1000).toFixed(0) + 'K';
            return `${smallFormatted}/${bigFormatted}`;
        }
        return `${small}/${big}`;
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <a href="/"> <img className="logo" src={logo} alt="logo"></img></a>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <h1 className='gameTitle'>{game.title}</h1>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {!(isMobile || isPortrait) && (
                            <>
                                <Button className="remoteBtn" type="primary" onClick={showRemoteModalHandler} icon={<MobileOutlined />}>Remote</Button>
                                <Button className="settingsBtn" type="primary" onClick={showDrawer} icon={<SettingOutlined />}></Button>
                            </>
                        )}
                    </div>
                </div>
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
                                        <div className="timerButtonsRow">
                                            <Button className="timerButton" onClick={() => togglePrev()} type="primary" shape="circle" icon={<LeftOutlined />} size={"large"} />
                                            <Button className="timerButton timerButtonMain" onClick={() => togglePause()} type="primary" shape="circle" icon={pausePlayIcon} size={"large"} />
                                            <Button className="timerButton" onClick={() => toggleNext()} type="primary" shape="circle" icon={<RightOutlined />} size={"large"} />
                                        </div>
                                        <div className="timerButtonsRow">
                                            <Button className="timerButton timerButtonReset" onClick={() => resetTimer()} type="primary" shape="circle" icon={<HistoryOutlined />} />
                                        </div>
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
                                        {formatBlindsDisplay(blind.small, blind.big)}
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
                                            {formatBlindsDisplay(game.blindStructure[game.currentBlindLevel - 1].small, game.blindStructure[game.currentBlindLevel - 1].big)}
                                        </h1>
                                    </div>
                                    <div className="blindsValueContainer anteContainer">
                                        <div className="blindsLabel" style={{textAlign: 'left', paddingLeft: '10px'}}>ANTE</div>
                                        <h1 className="activeBlindGreenText">
                                            {game.isAnteEnabled ? formatBlindValue(game.blindStructure[game.currentBlindLevel - 1].big) : 0}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Player Controls */}
                            <div className="blindsPlayerSection">
                                <div className="playerControlsContainer">
                                    <div className="playerLabel">Buy-ins:</div>
                                    <div className="playerControls">
                                        <Button onClick={handleBuyinDecrease} type="primary" shape="circle" icon={<MinusOutlined />} size="large" />
                                        <span className="playerCount">{game.numOfPlayers}</span>
                                        <Button onClick={handleBuyinIncrease} type="primary" shape="circle" icon={<PlusOutlined />} size="large" />
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
                            <TextArea rows={4} placeholder="Please describe the bug you encountered..." />
                        </Form.Item>
                        <Form.Item name="email"
                                label="Do you want us to email you when it's fixed?"
                                rules={[
                                    { type: 'email', message: 'Please enter a valid email address.' }
                                ]}
                                style={{ marginBottom: '20px' }}
                        >
                            <Input placeholder="your.email@example.com" style={{ width: '100%' }} />
                        </Form.Item>
                        
                        <div style={{ 
                            background: 'rgba(102, 108, 255, 0.1)', 
                            padding: '15px', 
                            borderRadius: '8px', 
                            border: '1px solid rgba(102, 108, 255, 0.3)'
                        }}>
                            <h4 style={{ color: '#666CFF', marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>
                                🚀 Upcoming Features
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc' }}>
                                <li>Mobile remote</li>
                            </ul>
                        </div>
                    </Form>
                </Modal>

                {/* Intro Modal */}
                <Modal
                    open={showIntroModal}
                    title=""
                    footer={null}
                    closable={false}
                    maskClosable={false}
                    onCancel={() => {}} // Prevent closing
                    width={Math.min(1000, window.innerWidth * 0.95)}
                    centered
                    styles={{
                        mask: {
                            backdropFilter: 'blur(12px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)'
                        },
                        body: {
                            maxHeight: `${Math.min(viewportHeight * 0.95, 700)}px`,
                            overflowY: 'auto',
                            padding: '0'
                        }
                    }}
                >
                    <div style={{
                        color: 'white',
                        padding: viewportHeight < 600 ? '15px' : '25px',
                        position: 'relative',
                        height: '100%'
                    }}>

                        <div style={{ textAlign: 'center', marginBottom: viewportHeight < 600 ? '15px' : '20px' }}>
                            <h1 style={{ 
                                color: '#fff', 
                                fontSize: viewportHeight < 600 ? '22px' : '30px', 
                                fontWeight: '800',
                                marginBottom: '8px',
                                textShadow: '0 3px 6px rgba(0, 0, 0, 0.6)',
                                background: 'linear-gradient(45deg, #1890ff, #52c41a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                🃏 Welcome to Poker Timer
                            </h1>
                            <p style={{ 
                                color: '#ccc', 
                                fontSize: viewportHeight < 600 ? '14px' : '18px', 
                                marginBottom: '0',
                                fontWeight: '400',
                                letterSpacing: '0.3px'
                            }}>
                                Choose your preferred tournament format to get started
                            </p>
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: viewportHeight < 600 ? '10px' : '20px', 
                            justifyContent: 'center', 
                            marginBottom: viewportHeight < 600 ? '15px' : '20px',
                            flexDirection: viewportHeight < 500 ? 'column' : 'row'
                        }}>
                            {/* Classic Tournament Setup */}
                            <div style={{ flex: 1, position: 'relative' }}>
                                <div
                                    onClick={handleClassicSelection}
                                    style={{
                                        width: '100%',
                                        height: viewportHeight < 600 ? '140px' : '180px',
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
                                        display: 'grid',
                                        gridTemplateColumns: viewportHeight < 800 ? '1fr 1fr' : '1fr',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        color: '#ccc',
                                        padding: '0 30px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#ff4d4f', 
                                                borderRadius: '50%',
                                                border: '1px solid #ff7875'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>100</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#1890ff', 
                                                borderRadius: '50%',
                                                border: '1px solid #40a9ff'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>500</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#52c41a', 
                                                borderRadius: '50%',
                                                border: '1px solid #73d13d'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>1,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#000', 
                                                borderRadius: '50%', 
                                                border: '1px solid #333'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>5,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
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
                                        height: viewportHeight < 600 ? '140px' : '180px',
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
                                        display: 'grid',
                                        gridTemplateColumns: viewportHeight < 800 ? '1fr 1fr' : '1fr',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        color: '#ccc',
                                        padding: '0 30px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#ff4d4f', 
                                                borderRadius: '50%',
                                                border: '1px solid #ff7875'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>500</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#1890ff', 
                                                borderRadius: '50%',
                                                border: '1px solid #40a9ff'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>1,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#52c41a', 
                                                borderRadius: '50%',
                                                border: '1px solid #73d13d'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>5,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
                                            <div style={{ 
                                                width: '16px', 
                                                height: '16px', 
                                                backgroundColor: '#000', 
                                                borderRadius: '50%', 
                                                border: '1px solid #333'
                                            }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff', minWidth: '60px', textAlign: 'left' }}>10,000</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '120px', justifyContent: 'center', paddingLeft: '50px' }}>
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
                                    padding: viewportHeight < 600 ? '8px 24px' : '12px 32px',
                                    fontSize: viewportHeight < 600 ? '14px' : '16px',
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

                {/* Remote Control Marketing Modal */}
                <Modal
                    open={showRemoteModal}
                    title=""
                    footer={null}
                    closable={true}
                    onCancel={() => setShowRemoteModal(false)}
                    width={window.innerWidth < 768 ? '95%' : 1200}
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
                        padding: '30px',
                        borderRadius: '16px',
                        border: '2px solid #333',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.9)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Special Decorative elements */}
                        <div style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '120px',
                            height: '120px',
                            background: 'radial-gradient(circle, rgba(102, 108, 255, 0.3) 0%, transparent 70%)',
                            borderRadius: '50%',
                            animation: 'pulse 3s ease-in-out infinite'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '100px',
                            height: '100px',
                            background: 'radial-gradient(circle, rgba(188, 255, 102, 0.2) 0%, transparent 70%)',
                            borderRadius: '50%',
                            animation: 'pulse 4s ease-in-out infinite reverse'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(255, 193, 7, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%',
                            animation: 'pulse 5s ease-in-out infinite'
                        }}></div>

                        {/* Header Section - Centered */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{
                                background: 'linear-gradient(45deg, #666CFF, #BCFF66)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                fontSize: '48px',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                textShadow: '0 0 30px rgba(102, 108, 255, 0.5)'
                            }}>
                                📱 Remote Control
                            </div>
                            
                            <h2 style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                marginBottom: '15px',
                                color: '#BCFF66',
                                textShadow: '0 0 20px rgba(188, 255, 102, 0.3)'
                            }}>
                                Control Your Poker Timer from Anywhere!
                            </h2>

                        </div>

                        {/* Main Content - Single Column */}
                        <div style={{ zIndex: 2 }}>
                            <div style={{ 
                                background: 'rgba(102, 108, 255, 0.1)', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(102, 108, 255, 0.3)',
                                marginBottom: '20px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '30px',
                                    alignItems: 'flex-start',
                                    flexDirection: window.innerWidth < 768 ? 'column' : 'row'
                                }}>
                                    {/* Left side - Key Features */}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ color: '#666CFF', fontSize: '24px', marginBottom: '20px', textAlign: 'left', textShadow: '0 0 15px rgba(102, 108, 255, 0.3)' }}>
                                            ✨ Key Features
                                        </h3>
                                        <ul style={{ fontSize: '18px', lineHeight: '2', paddingLeft: '20px' }}>
                                            <li>📱 <strong>Mobile Control</strong> - Use your phone as a remote</li>
                                            <li>🔐 <strong>Secure Code System</strong> - Like Netflix login</li>
                                            <li>⏱️ <strong>Full Timer Control</strong> - Start, pause, skip levels</li>
                                            <li>🌐 <strong>Works Anywhere</strong> - No WiFi restrictions</li>
                                        </ul>
                                    </div>

                                    {/* Right side - Image */}
                                    <div style={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        minHeight: '200px'
                                    }}>
                                        <img 
                                            src="/iphone_mockup.png" 
                                            alt="Remote Control Feature" 
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '300px',
                                                height: 'auto'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ 
                                background: 'rgba(188, 255, 102, 0.1)', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(188, 255, 102, 0.3)',
                                marginBottom: '30px'
                            }}>
                                <h3 style={{ color: '#BCFF66', fontSize: '24px', marginBottom: '15px', textAlign: 'left', textShadow: '0 0 15px rgba(188, 255, 102, 0.3)' }}>
                                    🚀 How It Works
                                </h3>
                                <ol style={{ fontSize: '18px', lineHeight: '2', paddingLeft: '20px' }}>
                                    <li>Get a <strong>connection code</strong> from your timer</li>
                                    <li>Open <strong>pokertimer.gg</strong> on your phone</li>
                                    <li>Enter the code to connect</li>
                                    <li>Control your timer remotely!</li>
                                </ol>
                            </div>

                            {/* Email Signup - Mailchimp Integration */}
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#FFC107', fontSize: '24px', marginBottom: '20px', textShadow: '0 0 15px rgba(255, 193, 7, 0.3)' }}>
                                    🚧 Coming Soon
                                </h3>
                                <form 
                                    action="https://pokertimer.us5.list-manage.com/subscribe/post?u=25e23b59560a646ba16615308&amp;id=b913746fd7&amp;f_id=00b7e9e1f0" 
                                    method="post" 
                                    id="mc-embedded-subscribe-form" 
                                    name="mc-embedded-subscribe-form" 
                                    className="validate" 
                                    noValidate
                                    style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.target;
                                        const email = form.querySelector('#mce-EMAIL').value;
                                        const button = form.querySelector('#mc-embedded-subscribe');
                                        const successDiv = document.getElementById('mce-success-response');
                                        const errorDiv = document.getElementById('mce-error-response');
                                        
                                        // Hide previous messages
                                        successDiv.style.display = 'none';
                                        errorDiv.style.display = 'none';
                                        
                                        // Basic email validation
                                        if (!email || !email.includes('@')) {
                                            errorDiv.textContent = 'Please enter a valid email address';
                                            errorDiv.style.display = 'block';
                                            return;
                                        }
                                        
                                        // Show loading state
                                        const originalText = button.textContent;
                                        button.textContent = 'Subscribing...';
                                        button.disabled = true;
                                        
                                        // Create form data
                                        const formData = new FormData(form);
                                        
                                        // Submit to Mailchimp
                                        fetch(form.action, {
                                            method: 'POST',
                                            body: formData,
                                            mode: 'no-cors'
                                        })
                                        .then(() => {
                                            // Since we can't read the response due to CORS, we'll assume success
                                            successDiv.textContent = "Thank you! We'll be in touch soon! 🎉";
                                            successDiv.style.display = 'block';
                                            form.querySelector('#mce-EMAIL').value = '';
                                        })
                                        .catch(() => {
                                            errorDiv.textContent = 'Something went wrong. Please try again.';
                                            errorDiv.style.display = 'block';
                                        })
                                        .finally(() => {
                                            button.textContent = originalText;
                                            button.disabled = false;
                                        });
                                    }}
                                >
                                    <input 
                                        type="email" 
                                        name="EMAIL" 
                                        className="required email" 
                                        id="mce-EMAIL" 
                                        placeholder="Enter your email"
                                        required
                                        style={{
                                            width: '300px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            color: 'white',
                                            fontSize: '16px',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            outline: 'none'
                                        }}
                                    />
                                    <button 
                                        type="submit" 
                                        name="subscribe" 
                                        id="mc-embedded-subscribe" 
                                        style={{
                                            background: 'linear-gradient(45deg, #FFC107, #FF8C00)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            padding: '12px 30px',
                                            height: 'auto',
                                            boxShadow: '0 6px 20px rgba(255, 193, 7, 0.4)',
                                            textShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!e.target.disabled) {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(255, 193, 7, 0.6)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                                        }}
                                    >
                                        Notify Me
                                    </button>
                                    {/* Real people should not fill this in and expect good things - do not remove this or risk form bot signups */}
                                    <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                                        <input type="text" name="b_25e23b59560a646ba16615308_b913746fd7" tabIndex="-1" value="" />
                                    </div>
                                </form>
                                <div id="mce-responses" style={{ marginTop: '10px' }}>
                                    <div id="mce-error-response" style={{ display: 'none', color: '#ff4d4f', fontSize: '14px' }}></div>
                                    <div id="mce-success-response" style={{ display: 'none', color: '#52c41a', fontSize: '14px' }}></div>
                                </div>
                            </div>
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