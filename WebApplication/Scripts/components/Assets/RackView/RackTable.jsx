/**
 * @license Copyright 2018 DENSO
 * 
 * RackTable Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { FormControl } from 'react-bootstrap';
import Slider from 'react-slick';

import Button from 'Common/Widget/Button';
import Loading from 'Common/Widget/Loading';

import RackColumn from './RackColumn';
import RackTableHeader from './RackTableHeader';
import RackTablePopup from './RackTablePopup';

import { includedRackColumn, isMountUnitView } from 'unitMountCheck';
import { hasRack, hasRackView } from 'assetUtility';
import { isEdge } from 'edgeUtility';

export const RACK_KEY_STR = {
    left: 'left',
    right: 'right'
}

/**
 * ラック搭載図コンポーネント（1列表示）
 * 
 * @param {object} rack ラック情報（表示ユニット情報を含む）
 * @param {object} selectedUnit 選択中のユニット（ユニット情報と位置情報）
 * @param {array} highlightUnits ハイライトするユニット一覧 ※表示用のユニットではなく、Unitの情報
 * @param {boolean} showLocation ロケーションを表示するか
 * @param {boolean} showQuickLauncher クイックランチャーを表示するか
 * @param {boolean} showUnitQuickLauncher ユニットのクイックランチャーを表示するか
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか（ユニットの選択ができない）
 * @param {boolean} isUnitReadOnly ユニット選択が読み取り専用かどうか（ユニットの選択ができない）
 * @param {boolean} isLeft 左側のラック搭載図かどうか
 * @param {boolean} isPrint 印刷するかどうか
 * @param {boolean} isFront 前面表示かどうか
 * @param {boolean} isDrag ドラッグさせるかどうか
 * @param {function} onSelectUnit ユニットを選択したときに呼び出す
 * @param {function} onDrop ユニットをドロップしたときに呼び出す
 * @param {function} onBeginDrag ドラッグを開始したときに呼び出す
 * @param {function} onDragEnd ドラッグが終了したときに呼び出す（ユニットにドロップしたときは呼び出さない）
 */
export default class RackTable extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            isFront: true,
            isPoppedOut: false,
            resetColumn: false,
            selectColumnNo: 1,
            isDuplicate: false,
            isEdgeBrowser: isEdge()
        };
    }

    /****************************************************
     * Reactコンポーネントのライフサイクル関数
     ****************************************************/

    /**
     * コンポーネントがマウントされたときに呼び出す
     */
    componentDidMount() {
        this.addElementAndStyleForEdge();
    }

    /**
     * 新しいpropsを受け取ると実行されます
     * @param {object} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps){        
        const nextRack = nextProps.rack;
        const beforeRack = this.props.rack;

        if (!(nextRack && beforeRack && nextRack.rackId === beforeRack.rackId)) {
            //ラックが変更されたら、stateをリセット
            this.state ={ 
                isFront: true,
                isPoppedOut: false,
                resetColumn: (!this.state.selectColumnNo)||(this.state.selectColumnNo !== 1),
                selectColumnNo: 1,
                isEdgeBrowser: this.state.isEdgeBrowser
            };
        } else if (nextProps.isFront !== undefined && nextProps.isFront !== this.state.isFront){      //isFrontがundefinedの時は入らない
            //同じラックで前面背面が変更されたら、propsに合わせる
            var obj = Object.assign({}, this.state, {
                isFront: nextProps.isFront
            });
            this.setState(obj);
        }
    }
    
    /**
     * コンポーネントが更新されると実行されます。
     * @param {object} prevProps 変更前のprops
     * @param {object} prevState 変更前のstate
     */
    componentDidUpdate(prevProps, prevState){        
        const nextRack = this.props.rack; 
        const beforeRack = prevProps.rack;
        
        //ラックが変更されたら、ページを1に戻す
        if (!((nextRack && beforeRack) && nextRack.rackId === beforeRack.rackId)) {
            this.changeColumnNo(1);
        } else if (this.state.isFront !== prevState.isFront) {
            this.changeColumnNo(this.state.selectColumnNo);
        }
        
        this.addElementAndStyleForEdge();
        this.refresh();
    }

    /****************************************************
     * コンポーネント作成関数
     ****************************************************/

    /**
     * render
     */
    render() {
        const { className, rack, location, selectedUnit, highlightUnits, isLeft, showQuickLauncher, showUnitQuickLauncher, showLocation, isReadOnly, isUnitReadOnly, isPrint, isDrag, isLoading, emptyRackMessage } = this.props;
        const { isFront, selectColumnNo, isPoppedOut, isEdgeBrowser } = this.state;
        const isRack = hasRack(rack);
        const isRackView = isRack ? hasRackView(rack) : false;
        const isMultiRack = this.isMultiRackTable(rack);
        const rackKey = this.makeRackKey(isLeft);
        const classes = {
            'rack': true,
            'rack-multi': isMultiRack,
            'unit-selectable': !(isReadOnly||isUnitReadOnly),
            'rack-flipped': !isFront
        };
        const rackBodyClass = isRackView ? 'rack-h' + rack.type.viewHeight + '-' + rack.row + 'u' : '';
                
        var rackViews = [];
        var rackName = '';
        if (isRack) {
            rackName = '';          //ラック名称はラック搭載図に表示しない
            if (isRackView) {
                rackViews =  this.makeRackColumns(rack, selectedUnit, highlightUnits, rackKey, showUnitQuickLauncher, (isReadOnly||isUnitReadOnly), isFront, isDrag, isEdgeBrowser);
            } else {
                rackViews = <div className="rack-body-inner-text">ラック搭載図の登録がありません</div>
            }
        } else {
            rackViews = <div className="rack-body-inner-text">{(emptyRackMessage || "ラックの登録がありません")}</div>
        }
        
        if (isPoppedOut && isMultiRack) {
            var popout = (<RackTablePopup isLeft={isLeft}
                                          rack={rack} 
                                          location={location}
                                          selectedUnit={selectedUnit} 
                                          selectColumnNo={selectColumnNo} 
                                          highlightUnits={highlightUnits}
                                          rackKey={rackKey}
                                          isLoading={isLoading}
                                          isPrint={isPrint}
                                          isReadOnly={isReadOnly}
                                          isUnitReadOnly={isUnitReadOnly}
                                          showQuickLauncher={showQuickLauncher}
                                          showUnitQuickLauncher={showUnitQuickLauncher}
                                          showLocation={showLocation}
                                          onSelectUnit={(id, position) => this.handlePopupSelectUnit(id, position)}
                                          onClosing={() => this.handlePopupClosed()} />);
        }
        
        return (
            <div ref="rackTable" className={classNames(classes, className)}>
                <div class="rack-inner">
                    <RackTableHeader rackName={rackName} 
                                     locationList={location}
                                     links={isRack&&rack.links}
                                     isFront={isFront}
                                     isRackView={isRackView}
                                     showQuickLauncher={showQuickLauncher}
                                     showLocation={showLocation}
                                     isReadOnly={isReadOnly}
                                     onFlipPlane={(isFront) => this.swichPlane(isFront)}
                    />
                    {isMultiRack&&
                        <ColumnControl columnCount={rack.col} 
                                       selectColumnNo={selectColumnNo} 
                                       onChangePrevious={() => this.dispPreviousColumn()} 
                                       onChangeNext={() => this.dispNextColumn()} 
                                       onShowAllColumns={() => this.changePopupState()} 
                                       onChangePage={(columnNo) => this.changeColumnNo(columnNo)} 
                        />
                    }
                    {isMultiRack ?
                        <Slider ref="rackTableSlider" 
                                className={classNames("rack-body", rackBodyClass, isEdgeBrowser&&'edge-style')}
                                rtl={!isFront}
                                arrows={false} 
                                swipe={true} 
                                dots={false} 
                                infinite={true} 
                                speed={500} 
                                slidesToShow={1} 
                                slidesToScroll={1} 
                                initialSlide={0}
                                afterChange = {(slideIndex) => this.handleSliderChanged(slideIndex)}        
                        >  
                            {rackViews}                    
                        </Slider>
                        :
                        <div className={classNames("rack-body", rackBodyClass, isEdgeBrowser&&'edge-style')}>
                            {isEdgeBrowser&&isRack&&isRackView&&<div className="edge-style" />}
                            {rackViews}
                        </div>
                    }
                    <Loading isLoading={isLoading} />
                </div>
                {popout}
            </div>
        );
    }

    /**
     * ラック列を作成する
     * @param {object} rack ラック情報
     * @param {object} selectedUnit 選択中のユニット情報
     * @param {array} highlightUnits ハイライトするユニット情報リスト
     * @param {string} rackKey ラックキー（left or right）
     * @param {boolean} showQuickLauncher クイックランチャーを表示するか
     * @param {boolean} isReadOnly 読み取り専用か
     * @param {boolean} isFront 前面かどうか
     * @param {boolean} isDrag ドラッグするかどうか
     */
    makeRackColumns(rack, selectedUnit, highlightUnits, rackKey, showQuickLauncher, isReadOnly, isFront, isDrag, isEdge){
        var rackColumns = [];
        for (let index = 1; index <= rack.col; ++index) {
            const unitViews = rack.unitDispSettings.filter((unit) => includedRackColumn(unit, index))
            var rackCol = (
                        <RackColumn key={index}
                            columnNo={this.isMultiRackTable(rack) ? index : undefined}
                            row={rack.row}
                            unitViews={unitViews}
                            selectedUnit={this.setSelectedUnit(index, unitViews, selectedUnit)}
                            highlightUnits={this.setHighlightUnits(index, highlightUnits, unitViews)}
                            rackKey={rackKey}
                            showQuickLauncher={showQuickLauncher}
                            isReadOnly={isReadOnly}
                            isFront={isFront}
                            isDrag={isDrag}
                            isEdge={isEdge}
                            onSelectUnit={(dispSetId, rowNo, columnNo) => this.handleSelectUnit(dispSetId, rowNo, columnNo)}
                            onDrop={(dispSetId, rowNo, columnNo) => this.handleDrop(dispSetId, rowNo, columnNo)}
                            onBeginDrag={(dispSetId) => this.handleBeginDrag(dispSetId)}
                            onDragEnd={() => this.handleDragEnd()}
                        />
            );

            //複数列の場合はdivで囲む
            if (rack.col > 1) {
                rackCol = (
                    <div refs="slick">
                        {isEdge&&<div className="edge-style" />}
                        <div className="rack-column">
                            {rackCol}
                        </div>
                    </div>
                );
            }

            rackColumns.push(rackCol);
        }
        return rackColumns;
    }

    /**
     * 選択ユニット情報をセットする
     * @param {number} colNo 列インデクス
     * @param {array} unitViews 列に表示するユニット情報
     * @param {object} selectedUnitView 選択中の表示ユニット 
     * @returns 列に含まれていた場合は選択ユニット
     */
    setSelectedUnit(colNo, unitViews, selectedUnitView) {
        if (!selectedUnitView) {
            return null;
        }

        const isSelected = unitViews.some((unit) => ((selectedUnitView.id === unit.dispSetId) || isMountUnitView(unit, selectedUnitView.y)));
        return (isSelected || selectedUnitView.position.x === colNo) ? selectedUnitView : null;
    }
    
    /**
     * ハイライトするユニット情報をセットする
     * @param {number} colNo 列インデクス
     * @param {array} highlightUnits ハイライトするユニット一覧
     * @param {array} unitViews 列に表示するユニット情報
     * @returns 列に含まれているハイライトユニット
     */
    setHighlightUnits(colNo, highlightUnits, unitViews){
        if (!highlightUnits) {
            return [];
        }

        var retUnits = [];
        highlightUnits.forEach((unit) => {
            if (unitViews.some((view) => {
                    return view.units.some(item => item.unitId === unit.unitId)
                })){
              retUnits.push(unit);  
            }
        })

        return retUnits;
    }

    /**
     * 段組みラックかどうかチェックする
     * @param {object} rack ラック
     * @returns 段組みラックかどうか（true：段組みラック、false：通常ラック）
     */
    isMultiRackTable(rack){
        return (rack && rack.col > 1) ? true : false;
    }
    
    /**
     * ラックキーを作成する
     * @param {boolen} isLeft 両端に表示されているラックの時に左側に表示されているか
     * @returns ラックキー
     */
    makeRackKey(isLeft){
        if (isLeft !== undefined) {
            return isLeft ? RACK_KEY_STR.left : RACK_KEY_STR.right;
        }
        return undefined;
    }
    
    /****************************************************
     * state変更の関数
     ****************************************************/

    /**
     * ポップアップ表示ステータスを変更する
     */
    changePopupState(){
        var obj = Object.assign({}, this.state);
        obj.isPoppedOut = !obj.isPoppedOut;
        this.setState(obj);
    }

    /**
     * 前面背面を切り替える
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
     * ユニット選択イベントを発生させる
     * @param {number} dispSetId 選択した表示設定ID
     * @param {number} rowNo 選択行番号
     * @param {number} columnNo 選択列番号
     */
    handleSelectUnit(dispSetId, rowNo, columnNo){
        var obj =  Object.assign({}, this.state);
        obj.selectedUnit = {
            id: dispSetId,
            position: {
                x: columnNo,
                y: rowNo
            }
        }
        this.setState(obj);
        if (this.props.onSelectUnit) {
            this.props.onSelectUnit(Object.assign({}, obj.selectedUnit))
        }
    }
        
    /**
     * 段組みラックポップアップのユニット選択イベントを発生させる
     * @param {number} dispSetId 選択ユニットID
     * @param {object} position 選択位置
     */
    handlePopupSelectUnit(dispSetId, position){
        var obj =  Object.assign({}, this.state);        
        obj.selectedUnit = {
            id: dispSetId,
            position: Object.assign({}, position)
        }
        this.setState(obj);

        //this.refs.rackTableSlider.slickGoTo(position.x - 1);    //スライダーのインデックスは「ユニット位置(横) - 1」
        this.changeColumnNo(position.x);        //スライダーのページを変更する
        if (this.props.onSelectUnit && !this.props.isDrag) {
            this.props.onSelectUnit(Object.assign({}, obj.selectedUnit));
        }
    }

    /**
     * ポップアップを閉じるイベント
     */
    handlePopupClosed(){        
        var obj = Object.assign({}, this.state);
        obj.isPoppedOut = false;
        this.setState(obj);
    }
    
    /**
     * ドロップイベントを発生させる
     * @param {number} dispSetId ドロップした表示設定ID
     * @param {number} rowNo ドロップした行番号
     * @param {number} columnNo ドロップした列番号
     */
    handleDrop(dispSetId, rowNo, columnNo){
        if (this.props.onDrop) {
            this.props.onDrop(dispSetId, { x: columnNo, y: rowNo });        //ドロップした位置と表示設定ID返す
        }
    }

    /**
     * ドラッグを開始したときのイベントハンドラ
     * @param {number} dispSetId ドラッグを開始した表示設定ID
     */
    handleBeginDrag(dispSetId){
        if (this.props.onBeginDrag) {         
            this.props.onBeginDrag(dispSetId);       //ドラッグしている位置と表示設定IDを返す
        }
    }

    /**
     * ドラッグが終わったときのイベント（ユニットにドロップしたときは発生しない）
     */
    handleDragEnd() {
        if (this.props.onDragEnd) {
            this.props.onDragEnd();
        }
    }
    
    /****************************************************
     * スライダー関係のイベントや関数
     ****************************************************/

    /**
     * スライドの変更イベント
     * @param {number} slideNo スライダーのインデックス
     */
    handleSliderChanged(slideIndex){
        var obj = Object.assign({}, this.state);
        if (this.state.resetColumn) {
            obj.resetColumn = false;
            if (this.state.isFront) {
                this.changeColumnNo(1);
            } else {
                this.changeColumnNo(this.props.rack.col);
            }
        } else {
            if (this.state.isFront) {
                obj.selectColumnNo = slideIndex + 1;         //列番号は「スライダーのインデックス + 1」
            } else {
                const { col } = this.props.rack;
                obj.selectColumnNo = (col - slideIndex !== 1) ?  col - slideIndex - 1 : col;         //列番号は「列数-スライダーのインデックス」
            }
        }
        this.setState(obj);
    }

    /**
     * ページ番号を変更する
     * @param {number} columnNo 列番号
     */
    changeColumnNo(columnNo) {
        if (this.refs.rackTableSlider) {
            if (this.state.isFront) {
                this.refs.rackTableSlider.slickGoTo(columnNo - 1);    //スライダーのインデックスは「列番号 - 1」
            } else {
                const { col } = this.props.rack;
                const slideNo = col !== columnNo ? col - columnNo - 1 : columnNo - 1;
                this.refs.rackTableSlider.slickGoTo(slideNo);
            }
        }
    }

    /**
     * 次のラック列を表示する
     */
    dispNextColumn(){
        if (this.refs.rackTableSlider) {
            this.refs.rackTableSlider.slickNext();
        }
    }
    
    /**
     * 前のラック列を表示する
     */
    dispPreviousColumn(){
        if (this.refs.rackTableSlider) {
            this.refs.rackTableSlider.slickPrev();
        }
    }

    //#region スクロールバー対応

    /**
     * コンポーネントを再レンダリングする
     */
    updateComponent() {
        //scroll-pane-innerとrack-columnのwidthが違う場合は、強制レンダリングする！
        const scrollInner = $(this.refs.rackTable).parents('.scroll-pane-inner');
        if (scrollInner &&
            scrollInner.width() !== $('.rack-column').width()) {
                this.forceUpdate();
        }
    }

    /**
     * スクロールバー表示時の幅を調整
     */
    refresh() {
        //段組みラックの時のみ監視
        if (this.isMultiRackTable(this.props.rack) && this.refs.rackTableSlider) {
            if (!this.sliderMoniterInterval) {
                this.sliderMoniterInterval = setInterval(() => this.updateComponent(), 400);
            }
        } else {
            if (this.sliderMoniterInterval) {
                clearInterval(this.sliderMoniterInterval);
                this.sliderMoniterInterval = null;
            }
        }
    }

    //#endregion

    //#region Edge対応

    /**
     * Edge用に要素やCSSを追加する
     */
    addElementAndStyleForEdge() {
        if (this.state.isEdgeBrowser && this.isMultiRackTable(this.props.rack)) {
            if ($('#rackBodyBackground').length <= 0) {
                $('.rack-body').prepend('<div id="rackBodyBackground" class="edge-style" />');
            }
        } 
    }

    //#endregion
}

/****************************************************
 * プライベートコンポーネント
 ****************************************************/
/**
 * ラック列コントロール用コンポーネント
 * @param {number} selectColumnNo 選択中の列番号
 * @param {number} columnCount 最大列数
 * @param {function} onChangeNext 次の列に進むボタン押下時に呼び出す
 * @param {function} onChangePrevious 前の列に戻るボタン押下時に呼び出す
 * @param {function} onShowAllColumns 全表示ボタン押下時に呼び出す
 * @param {function} onChangePage ページ変更時に呼び出す
 */
class ColumnControl extends Component {
    render() {
        const { selectColumnNo, columnCount } = this.props;
        var columns = [];
        for (let index = 1; index <= columnCount; index++) {
            columns.push(index);
        }

        return (
            <div class="rack-column-control">
                <div class="column-prev">
                    <Button onClick={() => this.handleClickPrevious()} ></Button>
                </div>
                <FormControl componentClass="select"
                             className="input-sm select-column"
                             value={selectColumnNo} 
                             onChange={(e) => this.handleColumnNoChanged(event.target.value)} >
                    {columns.map((i) => <option value={i}>{i + '/' + columnCount + '列'}</option>)}
                </FormControl>
                <div class="all-rack">
                    <Button iconId="show-all-columns" bsSize="xs" onClick={() => this.handleClickShowAllColumns()}>全表示</Button>
                </div>
                <div class="column-next">
                    <Button onClick={() => this.handleClickNext()} ></Button>
                </div>
            </div>
        );
    }
    
    /**
     * 次の列表示ボタンクリックイベント
     */
    handleClickNext() {
        if (this.props.onChangeNext) {
            this.props.onChangeNext();
        }        
    }

    /**
     * 前の列表示ボタンクリックイベント
     */
    handleClickPrevious() {
        if (this.props.onChangePrevious) {
            this.props.onChangePrevious();
        }        
    }
    
    /**
     * 全表示ボタンクリックイベント
     */
    handleClickShowAllColumns() {
        if (this.props.onShowAllColumns) {
            this.props.onShowAllColumns();
        }
    }

    /**
     * 列番号変更イベント
     * @param {string} columnNo 
     */
    handleColumnNoChanged(columnNo) {
        if (this.props.onChangePage) {
            this.props.onChangePage(parseInt(columnNo));
        }
    }
}

RackTable.propTypes = {
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
    highlightUnits: PropTypes.arrayOf(PropTypes.object),
    showLocation: PropTypes.bool,
    showQuickLauncher: PropTypes.bool,
    showUnitQuickLauncher: PropTypes.bool,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isUnitReadOnly: PropTypes.bool,
    isLeft: PropTypes.bool,
    isPrint: PropTypes.bool,
    isFront: PropTypes.bool,
    isDrag: PropTypes.bool,
    emptyRackMessage: PropTypes.string,
    onSelectUnit: PropTypes.func,
    onDrop: PropTypes.func,
    onBeginDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
}