/**
 * @license Copyright 2018 DENSO
 * 
 * ネットワーク接続経路表示画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { Row, Col } from 'react-bootstrap';

import { setLoadState, changeMessageModalState } from './actions.js';
import { setViewNetworkPathList, clearViewNetworkPathList, setViewNetworkPath, clearViewNetworkPath } from './actionsViewInfo.js';

import Content from 'Common/Layout/Content';
import LinkButton from 'Common/Widget/LinkButton';
import MessageModal from 'Assets/Modal/MessageModal';

import NetworkPathViewBox from 'NetworkConnection/View/NetworkPathViewBox';
import NetworkBox from 'NetworkConnection/View/NetworkBox';
import UnitBox from 'NetworkConnection/View/UnitBox'

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

/**
 * ネットワーク接続経路表示画面のコンポーネント
 */
class NetworkViewPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const { selectedNetworkPath } = this.props;
        if (selectedNetworkPath && selectedNetworkPath.networkPathRow && selectedNetworkPath.networkPathRow.networkId) {
            this.loadNetworkPath(selectedNetworkPath.networkPathRow.networkId);
        }
    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {
        this.props.clearViewNetworkPathList();
    }

    /**
     * render
     */
    render() {
        const { isLoading, modalInfo } = this.props;
        const { networkPath, selectedNetworkPath } = this.props.viewInfo;
        const isAllowedFrom = selectedNetworkPath && selectedNetworkPath.rackFrom && selectedNetworkPath.rackFrom.location.isAllowed;
        const isAllowedTo = selectedNetworkPath && selectedNetworkPath.rackTo && selectedNetworkPath.rackTo.location.isAllowed;
        return (
            <Content>
                <Row>
                    <Col md={12}>
                        <LinkButton iconClass="fal fa-angle-double-right"
                                    className="asset-transition-link"
                                    disabled={isLoading}
                                    onClick={() => this.dispNetworkList()}
                        >
                            ネットワーク一覧に戻る
                        </LinkButton>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <NetworkPathViewBox networkPath={networkPath} 
                                            selectedNetworkId={selectedNetworkPath&&selectedNetworkPath.network.networkId}
                                            isLoading={isLoading}
                                            onSelect={(networkPath, isExchange) => this.props.setViewNetworkPath(networkPath, isExchange)} 
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={4} xs={12} >
                        {selectedNetworkPath&&selectedNetworkPath.rackFrom&&
                            <UnitBox title="ユニット情報（接続元）"
                                     rackName={selectedNetworkPath.rackFrom.rackName} 
                                     unit={selectedNetworkPath.unitFrom} 
                                     port={selectedNetworkPath.portFrom} 
                                     portIndex={selectedNetworkPath.portIndexFrom}
                                     isAllowed={isAllowedFrom}
                                     isLoading={isLoading} 
                            />
                        }
                    </Col>
                    <Col sm={4} xs={12} isLoading >
                        {selectedNetworkPath&&
                            <NetworkBox 
                                network={selectedNetworkPath.network} 
                                isLoading={isLoading} 
                            />
                        }
                    </Col>
                    <Col sm={4} xs={12} >
                        {selectedNetworkPath&&selectedNetworkPath.rackTo&&
                            <UnitBox title="ユニット情報（接続先）"
                                     rackName={selectedNetworkPath.rackTo.rackName} 
                                     unit={selectedNetworkPath.unitTo}
                                     port={selectedNetworkPath.portTo} 
                                     portIndex={selectedNetworkPath.portIndexTo}
                                     isAllowed={isAllowedTo}
                                     isLoading={isLoading}
                           />
                        }     
                    </Col> 
                </Row>
                <MessageModal show={modalInfo.message.show} 
                              title={modalInfo.message.title} 
                              bsSize="small"
                              buttonStyle="message" 
                              onCancel={() => {modalInfo.message.callback ? modalInfo.message.callback() : this.props.changeMessageModalState(false)}} >
                              {modalInfo.message.show&&
                                  this.makeMessage(modalInfo.message.message, modalInfo.message.attenstion)
                              }
                </MessageModal>
            </Content>
        );
    }

    /**
     * メッセージを作成する
     * @param {string} message メッセージ
     * @param {string} attenstion 注意メッセージ
     * @returns {array} メッセージ
     */
    makeMessage(message, attenstion) {
        var messages = [];
        messages.push(<div>{message}</div>);
                
        if (attenstion) {
            messages.push(<strong><div className="mt-1" >!!!注意!!!</div></strong>);
            messages.push(<strong>{attenstion}</strong>)
        }

        return messages;        
    }

    /********************************************
     * データ読み込み、保存、削除
     ********************************************/

    /**
     * ネットワーク経路を取得する
     * @param {number} networkId ネットワークID
     */
    loadNetworkPath (networkId) {
        const url = '/api/networkPath/getNetworkPath?networkId=' + networkId;
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, url, null, (info, networkError) => {
            if (!networkError&&info&&info.networkPaths&&info.networkPaths.length>0) {
                this.props.setViewNetworkPathList(info.networkPaths[0]);
                this.props.setViewNetworkPath(info.networkPaths[0]);
            } else {
                const message = networkError ? NETWORKERROR_MESSAGE : 'データ取得に失敗しました。';
                this.props.changeMessageModalState(true, 'エラー', message + 'ネットワーク一覧に戻ります。', () => {
                    this.dispNetworkList();
                    this.props.changeMessageModalState(false);
                });
            }
            this.props.setLoadState(false);
        });
    }
    
    /**
     * ネットワーク一覧画面を表示する。
     */
    dispNetworkList() {
        browserHistory.goBack();
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        viewInfo: state.viewInfo,
        isLoading: state.isLoading,
        selectedNetworkPath: state.selectedNetworkPath,
        modalInfo: state.modalInfo,
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setViewNetworkPathList:(networkPath) => dispatch(setViewNetworkPathList(networkPath)),
        clearViewNetworkPathList:() => dispatch(clearViewNetworkPathList()),
        setViewNetworkPath:(networkPath, isExchange) => dispatch(setViewNetworkPath(networkPath, isExchange)),
        clearViewNetworkPath:() => dispatch(clearViewNetworkPath),
        setLoadState:(isLoading) => dispatch(setLoadState(isLoading)),
        changeMessageModalState:(show, title, message, callback) => dispatch(changeMessageModalState(show, title, message, callback))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(NetworkViewPanel);

 