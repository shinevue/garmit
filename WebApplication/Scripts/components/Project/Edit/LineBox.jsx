/**
 * @license Copyright 2020 DENSO
 * 
 * LineBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import GarmitBox from 'Assets/GarmitBox';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';

import LineList from './LineList';
import LineBulkModal from './LineBulkModal';
import LineSelectModal from './LineSelectModal';

import { MAX_LINE_COUNT, validateComSpeed, validateLineCount } from 'projectUtility';
import { getEmptyProjectLine } from 'projectLineUtility';
import { validateSelect, isIntegerString, successResult, VALIDATE_STATE } from 'inputCheck';
import { convertNumber } from 'numberUtility';

/**
 * 回線情報ボックス
 * @param {object} project 案件情報
 * @param {array} lines 回線一覧
 * @param {array} lineTypes 回線種別リスト
 * @param {array} wiringTypes ワイヤ種別リスト
 * @param {array} locations ロケーション情報 
 * @param {object} linePatchCableSelections 回線線番選択肢
 * @param {array} beforeLinePatchCableSelections 修正前線番選択用局入/IDF線番選択肢リスト
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} fixedflg 確定済みかどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onChange 案件変更時に呼び出す
 * @param {function} onChangeLines 回線一覧の変更時に呼び出す
 * @param {fucntion} onInitLineSelect 回線選択画面初期表示時に呼び出す
 * @param {function} onSelectInPatchboard 局入配線盤選択時に呼び出す
 * @param {function} onSelectInPatchCable 局入配線盤/線番変更時に呼び出す（局入で検索するもののみ使用）
 * @param {function} onSelectIdfPatchCable IDF配線盤/線番変更時に呼び出す（IDFで検索するもののみ使用）
 * @param {fucntion} onAddPatchCable 配線盤セレクトボックス追加時に呼び出す
 * @param {function} onClearPatchCables 線番選択をクリアする
 * @param {function} onClearLinePatchCables 回線選択の線番選択をクリアする
 * @param {function} onClearAllLinePatchCables 回線選択の線番選択を全てクリアする
 * @param {function} onAddLinePatchCables 回線選択の線番選択を追加する
 * @param {function} onSearchLine 回線を検索する
 * @param {function} onChangeTempType 登録方法変更時に呼び出す（仮登録/新設の場合）
 * @param {function} onChangeSearchType 検索方法変更時に呼び出す（撤去/修正（仮登録）/修正（残置）の場合）
 * @param {function} onSelectBeforePatchCable 修正前の配線盤/線番変更時に呼び出す（修正（仮登録）/修正（残置）の場合）
 */   
export default class LineBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { project, lines, fixedflg, isReadOnly } = props;
        this.state = { 
            validate : {
                lineType: project && !fixedflg && !isReadOnly ? successResult : { state: null, helpText: null },
                comSpeed: project && !fixedflg && !isReadOnly ? validateComSpeed(project.comSpeed) : { state: null, helpText: null },
                lineCount: project && !fixedflg && !isReadOnly ? validateLineCount(project.lineCount, lines) : { state: null, helpText: null }
            },
            editLines: [],
            showEditModal: false,
            showBulkEditModal: false
        };
    }

    //#region React ライフサイクルメソッド
    
    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeId = this.props.project && this.props.project.projectId;
        const nextProject = nextProps.project;
        const nextFixedflg = nextProps.fixedflg;
        const nextReadOnly = nextProps.isReadOnly;
        const nextId = nextProject && nextProject.projectId;
        if ((!beforeId && nextId) || (beforeId !== nextId)){
            this.setState({
                validate: {
                    lineType: nextProject && !nextFixedflg && !nextReadOnly ? validateSelect(nextProject.lineType.typeId) : { state: null, helpText: null },
                    comSpeed: nextProject && !nextFixedflg && !nextReadOnly ? validateComSpeed(nextProject.comSpeed) : { state: null, helpText: null },
                    lineCount: nextProject && !nextFixedflg && !nextReadOnly ? validateLineCount(nextProject.lineCount, nextProps.lines) : { state: null, helpText: null }
                },
                editLines: []
            });
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { project, lines, lineTypes, isLoading, fixedflg, isReadOnly, locations, wiringTypes, linePatchCableSelections, beforeLinePatchCableSelections, searchedLine } = this.props;
        if (project) {
            var { lineType, comSpeed, lineCount } = project;
        }
        const { validate, showBulkEditModal, showEditModal, editLines } = this.state;
        const projectType = project&&project.projectType;
        return (
            <GarmitBox title="回線情報" isLoading={isLoading} >
                <div>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="回線種別" columnCount={3} isRequired>
                                <SelectForm
                                    value={lineType.typeId}
                                    isRequired
                                    isReadOnly={fixedflg||isReadOnly}
                                    options={lineTypes&&lineTypes.map((type) => { return { value: type.typeId, name: type.name }})}
                                    onChange={(value) => this.onChangeLineType(value, validateSelect(value))} 
                                    validationState={validate.lineType.state}
                                    helpText={validate.lineType.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="通信速度" columnCount={3} >
                                <TextForm 
                                    value={comSpeed}
                                    unit="bps" 
                                    isReadOnly={fixedflg||isReadOnly}
                                    validationState={validate.comSpeed.state}
                                    helpText={validate.comSpeed.helpText}                                
                                    onChange={(value) => this.onChange('comSpeed', value, validateComSpeed(value))}                                
                                />
                            </InputForm.Col>
                            <InputForm.Col label="回線数" columnCount={3} isRequired>
                                <TextForm 
                                    value={lineCount}
                                    isReadOnly={fixedflg||isReadOnly}
                                    validationState={validate.lineCount.state}
                                    helpText={validate.lineCount.helpText}                                
                                    onChange={(value) => this.onChange('lineCount', value, validateLineCount(value, lines))}                                
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                    <LineList
                        lines={lines}
                        isReadOnly={fixedflg||isReadOnly}
                        projectType={projectType}
                        maxLineCount={this.getMaxLineCount(lineCount, validate.lineCount.state)}
                        onAdd={() => this.showLineSelectModal(getEmptyProjectLine(projectType), false)}
                        onEdit={(line) => this.showLineSelectModal(line, true) }
                        onEditBulk={(lines) => this.showLineBulkEditModal(lines)}
                        onDelete={(lines) => this.deleteLines(lines)}
                    />
                </div>
                <LineSelectModal
                    show={showEditModal}
                    line={editLines&&editLines.length===1?editLines[0]:null}
                    wiringTypes={wiringTypes}
                    locations={locations}
                    linePatchCableSelections={linePatchCableSelections}
                    beforeLinePatchCableSelections={beforeLinePatchCableSelections}
                    usedPatchCables={editLines&&editLines.length===1 ? this.getUsedPatchCables(lines, editLines[0]) : []}
                    usedBeforePatchCables={editLines&&editLines.length===1 ? this.getUsedBeforePatchCables(lines, editLines[0]) : []}
                    searchedLine={searchedLine}
                    projectType={projectType}
                    isLoading={isLoading}
                    onApply={(editLine) => this.applyLineChange(editLine)}
                    onCancel={() => this.cancelLineChange()}
                    onAddPatchCable={this.handleAddPatchCable}
                    onClearPatchCables={this.handleClearPatchCables}
                    onSelectInPatchboard={this.handleSelectInPatchboard}
                    onSelectInPatchCable={this.handleSelectInPatchCable}
                    onSelectIdfPatchCable={this.handleSelectIdfPatchCable}
                    onClearLinePatchCables={this.handleClearLinePatchCables}
                    onAddLinePatchCables={this.handleAddLinePatchCables}
                    onSearchLine={this.handleSearchLine}
                    onChangeTempType={this.handleChangeTempType}
                    onChangeSearchType={this.handleChangeSearchType}
                    onSelectBeforePatchCable={this.handleSelectBeforePatchCable}
                />
                <LineBulkModal
                    show={showBulkEditModal}
                    locations={locations}
                    onApply={(editKeys, editLine) => this.applyLineBulkChange(editKeys, editLine)}
                    onCancel={() => this.cancelLineBulkChange()}
                />
            </GarmitBox>
        );
    }

    //#region 入力変更

    /**
     * 入力変更イベントを発生させる
     * @param {string} key 変更値のオブジェクトキー
     * @param {any} value 変更後の値
     * @param {object} validate 入力検証結果
     */
    onChange(key, value, validate){
        const validateResult = this.setValidate(validate, key);
        if (this.props.onChange) {
            this.props.onChange(key, value, this.invalid(validateResult));
        }
    }

    /**
     * 回線一覧の変更イベント
     * @param {*} value 
     * @param {*} isError 
     */
    onChangeLines(value, isError) {
        if (this.props.onChangeLines) {
            this.props.onChangeLines(value, isError);
        }
    }

    /**
     * 回線種別の変更イベント
     * @param {object} value 変更後の回線種別ID
     * @param {object} validate 検証結果
     */
    onChangeLineType(value, validate) {
        const { lineTypes } = this.props
        const lineType = lineTypes ? lineTypes.find((type) => type.typeId === convertNumber(value)) : null;
        this.onChange('lineType', lineType, validate);
    }

    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate) {
        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key) && 
                validate[key].state &&
                validate[key].state !== VALIDATE_STATE.success) {
                    invalid = true;
                    break; 
            }
        }
        return invalid;
    }

    //#endregion

    //#region 入力検証

    /**
     * 検証結果をセットする
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @param {object} beforeValidate 変更前の検証結果（指定がない時はstateから変更）
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, key, beforeValidate) {
        var validate = beforeValidate ? Object.assign({}, beforeValidate) : Object.assign({}, this.state.validate);
        if (validate.hasOwnProperty(key) && targetValidate) {
            validate[key] = targetValidate;
            this.setState({validate:validate});
        }        
        return validate;
    }

    //#endregion

    //#region 回線選択モーダル関連
    
    /**
     * 回線選択モーダルを表示する
     * @param {object} line 編集中の回線
     * @param {boolean} isEdit 編集かどうか
     */
    showLineSelectModal(line, isEdit) {
        if (this.props.onInitLineSelect) {
            this.props.onInitLineSelect(this.props.project.projectType, isEdit, line);
        }
        this.setState({
            editLines: [ _.cloneDeep(line) ],
            showEditModal: true
        });
    }

    /**
     * 回線情報の変更を適用する
     * @param {object} value 変更後の回線情報
     */
    applyLineChange(value) {
        var workLines = _.cloneDeep(this.props.lines);
        const isUpdate = workLines.some((line) => {
                            if (line.projectLineNo === value.projectLineNo) {
                                line.lineNo = value.lineNo;
                                line.lineId1 = value.lineId1;
                                line.lineId2 = value.lineId2;
                                line.lineId3 = value.lineId3;
                                line.lineName = value.lineName;
                                line.location = value.location ? _.cloneDeep(value.location) : null;
                                line.wiringType = value.wiringType ? _.cloneDeep(value.wiringType) : null;
                                line.lineConnections = value.lineConnections ? _.cloneDeep(value.lineConnections) : [];
                                line.beforeLineConnections = value.beforeLineConnections ? _.cloneDeep(value.beforeLineConnections) : [];
                                line.memo = value.memo;
                                line.tempType = value.tempType;
                                line.hasTemp = value.hasTemp;
                                line.searchType = value.searchType;
                                line.leftType = value.leftType;
                                line.openDate = value.openDate ? value.openDate : null;
                                line.closeDate = value.closeDate ? value.closeDate : null;
                            }
                            return (line.projectLineNo === value.projectLineNo);
                         });
        if (!isUpdate) {
            const projectLineNos = workLines.map((item) => item.projectLineNo);
            const maxProjectLineNo = projectLineNos && projectLineNos.length > 0 ? Math.max.apply(null, projectLineNos) : 0;
            value.projectLineNo = maxProjectLineNo + 1;
            workLines.push(_.cloneDeep(value));
        }
        this.onChangeLines(workLines);
        this.onClearAllLinePatchCables();
        this.setState({ editLines: [], showEditModal: false});
    }

    /**
     * 回線情報の変更をキャンセルする
     */
    cancelLineChange(){
        this.onClearAllLinePatchCables();
        this.setState({ editLines: [], showEditModal: false});
    }

    /**
     * 使用中の回線線番情報リストを取得する
     * @param {array} lines 
     */
    getUsedPatchCables(lines, targetLine) {
        var patchCables = [];
        lines.forEach((line) => {
            if (line.projectLineNo !== targetLine.projectLineNo) {
                line.lineConnections.forEach((lineConnection) => {
                    let patchCableSequences = lineConnection.patchCableSequences.filter((sequence) => sequence.patchboardId !== null);
                    if (patchCableSequences && patchCableSequences.length > 0) {
                        patchCables = patchCables.concat(patchCableSequences);
                    }
                });
            }
        });        
        return patchCables;
    }

    /**
     * 使用中の修正前の回線線番情報リストを取得する
     * @param {array} lines 
     */
    getUsedBeforePatchCables(lines, targetLine) {
        var patchCables = [];
        lines.forEach((line) => {
            if (line.projectLineNo !== targetLine.projectLineNo) {
                line.beforeLineConnections.forEach((lineConnection) => {
                    let patchCableSequences = lineConnection.patchCableSequences.filter((sequence) => sequence.patchboardId !== null);
                    if (patchCableSequences && patchCableSequences.length > 0) {
                        patchCables = patchCables.concat(patchCableSequences);
                    }
                });
            }
        });        
        return patchCables;
    }

    //#endregion

    //#region 回線一括編集

    /**
     * 回線一括モーダルを表示する
     * @param {object} lines 
     */
    showLineBulkEditModal(lines) {
        this.setState({
            editLines: _.cloneDeep(lines),
            showBulkEditModal: true
        });
    }

    /**
     * 回線情報の一括変更を適用する
     * @param {object} line 
     */

    /**
     * 回線情報の一括変更を適用する
     * @param {array} editKeys 編集対象キー
     * @param {object} editLine 編集後の回線情報
     */
    applyLineBulkChange(editKeys, editLine) {
        const { editLines } = this.state;
        const updateLines = this.props.lines.map((beforeLine) => {
            let update = _.cloneDeep(beforeLine);
            if (editLines.some((l) => l.projectLineNo === update.projectLineNo)) {
                editKeys.forEach((key) => {
                    _.set(update, key, editLine[key]);
                });
            }
            return update;
        });
        this.onChangeLines(updateLines);
        this.setState({ editLines: [], showBulkEditModal: false});
    }

    /**
     * 回線情報の変更をキャンセルする
     */
    cancelLineBulkChange(){
        this.setState({ editLines: [], showBulkEditModal: false});
    }

    //#endregion

    //#region 回線削除関連

    /**
     * 回線を削除する
     * @param {array} lines 削除するの回線一覧
     */
    deleteLines(lines) {
        const nextLines = this.props.lines.filter((line) => !lines.some((l) => l.projectLineNo === line.projectLineNo));
        this.onChangeLines(nextLines);
    }

    //#endregion

    //#region 線番セレクトボックス変更関係

    /**
     * IDF配線盤セレクトボックス追加イベントハンドラ
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     */
    handleAddPatchCable = (seriesNo, patchboardId, callback) => {
        if (this.props.onAddPatchCable) {
            this.props.onAddPatchCable(seriesNo, patchboardId, callback);
        }
    }

    /**
     * IDF配線盤セレクトボックスクリアイベントハンドラ
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo 回線線番No
     */
    handleClearPatchCables = (seriesNo, seqNo) => {
        if (this.props.onClearPatchCables) {
            this.props.onClearPatchCables(seriesNo, seqNo);
        }
    }

    /**
     * 局入配線盤選択イベントハンドラ ※新設（仮登録なし）のみ
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     */
    handleSelectInPatchboard = (seriesNo, patchboardId) => {
        if (this.props.onSelectInPatchboard) {
            this.props.onSelectInPatchboard(seriesNo, patchboardId);
        }
    }


    /**
     * 局入配線盤/線番変更時に呼び出す　※新設（局入のみ） / 撤去（使用中・局入のみ） / 変更 / 残置
     */
    handleSelectInPatchCable = () => {
        if (this.props.onSelectInPatchCable) {
            this.props.onSelectInPatchCable();
        }
    }

    /**
     * IDF配線盤/線番変更時に呼び出す　※新設（構内のみ）/撤去（構内のみ）のみ
     */
    handleSelectIdfPatchCable = () => {
        if (this.props.onSelectIdfPatchCable) {
            this.props.onSelectIdfPatchCable();
        }
    }

    /**
     * 線番選択の選択肢を全てクリアする
     */
    onClearAllLinePatchCables() {
        if (this.props.onClearAllLinePatchCables) {
            this.props.onClearAllLinePatchCables();
        }
    }

    /**
     * 線番選択の選択肢をクリアする　※ワイヤ変更時
     * @param {number} seriesNo 局入系統No
     */
    handleClearLinePatchCables = (seriesNo) => {
        if (this.props.onClearLinePatchCables) {
            this.props.onClearLinePatchCables(seriesNo);
        }
    }

    /**
     * 線番選択の選択肢を追加する　※ワイヤ変更時
     * @param {number} seriesNo 局入系統No
     * @param {number} tempType 登録方法
     */
    handleAddLinePatchCables = (seriesNo, tempType) => {
        if (this.props.onAddLinePatchCables) {
            this.props.onAddLinePatchCables(seriesNo, tempType);
        }
    }

    /**
     * 回線を検索する
     * @param {number} patchboardId 配線盤ID
     * @param {number} patchCableNo 線番
     * @param {number} projectType 工事種別
     * @param {number} tempType 仮登録方法
     * @param {number} searchType 検索方法
     */
    handleSearchLine = (patchboardId, patchCableNo, projectType, tempType, searchType) => {
        if (this.props.onSearchLine) {
            this.props.onSearchLine(patchboardId, patchCableNo, projectType, tempType, searchType)
        }
    }

    /**
     * 登録方法を変更する（仮登録/新設）
     * @param {number} projectType 工事種別
     * @param {number} tempType 登録方法
     * @param {boolean} hasTemp 仮登録ありかどうか
     * @param {boolean} hasWireType ワイヤありかどうか
     */    
    handleChangeTempType = (projectType, tempType, hasTemp, hasWireType) => {
        if (this.props.onChangeTempType) {
            this.props.onChangeTempType(projectType, tempType, hasTemp, hasWireType);
        }
    }

    /**
     * 検索方法を変更する（撤去/修正（仮登録）/修正（残置））
     * @param {number} projectType 工事種別
     * @param {number} searchType 検索方法
     * @param {boolean} hasWireType ワイヤありかどうか
     */
    handleChangeSearchType = (projectType, searchType, hasWireType) => {
        if (this.props.onChangeSearchType) {
            this.props.onChangeSearchType(projectType, searchType, hasWireType);
        }
    }

    /**
     * 検索欄の配線盤/線番変更時に呼び出す　※修正（仮登録）/ 修正（残置）のみ
     */
    handleSelectBeforePatchCable = () => {
        if (this.props.onSelectBeforePatchCable) {
            this.props.onSelectBeforePatchCable();
        }
    }

    //#endregion

    //#region 

    /**
     * 最大回線数を取得する
     * @param {string} lineCount 入力されて回線数
     * @param {string} validateState 検証結果
     * @returns 最大回線数
     */
    getMaxLineCount(lineCount ,validateState){
        var maxLineCount = MAX_LINE_COUNT;
        if (validateState === VALIDATE_STATE.success || isIntegerString(lineCount)) {
            maxLineCount = convertNumber(lineCount)
        }
        return maxLineCount;
    }

    //#endregion
}

LineBox.propsTypes = {
    project: PropTypes.object,
    lines: PropTypes.array,
    lineTypes: PropTypes.array,
    wiringTypes: PropTypes.array,
    locations: PropTypes.array,
    linePatchCableSelections: PropTypes.object,
    isLoading: PropTypes.bool,
    fixedflg: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onChange: PropTypes.func,
    onChangeLines: PropTypes.func,
    onInitLineSelect: PropTypes.func,
    onSearchPatchCables: PropTypes.func,
    onSelectInPatchboard: PropTypes.func,
    onAddPatchCable: PropTypes.func,
    onClearPatchCables: PropTypes.func,
    onClearLinePatchCables: PropTypes.func,
    onClearAllLinePatchCables: PropTypes.func,
    onAddLinePatchCables: PropTypes.func,
    onSearchLine: PropTypes.func
}