using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    ///選択空きラックのラック群情報取得のパラメータ
    /// </summary>
    public class GetEmptyRackObjectParameter
    {
        /// <summary>
        /// 連続空きラック数
        /// </summary>
        public int EmptyRackCount { get; set; }

        /// <summary>
        /// ラック種別
        /// </summary>
        public int RackType { get; set; }

        /// <summary>
        /// 画面で選択したレイアウトオブジェクト
        /// </summary>
        public LayoutObject SelectedLayoutObject { get; set; }

        /// <summary>
        /// 選択したレイアウトオブジェクトを含む空きラックグループ
        /// </summary>
        public IEnumerable<LayoutObject> LayoutObjectGroup { get; set; }
    }
}