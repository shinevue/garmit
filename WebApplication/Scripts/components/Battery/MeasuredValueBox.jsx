/**
 * @license Copyright 2019 DENSO
 * 
 * 計測値ボックス Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Form, FormControl, Pagination } from 'react-bootstrap';
import GarmitBox from 'Assets/GarmitBox';
import { ExportReportButton } from 'Assets/GarmitButton';
import PointDetailModal from 'Assets/Modal/PointDetailModal';
import TrendGraphModal from 'Assets/Modal/TrendGraphModal';
import DataOption, { SORT_TYPE, INIT_FILTER_ALARM } from 'Assets/DataOption';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import Button from 'Common/Widget/Button';
import ChannelValueView from './ChannelValueView';
import PointValueView from './PointValueView';
import OtherValueView from './OtherValueView';

import { compareAscending } from 'sortCompare';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { convertNumber } from 'numberUtility';

const VIEW_MODE = {
    point: "point",
    channel: "channel"
};

const PAGESIZE_OPTIONS = {
    point: [ 20, 50, 100, 200, 500 ],
    channel: [ 10, 50, 100, 200 ]
}

/**
 * 計測値ボックスコンポーネントを定義します。
 * @param {object} batteryMeasuredData バッテリーの計測値データ
 * @param {number} selectedGateId 選択中の機器ID
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} editLevel 編集レベル
 * @param {function} onReportButtonClick レポート出力ボタンクリック時に呼び出す
 * @param {function} onMeasureButtonClick 測定ボタンクリック時に呼び出す
 * @param {function} onThresholdChange ポイントの閾値を変更したときに呼び出す
 */
export default class MeasuredValueBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            viewMode: VIEW_MODE.channel,
            pointDeteilModal : {
                show: false,
                pointNo: null
            },
            trendGraphModal : {
                show: false,
                pointNo: null
            },
            sort: { key: SORT_TYPE.name, isAsc: true },
            filter: {
                alarm: INIT_FILTER_ALARM,
                datatype: props.dataTypes && props.dataTypes.map((type) => type.dtType.toString())
            },
            pageInfo : {
                currentPage: 1,
                pageSize: PAGESIZE_OPTIONS.channel[1]
            }
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (JSON.stringify(this.getDtTypeList(nextProps.dataTypes)) !== 
            JSON.stringify(this.getDtTypeList(this.props.dataTypes))) {
            this.setState({
                filter: {
                    alarm: INIT_FILTER_ALARM,
                    datatype: nextProps.dataTypes && nextProps.dataTypes.map((type) => type.dtType.toString())
                }
            });
        }
        
        if (nextProps.selectedGateId != this.props.selectedGateId) {
            const { dataTypes, batteryMeasuredData } = nextProps;
            const useDataTypes = batteryMeasuredData ? this.getUseDataTypes(nextProps.dataTypes, batteryMeasuredData.channelValueData) : dataTypes;
            this.setState({
                viewMode: VIEW_MODE.channel,  
                sort: { key: SORT_TYPE.name, isAsc: true },
                filter: {
                    alarm: INIT_FILTER_ALARM,
                    datatype: useDataTypes && useDataTypes.map((type) => type.dtType.toString())
                },
                pageInfo : {
                    currentPage: 1,
                    pageSize: PAGESIZE_OPTIONS.channel[1]
                }
            });
        }
    }

    /**
     * データ種別IDリストを取得する
     * @param {array} dataTypes データ種別一覧
     */
    getDtTypeList(dataTypes) {
        if (!dataTypes) {
            return [];
        }
        return dataTypes.map((type) => type.dtType).sort((current, next) => compareAscending(current, next));
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, editLevel , dataTypes, batteryMeasuredData, selectedGateId, isLoading } = this.props;
        const { viewMode, sort, filter, pointDeteilModal, trendGraphModal } = this.state;
        const { currentPage, pageSize } = this.state.pageInfo;
        const listClasses = {
            'realtime-box-list': true,
            'with-statistic': false
        };
        const lastMeasuredDateStr = batteryMeasuredData && batteryMeasuredData.lastMeasuredDate ? moment(batteryMeasuredData.lastMeasuredDate).format('YYYY/MM/DD HH:mm:ss') : '';
        const channelValueData = batteryMeasuredData ? batteryMeasuredData.channelValueData : [];
        const gatePointValueData = batteryMeasuredData && batteryMeasuredData.gatePointValueData ? batteryMeasuredData.gatePointValueData : [];
        const useDataTypes = this.getUseDataTypes(dataTypes, channelValueData);
        const readOnly = (batteryMeasuredData && batteryMeasuredData.useFlg) && !readOnlyByLevel(isReadOnly, editLevel, LAVEL_TYPE.operator);
        
        const data = this.getDisplayData(viewMode, channelValueData);
        
        return (
            <GarmitBox title="測定値一覧" isLoading={isLoading}>
                <div>
                    <div className="mb-1 clearfix">
                        {readOnly&&
                            <Button bsStyle="primary" 
                                    disabled={selectedGateId&&selectedGateId>0?false:true} 
                                    onClick={() => this.onMeasureButtonClick(selectedGateId)}>
                                手動再測定
                            </Button>
                        }
                        <div className="ta-r pull-right">
                            <ExportReportButton className="mb-05" 
                                                onClick={() => this.onReportButtonClick(selectedGateId)}/>
                        </div>
                        <div className="mt-05">
                            { '前回の再測定開始日時：' + lastMeasuredDateStr}
                        </div>
                    </div>
                    {gatePointValueData.length > 0 &&
                        <OtherValueView className="mb-05"
                                        valueData={gatePointValueData}
                                        listClasses={listClasses}
                                        onShowPointDetailModal={(pointNo) => this.showModal(pointNo, 'pointDeteilModal', false)}
                                        onShowTrendGraphModal={(pointNo) => this.showModal(pointNo, 'trendGraphModal', false)}
                        />
                    }
                    <div className="mb-05">
                        <ToggleSwitch
                            value={viewMode}
                            bsSize="sm"
                            name="viewMode"
                            swichValues={[
                                { value: VIEW_MODE.channel, text: 'チャンネル表示' },
                                { value: VIEW_MODE.point, text: 'ポイント表示' }
                            ]}
                            onChange={(value) => this.handleChangeViewMode(value)}
                        />
                    </div>
                    <div className="battery-realtime-option">
                        {viewMode===VIEW_MODE.point&&
                            <div className="data-option">
                                <DataOption sort={sort}
                                            filter={filter}
                                            useSort
                                            useFilter
                                            dataTypes={useDataTypes}
                                            inline
                                            onSort={(sort) => this.handleSortChange(sort)}
                                            onFilter={(filter) => this.handleFilterChange(filter)}
                                />
                            </div>
                        }
                        <div>
                            <DisplayLengthSelectForm
                                pageSize={pageSize}
                                options={viewMode === VIEW_MODE.point ? PAGESIZE_OPTIONS.point : PAGESIZE_OPTIONS.channel}
                                unit={viewMode === VIEW_MODE.point ? '件' : 'CH'}
                                onChange={this.handlePageSizeChanged}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <div className={"muuri-container battery-realtime-grid" + (viewMode===VIEW_MODE.channel ? " mt-05" : "") } >
                            {viewMode === VIEW_MODE.point&&
                                <PointValueView valueData={data}
                                                listClasses={listClasses}
                                                dispIndexInfo={{start: (currentPage - 1) * pageSize + 1, end: currentPage * pageSize }}
                                                onShowPointDetailModal={(pointNo) => this.showModal(pointNo, 'pointDeteilModal', true)}
                                                onShowTrendGraphModal={(pointNo) => this.showModal(pointNo, 'trendGraphModal', true)}
                                />
                            }
                            {viewMode === VIEW_MODE.channel &&
                                <ChannelValueView channelValueData={data}
                                                  listClasses={listClasses}
                                                  dispIndexInfo={{start: (currentPage - 1) * pageSize + 1, end: currentPage * pageSize }}
                                                  onShowPointDetailModal={(pointNo) => this.showModal(pointNo, 'pointDeteilModal', true)}
                                                  onShowTrendGraphModal={(pointNo) => this.showModal(pointNo, 'trendGraphModal', true)}
                                />
                            }
                        </div>
                        <NormalPager 
                            {...this.pagerProps(
                                data.length, 
                                currentPage, 
                                pageSize
                            )}
                            unit={viewMode === VIEW_MODE.point ? '件' : 'CH'}
                            onPageChange={(pageNo) => this.handlePageNoChanged(pageNo)} 
                        />                        
                    </div>
                    <PointDetailModal
                        show={pointDeteilModal.show}
                        pointInfo={pointDeteilModal.isChanelData?
                                        this.getValueDataFromChannelData(pointDeteilModal.pointNo, channelValueData)
                                  :
                                        this.getGateValueData(pointDeteilModal.pointNo, gatePointValueData)
                                  }
                        isReadOnly={readOnlyByLevel(isReadOnly, editLevel, LAVEL_TYPE.manager)}
                        onClose={() => this.hideModal('pointDeteilModal')}
                        onSaved={() => this.props.onThresholdChange()}
                    />
                    <TrendGraphModal
                        showModal={trendGraphModal.show}
                        pointNos={trendGraphModal.pointNo && [trendGraphModal.pointNo]}
                        onHide={() => this.hideModal('trendGraphModal')}
                    />
                </div>
            </GarmitBox>
        );
    }
    
    //#region その他関数

    /**
     * 表示モードを変更する
     * @param {*} mode 
     */
    handleChangeViewMode(mode) {
        this.setState({ 
            viewMode: mode,
            pageInfo: {
                currentPage: 1,
                pageSize: mode === VIEW_MODE.point ? PAGESIZE_OPTIONS.point[0] : PAGESIZE_OPTIONS.channel[1]
            }
         });
    }

    /**
     * 使用中のデータ種別を取得する
     * @param {array} dataTypes 全部入りのデータ種別一覧
     * @param {array} channelValueData チャンネルごとのValueData
     * @returns {array} 使用中のデータ種別
     */
    getUseDataTypes(dataTypes, channelValueData) {
        var useDataTypes = [];
        for (let index = 0; index < dataTypes.length; index++) {
            const type = dataTypes[index];
            channelValueData.some((channelData) => {
                if (channelData.valueData.some((data) => data.point.datatype.dtType === type.dtType)) {
                    useDataTypes.push(type);
                    return true;
                }
            });
        }
        return useDataTypes;
    }

    //#endregion

    //#region ValueData関係

    /**
     * チャンネルデータから表示用データを取得する
     * @param {string} viewMode 表示モード
     * @param {array} channelValueData チャンネルごとのValueData
     */
    getDisplayData(viewMode, channelValueData) {
        return viewMode===VIEW_MODE.point ? this.makeDisplayPointViewData(channelValueData) : this.getChannelValueData(channelValueData);        
    }

    /**
     * ポイントNoからValueDataを取得する
     * @param {number} pointNo 対象ポイントNo
     * @param {array} channelValueData チャンネルごとのValueData
     */
    getValueDataFromChannelData(pointNo, channelValueData) {
        var retValueData = null;
        channelValueData.some((channelData) => {
            const valueData = channelData.valueData.find((data) => data.point.pointNo === pointNo);
            if (valueData) {
                retValueData = valueData;
                return true;
            }
            false
        });
        return retValueData;
    }

    /**
     * ポイントNoからValueDataを取得する
     * @param {number} pointNo 対象ポイントNo
     * @param {array} gatePointValueData チャンネルごとのValueData
     */
    getGateValueData(pointNo, gatePointValueData) {
        return gatePointValueData.find((data) => data.point.pointNo === pointNo);
    }

    /**
     * チャンネル毎からValueDataリストに変換したデータを取得する
     * @param {array} channelValueData チャンネルごとのValueData
     */
    getValueDataList(channelValueData) {        
        let valueData = [];
        for (let index = 0; index < channelValueData.length; index++) {
            const channelValue = channelValueData[index];
            if (channelValue.valueData.length > 0) {
                Array.prototype.push.apply(valueData, channelValue.valueData);
            }
        }
        return valueData;
    }

    /**
     * チャンネルデータを取得する
     * @param {array} channelValueData チャンネルだけのValueData
     */
    getChannelValueData(channelValueData) {
        return channelValueData.filter((item) => item.channelNo > 0);
    }

    //#endregion
    
    //#region モーダル関連

    /**
     * モーダルを表示する
     * @param {number} pointNo ポイント番号
     * @param {string} modalKey モーダルのキー
     * @param {boolean} isChanelData チャンネルのデータかどうか
     */
    showModal(pointNo, modalKey, isChanelData) {
        var obj = Object.assign({}, this.state);
        obj[modalKey] = { show: true, pointNo: pointNo, isChanelData: isChanelData };
        this.setState(obj);
    }

    /**
     * モーダルを閉じる
     */
    hideModal(modalKey) {
        var obj = Object.assign({}, this.state);
        obj[modalKey] = { show: false, pointNo: null };
        this.setState(obj);
    }

    //#endregion

    //#region ソート、並び替え関連

    /**
     * ソート変更イベント
     * @param {object} sort ソート情報
     */
    handleSortChange(sort) {
        this.setState({ sort: sort });
    }

    /**
     * 絞り込み変更イベント
     * @param {object} filter 絞り込み情報
     */
    handleFilterChange(filter) {
        this.setState({ filter: filter }, () => this.checkCurrentPageNo());
    }

    /**
     * 表示データを作成する
     * @param {array} data 元データ
     */
    makeDisplayPointViewData(channelValueData) {
        var data = this.getValueDataList(channelValueData);
        data = this.filter(data);
        this.sort(data);
        return data;
    }

    /**
     * ソートする
     */
    sort(data) {
        const { key, isAsc } = this.state.sort;
        data.sort((a, b) => {
            var aKey = key == SORT_TYPE.name ? a.point.pointName : this.makeValueString(a.dateValuePairs[0], a.format);
            var bKey = key == SORT_TYPE.name ? b.point.pointName : this.makeValueString(b.dateValuePairs[0], b.format);
            if (parseFloat(aKey) == aKey && parseFloat(bKey) == bKey) {
                aKey = parseFloat(aKey);
                bKey = parseFloat(bKey);
            }
            if (aKey > bKey) return isAsc ? 1 : -1;
            if (aKey < bKey) return isAsc ? -1 : 1;
            return 0;
        });
    }

    /**
     * 絞り込みする
     */
    filter(data) {
        const { filter } = this.state;
        return data.filter((r) => 
            filter.alarm.indexOf(r.alarmClassName) >= 0
            && filter.datatype.indexOf(r.point.datatype.dtType.toString()) >= 0)
    }

    /**
     * 表示する値を生成する
     * @param {any} dateValuePair
     */
    makeValueString(dateValuePair, formatString) {
        if (!dateValuePair) {
            return ' ― ';
        }
        if (dateValuePair.displayString) {
            return dateValuePair.displayString;
        }
        if (dateValuePair.scaledValue != null) {
            return format(formatString, dateValuePair.scaledValue);
        }
    }

    
    //#endregion

    //#region 関数呼び出し

    /**
     * レポート出力ボタンクリック関数を呼び出す
     */
    onReportButtonClick(gateId) {
        if (gateId && this.props.onReportButtonClick) {
            this.props.onReportButtonClick(gateId);
        }
    }

    /**
     * 再測定ボタンクリック関数を呼び出す
     */
    onMeasureButtonClick(gateId) {
        if (gateId && this.props.onMeasureButtonClick) {
            this.props.onMeasureButtonClick(gateId);
        }
    }

    //#endregion

    //#region ページ分け

    /**
     * ページ変更イベント
     */
    handlePageNoChanged = (pageNo) => {
        this.setState({
            pageInfo : Object.assign(this.state.pageInfo, {
                currentPage: convertNumber(pageNo)
            }) 
        });
    }

    /**
     * ページ数変更イベント
     */
    handlePageSizeChanged = (pageSize) => {
        this.setState({
            pageInfo: Object.assign(this.state.pageInfo, {
                pageSize: convertNumber(pageSize)
            })
        }, () => this.checkCurrentPageNo());
    }

    /**
     * ページャーのプロパティ
     * @param {number} totalItemCount データ全体の個数
     * @param {number} pageNo ページ番号
     * @param {number} pageSize ページ数
     */
    pagerProps(totalItemCount, pageNo, pageSize) {
        const startIndex = (pageNo - 1) * pageSize + 1;
        const endIndex = pageNo * pageSize;
        return {
            totalItemCount: totalItemCount,
            start: Math.min(startIndex, totalItemCount),
            end: Math.min(endIndex, totalItemCount),
            totalPages: Math.ceil(totalItemCount / pageSize),
            currentPage: pageNo
        }
    }

    /**
     * 現在のページ番号をチェックする
     */
    checkCurrentPageNo() {
        const { batteryMeasuredData } = this.props;
        const { viewMode } = this.state;
        const { currentPage, pageSize } = this.state.pageInfo;
        let dispItemLength = this.getDisplayData(viewMode, batteryMeasuredData.channelValueData).length;
        if (Math.ceil(dispItemLength / pageSize) < currentPage) {
            this.setState({ pageInfo: { currentPage: 1, pageSize: pageSize }});                
        }
    }

    //#endregion
}

MeasuredValueBox.propsTypes = {
    batteryMeasuredData: PropTypes.object,
    selectedGateId: PropTypes.number,
    authentication: PropTypes.object,
    isLoading: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    editLevel: PropTypes.number,
    onReportButtonClick: PropTypes.func,
    onMeasureButtonClick: PropTypes.func,
    onThresholdChange: PropTypes.func.isRequired
}


//#region 表示件数選択フォーム

const DisplayLengthSelectForm = ({ pageSize, options, unit, onChange: handleChanged }) => {
    return (
        <Form inline>
            <FormControl
                componentClass="select"
                value={pageSize}
                onChange={(e) => handleChanged(e.target.value)}
                bsSize="sm"
            >
                {options.map((option) => 
                    <option value={option.toString()}>{option}</option>
                )}
            </FormControl> {unit + 'を表示'}
        </Form>
    );
}

//#endregion

//#region ページャー

/**
 * ページャー（通常版）
 * <NormalPager totalItemCount={} start={} end={} totalPages={} currentPage={} onPageChange={} ></NormalPager>
 * @param {number} totalItemCount データ数合計
 * @param {number} start 表示開始行
 * @param {number} end 表示終了業
 * @param {number} totalPages ページ数合計
 * @param {number} currentPage 現在表示中のページ
 */
const NormalPager = ({ totalItemCount, start, end, totalPages, currentPage, unit, onPageChange: handlePageClick }) => (
    <div className="flex-center-between">
        <div>
            {totalItemCount} {unit} 中 {start} から {end} までを表示
        </div>
        <Pagination prev next first last ellipsis boundaryLinks
            maxButtons={5}
            items={totalPages}
            activePage={currentPage}
            onSelect={(e) => handlePageClick(e)}
        />
    </div>
);

//#endregion