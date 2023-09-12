/**
 * @license Copyright 2020 DENSO
 * 
 * 配電盤表示画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as Actions from './actions.js';

import { Form, FormControl, Row, Col, Clearfix } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import TreeView from 'Common/Widget/TreeView';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import LinkButton from 'Common/Widget/LinkButton';
import DataTable from 'Common/Widget/DataTable';
import AssetDetailBox from 'Assets/AssetDetailBox';
import GarmitBox from 'Assets/GarmitBox';

import PatchboardPathBox from 'Patchboard/PatchboardPathBox';
import PatchboardInfoBox from 'Patchboard/PatchboardInfoBox';
import ChildrenPatchboardsListBox from 'Patchboard/ChildrenPatchboardsListBox';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { getYoungestChildren } from 'patchboardUtility';

/**
 * PatchboardDisp画面のコンポーネント
 */
class PatchboardDispPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            selectedPathIndex: 0,
            selectedPathNo: 0
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        if (this.props.dispPatchboardId) {
            this.loadPatchboardForm(this.props.dispPatchboardId, () => {
                this.loadAncestorsTree(this.props.dispPatchboardId, (trees) => {
                    if (trees && trees[0]) {
                        const patchboard = getYoungestChildren(trees[0]);
                        this.loadChildrenPatchboards(patchboard);
                    }
                });
            });
        }

        garmitFrame.refresh();
    }

    /**
     * propsが変化したときの処理
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {

    }

    /**
     * 子配線盤クリック
     */
    onChildrenPatchboardSelect(patchboardId) {
        const parentPatchboardId = this.props.patchboardForm.patchboard.patchboardId;

        this.loadPatchboardForm(patchboardId, () => {
            this.loadAncestorsTree(patchboardId, (trees) => {
                if (trees) {
                    const index = trees.findIndex((tree) => {
                        const p = getYoungestChildren(tree);
                        return p.parents && p.parents[0] && p.parents[0].patchboardId == parentPatchboardId
                    });

                    this.setState({ selectedPathIndex: index });
                    const patchboard = getYoungestChildren(trees[index]);
                    this.loadChildrenPatchboards(patchboard);
                }
            });
        });
    }

    /**
     * 配線盤ツリー選択
     */
    onTreeNodeSelect(patchboard) {
        this.loadPatchboardForm(patchboard.patchboardId, () => {
            this.loadAncestorsTree(patchboard.patchboardId, (trees) => {
                if (trees) {
                    const index = trees.findIndex((tree) => {
                        const p = getYoungestChildren(tree);
                        return p.patchboardId == patchboard.patchboardId && p.pathNo == patchboard.pathNo
                    });

                    this.setState({ selectedPathIndex: index });
                    this.loadChildrenPatchboards(patchboard);
                }
            });
        });
    }

    /**
     * セレクトボックスで経路が変更された時
     * @param {any} index
     */
    onChangeSelectedPathIndex(index) {
        this.setState({ selectedPathIndex: index });

        if (index >= 0 && this.props.ancestorsTree[index]) {           
            const patchboard = getYoungestChildren(this.props.ancestorsTree[index]);
            this.loadChildrenPatchboards(patchboard);
        } else {
            this.setChildrenPatchboards([]);
        }        
    }

    /**
     * 配線盤編集情報を取得する
     * @param {any} patchboardId
     * @param {any} callback
     */
    loadPatchboardForm(patchboardId, callback) {
        const postData = { patchboardId: patchboardId };

        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/form', postData, (patchboardForm, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setPatchboardForm(patchboardForm);
            }
            if (callback) {
                callback(patchboardForm);
            }
        });
    }

    /**
     * 先祖ツリーを読み込む
     * @param {any} patchboardId
     * @param {any} callback
     */
    loadAncestorsTree(patchboardId, callback) {
        const postData = { patchboardId: patchboardId };

        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/tree/ancestors', postData, (ancestorsTree, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setAncestorsTree(ancestorsTree);
            }
            if (callback) {
                callback(ancestorsTree);
            }
        });
    }

    /**
     * 子配線盤を読み込む
     * @param {any} patchboard
     * @param {any} callback
     */
    loadChildrenPatchboards(patchboard, callback) {
        const postData = { patchboardId: patchboard.patchboardId, pathNo: patchboard.pathNo };
        this.setState({ selectedPathNo: patchboard.pathNo });   //経路番号を保持しておく

        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/children/pathNo', postData, (children, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setChildrenPatchboards(children);
            }
            if (callback) {
                callback(children);
            }
        });
    }

    /**
     * 一覧に戻る
     */
    goBack() {
        this.props.setPatchboardForm(null);
        this.props.setAncestorsTree(null);
        this.props.setChildrenPatchboards(null);
        this.props.setDispPatchboardId(null);
        browserHistory.goBack();
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { patchboardForm, ancestorsTree, childrenPatchboards, isLoading } = this.props;
        const { selectedPathIndex, selectedPathNo } = this.state;

        return (
            <Content>
                <div className="flex-center-left mb-05">
                    <LinkButton iconClass="fal fa-angle-double-right"
                                    className="asset-transition-link"
                                    onClick={() => this.goBack()}
                        >
                            一覧に戻る
                        </LinkButton>
                </div>
                <Row>
                    <Col sm={3}>
                        <PatchboardPathBox
                            isLoading={isLoading}
                            selectedPathIndex={selectedPathIndex}
                            patchboardTrees={ancestorsTree}
                            selectedPatchboard={patchboardForm && patchboardForm.patchboard}
                            selectedPathNo={selectedPathNo}
                            onSelectPatchboard={(patchboard) => this.onTreeNodeSelect(patchboard)}
                            onChangeSelectedPathIndex={(index) => this.onChangeSelectedPathIndex(index)}
                        />
                    </Col>
                    <Col sm={9}>
                        <PatchboardInfoBox
                            isLoading={isLoading}
                            patchboard={patchboardForm && patchboardForm.patchboard}
                        />
                        {patchboardForm && patchboardForm.extendedPages && patchboardForm.extendedPages.length > 1 &&
                            <div className="mb-2">
                                <AssetDetailBox
                                    isLoading={isLoading}
                                    title="詳細情報"
                                    id={1}
                                    pages={patchboardForm.extendedPages}
                                    defaultClose={false}
                                    isReadOnly={true}
                                    isSysAdmin={level === LAVEL_TYPE.administrator}
                                />
                            </div>
                        }
                        <ChildrenPatchboardsListBox
                            isLoading={isLoading}
                            patchboards={childrenPatchboards}
                            onSelect={(patchboardId) => this.onChildrenPatchboardSelect(patchboardId)}
                        />
                    </Col>
                </Row>
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        dispPatchboardId: state.dispPatchboardId,
        patchboardForm: state.patchboardForm,
        ancestorsTree: state.ancestorsTree,
        childrenPatchboards: state.childrenPatchboards,
        isLoading: state.isLoading,
        authentication: state.authentication
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(PatchboardDispPanel);

 