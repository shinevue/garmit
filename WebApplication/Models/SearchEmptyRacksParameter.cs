using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    ///連続空きラック検索時のパラメータ
    /// </summary>
    public class SearchEmptyRacksParameter
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
        /// 表示中レイアウト
        /// </summary>
        public Layout Layout { get; set; }
    }
}