/**
 * @license Copyright 2018 DENSO
 * 
 * 段組みラック搭載図 Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PopoutWindow from 'Common/Popup/PopoutWindow';
import RackMultiTable from './RackMultiTable';
import RackTableHeader from './RackTableHeader';

import { RACK_KEY_STR } from './RackTable';

const RACK_FULL_SIZE = 613.2;

/**
 * 段組みラック搭載図を表示するポップアップコンポーネント
 * @param {object} rack ラック情報（表示ユニット情報を含む）
 * @param {object} selectedUnit 選択中のユニット（ユニット情報と位置情報）
 * @param {number} selectColumnNo 選択中の列番号
 * @param {object} movingTarget 移動対象のユニット情報（ユニット情報と位置情報）
 * @param {array} highlightUnits ハイライトするユニット一覧 ※表示用のユニットではなく、Unitの情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか（ユニットの選択ができない）
 * @param {boolean} isUnitReadOnly ユニット選択が読み取り専用かどうか（ユニットの選択ができない）
 * @param {boolean} isLeft 左側のラック搭載図かどうか
 * @param {boolean} isPrint 印刷するかどうか
 * @param {boolean} showLocation ロケーションを表示するか
 * @param {boolean} showQuickLauncher クイックランチャーを表示するか
 * @param {boolean} showUnitQuickLauncher ユニットのクイックランチャーを表示するか
 * @param {object} container ツールチップのコンテナ
 * @param {function} onSelectUnit ユニットを選択したときに呼び出す
 * @param {function} onClosing ポップアップを閉じるときに呼び出す
 */
export default class RackTablePopup extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
             isFront: true,
             container: undefined
        };
    }

    /**
     * render
     */
    render() {
        const { rack, location, isLoading, rackKey, showQuickLauncher, showLocation, isReadOnly, isUnitReadOnly } = this.props;
        const { isFront, container } = this.state;
        const classes = {
            'rack': true,
            'rack-multi': true,
            'rack-multi-table ': true,
            'unit-selectable': !(isReadOnly||isUnitReadOnly)
        };

        var rackName = rack ? rack.rackName : 'ラック未選択';
        if (rackKey !== undefined) {
            rackName += rackKey === RACK_KEY_STR.left ? ' (左)' : ' (右)' ;
        }

        return (
            <PopoutWindow key={rackKey}
                          url="/RackMultiTable" 
                          title={rackName} 
                          options={{width: '1000px', height: this.getWindowHeight(rack&&rack.type.viewHeight, showLocation)}} 
                          onClosing={() => this.popoutClosed()}>    
                <div onLoad={() => this.handleClick()} >
                    <div ref="rackPopup" className={classNames(classes)}>
                        <div class="rack-inner">
                            <RackTableHeader rackName={rackName} 
                                             locationList={location}
                                             links={rack.links}
                                             isFront={isFront}
                                             isRackView={true}
                                             isPopout={true}
                                             showQuickLauncher={showQuickLauncher}
                                             showLocation={showLocation}
                                             isReadOnly={isReadOnly}
                                             toolipContainer={container}
                                             onFlipPlane={(isFront) => this.swichPlane(isFront)}
                                             onButtonEventTrigger={() => this.handleOverlayButtonEvent()}
                            />
                            {rack ? this.rackTable() : this.empty()}
                        </div>
                        { isLoading && 
                          <div className="overlay"><i className="fa fa-refresh fa-spin"></i></div>
                        }
                    </div>
                </div>
            </PopoutWindow>
        );
    }

    /**
     * オーバーレイボタンのコンテナをセットする
     */
    handleOverlayButtonEvent() {
        if (!this.state.container) {
            this.setState({container: this.refs.rackPopup})
        }
    }

    /****************************************************
     * コンポーネント作成関数
     ****************************************************/

    /**
     * ラック未選択の表示をする
     */
    empty() {
        return <div className="rack-body-inner-text">ラックの登録がありません</div>
    }

    /**
     * 段組みラックを表示する
     */
    rackTable() {
        const { rack, selectedUnit, selectColumnNo, highlightUnits, movingTarget, isUnitReadOnly, rackKey, showUnitQuickLauncher } = this.props;
        const { isFront } = this.state;
        return (<RackMultiTable rack={rack} 
                                selectedUnit={selectedUnit} 
                                selectColumnNo={selectColumnNo} 
                                movingTarget={movingTarget} 
                                highlightUnits={highlightUnits}
                                isReadOnly={isUnitReadOnly} 
                                rackKey={rackKey}　
                                isFront={isFront} 
                                showQuickLauncher={showUnitQuickLauncher} 
                                toolipContainer={this.state.container}
                                onTooltipButtonEventTrigger={() => this.handleOverlayButtonEvent()}
                                onSelectUnit={(id, position) => this.handleSelectUnit(id, position)} 
                />)
  
    }    

    /**
     * ウィンドウの高さを取得する
     * @param {number} viewHeight ラック高さの割合
     * @param {boolean} showLocation ロケーションを表示するかどうか
     * @returns {number} ウィンドウの高さ
     */
    getWindowHeight(viewHeight, showLocation){
        const rackHeight = Math.round(RACK_FULL_SIZE * viewHeight / 100);
        return rackHeight + (showLocation ? 185 : 160);
    }
    
    /****************************************************
     * state変更の関数
     ****************************************************/

    /**
     * 前面背面を切り替えます
     * @param {boolean} isFront 前面かどうか
     */
    swichPlane(isFront){
        var obj =  Object.assign({}, this.state);
        obj.isFront = isFront;
        this.setState(obj);
    }

    /****************************************************
     * イベント関数
     ****************************************************/

     /**
     * ポップアップを閉じるイベント
     */
    popoutClosed(){
        if (this.props.onClosing) {
            this.props.onClosing();
        }
    }
    
    /**
     * ユニット選択イベントを発生させる
     * @param dispSetId ユニット表示設定グループID
     * @param position ユニット位置
     */
    handleSelectUnit(dispSetId, position){
        if (this.props.onSelectUnit) {
            this.props.onSelectUnit(dispSetId, position);
        }
    }

}

RackTablePopup.propTypes = {
    rack: PropTypes.shape({
        rackId: PropTypes.string,
        rackName: PropTypes.string,
        row: PropTypes.number,
        col: PropTypes.number,
        type: PropTypes.shape({
            viewHeight: PropTypes.number.isRequired         //ラック搭載図の高さ。単位：100%。最大100%。
        }),
        links: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired
        })),
        unitDispSettings: PropTypes.arrayOf(PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
            dispSetId: PropTypes.string.isRequired,
            frontDispData: PropTypes.shape({             //前面の表示設定
                dispName: PropTypes.string.isRequired,
                fontSize: PropTypes.number.isRequired,
                textColor: PropTypes.string.isRequired,
                backColor: PropTypes.string.isRequired,
                unitImage: PropTypes.shape({
                    url: PropTypes.string.isRequired
                })
            }).isRequired,
            rearDispData: PropTypes.shape({              //背面の表示設定
                dispName: PropTypes.string.isRequired,
                fontSize: PropTypes.number.isRequired,
                textColor: PropTypes.string.isRequired,
                backColor: PropTypes.string.isRequired,
                unitImage: PropTypes.shape({
                    url: PropTypes.string.isRequired
                })
            }).isRequired,
            position: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            }).isRequired,
            size: PropTypes.shape({
                height: PropTypes.number.isRequired,
                width: PropTypes.number.isRequired
            }).isRequired,
            status: PropTypes.shape({
                color: PropTypes.string.isRequired
            }).isRequired,
            hasAlarm: PropTypes.bool,
            alarmName: PropTypes.string,
            totalWeight: PropTypes.number,
            totalPower: PropTypes.number,
            units: PropTypes.arrayOf(PropTypes.shape({
                unitId: PropTypes.string.isRequired,
                unitNo: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                type: PropTypes.shape({
                    name: PropTypes.string.isRequired
                }),
                position: PropTypes.shape({
                    x: PropTypes.number.isRequired,
                    y: PropTypes.number.isRequired
                }).isRequired,
                size: PropTypes.shape({
                    height: PropTypes.number.isRequired,
                    width: PropTypes.number.isRequired
                }).isRequired,
                links: PropTypes.arrayOf(PropTypes.shape({
                    title: PropTypes.string.isRequired,
                    url: PropTypes.string.isRequired
                }))
            }))
        }))
    }),
    location: PropTypes.arrayOf({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
    }),
    selectedUnit: PropTypes.shape({
        id: PropTypes.string,
        position:PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }),
    selectColumnNo: PropTypes.number,
    movingTarget: PropTypes.shape({
        id: PropTypes.number,
        position:PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }),
    highlightUnits: PropTypes.arrayOf(PropTypes.object),
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isUnitReadOnly: PropTypes.bool,
    rackKey: PropTypes.string,
    isPrint: PropTypes.bool,
    showLocation: PropTypes.bool,
    showQuickLauncher: PropTypes.bool,
    showUnitQuickLauncher: PropTypes.bool,
    onSelectUnit: PropTypes.func,
    onClosing: PropTypes.func
}