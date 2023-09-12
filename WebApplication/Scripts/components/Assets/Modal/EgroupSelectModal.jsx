/**
 * Copyright 2017 DENSO Solutions
 * 
 * 電源系統選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import EgroupTreeView from 'Assets/TreeView/EgroupTreeView'

/**
 * 電源系統選択モーダル
 *
 * @param {bool} showModal モーダル表示
 * @param {bool} checkbox チェックボックスの表示
 * @param {bool} defaultCollapse 初期状態でツリーを閉じるか
 * @param {bool} searchable ツリーに検索ボックスを表示するか
 * @param {array} egroupList 電源系統リスト
 * @param {object} selectedEgroup 選択された所属
 * @param {array} checkedEgroups チェックされた所属
 * @param {func} onSubmit 適用ボタンクリック時に呼ぶ関数
 * @param {func} onCancel キャンセルボタンクリック時に呼ぶ関数
 */
export default class EgroupSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedEgroup: this.props.selectedEgroup,
            checkedEgroups: this.props.checkedEgroups
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
        if (this.props.selectedEgroup !== nextProps.selectedEgroup) {
            this.setState({ selectedEgroup: nextProps.selectedEgroup });
        }
        if (this.props.checkedEgroups !== nextProps.checkedEgroups
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedEgroups: nextProps.checkedEgroups });
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
                this.props.onSubmit(this.state.checkedEgroups)
            } else {
                this.props.onSubmit(this.state.selectedEgroup)
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
        this.setState({ selectedEgroup: null });
    }

    render() {
        const { showModal, egroupList, checkbox, defaultCollapse, onCancel } = this.props
        const { selectedEgroup, checkedEgroups } = this.state
        return (
            <div>
                <Modal show={this.props.showModal} backdrop="static" onHide={() => onCancel()}>
                    <Modal.Header closeButton>
                        <Modal.Title>電源系統選択</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <EgroupTreeView
                            defaultCollapse={false}
                            checkbox={checkbox}
                            searchable={true}
                            defaultCollapse={defaultCollapse}
                            egroupList={this.props.egroupList}
                            selectedEgroup={selectedEgroup}
                            onEgroupSelect={(val) => this.setState({ selectedEgroup: val })}
                            checkedEgroups={checkedEgroups}
                            onCheckedEgroupsChange={(val) => this.setState({ checkedEgroups: val })}
                            showAllExpandButton={true}
                            maxHeight={500}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            bsStyle="primary"
                            onClick={() => this.handleSubmit()}
                            disabled={checkbox ?
                                (checkedEgroups && checkedEgroups.length > 0 ? false : true)
                                :
                                !selectedEgroup
                            }
                        >
                            <Icon className="fal fa-circle mr-05"/>
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
            </div>
        )
    }
}

EgroupSelectModal.propTypes = {
    showModal: PropTypes.bool,
    checkbox: PropTypes.bool,
    defaultCollapse: PropTypes.bool,
    searchable: PropTypes.bool,
    egroupList: PropTypes.array,
    selectedEgroup: PropTypes.object,
    checkedEgroups: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

EgroupSelectModal.defaultProps = {
    showModal: false,
    checkbox: false,
    defaultCollapse: false,
    searchable: false,
    egroupList: [],
    selectedEgroup: {},
    checkedEgroups: [],
    onSubmit: () => { },
    onCancel: () => { }
}