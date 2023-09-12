/**
 * @license Copyright 2017 DENSO
 * 
 * EgroupOverlaySelector Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Overlay, Popover, ButtonToolbar, Clearfix } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import EgroupTreeView from 'Assets/TreeView/EgroupTreeView';
import EgroupBreadcrumb from '../EgroupBreadcrumb';

/**
 * 電源系統選択パネル
 * @param {array} egroupList 電源系統リスト
 * @param {object} selectedEgroup 選択中の電源系統
 * @param {function} onSelect 電源系統選択時に呼び出す
 * @param {function} container オーバーレイのコンテナ
 * @param {boolean} isRightJustified 右寄せにするかどうか（falseの場合は左寄せ）
 * @param {boolean} isInlineBreadcrumb 電源系統パンくずリストをインライン表示とするか。インラインでない場合は縦に並ぶ
 */
export default class EgroupOverlaySelector extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    /**
     * 電源系統選択ボタン
     * @param {boolean} isPullRight 右寄せかどうか
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    egroupButton(isPullRight, isReadOnly) {
        return (
            <Button ref='target'
                className='ml-0' onClick={(e) => this.toggle(e)}
                disabled={isReadOnly}
            >
                <Icon className={'fas fa-play' + (isPullRight ? ' fa-rotate-180' : '')} />
            </Button>
        )
    }

    /**
     * 電源系統選択のラベル
     * @param {boolean} isPullRight 右寄せかどうか
     */
    egroupLabel(isPullRight) {
        return (
            <span className={'button-inline-span' + (isPullRight ? ' mr-05' : ' ml-05')} >電源系統選択</span>
        );
    }

    /**
     * 電源系統選択コンポーネント
     * @param {boolean} isPullRight 右寄せかどうか
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    setComponents(isRightJustified, isReadOnly) {
        var components = [];
        if (isRightJustified) {
            components.push(this.egroupLabel(isRightJustified, isReadOnly));
            components.push(this.egroupButton(isRightJustified, isReadOnly));
        } else {
            components.push(this.egroupButton(isRightJustified, isReadOnly));
            components.push(this.egroupLabel(isRightJustified, isReadOnly));
        }
        return components;
    }

    /**
     * render
     */
    render() {
        const { container, hideBreadcrumb, isRightJustified, egroupList, selectedEgroup, isReadOnly } = this.props;
        const { show } = this.state;
        return (
            <div ref='egroupPanel' className={'location-select' + (hideBreadcrumb ? ' mt-05' : '')}>
                {isRightJustified ?
                    <div className='pull-right'>
                        {this.setComponents(isRightJustified, isReadOnly)}
                    </div>
                    :
                    this.setComponents(isRightJustified, isReadOnly)
                }
                {isRightJustified && <Clearfix />}
                {!hideBreadcrumb && selectedEgroup.position.length > 0 && <EgroupBreadcrumb egroupList={selectedEgroup.position} />}
                <Overlay show={show}
                    target={this.refs.target}
                    placement={isRightJustified ? "left" : "right"}
                    container={container || this}
                    containerPadding={20}
                    rootClose
                    onEntering={() => this.egroupPanelEntering()}
                    onHide={() => this.egroupPanelHide()}>
                    <div ref='overleyPanel'
                        className='overlay-right-panel' >
                        <EgroupTreeView searchable egroupList={egroupList} selectedEgroup={selectedEgroup.egroup} showCheckbox={false} maxHeight={600} showAllExpandButton={true} onEgroupSelect={(value, position) => this.handleSelect(value, position)} />
                    </div>
                </Overlay>
            </div>
        );
    }

    /**
     * 電源系統パネルの表示切替
     */
    toggle(e) {
        this.setState({
            show: !(this.state.show),
        });
    }

    /**
     * 電源系統パネルを閉じたときのイベント
     */
    egroupPanelHide() {
        this.setState({
            show: false
        });
    }

    /**
     * 電源系統パネルの遷移を開始するイベント
     */
    egroupPanelEntering() {
        var element = this.refs.overleyPanel;
        var top = this.getEgroupPanelTopPosition();
        if (element && top) {
            //縦の位置を変更する（パネルの真ん中の位置で表示されてしまうため）
            element.style.top = top + 'px';
            element.positiontop = top;
        }
    }

    /**
     * 電源系統選択イベントハンドラ
     * @param {object} value 選択した電源系統
     * @param {array} position 電源系統の位置
     */
    handleSelect(value, position) {
        this.egroupPanelHide();       //電源系統パネルを閉じる
        if (this.props.onSelect) {
            this.props.onSelect(value, position)
        }
    }

    /**
     * 電源系統パネルの縦位置を取得する
     */
    getEgroupPanelTopPosition() {
        //電源系統パネル全体のTOP位置を取得
        var element = this.refs.egroupPanel;
        var rect = element.getBoundingClientRect();
        var offset = (window.pageYOffset !== undefined) ?
            window.pageYOffset
            :
            (document.documentElement || document.body.parentNode || document.body).scrollTop;
        return rect.top + offset;
    }

}

EgroupOverlaySelector.propTypes = {
    egroupList: PropTypes.arrayOf(
        PropTypes.shape({
            egroupId: PropTypes.string.isRequired,
            egroupName: PropTypes.string.isRequired,
            children: PropTypes.arrayOf(PropTypes.object),
            isChecked: PropTypes.bool,
        })
    ),
    selectedEgroup: PropTypes.shape({
        egroupId: PropTypes.string.isRequired,
        egroupName: PropTypes.string.isRequired,
        children: PropTypes.arrayOf(PropTypes.object),
        isChecked: PropTypes.bool,
        position: PropTypes.arrayOf({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    }),
    onSelect: PropTypes.func,
    container: PropTypes.object,
    isRightJustified: PropTypes.bool,
    isInlineBreadcrumb: PropTypes.bool,
    isReadOnly: PropTypes.bool
}