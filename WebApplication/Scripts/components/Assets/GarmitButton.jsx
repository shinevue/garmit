/**
 * Copyright 2017 DENSO Solutions
 * 
 * garmit用ボタン Reactコンポーネント
 *  
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import Hotkeys from 'react-hot-keys';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { HOT_KEYS } from 'constant';

/**
 * ボタンを作成する
 */
const createButton = (Component, btnProps, text, iconProps )=>{    
    return (props) => (
        <Component {...props} {...btnProps} className={classNames(props.className, btnProps.className)}>
            {iconProps &&
                <FalIcon {...iconProps} isMargin={text && 'mr-05'} />
            }
            {text}
        </Component>
    );
}

/**
 * アイコン用コンポーネント
 */
const FalIcon = ({iconId, isMargin})=>(
    <Icon className={classNames('fal fa-'+iconId,isMargin)} />
)

/**
 * ツールチップ付きボタンを作成する
 */
const createToolTipButton = (Component, tooltip, placement, trigger) => {
    const overlay = <Tooltip children={tooltip} />
    return (props) => (
        <OverlayTrigger placement={placement} overlay={overlay} trigger={trigger}>
            <Component {...props} />
        </OverlayTrigger>
    );
}

/**
 * ショートカット付きボタンを作成する
 * @returns 
 */
const createHotKeyButton =  (Component, keyName) => {
    return (props) => (        
        <Hotkeys
            keyName={keyName}
            filter={(event) => {
                let target = event.target || event.srcElement;
                let tagType = target.type;
                let tagName = target.tagName;
                if (tagType == 'checkbox') {
                    return true;
                } else if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') {
                    return false;
                }
                return true;
            }}
            onKeyDown={() => props.onClick && props.onClick()}
            disabled={props.disabled}
        >
            <Component {...props} />
        </Hotkeys>
    );
}

//追加ボタン
export const AddButton = createButton(Button, {isCircle:false, iconId:"add"}, "追加");
export const AddCircleButton = createButton(Button, { isCircle: true, iconId: "add" });
export const AddHotKeyButton = 
    createHotKeyButton(
        createButton(Button, {isCircle:false, iconId:"add"}, "追加"),
        HOT_KEYS.add,
    );

//削除ボタン
export const DeleteButton = createButton(Button, {isCircle:false, iconId:"delete"}, "削除");
export const DeleteCircleButton = createButton(Button, { isCircle: true, iconId: "delete" });
export const DeleteHotKeyButton = 
    createHotKeyButton(
        createButton(Button, {isCircle:false, iconId:"delete"}, "削除"),
        HOT_KEYS.delete,
    );

//編集ボタン
export const EditButton = createButton(Button, { isCircle: false, iconId: "edit" }, "編集");
export const EditCircleButton = createButton(Button, { isCircle: true, iconId: "edit" },);
export const EditHotKeyButton = 
    createHotKeyButton(
        createButton(Button, { isCircle: false, iconId: "edit" }, "編集"),
        HOT_KEYS.edit,
    );

//並べ替えボタン
export const SortButton = createButton(Button, { isCircle: false, bsStyle: "primary" }, "並べ替え", { iconId: "sort" });
export const SortCircleButton =
    createToolTipButton(
        createButton(Button, { isCircle: true, bsStyle: "primary" }, null, { iconId: "sort" }),
        "並べ替え", "bottom"
    );

//新規登録ボタン
export const RegisterButton = createButton(Button, { isCircle: false, iconId: "add" }, "新規登録");
export const RegisterHotKeyButton = 
    createHotKeyButton(
        createButton(Button, { isCircle: false, iconId: "add" }, "新規登録"),
        HOT_KEYS.add
    );

//その他ボタン
export const CancelButton = createButton(Button, { isCircle: false, iconId: "uncheck", bsStyle: "lightgray" }, "キャンセル");
export const CloseButton = createButton(Button, { isCircle: false, iconId: "uncheck", bsStyle: "lightgray" }, "閉じる");

//保存ボタン
export const SaveButton = createButton(Button, { isCircle: false, bsStyle: "success" }, "保存", { iconId: "save" }, HOT_KEYS.save);
export const SaveHotKeyButton = 
    createHotKeyButton(
        createButton(Button, { isCircle: false, bsStyle: "success" }, "保存", { iconId: "save" }),
        HOT_KEYS.save
    );

export const ApplyButton = createButton(Button, { isCircle: false, bsStyle: "primary" }, "適用", { iconId: "circle" });

export const RemoveCircleButton = createButton(Button, { isCircle: true, bsStyle: "lightgray" }, null, { iconId: "eraser" });

export const SelectClearButton = createButton(Button, { isCircle: false, iconId: "uncheck", bsStyle: "lightgray" }, "選択解除");

export const ExportReportButton = createButton(Button, { isCircle: false, className: "btn-garmit-output-csv" }, "レポート出力");
export const ExportReportHotKeyButton = 
    createHotKeyButton(
        createButton(Button, { isCircle: false, className: "btn-garmit-output-csv" }, "レポート出力"),
        HOT_KEYS.outputReport
    );

export const LayoutSelectCircleButton = createButton(Button, { isCircle: true, className: "btn-garmit-select-layout" });
export const ImageSelectCircleButton = createButton(Button, { isCircle: true, bsStyle: "primary" }, null, { iconId: "images" });
export const PowerSelectCircleButton = createButton(Button, { isCircle: true, className: "btn-garmit-plug" });
export const LinkSelectCircleButton = createButton(Button, { isCircle: true, bsStyle: "primary" }, null, { iconId: "link" });
export const LocationSelectCircleButton = createButton(Button, { isCircle: true, bsStyle: "primary" }, null, { iconId: "sitemap" });

//ダウンロード
export const DownloadButton = createButton(Button, { isCircle: false, iconId: "arrow-to-bottom", bsStyle: "success" }, "ダウンロード");

//クリアボタン
export const ClearCircleButton = createToolTipButton(
    createButton(Button, { isCircle: true, bsStyle: "lightgray" }, null, { iconId: "eraser" }),
    "クリア", "bottom"
);

//検索ボタン
export const SearchButton = createButton(Button, { isCircle: false, bsStyle: "primary" }, "検索", { iconId: "search" });
export const SearchHotKeyButton = 
    createHotKeyButton(
        createButton(Button, { isCircle: false, bsStyle: "primary" }, "検索", { iconId: "search" }),
        HOT_KEYS.search
    );

//アップロードボタン
export const UploadButton =  createButton(Button, { isCircle: false, bsStyle: "primary" }, "アップロード");
export const UploadHotKeyButton = 
    createHotKeyButton(
        createButton(Button, { isCircle: false, bsStyle: "primary" }, "アップロード"),
        HOT_KEYS.upload,
    );

//表示設定をクリア
export const ResetSortCircleButton =
    createToolTipButton(
        createButton(Button, { isCircle: true, bsStyle: "default" }, null, { iconId: "undo" }),
        "表示順をクリア", "bottom"
    );

//条件をクリア
export const ClearSearchCondButton = createButton(Button, { isCircle: false, iconId: "uncheck", bsStyle: "lightgray" }, "条件をクリア");
export const ClearSearchCondHotKeyButton = createHotKeyButton(
        createButton(Button, { isCircle: false, iconId: "uncheck", bsStyle: "lightgray" }, "条件をクリア"),
        HOT_KEYS.clearCond
    );

//確認ボタン
export const ConfirmButton = createButton(Button, { isCircle: false, iconId: "confirm" }, "確認");
export const ConfirmHotKeyButton = createHotKeyButton(
    createButton(Button, { isCircle: false, iconId: "confirm" }, "確認"),
    HOT_KEYS.confirm
);

//更新ボタン
export const UpdateButton = createButton(Button, { isCircle: false, bsStyle: "primary" }, "更新", { iconId: "sync" });
export const UpdateHotKeyButton = 
createHotKeyButton(
    createButton(Button, { isCircle: false, bsStyle: "primary" }, "更新", { iconId: "sync" }),
    HOT_KEYS.update
);

//コピーボタン
export const CopyButton = createButton(Button, { isCircle: false, bsStyle: "primary" }, "コピー", { iconId: "copy" });

//フロアマップアイコンボタン
export const FloorMapToolTipButton = createToolTipButton(
    createButton(Button, { isCircle: true, bsStyle: "default", className: "icon-garmit-floor-map" }),
    "フロアマップから選択", "bottom", ["hover"]
);

//ラック画面遷移ボタン
export const RackLinkButton = createToolTipButton(
    createButton(Button, { isCircle: true, className:"btn-garmit-quick-launcher" }),
    "ラック画面へ", "bottom", ["hover"]
);