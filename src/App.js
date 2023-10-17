import './App.css'
import {theme, Button, Card, Col, ConfigProvider, Drawer, Layout, Progress, Row, Tabs} from 'antd';
import {useEffect, useState} from 'react';
import {CaretRightOutlined, LeftOutlined, PauseOutlined, RightOutlined, SettingOutlined} from '@ant-design/icons';
import 'react-circular-progressbar/dist/styles.css';
import {getTab1, getTab2, getTab3} from "./settings/TabsManager";
import {useDispatch, useSelector} from "react-redux";
import {changeBlindLevel, restartGame} from "./redux/game";

const { Header, Content } = Layout;

let timerInterval = null
let timePassed = 0
let isPaused = true
let hasGameStarted = false

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

const App = () => {

    const [open, setOpen] = useState(false);
    const [pausePlayIcon, setPausePlayIcon] = useState(<CaretRightOutlined />)
    
    const game = useSelector((state) => {
        return state.game;
    })
    const [timeLeft, setTimeLeft] = useState(0);
    const dispatch = useDispatch()
    const [timer, setTimer]= useState(0);
    const [isTriggered, setIsTriggered] = useState(false)

       useEffect(() => {
           changeBlind(timer)
       }, [isTriggered])

    const startTimer = () => {
               hasGameStarted = true
               setTimeLeft(game.blindStructure[game.currentBlindLevel-1].duration)
               if (game.currentBlindLevel <=game.blindStructure.length) {// stop running end of array
                   timerInterval = setInterval(() => {
                       if (!isPaused) {
                           if ((game.blindStructure[game.currentBlindLevel-1].duration - timePassed) > 0) {// not end of level
                               timePassed++
                               let timeLeft = (game.blindStructure[game.currentBlindLevel-1].duration - timePassed)
                               setTimeLeft(timeLeft) 
                           } else { // end of level
                               if (game.currentBlindLevel <=(game.blindStructure.length - 1)) {// has next blind
                                   //changeBlind(+1) //todo issue here
                                   setTimer(+1);
                                   setIsTriggered(!isTriggered)
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
//            game.currentBlindLevel = newBlindLevel
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
           //game
//            savedgame.currentBlindLevel = 1
           startTimer()
           dispatch(restartGame())
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
       let timeLeft = (game.blindStructure[game.currentBlindLevel-1].duration - timePassed);
       return ((timeLeft / game.blindStructure[game.currentBlindLevel-1].duration) * 100).toFixed(0)
    }


    const timerFormat = () => {
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
                                          format={() => timerFormat()}
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
                        <h5 className="timeRemainingText">1:00:09</h5>
                        <Card bordered={false} className="prizesCard" style={{marginTop: 50}}>
                            <h1>£100</h1>
                        </Card>
                        <Card bordered={false} className="prizesCard">
                            <h1>£75</h1>
                        </Card>
                        <Card bordered={false} className="prizesCard">
                            <h1>£50</h1>
                        </Card>

                    </Col>
                </Row>

                <Row>
                    <Card bordered={false} className="blindsCard">
                        <Row>
                            <Col className="blindsList" span={2}>
                                <h4>25/50</h4>
                                <h4>50/100</h4>
                                <h4>75/150</h4>
                                <h4>100/200</h4>
                            </Col>
                            <div className="verticalLine"></div>
                            <Col className="flexBoxCol" span={10}>
                                <h1 className="activeBlindLeveltext">LEVEL {game.currentBlindLevel}</h1>
                            </Col>
                            <Col span={6}>
                                <h4 className="activeBlindGreenTextLabel">BLINDS</h4>
                                <h1 className="activeBlindGreenText">
                                    {game.blindStructure[game.currentBlindLevel-1].small + "/" + game.blindStructure[game.currentBlindLevel-1].big}
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