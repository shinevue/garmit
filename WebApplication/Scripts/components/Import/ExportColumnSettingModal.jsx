/**
 * Copyright 2017 DENSO Solutions
 * 
 * ExportColumnSettingModal Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Form, Grid } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import SelectForm from 'Common/Form/SelectForm';

import MessageModal from 'Assets/Modal/MessageModal';
import ExportColumnSettingForm from 'Import/ExportColumnSettingForm';

import { sendData, EnumHttpMethod } from 'http-request';

import { IMPORT_TYPE, EXPORT_TYPE } from 'constant';

/**
 * カラム表示設定モーダル
 * @param {bool} showModal モーダルを表示するか
 * @param {func} onHide モーダルを閉じる処理
 */
export default class ExportColumnSettingModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            category: this.getInitCategory(props.target),
            exportColumns: []
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.target != this.props.target) {
            this.setState({ category: this.getInitCategory(nextProps.target) });
        }
        if (nextProps.exportColumns !== this.props.exportColumns || (nextProps.showModal && !this.props.showModal)) {
            this.setState({ exportColumns: nextProps.exportColumns });
        }
    }

    /**
     * エクスポートカラムが変更された時
     * @param {any} filteredColumns
     */
    onChange(filteredColumns) {
        const columns = this.state.exportColumns.filter((col) => col.exportType !== this.state.category);
        this.setState({ exportColumns: columns.concat(filteredColumns) });
    }

    /**
     * 初期表示カテゴリーを取得
     * @param {any} target
     */
    getInitCategory(target) {
        switch (target) {
            case IMPORT_TYPE.rack:
                return EXPORT_TYPE.rack;

            case IMPORT_TYPE.unit:
                return EXPORT_TYPE.unit;

            case IMPORT_TYPE.point:
                return EXPORT_TYPE.point;

            case IMPORT_TYPE.icCard:
                return EXPORT_TYPE.icCard;    

        }
    }

    /**
     * カテゴリーのオプションを取得
     */
    getOptions() {
        switch (this.props.target) {
            case IMPORT_TYPE.rack:
                return [
                    { value: EXPORT_TYPE.rack, name: 'ラック情報' },
                    { value: EXPORT_TYPE.rackPower, name: '電源情報' },
                    { value: EXPORT_TYPE.rackOutlet, name: 'アウトレット情報' },
                    { value: EXPORT_TYPE.rackLink, name: 'リンク情報' },
                ];
            case IMPORT_TYPE.unit:
                return [
                    { value: EXPORT_TYPE.unit, name: 'ユニット情報' },
                    { value: EXPORT_TYPE.unitPower, name: '電源情報' },
                    { value: EXPORT_TYPE.unitLink, name: 'リンク情報' },
                    { value: EXPORT_TYPE.unitPort, name: 'ポート設定' },
                    { value: EXPORT_TYPE.unitIPAddress, name: 'IPアドレス' },
                ];
            default:
                return [];
        }
    }
    
    /**
     * インポート種別が「ラック」もしくは「ユニット」かどうか
     * @param {number} importType インポート種別
     */
     isAssetImportType(importType) {
        return importType === IMPORT_TYPE.rack || importType === IMPORT_TYPE.unit;
    }

    /**
     * render
     */
    render() {
        const { target } = this.props;
        const { exportColumns, category } = this.state;

        const filteredColumns = exportColumns && exportColumns.filter((col) => col.exportType === category);

        return (
            <div>
                <Modal show={this.props.showModal} onHide={() => this.props.onCancel()} backdrop="static">
                    <Modal.Header closeButton>
                        <Modal.Title>項目選択</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.isAssetImportType(this.props.target) &&
                            <Form inline className="mlr-2 mb-2">
                                <SelectForm
                                    label="出力カテゴリ　"
                                    value={this.state.category}
                                    options={this.getOptions()}
                                    onChange={(val) => this.setState({ category: parseInt(val), editedUserColumns: { columnHeaders: [] } })}
                                />
                            </Form>
                        }
                        {filteredColumns &&
                            <ExportColumnSettingForm
                                exportColumns={filteredColumns}
                                onChange={(filteredColumns) => this.onChange(filteredColumns)}
                            />
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            bsStyle="primary"
                            onClick={() => this.props.onSubmit(exportColumns)}
                        >
                            <Icon className="fal fa-circle mr-05" />
                            <span>適用</span>
                        </Button>
                        <Button
                            iconId="uncheck"
                            bsStyle="lightgray"
                            onClick={() => this.props.onCancel()}
                        >
                            <span>キャンセル</span>
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

ExportColumnSettingModal.propTypes = {
    showModal: PropTypes.bool,
    onHide: PropTypes.func
}

ExportColumnSettingModal.defaultProps = {
    showModal: false,
    onHide: () => { }
}