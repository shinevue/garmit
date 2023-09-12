/**
 * @license Copyright 2018 DENSO
 * 
 * AlarmToast Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { BUTTON_OPERATION_TYPE } from 'constant';
import { transitPage } from 'alarmToast';

/**
 * アラームトーストコンポーネントを定義します。
 * @param {number} alarmId アラーム番号
 * @param {object} alarmToastItem 発生中アラームパネル情報
 */
export default class AlarmToast extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.sectionRef = null;
    }

    /**
     * render
     */
    render() {
        const { alarmToastItem } = this.props
        const { alarmId, occurTime, alamCssClassName, categoryMessage, alarmPlaces, hoverButtons } = alarmToastItem;
        const { pointName, rackName, unitName, gateName, reportScheduleName, consumerName, projectNo, idfConnect, patchboardName } = alarmToastItem;
        const { occuredValueString, systemErrorType, extendedItemName, expiredDate } = alarmToastItem;

        return (
            <section className={'toast ' + (alamCssClassName ? 'toast-' + alamCssClassName : '')}
                     ref={(section) => {this.sectionRef = section}}
            >
                <div className="toast-title">{categoryMessage}</div>
                <dl className="toast-description">
                    {occurTime&&this.descriptionItem('発生日時', occurTime)}
                    {alarmPlaces&&this.alarmPlaces(alarmPlaces)}
                    {pointName&&this.descriptionItem('ポイント', pointName)}
                    {rackName&&this.descriptionItem('ラック', rackName)}
                    {unitName&&this.descriptionItem('ユニット', unitName)}
                    {gateName&&this.descriptionItem('機器', gateName)}
                    {reportScheduleName&&this.descriptionItem('スケジュール', reportScheduleName)}
                    {consumerName&&this.descriptionItem('コンシューマー', consumerName)}
                    {projectNo&&this.descriptionItem('工事番号', projectNo)}
                    {idfConnect&&this.descriptionItem('IDF線番', idfConnect)}
                    {patchboardName&&this.descriptionItem('配線盤', patchboardName)}
                    {occuredValueString&&this.descriptionItem('検出値', occuredValueString, 'message')}
                    {systemErrorType&&this.descriptionItem('メッセージ', systemErrorType, 'message')}
                    {extendedItemName&&this.descriptionItem('項目', extendedItemName)}
                    {expiredDate&&this.descriptionItem('日付', expiredDate, 'message')}
                </dl>
                {hoverButtons&&hoverButtons.length>0&&
                    <ToastActionButtons buttons={hoverButtons} alarmId={alarmId} />
                }
            </section>
        );
    }

    /**
     * アラーム発生場所
     * @param {array} alarmPlaces アラーム発生場所リスト
     */
    alarmPlaces(alarmPlaces) {
        const isMultiple = alarmPlaces&&alarmPlaces.length>1 ? true : false;
        var places = [];
        alarmPlaces.forEach((place, index) => {
            places.push(<dt>{'発生場所' + (isMultiple?(index+1):'')}</dt>);
            places.push(<dd><AlarmPlaceBreadcrumbs alarmPlaceList={place} /></dd>)
        });
        return places;
    }

    /**
     * 説明項目
     * @param {string} title タイトル
     * @param {string} value 値
     * @param {string} className クラス
     */
    descriptionItem(title, value, className) {
        var description = [];
        description.push(<dt>{title}</dt>);
        description.push(<dd className={className}>{value}</dd>);
        return description;
    }
}

/**
 * アラーム発生場所のパンくずリスト
 * @param {array} alarmPlace アラーム発生場所
 */
class AlarmPlaceBreadcrumbs extends Component {
    render() {
        const { alarmPlaceList } = this.props;
        return (
            <ol className="location-path">
                {alarmPlaceList&&alarmPlaceList.length>0&&
                    alarmPlaceList.map((place) => <li>{place}</li>)
                }
            </ol>                         
        );
    }
}

/**
 * トーストに表示するボタン
 * @param {array} ボタン情報リスト
 */
class ToastActionButtons extends Component {
    
    /**
     * render
     */
    render() {
        const { buttons, alarmId } = this.props;
        return (
            <div className="toast-action">
                {buttons.map((item) => this.makeButton(item, alarmId))}
            </div>
        );
    }

    /**
     * ボタンを作成する
     * @param {object} hoverButton 表示するボタン情報
     */
    makeButton(hoverButton, alarmId) {
        const { operationType, parameterKeyPairs } = hoverButton;        
        const iconClass = {
            'btn-garmit-floor-map': (operationType === BUTTON_OPERATION_TYPE.linkToFloorMap),
            'btn-garmit-trend-graph': (operationType === BUTTON_OPERATION_TYPE.graphDisp),
            'btn-garmit-category-asset': (operationType === BUTTON_OPERATION_TYPE.linkToRack) || (operationType === BUTTON_OPERATION_TYPE.linkToUnit),
            'btn-garmit-category-maintenance': (operationType === BUTTON_OPERATION_TYPE.pointDetail) || (operationType === BUTTON_OPERATION_TYPE.linkToDatagate),
            'btn-garmit-category-schedule':  (operationType === BUTTON_OPERATION_TYPE.linkToReportSchedule),
            'btn-garmit-category-consumer': (operationType === BUTTON_OPERATION_TYPE.linkToConsumer),
            'btn-garmit-eleckey-map': (operationType === BUTTON_OPERATION_TYPE.linkToElectricLockMap),
            'btn-garmit-category-line': (operationType === BUTTON_OPERATION_TYPE.linkToProject) || (operationType === BUTTON_OPERATION_TYPE.linkToLine) || (operationType === BUTTON_OPERATION_TYPE.linkToPatchboard),
        };

        var url = '';
        var title = '';
        switch (operationType) {
            case BUTTON_OPERATION_TYPE.linkToFloorMap:
                url = '/FloorMap';
                title = 'フロアマップ';
                break;        
            case BUTTON_OPERATION_TYPE.graphDisp:
                url = '/TrendGraph';
                title = 'トレンドグラフ';
                break;
            case BUTTON_OPERATION_TYPE.linkToRack:
                url = '/Rack';
                title = 'ラック';
                break;
            case BUTTON_OPERATION_TYPE.linkToUnit:
                url = '/Unit';
                title = 'ユニット';
                break;
            case BUTTON_OPERATION_TYPE.pointDetail:
                url = '/Maintenance/Point';
                title = 'ポイント';
                break;
            case BUTTON_OPERATION_TYPE.linkToDatagate:
                url = '/Maintenance/Device';
                title = '機器';
                break;
            case BUTTON_OPERATION_TYPE.linkToReportSchedule:
                url = '/ReportSchedule';
                title = 'レポートスケジュール';
                break;
            case BUTTON_OPERATION_TYPE.linkToConsumer:
                url = '/Consumer';
                title = 'コンシューマー';
                break;
            case BUTTON_OPERATION_TYPE.linkToElectricLockMap:
                url = '/ElectricLockMap';
                title = '電気錠マップ'
                break;
            case BUTTON_OPERATION_TYPE.linkToProject:
                url = '/Project';
                title = '案件'
                break;
            case BUTTON_OPERATION_TYPE.linkToLine:
                url = '/Line';
                title = '回線'
                break;
            case BUTTON_OPERATION_TYPE.linkToPatchboard:
                url = '/Patchboard';
                title = '配線盤'
                break;
        }

        return (
            <Button 
                bsStyle="xs" 
                className={iconClass}
                data-alarmid={alarmId} 
                data-operationtype={operationType} 
                data-url={url} 
                onClick={(e) => transitPage(url, parameterKeyPairs)} >
                    {title}
            </Button>
        );
    }
}



AlarmToast.propTypes = {
    alarmId: PropTypes.number.isRequired,
    alarmToastItem: PropTypes.shape({
        alarmId: PropTypes.number.isRequired,
        occurTime: PropTypes.string,
        alamCssClassName: PropTypes.string,
        alarmCategory: PropTypes.shape({
            alarmType: PropTypes.number,
            name: PropTypes.string,
            categoryType: PropTypes.shape({
                categoryNo: PropTypes.number,
                name: PropTypes.string,
                iconClass: PropTypes.string,
                color: PropTypes.string
            }),
            direction: PropTypes.number
        }),
        categoryMessage: PropTypes.string,
        alarmPlace: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
        pointName: PropTypes.string,
        rackName: PropTypes.string,
        unitName: PropTypes.string,
        gateName: PropTypes.string,
        occuredValueString: PropTypes.string,
        systemErrorType: PropTypes.string,
        extendedItemName: PropTypes.string,
        expiredDate: PropTypes.string,
        soundUrl: PropTypes.string,
        hoverButtons: PropTypes.arrayOf(PropTypes.shape({
            operationType: PropTypes.number.isRequired,
            parameterKeyPairs: PropTypes.arrayOf(PropTypes.shape({
                paramater: PropTypes.string,
                key: PropTypes.string
            }))
        }))
    }).isRequired
}