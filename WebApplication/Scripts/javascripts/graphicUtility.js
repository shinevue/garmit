/**
 * @license Copyright 2018 DENSO
 * 
 * グラフィックメンテナンスUtility
 * 
 */

'use strict';

import { DRAW_AREA_SIZE } from 'constant';
import { validateInteger, validateReal, validateText } from 'inputCheck';

//#region 定数
/**
 * オブジェクト種別
 */
export const OBJECT_TYPE = {
    label: 1,
    picture: 2,
    valueLabel: 3
}

/**
 * オブジェクト種別選択肢
 */
export const OBJECT_TYPE_OPTIONS = [
    { value: OBJECT_TYPE.label, name: "ラベル" },
    { value: OBJECT_TYPE.picture, name: "ピクチャ" },
    { value: OBJECT_TYPE.valueLabel, name: "測定値ラベル" }
];

/**
 * リンク種別
 */
export const LINK_TYPE = {
    nothing: 0,
    point: 1,
    location: 2,
    layout: 3,
    egroup: 4,
}

/**
 * リンク種別選択肢
 */
export const LINK_TYPE_OPTIONS = [
    { value: LINK_TYPE.nothing, name: "リンクなし" },
    { value: LINK_TYPE.point, name: "ポイント" },
    { value: LINK_TYPE.location, name: "ロケーション" },
    { value: LINK_TYPE.layout, name: "レイアウト" },
    { value: LINK_TYPE.egroup, name: "電源系統" }
];

/**
 * オブジェクト設定ボックスデフォルト値
 */
export const DEFAULT_OBJECT_SETTING = {
    monitor: 1,
    objectType: OBJECT_TYPE.label,
    position: { x: 0, y: 0 },
    size: { width: 16, height: 12 },
    backColor: "#D3EDFB",
    foreColor: "black",
    displayText: "",
    fontSize: 8,
    border: 1,
    borderColor: "black",
    backgroundImage: null,
    backgroundImageUrl: null,
    linkType: LINK_TYPE.nothing,
    egroup: null,
    point: null,
    layout: null,
    location: null,
    isMultiRack: false
}

/**
 * レイアウト設定ボックスデフォルト値
 */
export const DEFAULT_LAYOUT_SETTING = {
    systemId: null,
    layoutId: -1,
    layoutName: null,
    backgroundImage: null,
    backgroundImageUrl: null,
    backgourndMaskImage: null,
    backgroundMaskImageUrl: null,
    parent: null,
    children: [],
    layoutObjects: [],
    lebel: null,
    location: null,
    updateUserId: null,
    updateDate:null
}
//#endregion

//#region SVG関連
/**
 * レイアウトオブジェクトを操作可能にする
 */
export function setEditableObject(id, onChangeMapObject) {
    const maintObjectGroup = SVG.get(id);
    var isDragging = false;

    //マウスエンターイベント設定
    maintObjectGroup.on('mouseover', function () {
        this.draggable();   //ドラッグ可能にする
    });
    //マウスアウトイベント設定
    maintObjectGroup.on('mouseout', function () {
        this.draggable(false);  //ドラッグ不可にする
    });
    //オブジェクト移動イベント設定
    maintObjectGroup.on('dragmove', function (e) {
        moveObjects(e);
    })
    //オブジェクト移動終了イベント設定
    maintObjectGroup.on('dragend', (e) => {
        isDragging = false;         //ドラッグ終了
        changePosition(e, onChangeMapObject);
    });
    //ドラッグ開始イベント設定
    maintObjectGroup.on('beforedrag', (e) => {
        if (!isDragging) {
            isDragging = true;
        } else {
            e.preventDefault();     //ドラッグ中だったら、ドラッグをキャンセル
        }
    });

    const maintObject = SVG.get("rect" + id);
    //オブジェクトリサイズを可能にする
    maintObject.selectize({
        classRect: ['through-object', 'transparent-object'],
        classPoints: 'resize-points',
        points: ['rb'],   //右下ポイントのみ表示（位置の変更を起こさないため）
        rotationPoint: false    //回転用ポイントは表示しない
    }).resize();
    //オブジェクトリサイズイベント設定
    maintObject.on('resizing', (e) => {
        resizeObject(e);
    });
    //オブジェクトリサイズ終了イベント設定
    maintObject.on('resizedone', (e) => {
        changeSize(e, onChangeMapObject);
    });
    //オブジェクトリサイズ終了イベント設定
    maintObject.on('beforedrag', (e) => {
        e.preventDefault();
    });
}

/**
 * レイアウトオブジェクトを操作不可にする
 */
export function clearEditableObject(id) {
    const maintObjectGroup = SVG.get(id);
    const maintObject = SVG.get("rect" + id);

    //リサイズ不可に変更
    maintObject.selectize(false);
    //イベント削除
    maintObjectGroup.off('mouseenter');
    maintObjectGroup.off('mouseout');
    maintObjectGroup.off('dragend');
    maintObjectGroup.off('mouseover');
    maintObjectGroup.off('dragmove');
    maintObjectGroup.off('beforedrag');
    //ドラッグ不可に変更
    maintObjectGroup.draggable(false);
}

/**
 * 選択中四角形オブジェクトグループのIDを取得する
 */
function getSelectIdList(target) {
    let selectIdList = [];
    if ($(target).find('.selectable-object').hasClass('maint-select-object')) {
        $('.maint-select-object').each((index, obj) => {
            selectIdList.push(_.trim(obj.id, 'rect'));
        });
    }
    else {
        selectIdList.push(target.id);
    }
    return selectIdList;
}

/**
 * 入力されているグリッド間隔を取得する
 */
function getGridSize() {
    //吸着するかどうか取得
    const isSnap = $("#isSnap").find('label').hasClass('active') && !$("#gridSizeWidth").children().hasClass('has-error');
    if (isSnap) {
        const width = $("#gridSizeWidth").find('input').val();
        const height = $("#gridSizeHeight").find('input').val();
        return {
            width: !width || isNaN(width) ? 1 : Number(width),
            height: !height || isNaN(height) ? 1 : Number(height)
        }
    }
    else {
        return { width: 1, height: 1 };
    }
}
//#region オブジェクト移動用関数
/**
 * ボーダー幅調整値取得
 */
function getStrokeAdjust(id) {
    const strokeWidth = SVG.get(id).style('stroke-width');
    const adjust = isNaN(strokeWidth) ? 0 : Number(strokeWidth) / 2;
    return adjust;
}

/**
 * オブジェクト移動
 */
export function moveObjects(e) {
    if (e.detail) {
        e.preventDefault();
        const gridSize = getGridSize();
        const targetId = e.target.id;      //つかまれたオブジェクトのID
        //つかまれたオブジェクトの移動後の位置を取得する
        const position = getMovedPosition(targetId, e.detail, gridSize);

        //選択中オブジェクト取得
        var select = SVG.select("rect.maint-select-object");
        if (select.length() === 0 || !SVG.get("rect" + targetId).hasClass('maint-select-object')) {
            //選択オブジェクトではない
            svgz_element(e.target).toTop();    //最前面に移動する    
            SVG.get(targetId).transform({ x: position.x, y: position.y });
        }
        else {  //選択オブジェクトの場合、選択中のすべてのオブジェクトを一緒に移動させる
            moveSelectObjects(position, targetId, select, gridSize);
        }
    }
}

/**
 * 選択中オブジェクトを移動
 */
function moveSelectObjects(position, targetId, select, gridSize) {
    const distance = getDistance(position, targetId);   //移動距離を取得
    for (let i = 0; i < select.length(); i++) {
        const targetId = _.trim(select.get(i).node.id, 'rect');
        svgz_element(SVG.get(targetId).node).toTop();    //最前面に移動する    
        const target = SVG.get(targetId);
        //移動距離から各オブジェクトの移動後の位置を取得する
        let afterPosition = {
            x: target.transform().x + distance.x,
            y: target.transform().y + distance.y
        };
        const strokeAdjust = getStrokeAdjust("rect" + targetId);
        const position = AdjustMaxMin(afterPosition, targetId, strokeAdjust);
        target.transform(position);
    }
}

/**
 * オブジェクトの移動を適用する
 */
function changePosition(e, onChangeMapObject) { 
    let selectIdList = getSelectIdList(e.target);
    const changeList = [];
    selectIdList.forEach((id) => {
        const adjust = getStrokeAdjust("rect" + id);
        changeList.push({
            key: isNaN(id)? null:Number(id),
            value: { x: SVG.get(id).transform().x - adjust, y: SVG.get(id).transform().y - adjust }
        });
    })
    onChangeMapObject({ changeObject: { item: "position", change: changeList }, gripObjectId: !isNaN(e.target.id) &&Number(e.target.id) });
}

//#region 位置計算関数
/**
 * 移動後の位置情報取得する
 */
function getMovedPosition(targetId, detail, gridSize) {
    //移動開始時のオブジェクトの位置
    const startPosition = getStartPosition(targetId, detail);

    //移動開始時のマウスの位置（オブジェクトからの相対位置）
    const startMousePosition = getStartMousePosition(detail);

    //移動前の位置
    const beforePosition = getBeforePosition(targetId);

    //移動開始から移動前までの移動距離を取得
    const latestMoveDistance = getLatestMoveDistance(beforePosition, startPosition);

    //移動後の位置
    let afterPosition = getAfterPosition(targetId, startPosition, detail, startMousePosition, gridSize);

    //ボーダー幅調整
    const strokeAdjust = getStrokeAdjust("rect" + targetId);
    afterPosition.x += strokeAdjust;
    afterPosition.y += strokeAdjust;

    //最大値最小値調整
    let position = AdjustMaxMin(afterPosition, targetId, strokeAdjust);

    return position;
}

/**
 * 前回からの今回の移動距離を取得する
 */
function getDistance(position, targetId) {
    const beforePosition = getBeforePosition(targetId);
    return {
        x: position.x - beforePosition.x,
        y: position.y - beforePosition.y
    };
}

/**
 * 移動前の位置情報取得する
 */
function getBeforePosition(targetId) {
    return {
        x: SVG.get(targetId).transform().x,
        y: SVG.get(targetId).transform().y
    };
}

/**
 * 移動開始時のオブジェクトの位置情報取得する
 */
function getStartPosition(targetId, detail) {
    return {
        x: detail.handler.startPoints.transform.x,
        y: detail.handler.startPoints.transform.y
    };
}

/**
 * 移動開始時のマウスの位置情報取得する
 */
function getStartMousePosition(detail) {
    return {
        x: detail.handler.startPoints.point.x,
        y: detail.handler.startPoints.point.y
    };
}

/**
 * 移動開始から前回までの移動距離を取得する
 */
function getLatestMoveDistance(beforePosition, startPosition) {
    return {
        x: beforePosition.x - startPosition.x,
        y: beforePosition.y - startPosition.y
    };
}

/**
 * 移動後の位置情報を取得する
 */
function getAfterPosition(targetId, startPosition, detail, startMousePosition, gridSize) {
    let afterPosition = {
        x: startPosition.x + detail.p.x - startMousePosition.x ,
        y: startPosition.y + detail.p.y - startMousePosition.y 
    };
    //グリッド幅に合わせて位置を調整する
    afterPosition = AdjustGrid(afterPosition, gridSize);
    return afterPosition;
}

/**
 * グリッド幅に合わせて位置を調整する
 */
function AdjustGrid(afterPosition, gridSize) {
    const adjustX = afterPosition.x % gridSize.width;
    const adjustY = afterPosition.y % gridSize.height;
    return {
        x: afterPosition.x - adjustX,
        y: afterPosition.y - adjustY
    };
}

/**
 * 最大値最小値に合わせて位置を調整する
 */
function AdjustMaxMin(afterPosition, targetId, strokeAdjust) {
    //最大値（描画エリア幅/高さ - オブジェクト幅/高さ + ボーダー幅）
    const maxX = DRAW_AREA_SIZE.width - SVG.get("rect" + targetId).width() + strokeAdjust;
    const maxY = DRAW_AREA_SIZE.height - SVG.get("rect" + targetId).height() + strokeAdjust;
    const min = strokeAdjust;

    return {
        x: _.inRange(afterPosition.x, 0, maxX) ? afterPosition.x : afterPosition.x <= min ? min : maxX,
        y: _.inRange(afterPosition.y, 0, maxY) ? afterPosition.y : afterPosition.y <= min ? min : maxY
    };
}
//#endregion
//#endregion

//#region オブジェクトリサイズ用関数
/**
 * 前回からの今回の移動距離を取得する
 */
export function resizeObject(e) {
    const gridSize = getGridSize();

    //リサイズ後のサイズ
    const resizedWidth = SVG.get(e.target.id).width();
    const resizedHeight = SVG.get(e.target.id).height();

    //グリッドに合わせてサイズ調整
    const adjustWidth = resizedWidth % gridSize.width;
    const adjustHeight = resizedHeight % gridSize.height;
    const afgerWidth = resizedWidth - adjustWidth;
    const afgerHeight = resizedHeight - adjustHeight;
    
    //最小値チェック
    const width = afgerWidth < gridSize.width ? gridSize.width : afgerWidth;
    const height = afgerHeight < gridSize.height ? gridSize.height : afgerHeight;
    
    SVG.get(e.target.id).size(width, height);
}

/**
 * オブジェクトのサイズ変更を適用する
 */
function changeSize(e, onChangeMapObject) {
    //リサイズオブジェクトの四角形グループのIDを取得
    let targetId = _.trimStart(SVG.get(e.target.id), "rect");
    targetId = isNaN(targetId) ? null : Number(targetId);
    onChangeMapObject({
        changeObject: {
            item: "size",
            change: [{
                key: isNaN(targetId)?null:Number(targetId),
                value: { width: SVG.get(e.target.id).width(), height: SVG.get(e.target.id).height() }
            }]
        },
        gripObjectId: targetId
    })
}
//#endregion
//#endregion

//#region 入力チェック
/**
 * グリッド間隔入力チェック
 */
export function gridSizeInputCheck(value) {
    const width = validateInteger(value.width, 1, DRAW_AREA_SIZE.width, false);
    const height = validateInteger(value.height, 1, DRAW_AREA_SIZE.height, false);
    return {
        width: width,
        height: height,
        state: width.state === "success" && height.state === "success" ? "success" : "error"
    }
}

/**
 * layoutName入力チェック
 */
export function layoutNameInputCheck(value) {
    return validateText(value, 30, false);
}
/**
 * position入力チェック
 */
export function positionInputCheck(value, objSize) {
    const objectWidth = isNaN(objSize.width) || Number(objSize.width) > DRAW_AREA_SIZE.width ? 0 : Number(objSize.width);
    const objectHeight = isNaN(objSize.height) || Number(objSize.height) > DRAW_AREA_SIZE.height ? 0 : Number(objSize.height);
    const maxX = DRAW_AREA_SIZE.width - objectWidth;
    const maxY = DRAW_AREA_SIZE.height - objectHeight;
    const x = validateInteger(value.x, 0, maxX, false);
    const y = validateInteger(value.y, 0, maxY, false);
    return {
        x: x,
        y: y,
        state: x.state === "success" && y.state === "success" ? "success" : "error"
    };
}
/**
 * size入力チェック
 */
export function sizeInputCheck(value) {
    const width = validateInteger(value.width, 1, DRAW_AREA_SIZE.width, false);
    const height = validateInteger(value.height, 1, DRAW_AREA_SIZE.height, false);
    return {
        width: width,
        height: height,
        state: width.state === "success" && height.state === "success" ? "success" : "error"
    }
}
/**
 * border入力チェック
 */
export function borderInputCheck(value) {
    return validateInteger(value, 1, 10, false);
}
/**
 * displayText入力チェック
 */
export function displayTextInputCheck(value) {
    return validateText(value, 50, true);
}
/**
 * fontSize入力チェック
 */
export function fontSizeInputCheck(value) {
    return validateReal(value, 1, 72, false, 1)
}

/**
 * objectSettingBoxの入力チェック
 */
export function validateObjectSetting(value, isMultiSelect) {
    if (isMultiSelect) {    //複数選択になった場合はすべて未チェックのためerrorとする
        return { state: "error" };
    }
    const inputResult = {
        position: positionInputCheck(_.get(value, "position"), _.get(value, "size")),
        size: sizeInputCheck(_.get(value, "size")),
        borderColor:{state:'success'},
        border: borderInputCheck(_.get(value, "border")),
        backColor: { state: 'success' },
        objectType: { state: 'success' },
        fontSize: fontSizeInputCheck(_.get(value, "fontSize")),
        displayText: displayTextInputCheck(_.get(value, "displayText")),
        foreColor: { state: 'success' },
        linkType: { state: 'success' }
    };
    return { ...inputResult, state: _.every(inputResult, { 'state': 'success' }) ? 'success' : 'error' };
}

/**
 * objectSettingBox情報を適用可能かどうか取得
 * @param validationInfo 各フォームの検証結果
 * @param unchecked チェック解除されたかどうか
 * @param checkedItems チェックされている項目名配列
 */
export function getIsApply(validationInfo, unchecked, checkedItems) {
    let state = "error";    //チェック解除された（複数選択中）かつチェックされている項目がない場合は適用不可
    if (!unchecked || _.size(checkedItems) > 0) {
        state = _.every(_.omit(validationInfo, ['state']), { 'state': 'success' }) ? "success" : "error";
    }
    return state;
}
//#endregion

//#region その他
/**
 * objectSettingBoxの情報を適用できる形に変換する（文字列→数値）
 */
export function convertObjectSettingBox(info) {
    let convert = _.cloneDeep(info);
    //数値に変換
    convert.position.x = Number(convert.position.x);
    convert.position.y = Number(convert.position.y);
    convert.size.height = Number(convert.size.height);
    convert.size.width = Number(convert.size.width);
    convert.border = Number(convert.border);
    convert.fontSize = Number(convert.fontSize);
    return convert;
}

/**
 * objectSettingBoxで表示する情報を取得する
 */
export function getObjectSetting(value) {
    return _.pick(value,
        [
            "monitor",
            "objectType",
            "position",
            "size",
            "backColor",
            "foreColor",
            "displayText",
            "fontSize",
            "border",
            "borderColor",
            "backgroundImage",
            "backgroundImageUrl",
            "linkType",
            "egroup",
            "point",
            "layout",
            "location",
            "isMultiRack"
        ]);
}

/**
 * layoutObject一覧からobjectIdでlayoutObjectを取得する
 */
export function getMatchLayoutObject(layoutObjects, objectId) {
    return _.find(layoutObjects, { "objectId": objectId });
}

/**
 * layoutObject一覧から新規登録用のobjectIdを取得する（使用中objectIdのmax+1）
 */
export function getAddObjectId(layoutObjects) {
    if (layoutObjects.length > 0) {
        const maxId = _.maxBy(layoutObjects, 'objectId').objectId;
        return maxId+ 1;
    }
    return 1;   //レイアウトオブジェクトが1つもない場合は1を返す
}

/**
 * layoutObject一覧から選択中オブジェクト情報を取得する
 */
export function getSelectObjectInfo(layoutObjects, selectObjects) {
    const result = [];
    selectObjects.forEach((obj) => {
        const match = _.find(layoutObjects, { "objectId": obj });
        if (match) {
            result.push(match);
        }
    })
    return result;
}

/**
 * 測定値ラベルのみ表示中かどうか判定する
 */
export function isSelectOnlyValueLabel(layoutObjects, selectObjects) {
    const objectInfo = getSelectObjectInfo(layoutObjects, selectObjects);
    if (_.size(objectInfo) > 0) {
        return _.every(objectInfo, { 'objectType': OBJECT_TYPE.valueLabel });
    }
    return false;   //選択オブジェクトがない場合はfalse
}

/**
 * 値を持っているかどうか
 */
export function hasValue(value) {
    if (value !== "" && value !== null && value !== undefined) {
        return true;
    }
    return false;
}

/**
 * レイアウトオブジェクトの選択中オブジェクトに変更を適用した値を取得
 * @param layoutObjects
 * @param targetObjects 変更を適用したいオブジェクトの配列
 * @param changed 変更したい項目名と値のオブジェクト配列
 */
export function getAppliedObjects(layoutObjects, targetObjects, changed) {
    let result = _.cloneDeep(layoutObjects);
    targetObjects.forEach((obj) => {
        const targetId = _.findIndex(result, { 'objectId': obj.objectId });
        if (targetId >= 0) {
            let objectSetting = changed;
            if (result[targetId].objectType === OBJECT_TYPE.valueLabel) {
                //測定値表示ラベルの場合は表示文字・文字色は設定しない
                if (objectSetting.displayText) {
                    objectSetting.displayText = "";
                }
                if (objectSetting.foreColor) {
                    objectSetting.foreColor = "";
                }
            }
            if (result[targetId].objectType !== OBJECT_TYPE.picture) {
                //ピクチャ以外の場合は背景画像情報は設定しない
                if (objectSetting.backgroundImage) {
                    objectSetting.backgroundImage = "";
                }
                if (objectSetting.backgroundImageUrl) {
                    objectSetting.backgroundImageUrl = "";
                }
            }
            result[targetId] = Object.assign({}, result[targetId], objectSetting);
        }
    });
    return result;
}

/**
 * 分割ラック設定が設定可能かどうか
 * @param {object} location ロケーション
 */
export function canSettingIsMultiRack(location) {
    if (location && location.children && location.children.length > 0) {
        return true;
    }
    return false;
}

/**
 * 分割ラック設定が可能か
 * @param {object} layout レイアウト
 */
export function canSettingIsMultiRackByLayout(layout) {
    if (layout) {
        return canSettingIsMultiRack(layout.location);
    }
    return false;
}


//#endregion