using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// ポイントのトレンドグラフ情報取得時のパラメータ
    /// </summary>
    public class PointTrendQueryParameter
    {
        /// <summary>
        /// ルックアップ
        /// </summary>
        public LookUp LookUp { get; set; }
        
        /// <summary>
        /// ポイントリスト
        /// </summary>
        public IEnumerable<int> PointNos { get; set; }
    }
}