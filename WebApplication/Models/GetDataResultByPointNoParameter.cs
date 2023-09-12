using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// DataResultを取得する時のパラメータ
    /// </summary>
    public class GetDataResultByPointNoParameter
    {
        /// <summary>
        /// 検索条件
        /// </summary>
        public LookUp LookUp { get; set; }

        /// <summary>
        /// ポイント番号のリスト
        /// </summary>
        public IEnumerable<int> PointNos { get; set; }
    }
}