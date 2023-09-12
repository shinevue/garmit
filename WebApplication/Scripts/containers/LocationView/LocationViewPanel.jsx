/**
 * @license Copyright 2017 DENSO
 * 
 * ロボット制御画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from './actions';
import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';

import { ButtonGroup, ButtonToolbar, Row, Col, FormGroup, Radio, Well } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import MessageModal from 'Assets/Modal/MessageModal';
import { ImageLayer, CameraObjectLayer } from 'Assets/FloorMap/FloorMap';
import LayoutSelectForm from 'Assets/FloorMap/LayoutSelectForm';
import Loading from 'Common/Widget/Loading';

import { sendData, EnumHttpMethod } from 'http-request';
import { closeModalInfo } from 'messageModalUtility';
import { DRAW_AREA_SIZE } from 'constant';

const CAMERA1_URL = "../../../TEMP/robotControl/robotControl.html";
const CAMERA2_URL = "../../../TEMP/robotControl2/robotControl.html";

/**
 * ロボット制御画面のコンポーネント
 */
class LocationViewPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            selectUrl: CAMERA1_URL,
            showModal: false,
            modalTitle: null,
            modalMessage: null
         };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        if (application.appSettings.series === "DC") {
            //ロボットコントロール用の外部urlから高さ情報を受け取る
            window.addEventListener("message", (e) => { this.setHeight(e) }, false);
        }
        else if (application.appSettings.series === "ME") {
            this.loadAuthentication();  //権限取得
            this.loadInfo();            //ページ情報取得  
        }
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.selectCamera.height !== nextProps.selectCamera.height) {
            //高さが変更された場合
            $("input.slider").bootstrapSlider('setValue', nextProps.selectCamera.height);
        }
        
    }

    /**
     * コンポーネントアップデート後に実行
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.selectCamera.id && this.props.selectCamera.id) {
            //スライダー初期設定
            $("input.slider").bootstrapSlider()
                .on('slideStop', (e) => {
                    //スライダー変更時
                    this.props.changeCameraState({ key: "height", value: e.value });
                });
        }
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.locationView, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * 初期表示情報を読み込む
     */
    loadInfo() {  
        this.props.requestLayoutList();
    }


    //#region DC用
    /**
     * 描画エリアの高さをセットする
     * @param {number} wait 
     */
    setHeight(e) {
		//高さが入っている場合のみ指定
        if (e.data.height) {
            $(".robot-content")[0].height = e.data.height;
        }
    }

    /**
     * ボタンクリックイベント
     * @param {string} url
     */
    handleClick(url) {
        this.setState({ selectUrl: url });
    }
    //#endregion

    //#region　イベントハンドラ
    /**
    * レイアウト選択イベント
    */
    handleChangeSelectLayout = (selectLayout) => {
        this.props.requestLayoutInfo(_.get(selectLayout, 'layoutId'));
    }

    /**
     * カメラ選択イベント
     */
    handleSelectCamera = (id) => {
        this.props.requestCameraInfo(id);
    }

    /**
     * カメラモード変更イベント
     */
    handleChangeCameraMode = (value) => {
        this.props.changeCameraState(value);
    }

    /**
     * カメラ設定変更イベント
     */
    handleChangeSetting = (id, value) => {
        this.props.changeCameraSetting({ key: id, value:value});
    }

    /**
     * モーダルクローズ
     */
    handleCloseModal = () => {
        this.props.changeModalState(closeModalInfo());
    }
    //#endregion

    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication  } = this.props.authentication;
        const { panelState, cameraList, selectCamera, setting, layoutInfo } = this.props;
        const { layoutList = [], selectLayout } = layoutInfo;
        const { isLoading } = panelState;
        const { show, title, message } = panelState.modalState;
        const { id=null, cameraMode=null, height=null } = selectCamera;
        const { selectUrl } = this.state;
        //const _cameraList = [
        //    { id: 1, name: "カメラ1", selected: true, position: { x: 10, y: 100 }, rotate: 10 },
        //    { id: 2, name: "カメラ2", selected: false, position: { x: 100, y: 100 }, rotate: 0 }
        //];        
        if (application.appSettings.series === "DC") {
            const loading = loadAuthentication;
            const iframeObject = <iframe className="robot-content" src={selectUrl}
                                    width="100%" height="auto" style={{ border: "none" }}>
                                </iframe>;
            return (
                <Content>
                    <ButtonGroup>
                        <Button disabled={loading} active={selectUrl === CAMERA1_URL ? true : false} onClick={() => this.handleClick(CAMERA1_URL)}>カメラ1</Button>
                        <Button disabled={loading} active={selectUrl === CAMERA2_URL ? true : false} onClick={() => this.handleClick(CAMERA2_URL)}>カメラ2</Button>
                    </ButtonGroup>
                    {loading ? 
                        <div>
                            {iframeObject}   
                            <Loading isLoading={loading} />                     
                        </div>
                    :
                        iframeObject
                    }
                </Content>
            );
        }
        else if (application.appSettings.series === "ME") {
            const loading = isLoading || !loadAuthentication;
            return (
                <Content>
                    {layoutList &&
                        <LayoutSelectForm
                            isReadOnly={isReadOnly || loading}
                            layoutList={layoutList}
                            selectLayout={selectLayout}
                            onChangeSelectLayout={this.handleChangeSelectLayout}
                        />
                    }
                    <CameraButtonGroup selectCamera={selectCamera} cameraList={cameraList} onClick={this.handleSelectCamera} />
                    {id &&
                        < Row >
                            <Col xs={12} sm={6}>
                                <CameraBox isReadOnly={isReadOnly} isLoading={loading} selectCameraId={id} cameraMode={cameraMode} height={height} onChange={this.handleChangeCameraMode} />
                            </Col>
                            <Col xs={12} sm={6}>
                                <FloorMapBox isLoading={loading} cameraList={cameraList} selectCameraId={id} />
                                <SettingBox isLoading={loading} setting={setting} onChange={this.handleChangeSetting} />
                            </Col>
                        </Row>
                    }
                    <MessageModal
                        title={title}
                        show={show}
                        bsSize={"sm"}
                        buttonStyle={"message"}
                        onCancel={this.handleCloseModal}
                    >
                        {message}
                    </MessageModal>
                </Content>
            );
        }
        else {
            return false;
        }
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        layoutInfo: state.layoutInfo,
        cameraList: state.cameraList,
        selectCamera: state.selectCamera,
        setting:state.setting,
        panelState: state.panelState
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(LocationViewPanel);

//ME対応
//#region カメラ選択ボタングループ
/**
 * カメラ選択ボタングループ
 */
const CameraButtonGroup = ({ cameraList, selectCamera,  onClick:handleClick }) => {
    return (
        <ButtonGroup className="mb-2">
            {cameraList.map((info) => {
                return <CameraButton name={info.name} selected={selectCamera.id === info.id} onClick={handleClick.bind(this,info.id)} />
            })}
        </ButtonGroup>
        );
}

/**
 * カメラ選択ボタン
 */
const CameraButton = ({ name, selected, onClick: handleClick }) => (
    <Button active={selected} onClick={handleClick}>{name}</Button>
);
//#endregion

//#region カメラボックス
/**
 * カメラボックス
 */
const CameraBox = ({ isReadOnly, isLoading, cameraMode, height, selectCameraId, onChange: handleChange }) => {
    return (
        <Box isLoading={isLoading}>
            <Box.Header>
                <Box.Title>カメラ</Box.Title>
            </Box.Header >
            <Box.Body>
                <MainCameraImageSelector id={selectCameraId} mode={_.get(cameraMode, "main", "camera")} onChange={handleChange} />
                <Row>
                    <Col md={12} lg={7}>
                        <SubCameraImage mode={_.get(cameraMode, "sub", "front")} onChange={handleChange}  />
                    </Col>
                    <Col md={12} lg={5}>
                        <label>カメラ操作</label>
                        <CameraOperationWell isReadOnly={isReadOnly} height={height} onChange={handleChange} />
                    </Col>
                </Row>
            </Box.Body>
        </Box>
    );
}

//#region カメラ映像
/**
 * カメラ映像表示
 */
const CameraImage = ({ src, children }) => {
    return (
        <div className="mb-2">
            <div className="mlr-2">
                {children}
                <img width='100%' src={"./Content/Temporary/"+src} />
            </div>
        </div>
    );
}

/**
 * メインカメラ表示モード選択フォーム
 */
const MainModeForm = ({ mode, onChange: handleChange }) => {
    return (
        <FormGroup>
            <label className="mr-2">メイン</label>
            <Radio checked={mode === "camera"} onChange={handleChange.bind(this, { key: "main", value: "camera" })} inline >
                カメラモード
              </Radio>
            <Radio checked={mode === "thermal"} onChange={handleChange.bind(this, { key: "main", value: "thermal"})} inline>
                サーマルモード
              </Radio>
        </FormGroup>
    );
}

/**
 * サブカメラ表示モード選択フォーム
 */
const SubModeForm = ({ mode, onChange: handleChange }) => {
    return (
        <FormGroup>
            <label className="mr-2">サブ</label>
            <Radio checked={mode === "front"} onChange={handleChange.bind(this, { key: "sub", value: "front"})} inline >
                フロント
              </Radio>
            <Radio checked={mode === "rear"} onChange={handleChange.bind(this, { key: "sub", value: "rear" })} inline>
                リア
              </Radio>
        </FormGroup>
    );
}

/**
 * カメラ映像表示HOC
 */
const createCameraImage = (FormComponent, srcList) => {
    return (props) => (
        <CameraImage src={_.get(srcList, props.mode)}>
            <FormComponent {...props} />
        </CameraImage>
    );
}

/**
 * メインカメラのコンポーネントセレクタ
 */
const MainCameraImageSelector = (props) => {
    switch (props.id) {
        case 1:
            return <MainCameraImage1 {...props} />
        case 2:
            return <MainCameraImage2 {...props} />
        case 3:
            return <MainCameraImage3 {...props} />
    }
}
const MainCameraImage1 = createCameraImage(MainModeForm, { camera: "maincam_dummy.jpg", thermal: "thermal.png" });
const MainCameraImage2 = createCameraImage(MainModeForm, { camera: "maincam_dummy2.jpg", thermal: "thermal.png" });
const MainCameraImage3 = createCameraImage(MainModeForm, { camera: "maincam_dummy3.jpg", thermal: "thermal.png" });
const SubCameraImage = createCameraImage(SubModeForm, { front: "front.jpg", rear: "rear.jpg" });

//#endregion

//#region カメラ操作
/**
 * カメラ操作
 */
const CameraOperationWell = ({ isReadOnly, height, onChange: handleChange }) => {
    return (
        <Well>
            <div className="flex-top-left flex-wrap">
                <PanTilt />
                <Lifting height={height} />
                <Zoom />
            </div>            
        </Well>
    );
}

/**
 * パン・チルト操作用コンポーネント
 */
const PanTilt = () => {
    return (
        <div className="camera-pantilt mlr-05">
            <label className="mr-1">パン・チルト:</label>
            <div className="flex-column">
                <div className="flex-center">
                    <Button className="btn-primary">
                        <Icon className="fal fa-caret-up" />
                    </Button>
                </div>
                <div className="flex-center">
                    <Button className="btn-primary">
                        <Icon className="fal fa-caret-left" />
                    </Button>
                    <Button className="btn-primary mlr-05 mtb-05">
                        <Icon className="fal fa-home" />
                    </Button>
                    <Button className="btn-primary">
                        <Icon className="fal fa-caret-right" />
                    </Button>
                </div>
                <div className="flex-center">
                    <Button className="btn-primary">
                        <Icon className="fal fa-caret-down" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * 昇降操作用コンポーネント
 */
const Lifting = ({height, onChange:handleChange}) => {
    return (
        <div className="mlr-05">
            <label className="mr-1">昇降:</label>
            <div className="flex-center-left">
                <ButtonGroup vertical className="mlr-05">
                    <Button className="btn-primary">
                        <Icon className="fal fa-chevron-up mtb-1" />
                    </Button>
                    <Button className="btn-primary">
                        <Icon className="fal fa-stop" />
                    </Button>
                    <Button className="btn-primary">
                        <Icon className="fal fa-chevron-down mtb-1" />
                    </Button>
                </ButtonGroup>
                <div style={{display:"flex"}}>
                    <div>
                        <input
                            className="slider"
                            type="text"
                            data-provide="slider"
                            data-slider-orientation="vertical"
                            data-slider-min="0"
                            data-slider-max="180"
                            data-slider-step="1"
                            data-slider-value={height}
                            data-slider-reversed={true}
                            data-slider-tooltip="always"
                        />
                    </div>
                    <div class="flex-column-between">
                        <span id="sliderLabelUpper">180</span>
                        <span id="sliderLabelLower">0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * ズーム操作用コンポーネント
 */
const Zoom = () => {
    return (
        <div className="flex-column  mlr-05">
            <label className="mr-1">ズーム:</label>
            <ButtonGroup>
                <Button className="btn-primary">
                    <Icon className="fal fa-minus mlr-2" />
                </Button>
                <Button className="btn-primary">
                    <Icon className="fal fa-plus mlr-2" />
                </Button>
            </ButtonGroup>
        </div>
    );
}
//#endregion
//#endregion

//#region フロアマップボックス
/**
 * フロアマップボックス
 */
const FloorMapBox = ({ isLoading, cameraList, selectCameraId }) => {
    return (
        <Box boxStyle='default' isLoading={isLoading}>
            <Box.Header>
                <Box.Title>フロアマップ</Box.Title>
            </Box.Header >
            <Box.Body>
                <div className="flex-center">
                    <svg
                        width="640"
                        height="480"
                        viewBox={"0 0 " + DRAW_AREA_SIZE.width + " " + DRAW_AREA_SIZE.height}
                    >
                        <ImageLayer id="backgroundImage" imagePath={"./FloorMapImage/sampleME.svg"} />
                        <CameraObjectLayer cameraList={cameraList} selectCameraId={selectCameraId} />
                    </svg>
                </div>
            </Box.Body>
        </Box>
    );
}

//#endregion

//#region 設定・操作ボックス
/**
 * 設定・操作ボックス
 */
const SettingBox = ({ isLoading, setting, onChange:handleChange }) => {
    return (
        <Box isLoading={isLoading}>
            <Box.Header>
                <Box.Title>設定・操作</Box.Title>
            </Box.Header >
            <Box.Body>
                <div className="flex-center-left flex-wrap">
                    {setting.map((info) => {
                        return <SettingForm name={info.name} value={info.value} id={info.id} onChange={handleChange} />
                    })}
                </div>
            </Box.Body>
        </Box>
    );
}

/**
 * 設定フォーム
 */
const SettingForm = ({ name, value, id, onChange:handleChange}) => {
    return (
        <div className="mb-05 mr-2">
            <label className="mr-1">{name}</label>
            <CheckboxSwitch text="ON" checked={value} onChange={handleChange.bind(this, id)} />
        </div>
    );
}
//#endregion