/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkPathView Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { ButtonToolbar, ButtonGroup, OverlayTrigger, Popover, Form, Clearfix } from 'react-bootstrap';
import { ReactSVGPanZoom,} from 'react-svg-pan-zoom';
import LabelForm from 'Common/Form/LabelForm';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import NetworkNameObject from './Object/NetworkNameObject';
import RectObject from './Object/RectObject';
import TextObject from './Object/TextObject';
import ImageObject from './Object/ImageObject';

const UNITOBJECT_SIZE = {
    width: 150,
    height: 20
};
const NETWORKNAME_SIZE = {
    width: 120,
    height: 40
};
const NETWORK_LINE_LENGTH = 200;
const UNIT_MARGIN_VERTICAL = 100;
const NETWORK_SHIFT_YDIRECTION = UNITOBJECT_SIZE.height / 2;
const MARGIN_NETWORK_VIEW = 30;
const DRAWAERA_HEIGHT_MIN = 200;
const MARING_DRAWAREA_BUTTOM = 90;
const NETWORK_NAME_MAXLENGTH = 20;

/**
 * ネットワーク経路表示ビューコンポーネント
 * @param {object} networkPath ネットワーク経路（Form/To入り）
 * @param {object} selectedNetworkId 選択したネットワークID
 * @param {function} onSelect ネットワーク経路選択時に呼び出す
 */
export default class NetworkPathView extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);        
        this.state = {
            objects: {
                networks: [],
                units: []
            },
            drawingAreaWidth: 1,
            dragMode: false,
            dragInfo: {
                isMouseDown: false,
                targetUnitId: null,
                coords: {}, 
                xDiff: 0,
                yDiff: 0
            }
        };
        this.maxYPoint = 0;
        this.maxXPoint = 0;
        this.minXPoint = 0;
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.setDrawingAreaWidth();

        //画面サイズ変更イベントを設定
        window.addEventListener('resize', () => {
            this.setDrawingAreaWidth();
        });
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (!_.isEqual(nextProps.networkPath, this.props.networkPath)) {
            this.setState({ objects: this.setObjectProperties(nextProps.networkPath)});
        }
    }

    /**
     * 新しいpropsまたはstateを受け取り、renderされる前に呼び出される。
     * 新しいpropsとstateへの変更がコンポーネントの更新を必要としない場合はfalseを返却する。
     * falseを返すと、以降のcomponentWillUpdate(), render(), componentDidMount()の処理がスキップされる。
     * @param {*} nextProps 新しいprops
     * @param {*} nextState 新しいstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        const propsDiff = _.isEqual(nextProps, this.props);
        const stateDiff = _.isEqual(nextState, this.state);
        return !(propsDiff && stateDiff);
    }

    /**
     * Componentが更新された後に呼ばれます。初回時には呼ばれません。
     * @param {*} prevProps 前回のprops
     * @param {*} prevState 前回のstate
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.NetworkViewBase.clientWidth !== this.state.drawingAreaWidth) {
            this.setDrawingAreaWidth();
        }
                
        if (!_.isEqual(prevState.objects, this.state.objects)) {
            this.Viewer.fitToViewer();
        }
    }

    /**
     * render
     */
    render() {
        const { selectedNetworkId } = this.props;
        const { objects, drawingAreaWidth, dragMode, dragInfo } = this.state;
        const networks = objects&&objects.networks;
        const units = objects&&objects.units;
        const shiftX = MARGIN_NETWORK_VIEW - this.minXPoint;
        const drawSize = {
            height: this.maxYPoint + MARGIN_NETWORK_VIEW,
            width: this.maxXPoint - this.minXPoint + MARGIN_NETWORK_VIEW * 2
        };
        const drawingHeight = this.getDrawingAreaHeight(drawSize, drawingAreaWidth);
        return (
            <div >
                <Clearfix>
                    <CheckboxSwitch text="選択モード" checked={!dragMode} bsSize="sm" onChange={() => this.changeDragMode()} />
                    <NetworkViewToolButtonGroup className="pull-right" Viewer={this.Viewer} />
                </Clearfix>
                <div className="network-view-base" 
                     ref={NetworkViewBase => this.handleSetNetworkViewBase(NetworkViewBase)}
                     onMouseLeave={() => this.handleMouseLeave()}>
                    <ReactSVGPanZoom
                        width={drawingAreaWidth} 
                        height={drawingHeight}
                        background="white"
                        scaleFactorOnWheel={1.1}
                        detectAutoPan={false}
                        disableDoubleClickZoomWithToolAuto={true}
                        tool={dragMode?"none":null}
                        toolbarPosition="none"
                        miniaturePosition="left"
                        ref={Viewer => this.handleSetViewer(Viewer)}
                        onMouseMove={(e) => this.handleMouseMove(e)}
                        onMouseUp={() => this.handleMouseUp()}
                    >
                        <svg width={drawSize.width} height={drawSize.height + MARING_DRAWAREA_BUTTOM} viewBox={"0 0 " + drawSize.width + " " + drawSize.height} > 
                            {networks&&networks.length>0&&
                                networks.slice().reverse().map((network) => 
                                <NetworkConnectLine {...network}
                                                    startPoint={{ x: network.startPoint.x + shiftX, y: network.startPoint.y}}
                                                    endPoint={{ x: network.endPoint.x + shiftX , y: network.endPoint.y}}
                                                    xDiffStart={network.fromUnitId === dragInfo.targetUnitId ? dragInfo.xDiff : 0}
                                                    yDiffStart={network.fromUnitId === dragInfo.targetUnitId ? dragInfo.yDiff : 0}
                                                    xDiffEnd={network.toUnitId === dragInfo.targetUnitId ? dragInfo.xDiff : 0}
                                                    yDiffEnd={network.toUnitId === dragInfo.targetUnitId ? dragInfo.yDiff : 0}
                                                    isSelected={network.networkId===selectedNetworkId} 
                                                    dragMode={dragMode}
                                />
                            )}
                            {units&&units.length>0&&
                                units.map((unit) => 
                                    <UnitObject {...unit}
                                                dragMode={dragMode}
                                                position={{ x: unit.position.x + shiftX, y: unit.position.y }}
                                                xDiff={unit.unitId === dragInfo.targetUnitId ? dragInfo.xDiff : 0}
                                                yDiff={unit.unitId === dragInfo.targetUnitId ? dragInfo.yDiff : 0}
                                                isSelected={unit.networkIds.indexOf(selectedNetworkId) >= 0} 
                                                onMouseDown={(e, unitId, position) => this.handleMouseDownUnit(e, unitId, position)}
                                    />                
                            )}
                        </svg>
                    </ReactSVGPanZoom>
                </div>
            </div>
        );
    }

    /**
     * 選択ネットワークの変更イベント
     * @param {object} networkPath 選択したネットワーク経路
     * @param {boolean} isExchange 接続元と先で高価が必要かどうか
     */
    changeNetwork(networkPath, isExchange) {
        if (!this.state.dragMode && this.props.onSelect) {
            this.props.onSelect(networkPath, isExchange);
        }
    }

    /**
     * 描画エリアの幅をセットする
     * @param {boolean} isFit 幅をセットした後に描画をフィットさせるか
     */
    setDrawingAreaWidth(isFit) {
        this.setState({ drawingAreaWidth: this.NetworkViewBase.clientWidth}, () => {
            if (isFit) {
                this.Viewer.fitToViewer();
            }
        });        
    }

    /**
     * 描画エリアの幅
     * @param {*} drawSize 
     * @param {*} drawingAreaWidth 
     */
    getDrawingAreaHeight(drawSize, drawingAreaWidth) {        
        var drawingHeight = drawSize.height;
        if (DRAWAERA_HEIGHT_MIN > drawingHeight) {
            drawingHeight = DRAWAERA_HEIGHT_MIN;
        } else {
            drawingHeight = drawingAreaWidth * drawSize.height / drawSize.width;
        }
        drawingHeight += MARING_DRAWAREA_BUTTOM;
        return drawingHeight;
    }
    
    /**
     * ユニット移動モードを変更する
     */
    changeDragMode() {
        this.setState({
            dragMode: !this.state.dragMode
        });
    }

    //#region ドラッグ＆ドロップ

    /********************************************
     * ドラッグ＆ドロップ
     ********************************************/

    /**
     * SVG内でのマウスアップイベント
     */
    handleMouseUp() {
        if (this.state.dragInfo.isMouseDown) {
            this.resetDragInfo();
        }
    }
    
    /**
     * SVG内でのマウスムーブイベント
     */
    handleMouseMove(e) {
        const { dragInfo } = this.state;
        if (dragInfo.isMouseDown) {
            const xDiff = dragInfo.coords.x - e.point.x;
            const yDiff = dragInfo.coords.y - e.point.y;
            this.setState({
                dragInfo: Object.assign({}, dragInfo, {
                    coords: {
                        x: e.point.x,
                        y: e.point.y
                    },
                    xDiff: xDiff,
                    yDiff: yDiff
                })
            });
        }
    }

    /**
     * SVG領域からマウスが外れたときのイベント
     */
    handleMouseLeave() {
        if (this.state.dragInfo.isMouseDown) {
            this.resetDragInfo();
        }
    }

    /**
     * ユニットにマウスダウンしたときのイベント
     * @param {*} e 
     * @param {string} unitId マウスダウンされたユニットのID
     * @param {object} position ユニットのsvg内での位置 { x: , y: }
     */
    handleMouseDownUnit(e, unitId, position) {
        var point = this.svgPoint(e.currentTarget, e.clientX, e.clientY);
        this.setState({
            dragInfo: Object.assign({}, this.state.dragInfo, {
                isMouseDown: true,
                targetUnitId: unitId,
                coords: {
                    x: point.x + position.x,
                    y: point.y + position.y
                }
            })
        });
    }

    /**
     * SVGポイントを取得する
     * @param {element} element 要素
     * @param {number} x 
     * @param {number} y 
     */
    svgPoint(element, x, y) {
        var point = (this.Viewer.ViewerDOM).createSVGPoint();      
        point.x = x;
        point.y = y;      
        return point.matrixTransform(element.getScreenCTM().inverse());
    }

    /**
     * ドラッグ情報をリセットする
     */
    resetDragInfo() {
        this.setState({
            dragInfo: {
                isMouseDown: false,
                targetUnitId: null,
                coords: {}, 
                xDiff: 0,
                yDiff: 0
            }
        });
    }

    //#endregion
    
    //#region 参照設定

    /********************************************
     * 参照設定
     ********************************************/

    /**
     * ReactZoomPan参照設定
     */
    handleSetViewer(Viewer) {
        if (!this.Viewer) {
            this.Viewer = Viewer;
            this.Viewer.changeTool("auto"); //初期選択ツール設定
        }
    }

    /**
     * ネットワーク経路表示の描画ベースの参照設定
     * @param {any} NetworkViewBase 
     */
    handleSetNetworkViewBase(NetworkViewBase) {
        if (!this.NetworkViewBase) {
            this.NetworkViewBase = NetworkViewBase;
        }
    }

    //#endregion

    //#region オブジェクトのプロパティ作成

    
    /********************************************
     * オブジェクトのプロパティ作成
     ********************************************/

    /**
     * オブジェクトプロパティリストを作成する
     * @param {object} networkPath 対象のネットワーク
     */
    setObjectProperties(networkPath) {
        const INIT_YPOSITION = MARGIN_NETWORK_VIEW;
        const isAllowed = networkPath.rackTo.location.isAllowed;
        this.maxYPoint = INIT_YPOSITION + UNITOBJECT_SIZE.height;
        this.maxXPoint = UNITOBJECT_SIZE.width * 2 + NETWORK_LINE_LENGTH;
        this.minXPoint = 0;
        var objects = { 
            networks:[this.makeNetworkProperty(
                            networkPath, 
                            { x: UNITOBJECT_SIZE.width, y: INIT_YPOSITION }, 
                            INIT_YPOSITION + NETWORK_SHIFT_YDIRECTION,
                            true
                     )], 
            units: [
                this.makeUnitProperty(
                    networkPath.unitFrom, 
                    networkPath.portFrom, 
                    { x: -NETWORK_LINE_LENGTH, y: INIT_YPOSITION }, 
                    this.getNetworkIds(networkPath, networkPath.networksFrom),
                    true
                ),
                this.makeUnitProperty(
                    networkPath.unitTo, 
                    networkPath.portTo, 
                    {x: UNITOBJECT_SIZE.width, y: INIT_YPOSITION}, 
                    this.getNetworkIds(networkPath, networkPath.networksTo),
                    true,
                    isAllowed
                )
            ] 
        };

        if (networkPath.networksFrom && networkPath.networksFrom.length > 0) {
            let fromObjects = this.getNetwrokObjectProperties(networkPath.networksFrom, { x: 0, y: INIT_YPOSITION } ,INIT_YPOSITION + NETWORK_SHIFT_YDIRECTION, false);
            objects.networks = objects.networks.concat(fromObjects.networks);
            objects.units = objects.units.concat(fromObjects.units);
        }

        if (isAllowed && networkPath.networksTo && networkPath.networksTo.length > 0) {
            let toObjects = this.getNetwrokObjectProperties(networkPath.networksTo, { x: (UNITOBJECT_SIZE.width*2 + NETWORK_LINE_LENGTH) , y: INIT_YPOSITION }, INIT_YPOSITION + NETWORK_SHIFT_YDIRECTION, true);
            objects.networks = objects.networks.concat(toObjects.networks);
            objects.units = objects.units.concat(toObjects.units);
        }
        
        return objects;
    }

    /**
     * ネットワークオブジェクトプロパティリストを作成する
     * @param {array} networkPaths 対象ネットワーク一覧
     * @param {object} startPosition ネットワークオブジェクトを描画する開始ポイント { x: , y:  }
     * @param {number} networkStartY ネットワークの開始Y位置
     * @param {boolean} isPlusDirection プラス方向にシフトするかどうか
     * @param {object} networkFrom 接続元のネットワーク
     */
    getNetwrokObjectProperties(networkPaths, startPosition, networkStartY, isPlusDirection) {
        var objects = { networks:[], units: [] };
        var yPoint = startPosition.y;
        networkPaths.forEach((nw, index) => {
            const isAllowed = nw.rackTo.location.isAllowed;
            let objectPoistion = { x: startPosition.x, y: yPoint};
            let network = this.makeNetworkProperty(
                                nw, 
                                objectPoistion,
                                networkStartY,
                                isPlusDirection
                          );
            let unit = this.makeUnitProperty(
                            nw.unitTo, 
                            nw.portTo, 
                            objectPoistion, 
                            this.getNetworkIds(nw, nw.networksTo), 
                            isPlusDirection,
                            isAllowed
                        );
            objects.networks.push(network);
            objects.units.push(unit);

            //子要素を確認
            if (isAllowed && nw.networksTo && nw.networksTo.length > 0) {
                let childXShift = (NETWORK_LINE_LENGTH + UNITOBJECT_SIZE.width) * (isPlusDirection ? 1 : -1);
                let childObjects = this.getNetwrokObjectProperties(
                                        nw.networksTo, 
                                        { x: startPosition.x + childXShift, y: yPoint }, 
                                        yPoint + NETWORK_SHIFT_YDIRECTION,
                                        isPlusDirection
                                    );
                objects.networks = objects.networks.concat(childObjects.networks);
                objects.units = objects.units.concat(childObjects.units);

                yPoint = Math.max.apply(null, childObjects.units.map((ob) => ob.position.y));
            }

            const endXPoint = startPosition.x + (UNITOBJECT_SIZE.width + NETWORK_LINE_LENGTH) * (isPlusDirection ? 1 : -1);
            if (this.maxXPoint < endXPoint) {
                this.maxXPoint = endXPoint;
            } else if (this.minXPoint > endXPoint) {
                this.minXPoint = endXPoint;
            }

            if ((networkPaths.length - 1) !== index) {
                let unitHeight = isAllowed ? unit.height : 1;
                yPoint = yPoint + unitHeight + UNIT_MARGIN_VERTICAL;
            }
        });

        if (this.maxYPoint < yPoint) {
            this.maxYPoint = yPoint;
        }

        return objects;
    }


    /**
     * ネットワークオブジェクトのプロパティを作成する
     * @param {object} networkPath ネットワーク経路情報
     * @param {object} position オブジェクトの位置（左上の点） { x: , y:  }
     * @param {number} networkStartY ネットワークの開始Y位置
     * @param {boolean} isPlusDirection プラス方向にシフトするかどうか
     * @returns {object} ネットワークオブジェクトのプロパティ
     */
    makeNetworkProperty(networkPath, position, networkStartY, isPlusDirection) {
        const endX = position.x + ((isPlusDirection ? 1 : -1) * NETWORK_LINE_LENGTH);
        return {
            networkId: networkPath.network.networkId,
            fromUnitId: networkPath.unitFrom&&networkPath.unitFrom.unitId,
            toUnitId: networkPath.unitTo&&networkPath.unitTo.unitId,
            name: networkPath&&networkPath.network&&networkPath.network.name,
            startPoint: { x: position.x, y: networkStartY},
            endPoint: { x: endX , y: position.y + UNITOBJECT_SIZE.height / 2},
            onSelect: () => this.changeNetwork(networkPath, !isPlusDirection)
        };
    }

    /**
     * ユニットオブジェクトのプロパティを作成する
     * @param {object} unit ユニット情報
     * @param {object} port ポート情報
     * @param {object} position オブジェクトの位置（左上の点） { x: , y:  }
     * @param {array} networkIds 関係するネットワークIDリスト
     * @param {boolean} isPlusDirection プラス方向にシフトするかどうか
     * @param {boolean} isAllowed 許可されているかどうか
     */
    makeUnitProperty(unit, port, position, networkIds, isPlusDirection, isAllowed = true) {
        const xPosition = position.x + 
                          (isPlusDirection ? 
                                NETWORK_LINE_LENGTH 
                                : 
                                (NETWORK_LINE_LENGTH + UNITOBJECT_SIZE.width) * -1 
                          );
        if (isAllowed) {
            return {
                networkIds: networkIds,
                unitId: unit.unitId,
                unitName: unit.name,
                typeName: unit.type.name,
                portName: port.portNo + '(' + port.name + ')',
                fontSize: unit.fontSize,
                textColor: unit.textColor,
                backColor: unit.backColor,
                imageUrl: unit.frontUnitImage && unit.frontUnitImage.url,
                position: { x: xPosition, y: position.y },
                height: unit.size.height * UNITOBJECT_SIZE.height
            };
        } else {
            return {
                networkIds: networkIds,
                unitId: unit.unitId,
                unitName: '(権限なし)',
                typeName: '(権限なし)',
                portName: '(権限なし)',
                fontSize: 8,
                textColor: '#000000',
                backColor: '#FFFFFF',
                imageUrl: null,
                position: { x: xPosition, y: position.y },
                height: UNITOBJECT_SIZE.height
            };
        }
    }

    /**
     * ネットワークIDリストを取得する
     * @param {object} fromNetwrokPath 接続元のネットワーク経路情報
     * @param {array} toNetworkPaths 接続先のネットワーク経路情報リスト
     * @returns {array} ネットワークIDリスト
     */
    getNetworkIds(fromNetwrokPath, toNetworkPaths) {
        var networkIds = [];
        if (fromNetwrokPath) {
            networkIds.push(fromNetwrokPath.network.networkId);
        }
        if (toNetworkPaths&&toNetworkPaths.length>0) {
            networkIds = networkIds.concat(toNetworkPaths.map((nw) => nw.network.networkId));
        }
        return networkIds;
    }

    //#endregion

}

/**
 * ネットワーク接続ラインコンポーネント
 * @param {boolean} isSelected 選択されているかどうか
 * @param {string} name ネットワーク名称
 * @param {object} startPoint 開始ポイント { x:1, y:1 }
 * @param {object} endPoint 終了ポイント { x:1, y:1 }
 * @param {function} onSelect ネットワーク選択時に呼び出す
 * @param {number} xDiffStart 移動するX差分(開始点)
 * @param {number} yDiffStart 移動するY差分(開始点)
 * @param {number} xDiffEnd 移動するX差分(終了点)
 * @param {number} yDiffEnd 移動するY差分(終了点)
 */
class NetworkConnectLine extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);        
        this.state = {
            startPoint: {
                x: props.startPoint ? props.startPoint.x : 0,
                y: props.startPoint ? props.startPoint.y : 0
            },
            endPoint: {
                x: props.endPoint ? props.endPoint.x : 0,
                y: props.endPoint ? props.endPoint.y : 0
            }
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { startPoint, endPoint, xDiffStart, yDiffStart, xDiffEnd, yDiffEnd } = nextProps;
        if (!_.isEqual(startPoint, this.props.startPoint) ||
            !_.isEqual(endPoint, this.props.endPoint)) {
            this.setState({
                startPoint: {
                    x: startPoint ? startPoint.x : 0,
                    y: startPoint ? startPoint.y : 0
                },
                endPoint: {
                    x: endPoint ? endPoint.x : 0,
                    y: endPoint ? endPoint.y : 0
                }
            });
        } else if (xDiffStart || yDiffStart || xDiffEnd || yDiffEnd) {
            this.setState({
                startPoint: {
                    x: this.state.startPoint.x - xDiffStart,
                    y: this.state.startPoint.y - yDiffStart
                },
                endPoint: {
                    x: this.state.endPoint.x - xDiffEnd,
                    y: this.state.endPoint.y - yDiffEnd
                }
            });
        }
    }

    /**
     * 新しいpropsまたはstateを受け取り、renderされる前に呼び出される。
     * 新しいpropsとstateへの変更がコンポーネントの更新を必要としない場合はfalseを返却する。
     * falseを返すと、以降のcomponentWillUpdate(), render(), componentDidMount()の処理がスキップされる。
     * @param {*} nextProps 新しいprops
     * @param {*} nextState 新しいstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        const propsDiff = _.isEqual(nextProps, this.props);
        const stateDiff = _.isEqual(nextState, this.state);
        return !(propsDiff && stateDiff);
    }

    render(){
        const { isSelected } = this.props;
        const { startPoint, endPoint } = this.state
        const groupPositionY = (endPoint.y > startPoint.y) ? startPoint.y : endPoint.y;
        return (
            <g>
                <line className={ClassNames('network-view-network-line', (isSelected?' selected':''))} 
                      x1={startPoint.x} 
                      y1={startPoint.y} 
                      x2={endPoint.x} 
                      y2={endPoint.y} 
                />
                { this.makeNetworkNameObject(groupPositionY) }
            </g>
        );
    }

    /**
     * ネットワーク名称オブジェクト
     * @param {number} groupPositionY グループのY位置
     */
    makeNetworkNameObject(groupPositionY) {
        const { isSelected, name, dragMode, networkId } = this.props;
        const { startPoint, endPoint } = this.state
        const classes = {
            selected: isSelected,
            'can-drag': dragMode 
        }
        const networkName = (name && name.length > NETWORK_NAME_MAXLENGTH) ?  name.substring(0, NETWORK_NAME_MAXLENGTH) + '...' : name;
        return <NetworkNameObject 
                    id={networkId}
                    className={ClassNames('network-view-network-name', classes)}
                    position={{
                        x: startPoint.x + (endPoint.x - startPoint.x - NETWORKNAME_SIZE.width)/2,
                        y: Math.abs(endPoint.y - startPoint.y)/2 + groupPositionY - UNITOBJECT_SIZE.height/2
                    }}
                    size={{
                        width: NETWORKNAME_SIZE.width,
                        height: NETWORKNAME_SIZE.height
                    }}
                    dispName={networkName}
                    name={name}
                    onClick={() => this.onSelect()}
                    selectable={!dragMode}
                />;
    }

    /**
     * ネットワークを選択する
     */
    onSelect() {
        if (this.props.onSelect) {
            this.props.onSelect();
        }
    }
}

/**
 * ユニットオブジェクトコンポーネント
 * @param {boolean} isSelected 選択されているかどうか
 * @param {string} unitName ユニット名称
 * @param {string} typeName 種別名称
 * @param {string} portName ポート名称
 * @param {number} fontSize フォントサイズ
 * @param {string} textColor 文字色
 * @param {string} backColor 背景色
 * @param {string} imageUrl 画像URL
 * @param {object} position オブジェクト表示位置 { x:1, y:1 }（搭載位置ではない）
 * @param {number} height オブジェクトの高さ（占有ユニット数ではない）
 * @param {number} xDiff 移動するX差分
 * @param {number} yDiff 移動するY差分
 * @param {function} onMouseDown オブジェクトにマウスダウンされたときに呼び出す
 * @param {boolean} dragMode ドラッグモードかどうか
 */
class UnitObject extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);        
        this.state = {
            position: {
                x: props.position ? props.position.x : 0,
                y: props.position ? props.position.y : 0
            }
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { position, xDiff, yDiff } = nextProps;
        if (!_.isEqual(position, this.props.position)) {
            this.setState({ 
                position: {
                    x: position ? position.x : 0,
                    y: position ? position.y : 0
                }
            });
        } else if (xDiff || yDiff) {
            this.setState({ 
                position: {
                    x: this.state.position.x - xDiff,
                    y: this.state.position.y - yDiff
                }
            });
        }
    }

    /**
     * 新しいpropsまたはstateを受け取り、renderされる前に呼び出される。
     * 新しいpropsとstateへの変更がコンポーネントの更新を必要としない場合はfalseを返却する。
     * falseを返すと、以降のcomponentWillUpdate(), render(), componentDidMount()の処理がスキップされる。
     * @param {*} nextProps 新しいprops
     * @param {*} nextState 新しいstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        const propsDiff = _.isEqual(nextProps, this.props);
        const stateDiff = _.isEqual(nextState, this.state);
        return !(propsDiff && stateDiff);
    }

    render(){
        const { unitName, typeName, portName, dragMode } = this.props;
        const popover = <Popover className="network-view-unit-popover" title={unitName} >
                            <Form className="" >
                                <LabelForm label="種別" value={typeName} />
                                <LabelForm label="ポート" value={portName} />
                            </Form>
                        </Popover>
        return (
            dragMode?
                this.unitView(this.props, this.state)
            :
                <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={popover}>
                   {this.unitView(this.props, this.state)}
                </OverlayTrigger>
        );
    }

    unitView = (props, state) => {
        const { isSelected, unitId, unitName, fontSize, textColor, backColor, imageUrl, height, dragMode } = props;
        const { position } = this.state;
        const classes = {
            selected: isSelected,
            'has-image': imageUrl ? true : false,
            'can-drag': dragMode 
        }
        const objectPosition = isSelected?{ x: 2, y: 2 }:{ x: 0, y: 0 };
        const objectSize = {width: UNITOBJECT_SIZE.width, height: height};
        return (
            <g  id={unitId}
                className={ClassNames('unit', classes)}
                transform={'translate(' + position.x + ',' + position.y + ')'}
                onMouseDown={(e) => this.handleMouseDown(e)}
            >
                <RectObject 
                    id={'unitRect' + unitId}
                    className="unit-rect"
                    position={{ x: 0, y: 0 }} 
                    size={isSelected?{ width: objectSize.width + 4 , height: objectSize.height + 4 }:objectSize}
                    style={{ backColor: backColor }}
                    overlayInfo={{ placement: 'bottom', rootClose: true, trigger: "click" }}
                />
                {imageUrl&&
                    <ImageObject 
                        position={objectPosition} 
                        size={objectSize}
                        imagePath={imageUrl}
                        preserveAspectRatio="none" 
                    />
                }
                <TextObject 
                    id={'unitText' + unitId} 
                    className="unit-text"
                    position={objectPosition} 
                    size={objectSize} 
                    text={unitName} 
                    style={{ fontSize: fontSize, fontColor: textColor, fontWeight: 'bold' }}
                    isBreakWord
                    isBackground={imageUrl ? true : false}
                />
            </g>
        )
    }

    /**
     * オブジェクトのマウスダウンイベント
     */
    handleMouseDown(e) {
        if (this.props.dragMode && this.props.onMouseDown) {
            this.props.onMouseDown(e, this.props.unitId, this.state.position);
        }
    }
}

/**
 * ネットワーク経路表示用ツールボタングループ
 */
export const NetworkViewToolButtonGroup = ({ className, Viewer }) => {
    return (
        <ButtonToolbar className={className}>
            <ButtonGroup>
                <Button onClick={() => Viewer.zoomOnViewerCenter(1.1)} >
                    <Icon className="fal fa-search-plus" />
                </Button>
                <Button onClick={() => Viewer.zoomOnViewerCenter(0.9)}>
                    <Icon className="fal fa-search-minus" />
                </Button>
            </ButtonGroup>
            <ButtonGroup>
                <Button onClick={() => Viewer.fitToViewer()}>
                    <Icon className="fal fa-arrows-alt" />
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    );
}

NetworkPathView.propTypes = {
    networkPath: PropTypes.shape({
        network: PropTypes.shape({
            networkId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            cableType: PropTypes.shape({
                cableId: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
            cableStandard: PropTypes.string,
            speed: PropTypes.string,
            bandWidth: PropTypes.string,
            comment: PropTypes.string
        }),
        rackFrom: PropTypes.shape({ 
            rackName: PropTypes.string 
        }),
        unitFrom: PropTypes.shape({ 
            unitId: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired, 
            type: PropTypes.shape({ 
                name: PropTypes.string
            }).isRequired
        }),
        portFrom: PropTypes.shape({ 
            portNo: PropTypes.number.isRequired, 
            name: PropTypes.string 
        }),
        portIndexFrom: PropTypes.number.isRequired, 
        rackTo: PropTypes.shape({ 
            rackName: PropTypes.string 
        }),
        unitTo: PropTypes.shape({ 
            unitId: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired, 
            type: PropTypes.shape({ 
                name: PropTypes.string
            }).isRequired
        }),
        portTo: PropTypes.shape({ 
            portNo: PropTypes.number.isRequired, 
            name: PropTypes.string 
        }),
        portIndexTo: PropTypes.number.isRequired,
        networksFrom: PropTypes.array,
        networksTo: PropTypes.array
    }),
    selectedNetworkId: PropTypes.number,
    onSelect: PropTypes.func
};
