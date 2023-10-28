import './App.css'
import {theme, Button, Card, Col, ConfigProvider, Drawer, Layout, Progress, Row, Tabs, Flex} from 'antd';
import {useEffect, useRef, useState} from 'react';
import {CaretRightOutlined, LeftOutlined, PauseOutlined, RightOutlined, SettingOutlined, FullscreenOutlined, MinusOutlined, PlusOutlined} from '@ant-design/icons';
import 'react-circular-progressbar/dist/styles.css';
import {getTab1, getTab2, getTab3} from "./settings/TabsManager";
import {useDispatch, useSelector} from "react-redux";
import {changeBlindLevel, updateNumOfPlayers} from "./redux/game";
import formatTime from './TimeFormatter';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const { Header, Content } = Layout;

const App = () => {
    const handle = useFullScreenHandle();
    const [open, setOpen] = useState(false);
    const [pausePlayIcon, setPausePlayIcon] = useState(<CaretRightOutlined />)
    const game = useSelector((state) => state.game)
    const dispatch = useDispatch()
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
        <FullScreen handle={handle}>
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
                <Button className="settingsBtn" type="primary" onClick={showDrawer} icon={<SettingOutlined />}></Button>
                {/* <Button className="fullscreenBtn" type="primary" onClick={handle.enter} icon={<FullscreenOutlined />}></Button> */}
                <Drawer className ="settingsBg" title="Settings" placement="right" onClose={onClose} open={open} width={600}>
                    <Tabs centered="true" type="card" size="large" items={[getTab1(), getTab2(), getTab3()]}/>
                </Drawer>
            </Header>
            <Content>
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

            </Content>
        </Layout>
        </ConfigProvider>
        </FullScreen>
        
    );
};
export default App;