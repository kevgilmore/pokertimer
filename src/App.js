import './App.css'
import {theme, Button, Card, Col, ConfigProvider, Drawer, Layout, Progress, Row, Tabs} from 'antd';
import {useState} from 'react';
import {CaretRightOutlined, LeftOutlined, PauseOutlined, RightOutlined, SettingOutlined} from '@ant-design/icons';
import 'react-circular-progressbar/dist/styles.css';
import {getTab1, getTab2, getTab3} from "./settings/TabsManager";
import {useDispatch, useSelector} from "react-redux";
import {changeBlindLevel, updateStartTime} from "./redux/game";
import formatTime from './TimeFormatter';

const { Header, Content } = Layout;

let timerInterval = null
let timePassed = 0
let isPaused = true
let hasGameStarted = false
let totalTimeLapsed = 0;

const App = () => {
    const [open, setOpen] = useState(false);
    const [pausePlayIcon, setPausePlayIcon] = useState(<CaretRightOutlined />)
    const game = useSelector((state) => state.game)
    const [timeLeft, setTimeLeft] = useState(game.blindStructure[0].duration*60);
    const dispatch = useDispatch()
    const [setTimer]= useState(0);

    const startTimer = () => {  
        hasGameStarted = true
        setTimeLeft(game.blindStructure[game.currentBlindLevel-1].duration*60)
        if (game.currentBlindLevel <=game.blindStructure.length) {// stop running end of array
            timerInterval = setInterval(() => {
                console.log("game started?", hasGameStarted);
                if (!isPaused) {
                    totalTimeLapsed++
                    if ((game.blindStructure[game.currentBlindLevel-1].duration*60 - timePassed) > 0) {// not end of level
                        timePassed++
                        let timeLeft = (game.blindStructure[game.currentBlindLevel-1].duration*60 - timePassed)
                        setTimeLeft(timeLeft) 
                    } else { // end of level
                        if (game.currentBlindLevel <=(game.blindStructure.length - 1)) {// has next blind
                            setTimer(+1);
                            changeBlind(+1)
                        } else {
                            stopTimer()
                        }
                    }
                }
            }, 1000)
        }
    }

   const changeBlind = (change) => {
       let newBlindLevel = (game.currentBlindLevel + change)
       if (newBlindLevel > 0 && newBlindLevel <= game.blindStructure.length) {// stop running end of array
           timePassed = 0
           dispatch(changeBlindLevel(newBlindLevel))
           clearInterval(timerInterval)
           startTimer()
       }
   }

   const togglePause = () => {
       isPaused = !isPaused
       if (isPaused) {
           setPausePlayIcon(getIcon())
       } else {
           setPausePlayIcon(getIcon())
       }
       if (!hasGameStarted) { // restarting game
           timePassed = 0
           setTimeLeft(game.blindStructure[game.currentBlindLevel-1].duration)
           startTimer()
        //    dispatch(restartGame())
        dispatch(updateStartTime(new Date().toISOString()))
       }
   }

    const getIcon = () => {
        if (!isPaused) {
            return <PauseOutlined />
        } else {
            return <CaretRightOutlined/>
        }
    }

   const stopTimer = () => {
       clearInterval(timerInterval)
       isPaused = true
       hasGameStarted = false
       setPausePlayIcon(getIcon())
   }

    const calculatePercentage = () => {
       let timeLeft = (game.blindStructure[game.currentBlindLevel-1].duration*60 - timePassed);
       return ((timeLeft / (game.blindStructure[game.currentBlindLevel-1].duration*60)) * 100).toFixed(0)
    }


    const getTimerControls = () => {
        return <div>
            {formatTime(timeLeft)}
            <br></br>
            {<Button style={{width: 50, height:50, margin:10}} onClick={() => changeBlind(-1)} type="primary" shape="circle" icon={<LeftOutlined />} size={"large"} />}
            {<Button style={{width: 75, height:75, margin:10}} onClick={() => togglePause()} type="primary" shape="circle" icon={pausePlayIcon} size={"large"} />}
            {<Button style={{width: 50, height:50, margin:10}} onClick={() => changeBlind(+1)} type="primary" shape="circle" icon={<RightOutlined />} size={"large"} />}
        </div>
    }

    const showDrawer = () => {
        setOpen(true)
    };

    const onClose = () => {
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
                pokertimer.gg
                {/* <h1 className="gameTitle">Poker Tournament</h1>
                <h3 className="gameSubtitle">£20 + 1 rebuy</h3> */}
                <Button className="settingsBtn" type="primary" onClick={showDrawer} icon={<SettingOutlined />}></Button>
                <Drawer className ="settingsBg" title="Settings" placement="right" onClose={onClose} open={open} width={600}>
                    <Tabs
                        centered="true"
                        type="card"
                        size="large"
                        items={[getTab1(), getTab2(), getTab3()]}
                    />
                </Drawer>
            </Header>
            <Content>
                {/*Main row*/}
                <Row>
                    {/*Timer column*/}
                    <Col span={14}>
                        <div className="timerBox">
                                <Progress type="circle"
                                          format={() => getTimerControls()}
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
                        <p className="timeRemainingLabel">TOURNAMENT RUNNING TIME</p>
                        <h5 className="totalTimeLapsed">{formatTime(totalTimeLapsed)}</h5>
                        <Card bordered={false} className="prizesCard" style={{marginTop: 50}}>
                            <h1>{game.currencySymbol}{game.prizes[0]}</h1>
                        </Card>
                        <Card bordered={false} className="prizesCard">
                            <h1>{game.currencySymbol}{game.prizes[1]}</h1>
                        </Card>
                        <Card bordered={false} className="prizesCard">
                            <h1>{game.currencySymbol}{game.prizes[2]}</h1>
                        </Card>

                    </Col>
                </Row>
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
                            <Col className="flexBoxCol" span={10}>
                                <h1 className="activeBlindLeveltext">LEVEL {game.currentBlindLevel}</h1>
                            </Col>
                            <Col span={6}>
                                {/* <h4 className="activeBlindGreenTextLabel">BLINDS</h4> */}
                                <h1 className="activeBlindGreenText">
                                    {game.blindStructure[game.currentBlindLevel - 1].small + "/" + game.blindStructure[game.currentBlindLevel - 1].big}
                                </h1>
                            </Col>
                            <Col span={5}></Col>
                        </Row>
                    </Card>
                </Row>

            </Content>
        </Layout>
        </ConfigProvider>
    );
};
export default App;