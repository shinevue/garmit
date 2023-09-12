/**
 * @license Copyright 2018 DENSO
 * 
 * MoveUnitInfo Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Panel, Col, Form, FormGroup, ControlLabel, Breadcrumb } from 'react-bootstrap';
import AssetArrow from 'Assets/AssetArrow';
import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';
import { hasUnitDispSetting } from 'assetUtility';

/**
 * 移動ユニット情報表示コンポーネント
 * @param {string} rackName ラック名称
 * @param {object} unitDispSetting ユニット表示設定グループ
 * @param {boolean} isTouchDevice タッチデバイスかどうか
 * @param {boolean} isLeft 移動ユニットが左ラック内のユニットか
 */
export default class MoveUnitInfo extends Component {
    
    /**
     * render
     */
    render() {
        const { rackName, unitDispSetting, isLeft, isTouchDevice } = this.props;
        const unitNames = unitDispSetting?unitDispSetting.units.map((unit) => { return { value: unit.name, isHighlight: unit.frontFlg||unit.rearFlg }} ) : [];
        var typeNames = unitDispSetting?unitDispSetting.units.map((unit) =>  { return { value: unit.type.name }}) : [];
        typeNames = typeNames.filter((x, i, self) => self.findIndex(item => item.value === x.value) === i);
        const isDispSetting = hasUnitDispSetting(unitDispSetting);
        const divClasses = {
            'asset-panel-item': true,
            'pa-right': isDispSetting&&isLeft,
            'pa-left': isDispSetting&&!isLeft
        }

        return (
            <div className={'asset-panel-group' + (isTouchDevice?' asset-center-first-row':'')} >
                {isDispSetting&&isLeft&&
                    <div className='asset-panel-item asset-panel-addon hidden-xs'>
                        <AssetArrow className="unitmove-arrow-left" direction='left' />
                    </div>
                }
                <div className={classNames(divClasses)}>
                    <Panel bsStyle={isDispSetting?'primary':'default'} header='移動ユニット'>
                        <Form className='row' horizontal>
                            <Col md={6}>
                                <StaticTextForm label='ラック名称' value={rackName}/>
                                <StaticMultipleValueFrom label='名称' values={unitNames}/>
                                <StaticMultipleValueFrom label='種別' values={typeNames}/>
                                <StaticTextForm label='搭載位置' value={unitDispSetting&&(unitDispSetting.position.y + 'U × ' + unitDispSetting.position.x + '列')}/>
                            </Col>
                            <Col md={6}>
                                <StaticTextForm label='占有ユニット数' value={unitDispSetting&&(unitDispSetting.size.height + 'U × ' + unitDispSetting.size.width + '列')}/>
                                <StaticTextForm label='重量(合計)' value={unitDispSetting&&(unitDispSetting.totalWeight.toFixed(1) + 'kg')}/>
                                <StaticTextForm label='定格電力(合計)' value={unitDispSetting&&(unitDispSetting.totalPower.toFixed(1) + 'W')}/>
                            </Col>                       
                        </Form>
                    </Panel>
                </div>
                {isDispSetting&&!isLeft&&
                    <div className='asset-panel-item asset-panel-addon hidden-xs'>
                        <AssetArrow className="unitmove-arrow-right" direction='right' />
                    </div>
                }
            </div>
        );
    }
}

/**
 * ラベルフォーム
 * @param {string} label フォームのタイトル
 * @param {string} value 表示文字列
 */
class StaticTextForm extends Component {
    render(){
        const { label, value } = this.props;
        return (
            <HorizontalLabelForm label={label} value={value} labelCol={{md: 5}} valueCol={{md: 7}} />
        );
    }
}

/**
 * 複数ユニット用のパンくずリストフォーム
 * @param {string} label フォームのタイトル
 * @param {array} values パンくずリストの文字列リスト { value: 表示する文字列, isHighlight: ハイライトするかどうか }
 */
class StaticMultipleValueFrom extends Component {
    render() {
        const { label, values } = this.props;
        return (
            <FormGroup>
                <Col componentClass={ControlLabel} md={5}>
                    {label}
                </Col>
                <Col md={7}>
                    <Breadcrumb className="unitmove-label-breadcrumb" >
                        {values.map((item) => <li className={(values.length>1&&item.isHighlight)?'breadcrumb-highlight':''} >{item.value}</li>)}
                    </Breadcrumb>
                </Col>
            </FormGroup>
        );
    }
}

MoveUnitInfo.propTypes = {
    rackName: PropTypes.string,
    unitDispSetting: PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
        dispSetId: PropTypes.string.isRequired,
        frontDispData: PropTypes.shape({             //前面の表示設定
            dispName: PropTypes.string.isRequired
        }).isRequired,
        rearDispData: PropTypes.shape({              //背面の表示設定
            dispName: PropTypes.string.isRequired
        }).isRequired,
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired,
        size: PropTypes.shape({
            height: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired
        }).isRequired,
        totalWeight: PropTypes.number,
        totalPower: PropTypes.number,
        units: PropTypes.arrayOf(PropTypes.shape({
            unitId: PropTypes.string.isRequired,
            unitNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            type: PropTypes.shape({
                name: PropTypes.string.isRequired
            })
        }))
    }),
    isLeft: PropTypes.bool
}
