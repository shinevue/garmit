/**
 * @license Copyright 2018 DENSO
 * 
 * BreakerSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import BreakerListBox from 'Assets/List/BreakerListBox';
import MessageModal from 'Assets/Modal/MessageModal';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { showErrorModalInfo, closeModalInfo } from 'messageModalUtility';

/**
 * ブレーカー選択コンポーネントを定義します。
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {object} lookUp 検索条件
 * @param {function} onSelect ブレーカーを選択したときに呼び出す
 * @param {function} onCancel キャンセルしたときに呼び出す
 */
export default class BreakerSelectModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            breakers: null,
            selectedBreaker: null,
            searchCondition: null,
            isLoading: false,
            messageModalInfo: {
                show: false,
                title: null,
                message: null,
                buttonStyle: null
            }
        };
    }

    //#region Reactライフサイクル

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (!nextProps.showModal && this.props.showModal) {
            this.setState({ breakers: null, selectedBreaker: null, searchCondition: null });
        }
    }

    /**
     * render
     */
    render() {
        const { showModal, lookUp } = this.props
        const { breakers, selectedBreaker, searchCondition, isLoading, messageModalInfo } = this.state;
        const hasEGroups = lookUp&&lookUp.egroups&&lookUp.egroups.length > 0 ? true : false;
        return (
            <Modal bsSize={hasEGroups?'large':'small'} show={showModal} backdrop="static" onHide={() => this.onCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>ブレーカー選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {hasEGroups?
                        <SearchConditionBox
                            isLoading={isLoading}
                            targets={['egroups']}
                            lookUp={lookUp}
                            searchCondition={searchCondition}
                            onChange={(condition) => this.changeSearchCondition(condition)}
                            onSearchClick={(condition) => this.searchBrekers(condition)}
                        />
                    :
                        <div>
                            <div>電源系統がありません。もしくは、電源系統への権限がありません。</div>
                            <div>電源系統を登録してください。</div>
                        </div>
                    }
                    {hasEGroups&&
                        <BreakerListBox title="検索結果" 
                                        breakers={breakers} 
                                        selectedBreaker={selectedBreaker}
                                        onSelect={(breaker) => this.selectBreaker(breaker)}
                                        isLoading={isLoading}
                        />
                    }
                </Modal.Body>
                <Modal.Footer>
                    {hasEGroups&&
                        <Button 
                            bsStyle="primary" 
                            onClick={() => this.onSelect(selectedBreaker)}
                            disabled={selectedBreaker?false:true}
                        >
                            <Icon className="fal fa-circle mr-05" />
                            適用
                        </Button>
                    }
                    <Button 
                        iconId="uncheck" 
                        bsStyle="lightgray" 
                        onClick={() => this.onCancel()}
                    >
                        キャンセル
                    </Button>
                </Modal.Footer>
                <MessageModal
                    {...messageModalInfo}
                    bsSize={"sm"}
                    onCancel={() => this.setState({ messageModalInfo: closeModalInfo() })}
                >{messageModalInfo.message}
                </MessageModal>
            </Modal>
        );
    }

    //#endregion

    //#region 検索条件・検索

    /********************************************
     * 検索条件・検索
     ********************************************/

    /**
     * 検索条件を変更する
     * @param {object} condition 検索条件
     */
    changeSearchCondition(condition) {
        this.setState({ searchCondition: condition })
    }

    /**
     * 分岐電源を検索する
     * @param {object} condition 検索条件
     */
    searchBrekers(condition) {
        var egroupIds = [];
        if (condition.egroups && condition.egroups.length > 0) {
            egroupIds = condition.egroups.map((egroup) => egroup.egroupId);
        }
        this.setBreakerList(egroupIds);
    }

    //#endregion

    //#region 分岐電源の選択

    /********************************************
     * 分岐電源の選択
     ********************************************/

    /**
     * 分岐電源を選択する
     * @param {object} breaker 分岐電源
     */
    selectBreaker(breaker) {
        this.setState({selectedBreaker: breaker});
    }

    //#endregion

    //#region イベント発生

    /********************************************
     * イベント発生
     ********************************************/

    /**
     * 適用イベントを呼び出す
     */
    onSelect(breaker){
        if (this.props.onSelect) {
            this.props.onSelect(breaker)
        }
    }

    /**
     * キャンセルイベントを呼び出す
     */
    onCancel(){
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    //#endregion

    //#region API呼び出し

    /**
     * ブレーカー一覧を取得・設定する
     * @param {array} egroupIds 電源系統IDリスト
     */
    setBreakerList(egroupIds) {
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/power/getBreakers', egroupIds, (breakers, networkError) => {
                if (networkError) {
                    this.setState({ isLoading: false, messageModalInfo: showErrorModalInfo(NETWORKERROR_MESSAGE) });
                } else if (breakers) {
                    this.setState({ isLoading: false, breakers: breakers });
                } else {
                    this.setState({ isLoading: false, messageModalInfo: showErrorModalInfo('ブレーカー一覧の取得に失敗しました。') });
                }
            });
        });
    }

    //#endregion
}

BreakerSelectModal.propTypes = {
    showModal: PropTypes.bool,
    lookUp: PropTypes.object,
    onSelect: PropTypes.func,
    onCancel: PropTypes.func,
}
