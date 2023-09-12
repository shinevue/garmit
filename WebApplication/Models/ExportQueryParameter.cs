using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// エクスポート時のパラメーター
    /// </summary>
    public class ExportQueryParameter
    {
        /// <summary>
        /// 検索条件
        /// </summary>
        public LookUp LookUp { get; set; }

        /// <summary>
        /// 出力するカラムの情報
        /// </summary>
        public ExportSet ExportSet { get; set; }

        /// <summary>
        /// 出力する種別
        /// </summary>
        public IEnumerable<ExportColumn.ExportType_e> ExportTypes { get; set; }

        /// <summary>
        /// フォーマットのみを出力するどうか
        /// </summary>
        public bool IsFormatOnly { get; set; }

        /// <summary>
        /// カラム選択をDBに保存するかどうか
        /// </summary>
        public bool WithoutSave { get; set; }

        /// <summary>
        /// ICカード検索条件
        /// </summary>
        public ICCardCondition ICCardCondition { get; set; }
    }
}