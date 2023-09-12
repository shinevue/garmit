/**
 * Copyright 2017 DENSO Solutions
 * 
 * 所属選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import EnterpriseTreeView from 'Assets/TreeView/EnterpriseTreeView'


/**
 * 所属選択モーダル
 *
 * @param {bool} showModal モーダル表示
 * @param {bool} checkbox チェックボックスの表示
 * @param {bool} defaultCollapse 初期状態でツリーを閉じるか
 * @param {bool} searchable ツリーに検索ボックスを表示するか
 * @param {array} enterpriseList 所属リスト
 * @param {object} selectedEnterprise 選択された所属
 * @param {array} checkedEnterprise チェックされた所属
 * @param {func} onSubmit 適用ボタンクリック時に呼ぶ関数
 * @param {func} onCancel キャンセルボタンクリック時に呼ぶ関数
 */
export default class EnterpriseSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedEnterprise: this.props.selectedEnterprise,
            checkedEnterprise: this.props.checkedEnterprise
        }
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.selectedEnterprise !== nextProps.selectedEnterprise || this.props.showModal !== nextProps.showModal) {
            this.setState({ selectedEnterprise: nextProps.selectedEnterprise });
        }
        if (this.props.checkedEnterprise !== nextProps.checkedEnterprise
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedEnterprise: nextProps.checkedEnterprise });
        }
    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {
    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            if (this.props.checkbox) {
                this.props.onSubmit(this.state.checkedEnterprise)
            } else {
                this.props.onSubmit(this.state.selectedEnterprise)
            }
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    /**
     * render
     */
    render() {
        const { showModal, enterpriseList, checkbox, searchable, initialTreeMode } = this.props
        const { selectedEnterprise, checkedEnterprise } = this.state

        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>所属選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EnterpriseTreeView
                        checkbox={checkbox}
                        searchable={searchable}
                        enterpriseList={this.props.enterpriseList}
                        selectedEnterprise={selectedEnterprise}
                        initialTreeMode={initialTreeMode}
                        onEnterpriseSelect={(val) => this.setState({ selectedEnterprise: val })}
                        checkedEnterprises={checkedEnterprise}
                        onCheckedEnterpriseChange={(val) => this.setState({ checkedEnterprise: val })}
                        showAllExpandButton={true}
                        maxHeight={500}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.handleSubmit()}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.handleCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

EnterpriseSelectModal.propTypes = {
    showModal: PropTypes.bool,
    checkbox: PropTypes.bool,
    searchable: PropTypes.bool,
    enterpriseList: PropTypes.array,
    selectedEnterprise: PropTypes.object,
    checkedEnterprise: PropTypes.array,
    initialTreeMode: PropTypes.oneOf(['individual', 'collective']),  //ツリーチェックモード初期値
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

EnterpriseSelectModal.defaultProps = {
    showModal: false,
    checkbox: false,
    searchable: false,
    enterpriseList: [],
    selectedEnterprise: {},
    checkedEnterprise: [],
    onSubmit: () => { },
    onCancel: () => { }
}
