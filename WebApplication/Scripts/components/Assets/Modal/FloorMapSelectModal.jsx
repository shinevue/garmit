/**
 * @license Copyright 2018 DENSO
 * 
 * ロケーション選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';

import LayoutSelectForm from 'Assets/FloorMap/LayoutSelectForm.jsx';
import FloorMapBox from 'Assets/FloorMap/FloorMapBox';
import MessageModal from 'Assets/Modal/MessageModal';
import { ApplyButton, CancelButton } from 'Assets/GarmitButton';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { MAP_DRAWING_AREA_INIT, MAP_TRANSITION_TYPE, LINK_TYPE } from 'constant';

const LAYOUT_LOG_MAX_LENGTH = 20;
const LAYOUT_LOG_INIT = {
    logs: [],
    pointer: -1,
    canBack: false,
    canForward: false
};

/**
 * フロアマップ（ロケーション）選択モーダル
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {number} idKey キー
 * @param {array} layoutList レイアウトリスト
 * @param {object} selectedLayoutObject 選択中のレイアウトオブジェクト
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onApply 適用ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタン or ×ボタン クリック時に呼び出す
 */
export default class FloorMapSelectModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedLayout: null,
            selectedLayoutObject: null,
            drawingArea: _.cloneDeep(MAP_DRAWING_AREA_INIT),
            layoutLogInfo: _.cloneDeep(LAYOUT_LOG_INIT),
            isLoading: false,
            messageModal: {
                show: false,
                title: '',
                message: ''
            }
        };
    }

    //#region ライフサイクル

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.setDrawingArea(this.props.idKey);

        //画面サイズ変更イベントを設定
        window.addEventListener('resize', () => {
            this.setDrawingArea(this.props.idKey);
        });       
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        const show = nextProps.showModal != this.props.showModal && nextProps.showModal
        if (show) {
            if (nextProps.selectedLayoutObject) {
                this.setLayout(nextProps.selectedLayoutObject.layoutId, _.cloneDeep(nextProps.selectedLayoutObject), true);
            } else {
                this.clearSelectInfo();
            }
            this.setDrawingArea(nextProps.idKey);
        } else if (nextProps.showModal && this.state.selectedLayout) {
            this.setDrawingArea(nextProps.idKey);
        }
    }

    /**
     * Componentが更新された後に呼ばれます。初回時には呼ばれません。
     * @param {*} prevProps 変更前のprops
     * @param {*} prevState 変更前のstate
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.props.showModal && !prevState.selectedLayout && this.state.selectedLayout) {
            this.setDrawingArea(this.props.idKey);
        }
    }

    //#endregion

    render() {
        const { showModal, layoutList, isLoading: propsLoading, idKey } = this.props;
        const { selectedLayout, selectedLayoutObject, drawingArea, layoutLogInfo, isLoading, messageModal } = this.state;
        const loading = propsLoading||isLoading;
        const floorMapProps = {
            floorMapInfo: { drawingArea: drawingArea },
            selectLayout: selectedLayout,
            selectObjectInfo: {
                selectObject: selectedLayoutObject
            },
            selectedLayoutList: {
                layoutIdList: layoutLogInfo.logs,
                index: layoutLogInfo.pointer,
                canBack: layoutLogInfo.canBack,
                canForward:layoutLogInfo.canForward
            },
            floorMapOptionInfo: [],
            selectableLinkTypes: [ LINK_TYPE.location, LINK_TYPE.layout ],
            authCheckable: true
        };

        return (
            <Modal show={showModal} bsSize="large" backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>フロアマップ（ロケーション）選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LayoutSelectForm
                        layoutList={layoutList}
                        selectLayout={selectedLayout}
                        isReadOnly={loading}
                        treeViewMaxHeight={600}
                        onChangeSelectLayout={(selectLayout) => this.setLayout(selectLayout.layoutId)}
                    />
                    <div id={'floorMapBox' + (idKey||'')}>
                        <FloorMapBox
                            isLoading={loading}
                            idKey={idKey}
                            floorMapProps={floorMapProps}
                            onClickObject={this.handleClickObject}
                            onClickMapTransition={this.handleClickMapTransition}  
                        />
                    </div>
                    <MessageModal
                        show={messageModal.show}
                        title={messageModal.title}
                        bsSize="small"
                        buttonStyle="message"
                        onCancel={() => this.clearMessage()}
                        disabled={loading}
                    >
                        {messageModal.message}
                    </MessageModal>
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton
                        onClick={this.handleApply}
                        disabled={selectedLayoutObject ? (!selectedLayoutObject.isAllowed) : true}
                    />
                    <CancelButton
                        onClick={this.handleCancel}
                    />
                </Modal.Footer>
            </Modal>
        )
    }

    //#region イベントハンドラ

    /**
     * 適用ボタンクリック
     */
    handleApply = () => {
        if (this.props.onApply) {
            this.props.onApply(this.state.selectedLayoutObject);
        }
        this.clearSelectInfo();
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.clearSelectInfo();
    }
    
    /**
     * マップ遷移ボタンクリックイベントハンドラ
     * @param {number} type 遷移種別
     */
    handleClickMapTransition = (type) => {
        if (type !== MAP_TRANSITION_TYPE.referrer) {
            this.backForwardFloorMap(type);
        }
    }
    
    /**
     * オブジェクトクリックイベントハンドラ
     * @param {object} selectObject オブジェクト
     * @param {bool} isDoubleClick ダブルクリックかどうか
     */
    handleClickObject = (selectObject, isDoubleClick) => {
        if (isDoubleClick) {
            if (selectObject.linkType === LINK_TYPE.layout && selectObject.isAllowed) {
                this.setLayout(selectObject.layout.layoutId);       //レイアウト遷移
            }
        } else {
            if (selectObject.linkType === LINK_TYPE.location && selectObject.isAllowed) {
                this.setState({
                    selectedLayoutObject: _.cloneDeep(selectObject)        //オブジェクトを選択中とする
                });
            }
        }
    }

    //#endregion

    //#region レイアウト情報セット

    /**
     * レイアウトをセットする
     * @param {number} layoutId レイアウトID
     * @param {object} layoutObject 選択するレイアウトオブジェクト
     * @param {boolean} isClaerLayoutLogs レイアウト遷移ログをクリアするかどうか
     */
    setLayout(layoutId, layoutObject = null, isClaerLayoutLogs = false) {
        const beforeLogInfo = isClaerLayoutLogs ? _.cloneDeep(LAYOUT_LOG_INIT) : this.state.layoutLogInfo;
        this.loadLayout(layoutId, (layout) => {
            if (layoutObject) {
                layout.layoutObjects = this.moveToEndOfLayoutObjects(layout.layoutObjects, layoutObject);
            }
            this.setState({
                selectedLayout: layout,
                selectedLayoutObject: layoutObject && _.cloneDeep(layoutObject),
                layoutLogInfo: this.getAddLayoutLogInfo(beforeLogInfo, layoutId)   //レイアウト遷移ログを記録
            })
        });
    }

    /**
     * 表示フロアマップを戻るor進める
     * @param {number} type マップ遷移種別
     */
    backForwardFloorMap(type) {
        const { layoutLogInfo } = this.state;
        const direction = (type === MAP_TRANSITION_TYPE.back) ? -1 : 1;
        const layoutId = layoutLogInfo.logs[layoutLogInfo.pointer + direction];
        this.loadLayout(layoutId, (layout) => {
            this.setState({
                selectedLayout: layout,
                selectedLayoutObject: layoutObject && _.cloneDeep(layoutObject),
                layoutLogInfo: this.getChangePointerLayoutLogInfo(this.state.layoutLogInfo, direction)          //レイアウト遷移ログで表示中のインデックスを戻るor進める
            });
        });
    }

    /**
     * フロアマップを読み込む
     * @param {number} layoutId レイアウトID
     * @param {function} callback コールバック関数
     */
    loadLayout(layoutId, callback) {
        this.chnageLoadState(true, () => {
            const postData = { layoutInfo: { layoutId: layoutId } };
            sendData(EnumHttpMethod.post, '/api/floorMap/layout', postData, (data, networkError) => {
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else if (data) {
                    const layout = _.omit(data.layout, ['parent', 'children', 'level', 'location', 'updateUserId', 'updateDate', 'operationLogs']);
                    this.chnageLoadState(false ,() => {
                        callback && callback(layout);
                    });
                } else {
                    this.showErrorMessage('マップ情報取得に失敗しました。')
                }
            });
        })
    }

    //#endregion

    //#region フロアマップ遷移ログ関連

    /**
     * レイアウトログに追加する
     * @param {object} beforeLogInfo 変更前のレイアウトログ情報
     * @param {number} layoutId ログに追加するレイアウトID
     */
    getAddLayoutLogInfo(beforeLogInfo, layoutId) {
        let update = _.cloneDeep(beforeLogInfo);
        const nextPointer = beforeLogInfo.pointer + 1;

        //表示中のレイアウトID以降の情報を削除
        update.logs.splice(nextPointer, beforeLogInfo.logs.length - nextPointer);
        
        //記録できるのは21個までとする(20回戻れる) 
        //既に21個目以上のログがある場合は、先頭を削除
        if(update.logs.length > LAYOUT_LOG_MAX_LENGTH) {
            update.logs.shift();
            update.pointer--;
        }

        //ログ追加/各パラメータの設定
        update.logs.push(layoutId);        
        update.pointer++;
        update.canBack = this.getCanBack(update.pointer);
        update.canForward = this.getCanForward(update.logs.length,update.pointer);

        return update;
    }

    /**
     * 表示中のインデックスを変更する
     * @param {object} beforeLogInfo 変更前のレイアウトログ情報
     * @param {number} index pointerをどれくらい進めるか（-1 or 1）
     */
    getChangePointerLayoutLogInfo(beforeLogInfo, index) {
        let update = _.cloneDeep(beforeLogInfo);
        update.pointer += index;
        update.canBack = this.getCanBack(update.pointer);
        update.canForward = this.getCanForward(update.logs.length, update.pointer);
        return update;
    }

    /**
     * 「一つ戻る」ボタンが操作可能かどうか
     * @param {number} pointer 現在表示中のレイアウトのインデックス
     */
    getCanBack(pointer) {
        return pointer === 0 ? false : true;
    }

    /**
     * 「一つ次に進む」ボタンが操作可能かどうか
     * @param {number} logsLength ログの長さ
     * @param {number} pointer 現在表示中のレイアウトのインデックス
     */
    getCanForward(logsLength, pointer) {
        return logsLength === (pointer + 1) ? false : true;
    }

    //#endregion

    //#region フロアマップ表示関連

    /**
     * 指定のレイアウトオブジェクトを最後に移動する
     * @param {array} layoutObjects レイアウトオブジェクト一覧
     * @param {object} targetLayoutObject 最後に移動するレイアウトオブジェクト
     */
    moveToEndOfLayoutObjects(layoutObjects, targetLayoutObject) {
        const target = layoutObjects.find((obj) => obj.objectId === targetLayoutObject.objectId);
        let objects = layoutObjects.filter((obj) => obj.objectId !== targetLayoutObject.objectId);
        objects.push(target);
        return objects;
    }

    /**
     * 描画エリアの幅と高さをセットする
     */
    setDrawingArea(key) {
        const { width, height } = this.state.drawingArea;

        //フロアマップボックスの幅から描画エリアの幅と高さを取得
        var boxBody = $("#floorMapBox"+ (key||'')).children(".box")[0];
        if (boxBody) {
            const newWidth = boxBody.clientWidth - 20;
            const newHeight = newWidth * height / width;
    
            this.setState({
                drawingArea: {
                    width: newWidth,
                    height: newHeight
                }
            });
        }
    }

    //#endregion

    //#region メッセージモーダル関連

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            messageModal: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージをクリアする
     */
    closeMessage() {
        this.setState({
            messageModal: {
                show: false,
                title: '',
                message: ''
            }
        })
    }

    //#endregion

    //#region その他(stateセット等)

    /**
     * ロード中かどうかのみを変更する
     * @param {boolean} isLoading 変更後のロード中かどうか
     * @param {function} callback コールバック関数
     */
    chnageLoadState(isLoading, callback) {
        this.setState({ isLoading }, () => {
            callback && callback();
        });
    }

    /**
     * 選択中の情報をクリアする
     */
    clearSelectInfo() {
        this.setState({
            selectedLayout: null,
            selectedLayoutObject: null,
            layoutLogInfo: _.cloneDeep(LAYOUT_LOG_INIT)
        });
    }

    //#endregion
}

FloorMapSelectModal.propTypes = {
    showModal: PropTypes.bool,
    layoutList: PropTypes.array,
    selectedLayoutObject: PropTypes.object,
    onApply: PropTypes.func,
    onCancel: PropTypes.func
}

FloorMapSelectModal.defaultProps = {
    showModal: false,
    layoutList: [],
    selectedLayoutObject: {},
    onApply: () => { },
    onCancel: () => { }
}